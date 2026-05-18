/* ============================================================
   FIT N BLAZE – Admin JS
   Shared across all admin pages
   ============================================================ */

(function () {
  'use strict';

  /* ---- Sidebar toggle (mobile) ---- */
  const sidebar    = document.getElementById('adminSidebar');
  const overlay    = document.getElementById('sidebarOverlay');
  const hamburger  = document.getElementById('hamburgerBtn');

  function openSidebar()  { sidebar?.classList.add('open'); overlay?.classList.add('visible'); }
  function closeSidebar() { sidebar?.classList.remove('open'); overlay?.classList.remove('visible'); }

  hamburger?.addEventListener('click', openSidebar);
  overlay?.addEventListener('click', closeSidebar);

  /* ---- Active nav link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  /* ---- Update header date ---- */
  const dateEl = document.getElementById('headerDate');
  if (dateEl) {
    const now  = new Date();
    const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-IN', opts);
  }

  /* ---- Generic live table search ---- */
  const searchInput = document.getElementById('tableSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('#mainTable tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  /* ---- Status filter (Members / Payments) ---- */
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      const val = statusFilter.value.toLowerCase();
      document.querySelectorAll('#mainTable tbody tr').forEach(row => {
        if (!val) { row.style.display = ''; return; }
        const badge = row.querySelector('.badge');
        if (!badge) return;
        row.style.display = badge.textContent.toLowerCase().includes(val) ? '' : 'none';
      });
    });
  }

  /* ---- Animated counter for stats cards ---- */
  function animateCount(el, target, prefix = '', suffix = '') {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      el.textContent = prefix + start.toLocaleString('en-IN') + suffix;
    }, 18);
  }

  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    animateCount(el, target, prefix, suffix);
  });

  /* ---- Progress bar animate ---- */
  document.querySelectorAll('.progress-bar-fill[data-width]').forEach(bar => {
    setTimeout(() => { bar.style.width = bar.dataset.width; }, 200);
  });

  /* ---- Tooltip on plan cards ---- */
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.setAttribute('title', el.dataset.tooltip);
  });

  /* ---- Logout confirm ---- */
  document.getElementById('logoutLink')?.addEventListener('click', e => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      if(window.auth) window.auth.logout();
      else window.location.href = '../auth/login.html';
    }
  });

  /* ============================================================
     SUPABASE DYNAMIC DATA INTEGRATION
     ============================================================ */
  
  async function loadAdminData() {
      // Ensure Auth and DB are ready
      if(window.auth && window.auth.requireAuth) window.auth.requireAuth('admin');
      if (!window.db) return;

      const tbody = document.querySelector('#mainTable tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> Loading Data...</td></tr>';

      try {
          // --- DASHBOARD OVERVIEW ---
          if (currentPage === 'dashboard.html') {
              // 1. Fetch main stats
              const { data: statsData, error: statsError } = await window.db.rpc('get_dashboard_stats');
              if (!statsError && statsData) {
                  const totalEl = document.getElementById('stat-total-members');
                  const activeEl = document.getElementById('stat-active-members');
                  const expiredEl = document.getElementById('stat-expired-members');

                  if (totalEl) totalEl.dataset.count = statsData.total_members;
                  if (activeEl) activeEl.dataset.count = statsData.active_members;
                  if (expiredEl) expiredEl.dataset.count = statsData.expired_members;
                  
                  // Re-trigger counter animations for the first three cards
                  [totalEl, activeEl, expiredEl].forEach(el => {
                      if (el) {
                          const target = parseInt(el.dataset.count, 10);
                          const prefix = el.dataset.prefix || '';
                          const suffix = el.dataset.suffix || '';
                          animateCount(el, target, prefix, suffix);
                      }
                  });
              }

              // Update "Welcome back, Admin Name"
              const userSession = JSON.parse(localStorage.getItem('fnb_user'));
              const welcomeHeader = document.querySelector('.page-title-block h1');
              if (welcomeHeader && userSession && userSession.full_name) {
                  welcomeHeader.innerHTML = `Welcome back, ${userSession.full_name.split(' ')[0]} 👋`;
              }

              // 2. Fetch all members to compute Recent and Expiring lists dynamically
              const { data: members, error: membersErr } = await window.db.from('members').select(`
                  id, custom_id, status, membership_start, membership_end, goal,
                  users(full_name),
                  plans(name)
              `);

              if (!membersErr && members) {
                  // A. RECENT MEMBERS (Top 5 sorted by start date)
                  const recentTableBody = document.querySelector('.dashboard-2col .section-card:first-child tbody');
                  if (recentTableBody) {
                      // Sort by start date (descending)
                      const sortedRecent = [...members]
                          .filter(m => m.membership_start)
                          .sort((a, b) => new Date(b.membership_start) - new Date(a.membership_start))
                          .slice(0, 5);

                      recentTableBody.innerHTML = '';
                      if (sortedRecent.length === 0) {
                          recentTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666;">No members registered yet.</td></tr>';
                      } else {
                          sortedRecent.forEach(m => {
                              const name = m.users?.full_name || 'Unknown';
                              const planName = m.plans?.name || m.goal || 'Starter Plan';
                              const badgeClass = m.status === 'active' ? 'badge-active' : 'badge-expired';
                              const joinDate = new Date(m.membership_start).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
                              
                              recentTableBody.innerHTML += `
                                  <tr>
                                      <td class="member-name">${name}</td>
                                      <td><span class="plan-tag">${planName.split(' ')[0] || '1'} Month</span></td>
                                      <td><span class="badge ${badgeClass}">${m.status.toUpperCase()}</span></td>
                                      <td class="text-muted">${joinDate}</td>
                                  </tr>`;
                          });
                      }
                  }

                  // B. MEMBERSHIPS EXPIRING SOON (Next 7 days or expired)
                  const expiringTableBody = document.querySelector('main.admin-content > .section-card tbody');
                  const expiringBadge = document.querySelector('main.admin-content > .section-card .badge-expired');
                  const alertStrip = document.querySelector('.alert-strip');
                  
                  if (expiringTableBody) {
                      const today = new Date();
                      const sevenDaysLater = new Date();
                      sevenDaysLater.setDate(today.getDate() + 7);

                      // Filter expiring in next 7 days
                      const expiringList = members.filter(m => {
                          if (!m.membership_end) return false;
                          const end = new Date(m.membership_end);
                          return end >= today && end <= sevenDaysLater;
                      }).sort((a, b) => new Date(a.membership_end) - new Date(b.membership_end));

                      // Update alert strip and badge
                      if (expiringBadge) expiringBadge.textContent = `${expiringList.length} Members`;
                      if (alertStrip) {
                          if (expiringList.length > 0) {
                              alertStrip.style.display = 'flex';
                              alertStrip.querySelector('span').innerHTML = `<strong>${expiringList.length} memberships</strong> are expiring within the next 7 days. Consider sending renewal reminders.`;
                          } else {
                              alertStrip.style.display = 'none';
                          }
                      }

                      expiringTableBody.innerHTML = '';
                      if (expiringList.length === 0) {
                          expiringTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666;padding:20px;">No memberships expiring in the next 7 days.</td></tr>';
                      } else {
                          expiringList.forEach(m => {
                              const name = m.users?.full_name || 'Unknown';
                              const planName = m.plans?.name || m.goal || 'Starter Plan';
                              const end = new Date(m.membership_end);
                              const diffTime = Math.abs(end - today);
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              let statusBadgeClass = 'badge-pending';
                              let diffText = `${diffDays} days`;
                              if (diffDays <= 1) {
                                  statusBadgeClass = 'badge-expired';
                                  diffText = `${diffDays === 0 ? 'Today' : '1 day'}`;
                              }

                              expiringTableBody.innerHTML += `
                                  <tr>
                                      <td class="member-name">${name}</td>
                                      <td><span class="plan-tag">${planName}</span></td>
                                      <td class="text-muted">${end.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
                                      <td><span class="badge ${statusBadgeClass}">${diffText}</span></td>
                                  </tr>`;
                          });
                      }
                  }
              }

              // 3. Fetch Plans and Payments to calculate Plan Revenue, Monthly Revenue, and Yearly Revenue dynamically
              const { data: allPlans, error: plansErr } = await window.db
                  .from('plans')
                  .select('id, name')
                  .eq('is_active', true);

              const { data: payments, error: paymentsErr } = await window.db
                  .from('payments')
                  .select('amount, paid_at, plan_id, plans(name)')
                  .eq('status', 'paid');

              if (!paymentsErr && payments) {
                  const today = new Date();
                  const currentMonth = today.getMonth();
                  const currentYear = today.getFullYear();

                  let monthlyRev = 0;
                  let yearlyRev = 0;

                  // Map to keep track of revenue by plan ID
                  const planRevenueMap = {};

                  // Initialize map with all active database plans so that ALL memberships appear
                  if (!plansErr && allPlans) {
                      allPlans.forEach(plan => {
                          planRevenueMap[plan.id] = {
                              name: plan.name,
                              amount: 0
                          };
                      });
                  }

                  payments.forEach(p => {
                      const amount = Number(p.amount) || 0;
                      const paidDate = p.paid_at ? new Date(p.paid_at) : null;

                      // Calculate dynamic monthly revenue (current calendar month & year)
                      if (paidDate && paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
                          monthlyRev += amount;
                      }

                      // Calculate dynamic yearly revenue (current calendar year)
                      if (paidDate && paidDate.getFullYear() === currentYear) {
                          yearlyRev += amount;
                      }

                      // Accumulate plan revenue
                      if (p.plan_id) {
                          if (!planRevenueMap[p.plan_id]) {
                              planRevenueMap[p.plan_id] = {
                                  name: p.plans?.name || 'Custom/Other Plan',
                                  amount: 0
                              };
                          }
                          planRevenueMap[p.plan_id].amount += amount;
                      }
                  });

                  // Update Monthly and Yearly Revenue stat cards
                  const monthlyEl = document.getElementById('stat-monthly-revenue');
                  const yearlyEl = document.getElementById('stat-yearly-revenue');

                  if (monthlyEl) {
                      monthlyEl.dataset.count = monthlyRev;
                      animateCount(monthlyEl, monthlyRev, '₹', '');
                  }
                  if (yearlyEl) {
                      yearlyEl.dataset.count = yearlyRev;
                      animateCount(yearlyEl, yearlyRev, '₹', '');
                  }

                  // Render dynamic plan revenue breakdown
                  const planListContainer = document.getElementById('revenue-by-plan-list');
                  if (planListContainer) {
                      planListContainer.innerHTML = ''; // clear loading state
                      
                      // Remove any existing toggle button to avoid duplicates
                      const existingToggleBtn = document.getElementById('toggle-plans-btn');
                      if (existingToggleBtn) {
                          existingToggleBtn.remove();
                      }
                      
                      const planListArray = Object.values(planRevenueMap);
                      let totalPlanRev = 0;
                      planListArray.forEach(item => {
                          totalPlanRev += item.amount;
                      });
                      const totalRevForPct = totalPlanRev || 1; // avoid division by zero

                      // Sort plans by revenue descending
                      planListArray.sort((a, b) => b.amount - a.amount);

                      if (planListArray.length === 0) {
                          planListContainer.innerHTML = `<div style="text-align:center;padding:25px;color:#888;">No plan data found.</div>`;
                      } else {
                          const top3 = planListArray.slice(0, 3);
                          const remaining = planListArray.slice(3);

                          top3.forEach(item => {
                              const pct = Math.round((item.amount / totalRevForPct) * 100);
                              const itemHtml = `
                                  <div class="mini-stat-item">
                                      <div class="mini-stat-label"><i class="fa-solid fa-circle fa-xs" style="color: var(--accent); opacity: 0.85;"></i> ${item.name}</div>
                                      <div>
                                          <div class="mini-stat-value">₹${item.amount.toLocaleString('en-IN')}</div>
                                          <div class="progress-bar-wrap" style="width:120px;margin-top:5px">
                                              <div class="progress-bar-fill" style="width:${pct}%"></div>
                                          </div>
                                      </div>
                                  </div>
                              `;
                              planListContainer.insertAdjacentHTML('beforeend', itemHtml);
                          });

                          if (remaining.length > 0) {
                              // Create hidden container for remaining
                              const extraWrapperHtml = `<div id="extra-plans-container" style="display:none;flex-direction:column;"></div>`;
                              planListContainer.insertAdjacentHTML('beforeend', extraWrapperHtml);
                              
                              const extraContainer = document.getElementById('extra-plans-container');
                              remaining.forEach(item => {
                                  const pct = Math.round((item.amount / totalRevForPct) * 100);
                                  const itemHtml = `
                                      <div class="mini-stat-item">
                                          <div class="mini-stat-label"><i class="fa-solid fa-circle fa-xs" style="color: var(--accent); opacity: 0.85;"></i> ${item.name}</div>
                                          <div>
                                              <div class="mini-stat-value">₹${item.amount.toLocaleString('en-IN')}</div>
                                              <div class="progress-bar-wrap" style="width:120px;margin-top:5px">
                                                  <div class="progress-bar-fill" style="width:${pct}%"></div>
                                              </div>
                                          </div>
                                      </div>
                                  `;
                                  extraContainer.insertAdjacentHTML('beforeend', itemHtml);
                              });

                              // Add Toggle Button
                              const toggleBtnHtml = `
                                  <button id="toggle-plans-btn" class="quick-action-btn" style="width:calc(100% - 32px);margin:12px auto;justify-content:center;font-size:12px;padding:8px;border-radius:8px;">
                                      Show More (${remaining.length}) <i class="fa-solid fa-chevron-down" style="margin-left:6px;font-size:10px;"></i>
                                  </button>
                              `;
                              planListContainer.insertAdjacentHTML('afterend', toggleBtnHtml);

                              // Add toggle event listener
                              const toggleBtn = document.getElementById('toggle-plans-btn');
                              toggleBtn.addEventListener('click', () => {
                                  const isHidden = extraContainer.style.display === 'none';
                                  if (isHidden) {
                                      extraContainer.style.display = 'flex';
                                      toggleBtn.innerHTML = `Show Less <i class="fa-solid fa-chevron-up" style="margin-left:6px;font-size:10px;"></i>`;
                                  } else {
                                      extraContainer.style.display = 'none';
                                      toggleBtn.innerHTML = `Show More (${remaining.length}) <i class="fa-solid fa-chevron-down" style="margin-left:6px;font-size:10px;"></i>`;
                                  }
                              });
                          }
                      }
                  }
              }
          }

          // --- MEMBERS TABLE ---
          else if (currentPage === 'members.html') {
              const { data, error } = await window.db.from('members').select(`
                  id, user_id, custom_id, status, membership_end, current_weight, goal, assigned_trainer_id,
                  users(full_name, phone),
                  plans(name)
              `).order('membership_start', { ascending: false });

              if (!error && data && tbody) {
                  tbody.innerHTML = '';
                  data.forEach(m => {
                      const name = m.users?.full_name || 'Unknown';
                      const phone = m.users?.phone || '';
                      const badge = m.status === 'active' ? 'badge-active' : (m.status === 'expired' ? 'badge-expired' : 'badge-danger');
                      const escapedName = name.replace(/'/g, "\\'");
                      tbody.innerHTML += `
                          <tr>
                              <td class="member-id">${m.custom_id}</td>
                              <td class="member-name"><div class="user-cell"><div class="user-avatar">${name.charAt(0)}</div><div class="user-name">${name}</div></div></td>
                              <td class="text-muted">${phone || 'N/A'}</td>
                              <td><span class="plan-tag">${m.plans?.name || m.goal || 'General'}</span></td>
                              <td><span class="badge ${badge}">${m.status.toUpperCase()}</span></td>
                              <td class="text-muted">${m.membership_end ? new Date(m.membership_end).toLocaleDateString('en-IN', {month:'short', day:'numeric', year:'numeric'}) : 'N/A'}</td>
                              <td>
                                <div style="display:flex; gap:6px;">
                                  <button class="btn-admin btn-admin-primary" style="padding:6px 10px;font-size:12px;border-radius:6px;background:#3498db;color:#fff;border:none;cursor:pointer;" onclick="openEditMemberModal('${m.id}','${m.user_id}','${escapedName}','${phone}','${m.assigned_trainer_id || ''}','${m.status}')" title="Edit Member & Assign Trainer">
                                      <i class="fa-solid fa-pencil"></i>
                                  </button>
                                  <button class="btn-admin btn-admin-primary" style="padding:6px 10px;font-size:12px;border-radius:6px;" onclick="openRenewModal('${m.id}','${m.custom_id}','${escapedName}','${phone}')" title="Renew Membership">
                                      <i class="fa-solid fa-rotate"></i>
                                  </button>
                                  <button class="btn-admin btn-admin-danger" style="padding:6px 10px;font-size:12px;border-radius:6px;background:#e63946;color:#fff;border:none;cursor:pointer;" onclick="deleteMember('${m.user_id}','${escapedName}')" title="Delete Member">
                                      <i class="fa-solid fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                          </tr>`;
                  });

                  // Update footer count
                  const countEl = document.getElementById('membersCount');
                  if (countEl) countEl.textContent = `Showing ${data.length} members`;

                  // Update stat cards if present
                  const statCards = document.querySelectorAll('.stat-value');
                  if (statCards.length >= 3) {
                      const activeCount = data.filter(m => m.status === 'active').length;
                      const expiredCount = data.filter(m => m.status !== 'active').length;
                      statCards[0].textContent = data.length;
                      statCards[0].dataset.count = data.length;
                      statCards[1].textContent = activeCount;
                      statCards[1].dataset.count = activeCount;
                      statCards[2].textContent = expiredCount;
                      statCards[2].dataset.count = expiredCount;
                  }
              }
          }

           // --- TRAINERS TABLE ---
          else if (currentPage === 'trainers.html') {
              const { data, error } = await window.db.from('trainers').select(`
                  id, trainer_code, specialization, experience_years,
                  users(id, full_name, phone, is_active)
              `);

              if (!error && data && tbody) {
                  tbody.innerHTML = '';
                  data.forEach(t => {
                      const name = t.users?.full_name || 'Unknown';
                      const escapedName = name.replace(/'/g, "\\'");
                      const isActive = t.users?.is_active;
                      const badge = isActive ? 'badge-active' : 'badge-expired';
                      tbody.innerHTML += `
                          <tr>
                              <td class="member-id">${t.trainer_code}</td>
                              <td class="member-name"><div class="user-cell"><div class="user-avatar" style="background:var(--primary-dark)">${name.charAt(0)}</div><div class="user-name">${name}</div></div></td>
                              <td><span class="plan-tag">${t.specialization || 'General'}</span></td>
                              <td class="text-muted">${t.users?.phone || 'N/A'}</td>
                              <td><span class="badge ${badge}">${isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                              <td class="text-muted">${t.experience_years ? t.experience_years + ' Yrs' : 'N/A'}</td>
                              <td>
                                  <button class="btn-admin btn-admin-danger" style="padding:6px 10px;font-size:12px;border-radius:6px;background:#e63946;color:#fff;border:none;cursor:pointer;" onclick="deleteTrainer('${t.users?.id || ''}','${escapedName}')" title="Delete Trainer">
                                      <i class="fa-solid fa-trash"></i> Delete
                                  </button>
                              </td>
                          </tr>`;
                  });

                  // Update footer count
                  const countEl = document.getElementById('trainersCount');
                  if (countEl) countEl.textContent = `Showing ${data.length} trainers`;

                  // Update stat cards dynamically
                  const statCards = document.querySelectorAll('.stat-value');
                  if (statCards.length >= 3) {
                      const activeCount = data.filter(t => t.users?.is_active).length;
                      statCards[0].textContent = data.length;
                      statCards[0].dataset.count = data.length;
                      statCards[1].textContent = activeCount;
                      statCards[1].dataset.count = activeCount;
                      statCards[2].textContent = activeCount * 2; // Approximate session metric
                      statCards[2].dataset.count = activeCount * 2;
                  }
              }
          }

          // --- PAYMENTS TABLE ---
          else if (currentPage === 'payments.html') {
              const { data, error } = await window.db.from('payments').select(`
                  id, amount, payment_method, status, paid_at, transaction_reference,
                  members(custom_id, users(full_name)),
                  plans(name)
              `).order('paid_at', { ascending: false });

              if (!error && data && tbody) {
                  tbody.innerHTML = '';
                  data.forEach(p => {
                      const name = p.members?.users?.full_name || 'Unknown';
                      let badge = 'badge-pending';
                      if(p.status === 'paid') badge = 'badge-paid';
                      if(p.status === 'failed') badge = 'badge-failed';
                      
                      tbody.innerHTML += `
                          <tr>
                              <td class="member-id" style="font-family:monospace;font-size:12px;">${p.transaction_reference || 'N/A'}</td>
                              <td class="member-name"><div style="font-weight:600;">${name}</div><div style="font-size:11px;color:#666;">${p.members?.custom_id}</div></td>
                              <td><span class="plan-tag">${p.plans?.name || 'N/A'}</span></td>
                              <td class="fw-600 text-accent">₹${p.amount.toLocaleString('en-IN')}</td>
                              <td class="text-muted" style="text-transform:capitalize;">${p.payment_method}</td>
                              <td><span class="badge ${badge}">${p.status.toUpperCase()}</span></td>
                              <td class="text-muted">${new Date(p.paid_at).toLocaleDateString('en-IN', {month:'short', day:'numeric', year:'numeric'})}</td>
                          </tr>`;
                  });

                  // Update footer count
                  const countEl = document.getElementById('paymentsCount');
                  if (countEl) countEl.textContent = `Showing ${data.length} transactions`;

                  // Update stat cards dynamically
                  const statCards = document.querySelectorAll('.stat-value');
                  if (statCards.length >= 4) {
                      const paidTx = data.filter(p => p.status === 'paid');
                      const pendingTxCount = data.filter(p => p.status === 'pending').length;
                      const failedTxCount = data.filter(p => p.status === 'failed').length;
                      const totalRev = paidTx.reduce((sum, p) => sum + Number(p.amount), 0);

                      statCards[0].textContent = `₹${totalRev.toLocaleString('en-IN')}`;
                      statCards[0].dataset.count = totalRev;
                      statCards[1].textContent = paidTx.length;
                      statCards[1].dataset.count = paidTx.length;
                      statCards[2].textContent = pendingTxCount;
                      statCards[2].dataset.count = pendingTxCount;
                      statCards[3].textContent = failedTxCount;
                      statCards[3].dataset.count = failedTxCount;
                  }
              }
          }
      } catch (err) {
          console.error("Database fetch error:", err);
          if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ff4d4d">Failed to load data from server.</td></tr>';
      }
  }

    // Global function to delete a member
    window.deleteMember = async function(userId, memberName) {
        if (!userId) return alert('Invalid User ID.');
        if (!confirm(`⚠️ WARNING: Are you sure you want to permanently delete the member "${memberName}"?\n\nThis will completely erase their profile, diet plans, workout routines, and payment logs from the database. This action CANNOT be undone.`)) {
            return;
        }

        try {
            const { error } = await window.db.from('users').delete().eq('id', userId);
            if (error) throw error;
            
            alert(`✅ Member "${memberName}" has been successfully deleted.`);
            location.reload(); // Refresh the table
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete member: ' + (err.message || JSON.stringify(err)));
        }
    };

    // Global function to delete a trainer
    window.deleteTrainer = async function(userId, trainerName) {
        if (!userId) return alert('Invalid User ID.');
        if (!confirm(`⚠️ WARNING: Are you sure you want to permanently delete the trainer "${trainerName}"?\n\nThis will completely erase their trainer profile and slots from the database. This action CANNOT be undone.`)) {
            return;
        }

        try {
            const { error } = await window.db.from('users').delete().eq('id', userId);
            if (error) throw error;
            
            alert(`✅ Trainer "${trainerName}" has been successfully deleted.`);
            location.reload(); // Refresh the table
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete trainer: ' + (err.message || JSON.stringify(err)));
        }
    };

  // Load the dynamic data!
  loadAdminData();

})();
