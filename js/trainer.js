/* ============================================================
   FIT N BLAZE – Admin JS
   Shared across all admin pages
   ============================================================ */

(function () {
  'use strict';

  /* ---- Sidebar toggle (mobile) ---- */
  const sidebar    = document.getElementById('trainerSidebar');
  const overlay    = document.getElementById('sidebarOverlay');
  const hamburger  = document.getElementById('menuToggle');

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

  /* ---- Supabase Auth Check ---- */
  if(window.auth && window.auth.requireAuth) {
      window.auth.requireAuth('trainer');
  }

  /* ---- Sidebar Nav Toggling (Single Page Dashboard/Profile Router) ---- */
  const navLinkDashboard = document.getElementById('navLinkDashboard');
  const navLinkSlots = document.getElementById('navLinkSlots');
  const navLinkProfile = document.getElementById('navLinkProfile');
  const dashboardView = document.getElementById('dashboardView');
  const slotsView = document.getElementById('slotsView');
  const profileView = document.getElementById('profileView');
  const headerPageTitle = document.getElementById('headerPageTitle');

  function showSection(sectionName) {
      // Toggle sidebar overlay if open
      const trainerSidebar = document.getElementById('trainerSidebar');
      const sidebarOverlay = document.getElementById('sidebarOverlay');
      if (trainerSidebar && trainerSidebar.classList.contains('open')) {
          trainerSidebar.classList.remove('open');
          sidebarOverlay?.classList.remove('visible');
      }

      navLinkDashboard?.classList.remove('active');
      navLinkSlots?.classList.remove('active');
      navLinkProfile?.classList.remove('active');
      if (dashboardView) dashboardView.style.display = 'none';
      if (slotsView) slotsView.style.display = 'none';
      if (profileView) profileView.style.display = 'none';

      if (sectionName === 'dashboard') {
          navLinkDashboard?.classList.add('active');
          if (dashboardView) dashboardView.style.display = 'block';
          if (headerPageTitle) headerPageTitle.textContent = 'Trainer Dashboard';
      } else if (sectionName === 'slots') {
          navLinkSlots?.classList.add('active');
          if (slotsView) slotsView.style.display = 'block';
          if (headerPageTitle) headerPageTitle.textContent = 'Manage PT Slots';
      } else if (sectionName === 'profile') {
          navLinkProfile?.classList.add('active');
          if (profileView) profileView.style.display = 'block';
          if (headerPageTitle) headerPageTitle.textContent = 'My Profile';
      }
  }

  navLinkDashboard?.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('dashboard');
  });

  navLinkSlots?.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('slots');
  });

  navLinkProfile?.addEventListener('click', (e) => {
      e.preventDefault();
      showSection('profile');
  });

  /* ---- Dynamic Trainer Dashboard Data Loader ---- */
  async function loadTrainerDashboard() {
      const user = window.auth.getCurrentUser();
      if (!user || user.role !== 'trainer') return;

      // 1. Update Greeting & Avatar
      const greetingEl = document.getElementById('trainerGreeting');
      if (greetingEl) {
          greetingEl.textContent = `Welcome back, ${user.full_name || 'Trainer'} 👋`;
      }
      const headerAvatar = document.querySelector('.header-avatar');
      if (headerAvatar && user.full_name) {
          headerAvatar.textContent = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
          headerAvatar.title = `Trainer ${user.full_name}`;
      }

      const tbody = document.getElementById('assignedMembersTbody');
      if (!tbody) return;

      try {
          // 2. Fetch Trainer ID & Details from 'trainers' and 'users' using user UUID
          const { data: trainer, error: trainerError } = await window.db
              .from('trainers')
              .select(`
                  id, trainer_code, specialization, experience_years, certifications,
                  users(full_name, phone, email)
              `)
              .eq('user_id', user.id)
              .single();

          if (trainerError || !trainer) {
              console.warn("Trainer record not found:", trainerError);
              tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ff4d4d;padding:20px;">Trainer profile not registered in database.</td></tr>`;
              return;
          }

          // 3. Populate Profile Section Inputs
          const profFullName = document.getElementById('profFullName');
          const profPhone = document.getElementById('profPhone');
          const profEmail = document.getElementById('profEmail');
          const profCode = document.getElementById('profCode');
          const profSpecialization = document.getElementById('profSpecialization');
          const profExperience = document.getElementById('profExperience');
          const profCertifications = document.getElementById('profCertifications');

          if (profFullName) profFullName.value = trainer.users?.full_name || '';
          if (profPhone) profPhone.value = trainer.users?.phone || '';
          if (profEmail) profEmail.value = trainer.users?.email || '';
          if (profCode) profCode.value = trainer.trainer_code || '';
          if (profSpecialization) profSpecialization.value = trainer.specialization || '';
          if (profExperience) profExperience.value = trainer.experience_years !== null ? trainer.experience_years : '';
          // Parse certifications field JSON structure (handles backwards compatibility)
          let certificationsText = '';
          let checkedSlots = [];
          try {
              if (trainer.certifications && trainer.certifications.startsWith('{')) {
                  const certObj = JSON.parse(trainer.certifications);
                  certificationsText = certObj.certifications || '';
                  checkedSlots = certObj.pt_slots || [];
              } else {
                  certificationsText = trainer.certifications || '';
                  // Backwards compatibility default: check all standard slots
                  checkedSlots = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];
              }
          } catch(e) {
              certificationsText = trainer.certifications || '';
              checkedSlots = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];
          }

          if (profCertifications) profCertifications.value = certificationsText;

          // Dynamically populate available PT slots checkboxes
          const trainerSlotsContainer = document.getElementById('trainerSlotsContainer');
          if (trainerSlotsContainer) {
              const standardSlots = [
                  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
                  "12:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
              ];
              trainerSlotsContainer.innerHTML = '';
              standardSlots.forEach(slot => {
                  const isChecked = checkedSlots.includes(slot) ? 'checked' : '';
                  trainerSlotsContainer.innerHTML += `
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-primary); cursor: pointer; user-select: none;">
                          <input type="checkbox" class="trainer-slot-check" value="${slot}" ${isChecked} style="accent-color: var(--accent); width: 16px; height: 16px; cursor: pointer;">
                          ${slot}
                      </label>
                  `;
              });
          }

          // Focus style triggers for form input elements
          [profFullName, profPhone, profEmail, profSpecialization, profExperience, profCertifications].forEach(el => {
              if (!el) return;
              el.addEventListener('focus', () => {
                  el.style.borderColor = 'var(--accent)';
                  el.style.background = 'rgba(255,255,255,0.06)';
              });
              el.addEventListener('blur', () => {
                  el.style.borderColor = 'var(--border)';
                  el.style.background = 'rgba(255,255,255,0.04)';
              });
          });

          // Setup Profile Form Save submit event
          const trainerProfileForm = document.getElementById('trainerProfileForm');
          if (trainerProfileForm && !trainerProfileForm.dataset.listenerAdded) {
              trainerProfileForm.dataset.listenerAdded = 'true';
              trainerProfileForm.addEventListener('submit', async (e) => {
                  e.preventDefault();

                  const btnSave = document.getElementById('btnSaveProfile');
                  const formMsg = document.getElementById('profileFormMsg');

                  if (btnSave) {
                      btnSave.disabled = true;
                      btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right:6px;"></i> Saving...`;
                  }
                  if (formMsg) {
                      formMsg.style.display = 'none';
                      formMsg.textContent = '';
                  }

                  try {
                      const updatedFullName = profFullName.value.trim();
                      const updatedPhone = profPhone.value.trim();
                      const updatedEmail = profEmail.value.trim();
                      const updatedSpecialization = profSpecialization.value.trim();
                      const updatedExperience = profExperience.value ? parseInt(profExperience.value, 10) : null;
                      // Read previous certifications payload to preserve pt_slots
                      let oldPtSlots = [];
                      try {
                          if (trainer.certifications && trainer.certifications.startsWith('{')) {
                              const certObj = JSON.parse(trainer.certifications);
                              oldPtSlots = certObj.pt_slots || [];
                          }
                      } catch(e) {}

                      const updatedCertificationsText = profCertifications.value.trim();
                      const updatedCertifications = JSON.stringify({
                          certifications: updatedCertificationsText,
                          pt_slots: oldPtSlots
                      });

                      // Update public.users
                      const { error: userUpdateError } = await window.db
                          .from('users')
                          .update({
                              full_name: updatedFullName,
                              phone: updatedPhone,
                              email: updatedEmail
                          })
                          .eq('id', user.id);

                      if (userUpdateError) throw userUpdateError;

                      // Update public.trainers
                      const { error: trainerUpdateError } = await window.db
                          .from('trainers')
                          .update({
                              specialization: updatedSpecialization,
                              experience_years: updatedExperience,
                              certifications: updatedCertifications
                          })
                          .eq('id', trainer.id);

                      if (trainerUpdateError) throw trainerUpdateError;

                      // Cache updated credentials inside localStorage session
                      user.full_name = updatedFullName;
                      user.phone = updatedPhone;
                      user.email = updatedEmail;
                      localStorage.setItem('fnb_user', JSON.stringify(user));

                      // Instantly update layout header fields
                      if (greetingEl) {
                          greetingEl.textContent = `Welcome back, ${updatedFullName} 👋`;
                      }
                      if (headerAvatar) {
                          headerAvatar.textContent = updatedFullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                          headerAvatar.title = `Trainer ${updatedFullName}`;
                      }

                      if (formMsg) {
                          formMsg.style.background = 'rgba(74, 222, 128, 0.15)';
                          formMsg.style.color = '#4ade80';
                          formMsg.style.border = '1px solid rgba(74, 222, 128, 0.3)';
                          formMsg.textContent = 'Profile successfully updated!';
                          formMsg.style.display = 'block';
                      }

                  } catch (err) {
                      console.error("Profile save error:", err);
                      if (formMsg) {
                          formMsg.style.background = 'rgba(255, 60, 60, 0.15)';
                          formMsg.style.color = '#ff4d4d';
                          formMsg.style.border = '1px solid rgba(255, 60, 60, 0.3)';
                          formMsg.textContent = 'Failed to save changes: ' + err.message;
                          formMsg.style.display = 'block';
                      }
                  } finally {
                      if (btnSave) {
                          btnSave.disabled = false;
                          btnSave.innerHTML = `<i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i> Save Profile Changes`;
                      }
                  }
              });
          }

          // Setup Slots Form Save submit event
          const trainerSlotsForm = document.getElementById('trainerSlotsForm');
          if (trainerSlotsForm && !trainerSlotsForm.dataset.listenerAdded) {
              trainerSlotsForm.dataset.listenerAdded = 'true';
              trainerSlotsForm.addEventListener('submit', async (e) => {
                  e.preventDefault();

                  const btnSaveSlots = document.getElementById('btnSaveSlots');
                  const slotsMsg = document.getElementById('slotsFormMsg');

                  if (btnSaveSlots) {
                      btnSaveSlots.disabled = true;
                      btnSaveSlots.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right:6px;"></i> Saving Schedule...`;
                  }
                  if (slotsMsg) {
                      slotsMsg.style.display = 'none';
                      slotsMsg.textContent = '';
                  }

                  try {
                      // Read previous certifications payload to preserve textual certifications
                      let oldCertificationsText = '';
                      try {
                          if (trainer.certifications && trainer.certifications.startsWith('{')) {
                              const certObj = JSON.parse(trainer.certifications);
                              oldCertificationsText = certObj.certifications || '';
                          } else {
                              oldCertificationsText = trainer.certifications || '';
                          }
                      } catch(e) {
                          oldCertificationsText = trainer.certifications || '';
                      }

                      const checkedSlots = Array.from(document.querySelectorAll('.trainer-slot-check:checked')).map(el => el.value);
                      const updatedCertifications = JSON.stringify({
                          certifications: oldCertificationsText,
                          pt_slots: checkedSlots
                      });

                      // Update public.trainers
                      const { error: trainerUpdateError } = await window.db
                          .from('trainers')
                          .update({
                              certifications: updatedCertifications
                          })
                          .eq('id', trainer.id);

                      if (trainerUpdateError) throw trainerUpdateError;

                      // Update local trainer object
                      trainer.certifications = updatedCertifications;

                      if (slotsMsg) {
                          slotsMsg.style.background = 'rgba(74, 222, 128, 0.15)';
                          slotsMsg.style.color = '#4ade80';
                          slotsMsg.style.border = '1px solid rgba(74, 222, 128, 0.3)';
                          slotsMsg.textContent = 'PT slots schedule successfully saved!';
                          slotsMsg.style.display = 'block';
                      }
                  } catch (err) {
                      console.error("Save slots error:", err);
                      if (slotsMsg) {
                          slotsMsg.style.background = 'rgba(239, 68, 68, 0.15)';
                          slotsMsg.style.color = '#ef4444';
                          slotsMsg.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                          slotsMsg.textContent = err.message || 'Failed to save slots.';
                          slotsMsg.style.display = 'block';
                      }
                  } finally {
                      if (btnSaveSlots) {
                          btnSaveSlots.disabled = false;
                          btnSaveSlots.innerHTML = `<i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i> Save Available Slots`;
                      }
                  }
              });
          }

          // 4. Fetch Assigned Members
          const { data: members, error: membersError } = await window.db
              .from('members')
              .select(`
                  id, custom_id, goal, current_weight, target_weight, status, medical_notes,
                  users(full_name)
              `)
              .eq('assigned_trainer_id', trainer.id)
              .order('created_at', { ascending: false });

          if (membersError) throw membersError;

          if (!members || members.length === 0) {
              tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:#888;">No members are currently assigned to you.</td></tr>`;
              
              // Reset stats
              document.getElementById('statAssignedMembers').textContent = '0';
              document.getElementById('statTodaySessions').textContent = '0';
              return;
          }

          // 5. Render Members Table Rows
          tbody.innerHTML = '';
          members.forEach(m => {
              const name = m.users?.full_name || 'Unknown';
              const goal = m.goal || 'General Fitness';
              const curW = m.current_weight ? `${m.current_weight} kg` : '--';
              const tarW = m.target_weight ? `${m.target_weight} kg` : '--';
              const statusClass = m.status === 'active' ? 'badge-active' : 'badge-expired';

              tbody.innerHTML += `
                  <tr>
                      <td class="member-name">${name} <br><span class="member-id">${m.custom_id}</span></td>
                      <td><span class="plan-tag">${goal}</span></td>
                      <td class="text-muted">${curW} &rarr; ${tarW}</td>
                      <td><span class="badge ${statusClass}">${m.status.toUpperCase()}</span></td>
                  </tr>`;
          });

          // 6. Calculate and Update Stats Cards
          const activeCount = members.filter(m => m.status === 'active').length;
          const pendingUpdatesCount = members.filter(m => !m.current_weight || m.status !== 'active').length;

          // Update stats text and data-count attributes for animation
          const statAssigned = document.getElementById('statAssignedMembers');
          const statSessions = document.getElementById('statTodaySessions');

          if (statAssigned) { statAssigned.textContent = members.length; statAssigned.dataset.count = members.length; }
          if (statSessions) { statSessions.textContent = activeCount; statSessions.dataset.count = activeCount; }

          // Show Alert Strip if updates are pending
          const alertStrip = document.getElementById('trainerAlertStrip');
          const alertMsg = document.getElementById('trainerAlertMsg');
          if (alertStrip && alertMsg && pendingUpdatesCount > 0) {
              alertMsg.innerHTML = `<strong>${pendingUpdatesCount} member(s)</strong> need their weight/progress logged. Please update their files.`;
              alertStrip.style.display = 'flex';
          }

          // 6. Render Today's Sessions dynamically based on active members
          const sessionsList = document.getElementById('sessionsList');
          if (sessionsList) {
              const activeMembers = members.filter(m => m.status === 'active');
              if (activeMembers.length === 0) {
                  sessionsList.innerHTML = `
                      <div style="text-align:center;padding:25px;color:#888;">
                          <i class="fa-regular fa-calendar-check" style="font-size:24px;margin-bottom:8px;display:block;"></i>
                          No active members/sessions today.
                      </div>`;
              } else {
                  sessionsList.innerHTML = '';
                  const todayStr = new Date().toISOString().split('T')[0];
                  activeMembers.forEach((m) => {
                      const name = m.users?.full_name || 'Unknown';
                      const goal = m.goal || 'General Fitness';
                      
                      let slot = 'Not Scheduled';
                      let isCustom = false;
                      try {
                          if (m.medical_notes && m.medical_notes.startsWith('{')) {
                              const notesObj = JSON.parse(m.medical_notes);
                              if (notesObj.pt_date === todayStr && notesObj.pt_time) {
                                  slot = notesObj.pt_time;
                                  isCustom = true;
                              }
                          }
                      } catch(e) {}
                      
                      sessionsList.innerHTML += `
                          <div class="mini-stat-item">
                              <div class="mini-stat-label">
                                  <i class="fa-solid fa-circle fa-xs" style="color: ${isCustom ? '#4ade80' : 'var(--text-faint)'}"></i> 
                                  ${slot}
                              </div>
                              <div style="text-align: right;">
                                  <div class="mini-stat-value">${name}</div>
                                  <div class="text-muted" style="font-size: 11px;">${goal} Session</div>
                              </div>
                          </div>`;
                  });
              }
          }

      } catch (err) {
          console.error("Trainer loader error:", err);
          tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ff4d4d;padding:20px;">Failed to load assigned members.</td></tr>`;
          const sessionsList = document.getElementById('sessionsList');
          if (sessionsList) {
              sessionsList.innerHTML = `<div style="text-align:center;color:#ff4d4d;padding:20px;">Failed to load schedule.</div>`;
          }
      }
  }

  // Load dashboard on DOMContentLoaded
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadTrainerDashboard);
  } else {
      loadTrainerDashboard();
  }

})();
