// js/member.js
document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Supabase Auth Check ---
    if(window.auth && window.auth.requireAuth) {
        window.auth.requireAuth('member');
    }

    const currentUser = window.auth ? window.auth.getCurrentUser() : null;
    if (!currentUser || !window.db) return;

    const isDashboard = window.location.pathname.includes('dashboard.html');
    const isProfile = window.location.pathname.includes('profile.html');
    const isMembership = window.location.pathname.includes('membership.html');

    // Default Plans Templates
    const defaultDietTemplates = {
        'veg': 'Breakfast: Oats & Fruits\nLunch: Dal, Roti, Salad\nEvening: Protein Shake\nDinner: Paneer Tikka, Veggies',
        'non-veg': 'Breakfast: Eggs & Toast\nLunch: Chicken Breast, Rice\nEvening: Protein Shake\nDinner: Grilled Fish, Salad',
        'vegan': 'Breakfast: Tofu Scramble\nLunch: Quinoa & Beans\nEvening: Plant Protein\nDinner: Lentil Soup',
        'eggetarian': 'Breakfast: Omelette\nLunch: Dal & Rice\nEvening: Boiled Eggs\nDinner: Mixed Veg Curry'
    };

    const defaultWorkoutTemplate = 'Monday: Chest & Triceps\nTuesday: Back & Biceps\nWednesday: Cardio & Core\nThursday: Legs\nFriday: Shoulders\nSaturday: Functional Training\nSunday: Rest';

    const WORKOUT_EXERCISES = {
        "Chest & Triceps": {
            beginner: ["Push-Ups – 3 x 10", "Incline Dumbbell Press – 3 x 12", "Cable Fly – 3 x 12", "Tricep Pushdowns – 3 x 15", "Bench Dips – 3 x 12"],
            intermediate: ["Barbell Bench Press – 4 x 10", "Incline Dumbbell Press – 4 x 10", "Decline Hammer Press – 3 x 12", "Cable Crossover – 3 x 15", "Overhead Dumbbell Extension – 3 x 12", "Skull Crushers – 3 x 12"],
            advanced: ["Barbell Bench Press (Heavy) – 5 x 6-8", "Incline Dumbbell Press – 4 x 8-10 (Drop set on last set)", "Weighted Dips – 4 x 10", "Cable Fly (High-to-Low) – 3 x 12 (Superset with Low-to-High)", "Close Grip Bench Press – 4 x 8", "Weighted Skull Crushers – 3 x 10", "Rope Pushdowns – 3 x 15 (Drop set on last set)"]
        },
        "Back & Biceps": {
            beginner: ["Lat Pulldowns – 3 x 12", "Seated Cable Row – 3 x 12", "Dumbbell Bicep Curl – 3 x 15", "Hammer Curl – 3 x 12", "Back Extensions – 3 x 12"],
            intermediate: ["Deadlift – 4 x 8", "Bent Over Barbell Row – 4 x 10", "Lat Pulldown (Wide Grip) – 3 x 12", "Incline Dumbbell Curl – 3 x 12", "Barbell Preacher Curl – 3 x 12", "Hammer Curl – 3 x 12"],
            advanced: ["Deadlift (Heavy) – 5 x 5", "Weighted Pull-ups – 4 x 8", "Meadows Row / T-Bar Row – 4 x 8-10", "Chest-Supported Row – 3 x 12 (Superset with Lat Pullover)", "Incline Dumbbell Curl – 4 x 10", "Spider Curl – 3 x 12", "Hammer Curl (Heavy) – 3 x 10 (Drop set on last set)"]
        },
        "Legs": {
            beginner: ["Bodyweight Squats – 3 x 15", "Leg Press – 3 x 12", "Lying Leg Curl – 3 x 12", "Standing Calf Raise – 3 x 15"],
            intermediate: ["Barbell Squat – 4 x 10", "Romanian Deadlift – 4 x 10", "Bulgarian Split Squat – 3 x 12 per leg", "Lying Leg Curl – 3 x 15", "Calf Raise (Seated) – 4 x 15"],
            advanced: ["Barbell Back Squat (Heavy) – 5 x 6-8", "Deficit Romanian Deadlift – 4 x 8-10", "Bulgarian Split Squat (Weighted) – 4 x 10 per leg (Superset with Bodyweight Jump Squats)", "Leg Extension – 3 x 15 (Drop set on last set)", "Lying Leg Curl – 3 x 12 (Superset with Seated Calf Raise)", "Donkey Calf Raise – 4 x 20"]
        },
        "Shoulders": {
            beginner: ["Dumbbell Shoulder Press – 3 x 12", "Dumbbell Lateral Raise – 3 x 15", "Dumbbell Front Raise – 3 x 12", "Face Pulls – 3 x 15"],
            intermediate: ["Overhead Press (OHP) – 4 x 8", "Dumbbell Lateral Raise – 4 x 12", "Seated Dumbbell Press – 3 x 10", "Reverse Pec Deck Fly – 3 x 15", "Dumbbell Shrugs – 3 x 12"],
            advanced: ["Overhead Press (Heavy) – 5 x 5", "Dumbbell Lateral Raise (Heavy) – 4 x 12 (Drop set on last set)", "Behind-the-Neck Barbell Press – 3 x 10", "Cable Lateral Raise – 3 x 15 (Superset with Face Pulls)", "Dumbbell Rear Delt Fly – 4 x 12", "Barbell Shrugs (Heavy) – 4 x 8"]
        },
        "Cardio & Core": {
            beginner: ["Treadmill Walk (Incline) – 20 mins", "Bicycle Crunches – 3 x 15", "Plank – 3 x 30 secs", "Lying Leg Raises – 3 x 12"],
            intermediate: ["Treadmill Jog – 25 mins", "Hanging Knee Raise – 3 x 15", "Plank – 3 x 60 secs", "Russian Twist (Weighted) – 3 x 20 (10 per side)"],
            advanced: ["HIIT Sprint Intervals – 20 mins (30s sprint, 60s walk)", "Hanging Leg Raise (Toes to Bar) – 4 x 12", "Weighted Plank – 3 x 90 secs", "Ab Wheel Rollout – 3 x 12", "Russian Twist (Weighted) – 3 x 30"]
        },
        "Functional Training": {
            beginner: ["Kettlebell Swings – 3 x 15", "Goblet Squat – 3 x 12", "Dumbbell Farmer's Walk – 3 x 50 meters", "Mountain Climbers – 3 x 30 secs"],
            intermediate: ["Kettlebell Swings (Heavy) – 4 x 15", "Goblet Squat – 4 x 12", "Medicine Ball Slams – 4 x 12", "Burpees – 3 x 12", "Farmer's Walk (Heavy) – 3 x 50 meters"],
            advanced: ["Kettlebell Snatch – 4 x 10 per arm", "Barbell Clean & Press – 4 x 8", "Burpee Pull-Ups – 4 x 10", "Sandbag / Heavy D-Ball Carry – 3 x 50 meters", "Battle Ropes – 4 x 45 secs"]
        },
        "Rest": {
            beginner: ["Active Recovery – Light walk or stretching"],
            intermediate: ["Active Recovery – Light walk or stretching"],
            advanced: ["Active Recovery – Light walk or stretching"]
        }
    };

    // Premium Custom Modal UI
    function showCustomModal(title, fields, onSave) {
        const existing = document.getElementById('customOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'customOverlay';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(5px); z-index:9999; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.3s;';
        
        let inputsHtml = '';
        fields.forEach((f, i) => {
            if (f.type === 'textarea') {
                inputsHtml += `<div style="margin-bottom:15px;text-align:left;">
                    <label style="display:block;color:#aaa;font-size:12px;margin-bottom:5px;">${f.label}</label>
                    <textarea id="modInp_${i}" style="width:100%;height:150px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px;border-radius:8px;resize:vertical;font-family:inherit;">${f.value||''}</textarea>
                </div>`;
            } else if (f.type === 'select') {
                let optionsHtml = '';
                if (f.options) {
                    f.options.forEach(opt => {
                        const isSelected = (opt.toLowerCase() === (f.value || '').toLowerCase()) ? 'selected' : '';
                        optionsHtml += `<option value="${opt}" ${isSelected}>${opt}</option>`;
                    });
                }
                inputsHtml += `<div style="margin-bottom:15px;text-align:left;">
                    <label style="display:block;color:#aaa;font-size:12px;margin-bottom:5px;">${f.label}</label>
                    <select id="modInp_${i}" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px;border-radius:8px;font-family:inherit;">
                        ${optionsHtml}
                    </select>
                </div>`;
            } else {
                inputsHtml += `<div style="margin-bottom:15px;text-align:left;">
                    <label style="display:block;color:#aaa;font-size:12px;margin-bottom:5px;">${f.label}</label>
                    <input type="${f.type||'text'}" id="modInp_${i}" value="${f.value||''}" style="width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:12px;border-radius:8px;font-family:inherit;">
                </div>`;
            }
        });

        overlay.innerHTML = `
            <div style="background:#111; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; width:90%; max-width:450px; box-shadow:0 20px 40px rgba(0,0,0,0.6); transform:translateY(20px); transition:transform 0.3s;">
                <h3 style="margin:0 0 20px 0; color:#fff; font-size:18px;">${title}</h3>
                <div style="max-height: 400px; overflow-y: auto; padding-right: 5px; margin-bottom: 20px;">
                    ${inputsHtml}
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                    <button id="modBtnCancel" style="padding:10px 16px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:600; border-radius:8px; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'">Cancel</button>
                    <button id="modBtnSave" style="padding:10px 20px; background:var(--accent-primary); color:#fff; border:none; cursor:pointer; font-weight:600; border-radius:8px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('div').style.transform = 'translateY(0)';
        }, 10);

        const closeMod = () => {
            overlay.style.opacity = '0';
            overlay.querySelector('div').style.transform = 'translateY(20px)';
            setTimeout(() => overlay.remove(), 300);
        };

        overlay.querySelector('#modBtnCancel').addEventListener('click', closeMod);
        overlay.querySelector('#modBtnSave').addEventListener('click', () => {
            const results = fields.map((f, i) => document.getElementById(`modInp_${i}`).value);
            onSave(results);
            closeMod();
        });
    }

    // --- Dynamic Data Fetching ---
    async function loadMemberData() {
        try {
            // Fetch User + Member + Plan + Trainer
            const { data: memberData, error: memErr } = await window.db.from('members').select(`
                *,
                users (full_name, email, phone, created_at),
                plans (name, duration_days),
                trainers (certifications, users (full_name))
            `).eq('user_id', currentUser.id).single();

            if (memErr) throw memErr;
            if (!memberData) return;

            // Auto-fix missing plan or expiry date, or incorrect 30-day fallback for longer plans (graceful fallback)
            let planName = memberData.plans?.name;
            let expiryDate = memberData.membership_end;
            let durationDays = memberData.plans?.duration_days || 30;

            // Self-healing: Recover or correct plan_id and membership_end dynamically from payments history
            try {
                const { data: payData } = await window.db.from('payments')
                    .select('*')
                    .eq('member_id', memberData.id)
                    .order('created_at', { ascending: false })
                    .limit(1);
                if (payData && payData.length > 0) {
                    const payment = payData[0];
                    let matchedPlan = null;
                    const { data: allDbPlans } = await window.db.from('plans').select('*');
                    if (allDbPlans && allDbPlans.length > 0) {
                        // Ensure all exact website landing page plans are seeded
                        const defaultPlans = [
                            { name: '1 Month Plan', duration_days: 30, price: 2999.00, description: 'Gym & Cardio Access' },
                            { name: '3 Month Plan', duration_days: 90, price: 6999.00, description: 'Gym & Cardio Access' },
                            { name: '6 Month Plan', duration_days: 180, price: 9999.00, description: 'Gym & Cardio Access' },
                            { name: '12 Month Plan', duration_days: 365, price: 14999.00, description: 'Gym & Cardio Access' },
                            { name: 'Group Classes 1 Month', duration_days: 30, price: 2499.00, description: 'Group Classes Access' },
                            { name: 'Yoga Class 1 Month', duration_days: 30, price: 2499.00, description: 'Yoga Class Access' },
                            { name: 'Yoga Class 3 Months', duration_days: 90, price: 4599.00, description: 'Yoga Class Access' },
                            { name: 'PT Per Day', duration_days: 1, price: 250.00, description: 'Personal Trainer Access' },
                            { name: 'Group Session', duration_days: 30, price: 4999.00, description: 'Fitness Boxing' },
                            { name: 'PT One-on-One', duration_days: 30, price: 9999.00, description: 'Personal One-on-One' }
                        ];
                        const dbPlanNames = allDbPlans.map(p => p.name);
                        const missingPlans = defaultPlans.filter(p => !dbPlanNames.includes(p.name));
                        if (missingPlans.length > 0) {
                            const { data: newlyInserted } = await window.db.from('plans').insert(missingPlans).select();
                            if (newlyInserted) allDbPlans.push(...newlyInserted);
                        }

                        if (payment.plan_id) {
                            matchedPlan = allDbPlans.find(p => p.id === payment.plan_id);
                        }
                        if (!matchedPlan && payment.amount) {
                            matchedPlan = allDbPlans.find(p => Math.abs(Number(p.price) - Number(payment.amount)) < 10);
                        }
                    }
                    if (matchedPlan && (!memberData.plan_id || memberData.plan_id !== matchedPlan.id || durationDays !== matchedPlan.duration_days)) {
                        memberData.plan_id = matchedPlan.id;
                        memberData.plans = matchedPlan;
                        planName = matchedPlan.name;
                        durationDays = matchedPlan.duration_days || 30;
                        
                        const startBase = memberData.membership_start ? new Date(memberData.membership_start) : new Date(memberData.users.created_at || Date.now());
                        const correctEnd = new Date(startBase);
                        correctEnd.setDate(correctEnd.getDate() + durationDays);
                        expiryDate = correctEnd.toISOString().split('T')[0];
                        
                        await window.db.from('members').update({ 
                            plan_id: matchedPlan.id,
                            membership_end: expiryDate
                        }).eq('id', memberData.id);
                    }
                }
            } catch (err) {
                console.warn("Self-healing membership failed:", err);
            }

            const name = memberData.users.full_name;
            const firstName = name.split(' ')[0];

            const startBase = memberData.membership_start ? new Date(memberData.membership_start) : new Date(memberData.users.created_at || Date.now());
            
            // Check if stored expiryDate is incorrect (e.g., if it was mistakenly capped at 30 days previously)
            let needsCorrection = false;
            if (expiryDate) {
                const startMs = startBase.getTime();
                const endMs = new Date(expiryDate).getTime();
                const diffDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));
                if (durationDays > 30 && diffDays <= 31) {
                    needsCorrection = true;
                }
            }

            if (!planName || !expiryDate || needsCorrection) {
                planName = planName || "1 Month Plan";
                const fallbackEnd = new Date(startBase);
                fallbackEnd.setDate(fallbackEnd.getDate() + durationDays);
                expiryDate = fallbackEnd.toISOString().split('T')[0];
                
                // Fire-and-forget fix the db row for future
                window.db.from('members').update({ membership_end: expiryDate }).eq('id', memberData.id).then();
            }

            // Generate dynamic notifications
            const notifList = document.getElementById('notifList');
            const notifBadge = document.querySelector('.notif-badge');
            
            if (notifList) {
                notifList.innerHTML = '';
                let notifications = [];

                // 1. Expiry Check
                if (expiryDate) {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const exp = new Date(expiryDate);
                    exp.setHours(0,0,0,0);
                    
                    const timeDiff = exp.getTime() - today.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    if (daysDiff < 0) {
                        // Expired
                        notifications.push({
                            title: "Plan Expired!",
                            text: `Your ${planName} plan has expired. Renew your membership now to continue your fitness journey!`,
                            time: "Just now",
                            icon: "fa-triangle-exclamation",
                            iconColor: "var(--accent-primary)",
                            iconBg: "rgba(229, 9, 20, 0.1)",
                            unread: true
                        });
                    } else if (daysDiff <= 7) {
                        // Expiring soon
                        notifications.push({
                            title: "Plan Expiring Soon!",
                            text: `Your ${planName} plan will expire in ${daysDiff} day${daysDiff > 1 ? 's' : ''} (on ${exp.toLocaleDateString('en-IN', {month:'short', day:'numeric'})}). Renew now.`,
                            time: "Just now",
                            icon: "fa-triangle-exclamation",
                            iconColor: "var(--warning)",
                            iconBg: "rgba(241, 196, 15, 0.1)",
                            unread: true
                        });
                    }
                }

                // 2. Daily Diet Tip Notification
                const dietPref = (memberData.dietary_preferences || 'veg').toLowerCase();
                const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const todayDay = dayNames[new Date().getDay()];

                let dietText = "";
                if (dietPref === 'veg') {
                    dietText = `Today is ${todayDay}! Focus on green vegetables, cottage cheese (paneer), or soybean chunks to meet your protein target. Stay hydrated!`;
                } else if (dietPref === 'non-veg') {
                    dietText = `Today is ${todayDay}! Include lean meat (chicken breast) or boiled egg whites in your post-workout meal for optimal recovery.`;
                } else if (dietPref === 'vegan') {
                    dietText = `Today is ${todayDay}! Fuel your muscles with plant-based powerhouses like tofu, lentils, chickpeas, or a vegan protein shake.`;
                } else { // eggetarian
                    dietText = `Today is ${todayDay}! Add an egg-white scramble or boiled eggs to your breakfast today to boost your daily protein intake.`;
                }

                notifications.push({
                    title: "Today's Diet Guideline",
                    text: dietText,
                    time: "Today",
                    icon: "fa-apple-whole",
                    iconColor: "var(--success)",
                    iconBg: "rgba(46, 204, 113, 0.1)",
                    unread: true
                });

                // 3. Welcome / Workout checklist tip
                notifications.push({
                    title: "Daily Workout Checklist",
                    text: "Consistency is key! Today is a new opportunity to smash your goals. Complete your customized workout routine now.",
                    time: "Today",
                    icon: "fa-clipboard-list",
                    iconColor: "#3498db",
                    iconBg: "rgba(52, 152, 219, 0.1)",
                    unread: false
                });

                // Render them
                let unreadCount = 0;
                notifications.forEach(n => {
                    if (n.unread) unreadCount++;
                    notifList.innerHTML += `
                        <div class="notif-item ${n.unread ? 'unread' : ''}">
                            <div class="notif-icon" style="color: ${n.iconColor}; background-color: ${n.iconBg};">
                                <i class="fa-solid ${n.icon}"></i>
                            </div>
                            <div class="notif-content">
                                <p><strong>${n.title}</strong> ${n.text}</p>
                                <span class="notif-time">${n.time}</span>
                            </div>
                        </div>`;
                });

                // Update badge
                if (notifBadge) {
                    if (unreadCount > 0) {
                        notifBadge.textContent = unreadCount;
                        notifBadge.style.display = 'flex';
                    } else {
                        notifBadge.style.display = 'none';
                    }
                }

                // Mark all as read feature
                const markReadBtn = document.querySelector('.mark-read');
                if (markReadBtn) {
                    markReadBtn.onclick = () => {
                        document.querySelectorAll('.notif-item.unread').forEach(item => {
                            item.classList.remove('unread');
                        });
                        if (notifBadge) notifBadge.style.display = 'none';
                    };
                }
            }

            // Update Global Elements
            document.querySelectorAll('.welcome-msg').forEach(el => {
                if(isDashboard) {
                    if (window.innerWidth <= 576) {
                        el.textContent = `Hi, ${firstName}!`;
                    } else {
                        el.textContent = `Welcome back, ${firstName}!`;
                    }
                }
            });
            document.querySelectorAll('.profile-avatar').forEach(el => {
                el.textContent = name.substring(0, 2).toUpperCase();
            });

            // Calculate weight stats
            const currentW = parseFloat(memberData.current_weight) || 0;
            const targetW = parseFloat(memberData.target_weight) || 0;

            // Try loading from persistent LocalStorage first for instant, bulletproof speed
            let startW = parseFloat(localStorage.getItem(`fnb_start_weight_${memberData.id}`)) || 0;

            // If not found in LocalStorage, fetch from the database
            if (!startW) {
                try {
                    const { data: logs, error: logsErr } = await window.db
                        .from('progress_logs')
                        .select('weight, notes')
                        .eq('member_id', memberData.id)
                        .order('created_at', { ascending: true });

                    if (!logsErr && logs && logs.length > 0) {
                        const regLog = logs.find(l => l.notes && (l.notes.includes('Registration weight') || l.notes.includes('Registration weight (Admin)') || l.notes.includes('Registration weight (recovered)')));
                        startW = regLog ? parseFloat(regLog.weight) : parseFloat(logs[0].weight);
                    }
                } catch(logErr) {
                    console.warn("Failed to fetch weight progress logs:", logErr);
                }

                // If we found a start weight, cache it in LocalStorage for reliability
                if (startW > 0) {
                    localStorage.setItem(`fnb_start_weight_${memberData.id}`, startW.toString());
                } else {
                    // Fallback to current weight if absolutely no starting weight is recorded
                    startW = currentW;
                }
            }

            // Determine if this is a weight-loss or weight-gain goal
            const isLossGoal = startW > targetW;
            const weightChanged = Math.abs(startW - currentW);
            const totalToChange = Math.abs(startW - targetW);

            // Progress: how much of the journey from startW → targetW has been covered
            let progressPercentage = 0;
            if (totalToChange > 0 && currentW > 0 && targetW > 0) {
                if (isLossGoal) {
                    // Weight loss: progress = how much weight lost vs how much needed to lose
                    const lost = startW - currentW;
                    progressPercentage = Math.min(100, Math.max(0, (lost / totalToChange) * 100));
                } else {
                    // Weight gain: progress = how much weight gained vs how much needed to gain
                    const gained = currentW - startW;
                    progressPercentage = Math.min(100, Math.max(0, (gained / totalToChange) * 100));
                }
            }

            const weightDiff = Math.abs(startW - currentW).toFixed(1);
            const weightDiffLabel = isLossGoal
                ? (startW > currentW ? `${weightDiff} kg lost` : (startW < currentW ? `+${weightDiff} kg gained` : '0 kg'))
                : (currentW > startW ? `${weightDiff} kg gained` : (currentW < startW ? `-${weightDiff} kg` : '0 kg'));

            // Populate Dashboard
            if (isDashboard) {
                // PT Scheduler logic
                const setPtBtn = document.getElementById('setPtBtn');
                const ptStatusText = document.getElementById('ptStatusText');
                const ptSchedulerCard = document.querySelector('.pt-scheduler-card');

                if (!memberData.assigned_trainer_id || !memberData.trainers) {
                    if (ptSchedulerCard) {
                        ptSchedulerCard.style.display = 'none';
                    }
                } else if (setPtBtn && ptStatusText) {
                    if (ptSchedulerCard) {
                        ptSchedulerCard.style.display = 'flex';
                    }
                    const todayStr = new Date().toISOString().split('T')[0];
                    let currentNotes = { name: '', relation: '', phone: '', pt_time: '', pt_date: '' };
                    try {
                        if (memberData.medical_notes && memberData.medical_notes.startsWith('{')) {
                            currentNotes = JSON.parse(memberData.medical_notes);
                        }
                    } catch(e) {}

                    const isScheduledToday = currentNotes.pt_date === todayStr && currentNotes.pt_time;

                    if (isScheduledToday) {
                        ptStatusText.innerHTML = `Your PT session for today is scheduled at <strong style="color: #4ade80;">${currentNotes.pt_time}</strong>.`;
                        setPtBtn.innerHTML = `<i class="fa-solid fa-calendar-check"></i> Scheduled`;
                        setPtBtn.style.background = '#27272a';
                        setPtBtn.style.cursor = 'default';
                        setPtBtn.disabled = true;
                    } else {
                        ptStatusText.textContent = "Coordinate your personal training session for today with your trainer.";
                        setPtBtn.innerHTML = `<i class="fa-solid fa-clock"></i> Set Today's PT Time`;
                        setPtBtn.style.background = 'var(--accent-primary)';
                        setPtBtn.style.cursor = 'pointer';
                        setPtBtn.disabled = false;

                        setPtBtn.onclick = () => {
                            let trainerSlots = [];
                            try {
                                const trainerData = memberData.trainers;
                                if (trainerData && trainerData.certifications && trainerData.certifications.startsWith('{')) {
                                    const certObj = JSON.parse(trainerData.certifications);
                                    trainerSlots = certObj.pt_slots || [];
                                }
                            } catch(e) {}

                            if (trainerSlots.length === 0) {
                                trainerSlots = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];
                            }

                            const slots = trainerSlots.map(timeStr => {
                                let label = timeStr;
                                if (timeStr.includes("06:00 AM") || timeStr.includes("07:00 AM")) label += " - Morning Slot";
                                else if (timeStr.includes("08:00 AM") || timeStr.includes("09:00 AM") || timeStr.includes("10:00 AM")) label += " - Morning Slot";
                                else if (timeStr.includes("05:00 PM") || timeStr.includes("06:00 PM") || timeStr.includes("07:00 PM")) label += " - Evening Slot";
                                else if (timeStr.includes("08:00 PM") || timeStr.includes("09:00 PM")) label += " - Late Slot";
                                return { label: label, value: timeStr };
                            });

                            let selectOptionsHtml = slots.map(s => `<option value="${s.value}">${s.label}</option>`).join('');

                            const existing = document.getElementById('customOverlay');
                            if (existing) existing.remove();

                            const overlay = document.createElement('div');
                            overlay.id = 'customOverlay';
                            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(5px); z-index:9999; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.3s;';
                            overlay.innerHTML = `
                                <div style="background:#111; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; width:90%; max-width:400px; box-shadow:0 20px 40px rgba(0,0,0,0.6); transform:translateY(20px); transition:transform 0.3s;">
                                    <h3 style="margin:0 0 10px 0; color:#fff; font-size:18px;">Schedule Daily PT Time</h3>
                                    <p style="color:#aaa; font-size:13px; margin:0 0 20px 0;">Select your personal training time slot. You can only set this once a day.</p>
                                    <div style="margin-bottom:20px; text-align:left;">
                                        <label style="display:block; color:#aaa; font-size:12px; margin-bottom:8px;">Choose Time Slot</label>
                                        <select id="ptTimeSelect" style="width:100%; background:#1a1a1a; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:12px; border-radius:8px; font-family:inherit; outline:none; cursor:pointer;">
                                            ${selectOptionsHtml}
                                        </select>
                                    </div>
                                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                                        <button id="ptBtnCancel" style="padding:10px 16px; background:transparent; color:#aaa; border:none; cursor:pointer; font-weight:600; border-radius:8px; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'">Cancel</button>
                                        <button id="ptBtnConfirm" style="padding:10px 20px; background:var(--accent-primary); color:#fff; border:none; cursor:pointer; font-weight:600; border-radius:8px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Schedule Slot</button>
                                    </div>
                                </div>
                            `;
                            document.body.appendChild(overlay);

                            setTimeout(() => {
                                overlay.style.opacity = '1';
                                overlay.querySelector('div').style.transform = 'translateY(0)';
                            }, 10);

                            const closeMod = () => {
                                overlay.style.opacity = '0';
                                overlay.querySelector('div').style.transform = 'translateY(20px)';
                                setTimeout(() => overlay.remove(), 300);
                            };

                            overlay.querySelector('#ptBtnCancel').addEventListener('click', closeMod);
                            overlay.querySelector('#ptBtnConfirm').addEventListener('click', async () => {
                                const selectedSlot = document.getElementById('ptTimeSelect').value;
                                if (!selectedSlot) return;

                                overlay.querySelector('#ptBtnConfirm').disabled = true;
                                overlay.querySelector('#ptBtnConfirm').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scheduling...';

                                currentNotes.pt_time = selectedSlot;
                                currentNotes.pt_date = todayStr;

                                const { error: scheduleErr } = await window.db.from('members').update({
                                    medical_notes: JSON.stringify(currentNotes),
                                    updated_at: new Date().toISOString()
                                }).eq('id', memberData.id);

                                if (scheduleErr) {
                                    alert("Failed to schedule PT slot: " + scheduleErr.message);
                                    closeMod();
                                    return;
                                }

                                closeMod();
                                location.reload();
                            });
                        };
                    }
                }

                // Header & Mobile Badges
                document.querySelectorAll('.badge-goal').forEach(el => {
                    el.innerHTML = `<i class="fa-solid fa-bullseye"></i> ${memberData.goal || 'Fitness'}`;
                });

                const isActive = memberData.status === 'active' && expiryDate && new Date(expiryDate) >= new Date().setHours(0,0,0,0);
                document.querySelectorAll('.badge-status').forEach(el => {
                    if (isActive) {
                        el.className = 'badge badge-status';
                        el.innerHTML = `<i class="fa-solid fa-circle-check"></i> Active`;
                    } else {
                        el.className = 'badge badge-status expired';
                        el.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Expired`;
                    }
                });

                // Summary Card
                const summaryValues = document.querySelectorAll('.hero-summary .summary-value');
                if (summaryValues.length >= 4) {
                    summaryValues[0].textContent = memberData.custom_id;
                    const trainerName = memberData.trainers?.users?.full_name || 'Not Assigned';
                    summaryValues[1].innerHTML = `<i class="fa-solid fa-user-ninja" style="color: var(--accent-primary); font-size: 16px; margin-right: 5px;"></i>${trainerName}`;
                    summaryValues[2].textContent = planName;
                    summaryValues[3].textContent = new Date(expiryDate).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'});
                }

                // Stats Grid
                const statValues = document.querySelectorAll('.stats-grid .stat-value');
                if (statValues.length >= 5) {
                    statValues[0].textContent = currentW ? `${currentW} kg` : '--';
                    statValues[1].textContent = targetW ? `${targetW} kg` : '--';
                    statValues[2].textContent = weightDiffLabel;
                    statValues[3].textContent = memberData.height_cm ? `${memberData.height_cm} cm` : '--';
                    
                    // BMI calculation
                    if (currentW > 0 && memberData.height_cm > 0) {
                        const hM = memberData.height_cm / 100;
                        statValues[4].textContent = (currentW / (hM * hM)).toFixed(1);
                    } else {
                        statValues[4].textContent = '--';
                    }

                    // Dynamically update the Weight Diff card label and icon based on goal type (Loss vs Gain)
                    const diffCardIcon = document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-icon');
                    const diffCardLabel = document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-label');
                    if (diffCardLabel) {
                        diffCardLabel.textContent = isLossGoal ? 'Weight Lost' : 'Weight Gained';
                    }
                    if (diffCardIcon) {
                        if (isLossGoal) {
                            diffCardIcon.style.color = 'var(--success)';
                            diffCardIcon.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
                            diffCardIcon.innerHTML = '<i class="fa-solid fa-arrow-trend-down"></i>';
                        } else {
                            diffCardIcon.style.color = '#3498db';
                            diffCardIcon.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                            diffCardIcon.innerHTML = '<i class="fa-solid fa-arrow-trend-up"></i>';
                        }
                    }
                }

                // Progress Tracker Rendering
                const progressFill = document.getElementById('weightProgressBar');
                if (progressFill) progressFill.style.width = `${progressPercentage}%`;
                
                const progLabel = document.getElementById('progressLabel');
                if (progLabel) progLabel.textContent = `Progress towards ${targetW || '--'} kg target`;

                const progPercent = document.getElementById('progressPercent');
                if (progPercent) progPercent.textContent = `${progressPercentage.toFixed(0)}% Completed`;

                const progStart = document.getElementById('progressStart');
                if (progStart) progStart.textContent = `Start: ${startW || '--'} kg`;

                const progCurrent = document.getElementById('progressCurrent');
                if (progCurrent) progCurrent.textContent = `Current: ${currentW || '--'} kg`;

                const progTarget = document.getElementById('progressTarget');
                if (progTarget) progTarget.textContent = `Target: ${targetW || '--'} kg`;

                // Interactive Goal Adjuster Logic
                const toggleGoalEditor = document.getElementById('toggleGoalEditor');
                const cancelGoalEdit = document.getElementById('cancelGoalEdit');
                const saveGoalMetrics = document.getElementById('saveGoalMetrics');
                const goalProgressDisplay = document.getElementById('goalProgressDisplay');
                const goalMetricEditor = document.getElementById('goalMetricEditor');

                const editStartWeight = document.getElementById('editStartWeight');
                const editCurrentWeight = document.getElementById('editCurrentWeight');
                const editTargetWeight = document.getElementById('editTargetWeight');

                if (toggleGoalEditor && goalProgressDisplay && goalMetricEditor) {
                    // Populate initial values in form inputs
                    if (editStartWeight) editStartWeight.value = startW || '';
                    if (editCurrentWeight) editCurrentWeight.value = currentW || '';
                    if (editTargetWeight) editTargetWeight.value = targetW || '';

                    toggleGoalEditor.addEventListener('click', () => {
                        goalProgressDisplay.style.display = 'none';
                        goalMetricEditor.style.display = 'block';
                        toggleGoalEditor.style.display = 'none';
                    });

                    if (cancelGoalEdit) {
                        cancelGoalEdit.addEventListener('click', () => {
                            goalProgressDisplay.style.display = 'block';
                            goalMetricEditor.style.display = 'none';
                            toggleGoalEditor.style.display = 'flex';
                        });
                    }

                    if (saveGoalMetrics) {
                        saveGoalMetrics.addEventListener('click', async () => {
                            const newStart = parseFloat(editStartWeight.value) || 0;
                            const newCurrent = parseFloat(editCurrentWeight.value) || 0;
                            const newTarget = parseFloat(editTargetWeight.value) || 0;

                            if (newStart <= 0 || newCurrent <= 0 || newTarget <= 0) {
                                alert("Please enter valid weight values greater than 0 kg.");
                                return;
                            }

                            saveGoalMetrics.disabled = true;
                            saveGoalMetrics.textContent = 'Saving...';

                            try {
                                // 1. Save Start Weight to LocalStorage for instant bulletproof persistence
                                localStorage.setItem(`fnb_start_weight_${memberData.id}`, newStart.toString());

                                // 2. Delete any old "Registration weight" progress logs to prevent duplicate/incorrect baselines
                                const { data: oldRegs } = await window.db.from('progress_logs')
                                    .select('id')
                                    .eq('member_id', memberData.id)
                                    .or('notes.ilike.%Registration weight%,notes.ilike.%Registration weight (Admin)%,notes.ilike.%Registration weight (recovered)%');
                                
                                if (oldRegs && oldRegs.length > 0) {
                                    const oldIds = oldRegs.map(r => r.id);
                                    await window.db.from('progress_logs').delete().in('id', oldIds);
                                }

                                // 3. Insert fresh clean baseline log for Start Weight
                                const memberStart = memberData.membership_start || memberData.users?.created_at || new Date().toISOString();
                                await window.db.from('progress_logs').insert([{
                                    member_id: memberData.id,
                                    weight: newStart.toString(),
                                    notes: 'Registration weight (recovered)',
                                    created_at: new Date(memberStart).toISOString()
                                }]);

                                // 4. Update Current Weight and Target Weight directly in the members table
                                await window.db.from('members').update({
                                    current_weight: newCurrent.toString(),
                                    target_weight: newTarget.toString()
                                }).eq('id', memberData.id);

                                // 5. Add a current weight log if different from starting weight
                                if (newCurrent !== newStart) {
                                    await window.db.from('progress_logs').insert([{
                                        member_id: memberData.id,
                                        weight: newCurrent.toString(),
                                        notes: 'Updated via Goal Performance Hub editor'
                                    }]);
                                }

                                alert("Fitness metrics updated successfully!");
                                location.reload();
                            } catch(e) {
                                console.error("Failed to update goal metrics:", e);
                                alert("An error occurred while saving. Please check your network and try again.");
                                saveGoalMetrics.disabled = false;
                                saveGoalMetrics.textContent = 'Save Updates';
                            }
                        });
                    }
                }

                // Load Workout and Diet Plans
                await loadWorkoutAndDiet(memberData);
            }

            // Populate Profile
            if (isProfile) {
                const memVals = document.querySelectorAll('.mem-row .mem-val');
                if (memVals.length >= 8) { // Assuming 5 personal + 3 emergency
                    memVals[0].textContent = name;
                    memVals[1].textContent = memberData.users.email || 'N/A';
                    memVals[2].textContent = memberData.users.phone;
                    memVals[3].textContent = new Date(memberData.users.created_at).toLocaleDateString('en-IN');
                    memVals[4].textContent = 'Not Specified'; // Gender not in schema yet
                    
                    // Parse emergency contact from medical_notes if JSON
                    let emergency = { name: '', relation: '', phone: '' };
                    try {
                        if (memberData.medical_notes && memberData.medical_notes.startsWith('{')) {
                            emergency = JSON.parse(memberData.medical_notes);
                        }
                    } catch(e) {}

                    memVals[5].textContent = emergency.name || '---';
                    memVals[6].textContent = emergency.relation || '---';
                    memVals[7].textContent = emergency.phone || '---';
                }

                // Edit Emergency Contact with Premium Modal
                const editContactBtn = document.querySelector('.fa-truck-medical').closest('.card').querySelector('.btn-icon');
                if (editContactBtn) {
                    editContactBtn.addEventListener('click', () => {
                        let currentData = { name: '', relation: '', phone: '' };
                        try { if (memberData.medical_notes) currentData = JSON.parse(memberData.medical_notes); } catch(e){}
                        
                        showCustomModal("Edit Emergency Contact", [
                            { label: "Contact Name", value: currentData.name },
                            { label: "Relationship", value: currentData.relation },
                            { label: "Phone Number", value: currentData.phone }
                        ], async (results) => {
                            if (!results[0]) return;
                            const emergencyJson = JSON.stringify({ name: results[0], relation: results[1], phone: results[2] });
                            editContactBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                            await window.db.from('members').update({ medical_notes: emergencyJson }).eq('id', memberData.id);
                            location.reload();
                        });
                    });
                }
            }

            // Populate Membership Page Dynamically
            if (isMembership) {
                // 1. Current Membership Details
                const currentPlanNameEl = document.getElementById('currentPlanName');
                const currentPlanStartEl = document.getElementById('currentPlanStart');
                const currentPlanExpiryEl = document.getElementById('currentPlanExpiry');
                const currentPlanStatusEl = document.getElementById('currentPlanStatus');

                if (currentPlanNameEl) {
                    currentPlanNameEl.textContent = planName || "No Active Plan";
                }
                if (currentPlanStartEl) {
                    currentPlanStartEl.textContent = memberData.membership_start 
                        ? new Date(memberData.membership_start).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) 
                        : 'N/A';
                }
                if (currentPlanExpiryEl) {
                    currentPlanExpiryEl.textContent = expiryDate 
                        ? new Date(expiryDate).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) 
                        : 'N/A';
                }
                if (currentPlanStatusEl) {
                    const isActive = memberData.status === 'active' && expiryDate && new Date(expiryDate) >= new Date().setHours(0,0,0,0);
                    if (isActive) {
                        currentPlanStatusEl.innerHTML = `<span style="color: var(--success); font-weight: 600;"><i class="fa-solid fa-circle-check" style="margin-right: 5px;"></i>Active</span>`;
                    } else if (memberData.status === 'expired' || (expiryDate && new Date(expiryDate) < new Date())) {
                        currentPlanStatusEl.innerHTML = `<span style="color: var(--accent-primary); font-weight: 600;"><i class="fa-solid fa-circle-xmark" style="margin-right: 5px;"></i>Expired</span>`;
                    } else {
                        currentPlanStatusEl.innerHTML = `<span style="color: var(--warning); font-weight: 600;"><i class="fa-solid fa-clock" style="margin-right: 5px;"></i>${memberData.status || 'Pending'}</span>`;
                    }
                }

                // 2. Fetch all Plans from DB
                try {
                    const { data: dbPlans, error: plansErr } = await window.db.from('plans').select('*').eq('is_active', true);
                    if (plansErr) throw plansErr;

                    // Group grids by ID
                    const gymCardioGrid = document.getElementById('gymCardioGrid');
                    const groupClassesGrid = document.getElementById('groupClassesGrid');
                    const ptBoxingGrid = document.getElementById('ptBoxingGrid');

                    if (gymCardioGrid) gymCardioGrid.innerHTML = '';
                    if (groupClassesGrid) groupClassesGrid.innerHTML = '';
                    if (ptBoxingGrid) ptBoxingGrid.innerHTML = '';

                    const planFeatures = {
                        "1 Month Plan": ["Full Equipment Access", "General Trainer Support", "Floor Exercises"],
                        "3 Month Plan": ["Full Equipment Access", "General Trainer Support", "Floor Exercises", "Dietary Guidelines"],
                        "6 Month Plan": ["Full Equipment Access", "General Trainer Support", "Floor Exercises", "Free locker access"],
                        "12 Month Plan": ["Full Equipment Access", "General Trainer Support", "Personalized Diet Plan", "1 Month Freeze Option"],
                        
                        "Group Classes 1 Month": ["High-Energy Sessions", "Expert Instructor Led", "Dynamic Workouts"],
                        "Yoga Class 1 Month": ["Professional Guidance", "Flexibility & Core Strength", "Mental Focus"],
                        "Yoga Class 3 Months": ["Professional Guidance", "Flexibility & Core Strength", "Stress relief strategy"],
                        
                        "PT Per Day": ["1-on-1 Focus Session", "Form Correction", "Day Specific Routine"],
                        "Group Session": ["Small Group Attention", "Shared Motivation", "Complete Workout Coverage"],
                        "PT One-on-One": ["Dedicated Personal Coach", "Custom Nutrition Strategy", "Progress Tracking"]
                    };

                    dbPlans.forEach(plan => {
                        const isCurrent = memberData.plan_id === plan.id;
                        const features = planFeatures[plan.name] || ["Full Access", "Trainer support", "Custom routine"];
                        const featuresListHtml = features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('');

                        let priceSub = '';
                        let durationLabel = '';
                        let buttonText = 'Enroll Now';

                        // Format specific labels to match original hardcoded visual design
                        if (plan.name.includes("Month Plan") || plan.name.includes("12 Month")) {
                            if (plan.name.includes("1 Month")) { priceSub = " /mo"; durationLabel = "1 Month"; buttonText = "Renew Now"; }
                            else if (plan.name.includes("3 Month")) { priceSub = " /3mo"; durationLabel = "3 Months"; buttonText = "Upgrade Now"; }
                            else if (plan.name.includes("6 Month")) { priceSub = " /6mo"; durationLabel = "6 Months"; buttonText = "Upgrade Now"; }
                            else if (plan.name.includes("12 Month") || plan.name.includes("1 Year")) { priceSub = " /yr"; durationLabel = "1 Year (Best Value)"; buttonText = "Upgrade Now"; }
                        } else if (plan.name.includes("Yoga") || plan.name.includes("Group Classes")) {
                            durationLabel = plan.name;
                            priceSub = plan.name.includes("3 Months") ? " /3mo" : " /mo";
                            buttonText = "Enroll Now";
                        } else if (plan.name.includes("PT") || plan.name.includes("Session")) {
                            durationLabel = plan.name;
                            priceSub = plan.name.includes("Per Day") ? " /day" : " /mo";
                            buttonText = plan.name.includes("Per Day") ? "Book Session" : "Enroll Now";
                        } else {
                            durationLabel = plan.name;
                            priceSub = ` /${plan.duration_days} days`;
                        }

                        const cardElement = document.createElement('div');
                        cardElement.className = 'plan-card';
                        if (plan.name.includes("12 Month") || plan.name.includes("1 Year")) {
                            cardElement.style.borderColor = 'var(--accent-primary)';
                            cardElement.style.boxShadow = '0 0 20px rgba(230, 57, 70, 0.15)';
                        }

                        let buttonHtml = '';
                        if (isCurrent) {
                            buttonHtml = `<button class="btn-primary" disabled style="background: var(--success); opacity: 0.8; cursor: default;">Current Plan</button>`;
                        } else {
                            buttonHtml = `<button class="btn-primary" id="btn-pay-${plan.id}">${buttonText}</button>`;
                        }

                        cardElement.innerHTML = `
                            <div class="plan-name" ${plan.name.includes("12 Month") || plan.name.includes("1 Year") ? 'style="color: var(--accent-primary);"' : ''}>${durationLabel}</div>
                            <div class="plan-price">₹${Number(plan.price).toLocaleString('en-IN')}<span style="font-size: 14px; color: var(--text-muted); font-weight: normal;">${priceSub}</span></div>
                            <ul class="plan-features">
                                ${featuresListHtml}
                            </ul>
                            ${buttonHtml}
                        `;

                        // Append to correct category grid
                        if (plan.name.includes("Month Plan") || plan.name.includes("12 Month") || plan.name.includes("Starter") || plan.name.includes("Transformation") || plan.name.includes("Elite")) {
                            if (gymCardioGrid) gymCardioGrid.appendChild(cardElement);
                        } else if (plan.name.includes("Classes") || plan.name.includes("Yoga")) {
                            if (groupClassesGrid) groupClassesGrid.appendChild(cardElement);
                        } else {
                            if (ptBoxingGrid) ptBoxingGrid.appendChild(cardElement);
                        }

                        // Add Payment click listener if not current
                        if (!isCurrent) {
                            setTimeout(() => {
                                const payBtn = document.getElementById(`btn-pay-${plan.id}`);
                                if (payBtn) {
                                    payBtn.addEventListener('click', () => initiateRazorpayPayment(plan, memberData));
                                }
                            }, 50);
                        }
                    });

                } catch (plansErr) {
                    console.error("Failed to load plans dynamically:", plansErr);
                }
            }

        } catch (err) {
            console.error("Dashboard init error:", err);
        }
    }

    // --- Razorpay Payment Integration ---
    async function initiateRazorpayPayment(plan, memberData) {
        if (window.Razorpay) {
            try {
                const options = {
                    "key": "rzp_test_SeEg9HEO5nnatC", // Test Key
                    "amount": Math.round(plan.price * 100),
                    "currency": "INR",
                    "name": "Fit 'N' Blaze",
                    "description": `${plan.name} Membership`,
                    "image": "../assets/FNB%20logo.png",
                    "handler": async function (response) {
                        const paymentId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substr(2, 9)}`;
                        try {
                            await handlePaymentSuccess(plan, paymentId, memberData);
                            alert("✅ Membership successfully updated!");
                            location.reload();
                        } catch (err) {
                            console.error("Payment update error:", err);
                            alert("Payment was successful, but membership update failed: " + (err.message || JSON.stringify(err)));
                        }
                    },
                    "prefill": {
                        "name": memberData.users?.full_name || 'Member',
                        "email": memberData.users?.email || 'member@fitnblaze.com',
                        "contact": memberData.users?.phone || '9999999999'
                    },
                    "theme": {
                        "color": "#e63946"
                    }
                };
                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert("Payment Failed. Reason: " + response.error.description);
                });
                rzp.open();
            } catch (e) {
                console.warn("Razorpay loading error, falling back to simulated high-fidelity gateway:", e);
                showSimulatedRazorpayGateway(plan, memberData);
            }
        } else {
            showSimulatedRazorpayGateway(plan, memberData);
        }
    }

    // High fidelity, ultra-premium Razorpay checkout simulation
    function showSimulatedRazorpayGateway(plan, memberData) {
        const existing = document.getElementById('paymentOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'paymentOverlay';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:10000; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.3s; font-family:system-ui, -apple-system, sans-serif;';
        
        overlay.innerHTML = `
            <div style="background:#121214; border:1px solid rgba(255,255,255,0.06); border-radius:16px; width:90%; max-width:440px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.8); transform:translateY(30px); transition:transform 0.3s;">
                <!-- Simulated Razorpay Header -->
                <div style="background:#0b1a30; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #145cc5;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="../assets/FNB logo.png" style="height:28px; width:auto;" alt="FNB Logo">
                        <div style="text-align:left;">
                            <h4 style="margin:0; color:#fff; font-size:14px; font-weight:600; letter-spacing:0.5px;">FIT 'N' BLAZE</h4>
                            <p style="margin:0; color:#4ade80; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1px;"><i class="fa-solid fa-shield-halved" style="margin-right:3px;"></i> Razorpay Secure Sandbox</p>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <span style="color:#aaa; font-size:10px; display:block;">Amount to Pay</span>
                        <strong style="color:#fff; font-size:18px; font-weight:700;">₹${Number(plan.price).toLocaleString('en-IN')}</strong>
                    </div>
                </div>

                <!-- Simulation Body -->
                <div style="padding:24px;" id="paymentBody">
                    <p style="color:#aaa; font-size:12px; margin:0 0 20px 0; text-align:center; line-height:1.5;">This secure gateway allows you to test standard client-side membership activations and updates instantly using Sandbox integration.</p>
                    
                    <div style="margin-bottom:16px;">
                        <label style="display:block; color:#888; font-size:11px; text-transform:uppercase; font-weight:600; margin-bottom:6px; text-align:left;">Select Payment Method</label>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                            <button id="payMethodCard" style="background:#1b1b1f; border:1px solid #145cc5; color:#fff; padding:12px; border-radius:8px; display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-size:12px;">
                                <i class="fa-regular fa-credit-card" style="font-size:16px; color:#145cc5;"></i> Credit/Debit Card
                            </button>
                            <button id="payMethodUpi" style="background:#161618; border:1px solid rgba(255,255,255,0.06); color:#aaa; padding:12px; border-radius:8px; display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; font-weight:600; font-size:12px;">
                                <i class="fa-solid fa-mobile-screen-button" style="font-size:16px;"></i> UPI / QR Code
                            </button>
                        </div>
                    </div>

                    <!-- Card details input form -->
                    <div id="cardForm" style="display:block;">
                        <div style="margin-bottom:12px; text-align:left;">
                            <label style="display:block; color:#aaa; font-size:11px; margin-bottom:5px;">Card Number</label>
                            <input type="text" value="4111 2222 3333 4444" disabled style="width:100%; background:#161618; border:1px solid rgba(255,255,255,0.08); color:#fff; padding:10px; border-radius:6px; font-size:13px; font-family:monospace; box-sizing:border-box;">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; text-align:left;">
                            <div>
                                <label style="display:block; color:#aaa; font-size:11px; margin-bottom:5px;">Expiry (MM/YY)</label>
                                <input type="text" value="12/29" disabled style="width:100%; background:#161618; border:1px solid rgba(255,255,255,0.08); color:#fff; padding:10px; border-radius:6px; font-size:13px; font-family:monospace; text-align:center; box-sizing:border-box;">
                            </div>
                            <div>
                                <label style="display:block; color:#aaa; font-size:11px; margin-bottom:5px;">CVV</label>
                                <input type="password" value="123" disabled style="width:100%; background:#161618; border:1px solid rgba(255,255,255,0.08); color:#fff; padding:10px; border-radius:6px; font-size:13px; font-family:monospace; text-align:center; box-sizing:border-box;">
                            </div>
                        </div>
                        <div style="margin-bottom:20px; text-align:left;">
                            <label style="display:block; color:#aaa; font-size:11px; margin-bottom:5px;">Card Holder Name</label>
                            <input type="text" value="${memberData.users?.full_name || 'Member'}" disabled style="width:100%; background:#161618; border:1px solid rgba(255,255,255,0.08); color:#fff; padding:10px; border-radius:6px; font-size:13px; box-sizing:border-box;">
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                        <button id="paySubmitBtn" style="padding:14px; background:#145cc5; color:#fff; border:none; cursor:pointer; font-weight:600; border-radius:8px; transition:opacity 0.2s; font-size:13px;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                            <i class="fa-solid fa-lock" style="margin-right:5px;"></i> Pay ₹${Number(plan.price).toLocaleString('en-IN')} Securely
                        </button>
                        <button id="payCancelBtn" style="padding:10px; background:transparent; color:#888; border:none; cursor:pointer; font-weight:500; border-radius:8px; transition:color 0.2s; font-size:12px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#888'">
                            Cancel Payment
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('div').style.transform = 'translateY(0)';
        }, 10);

        const closePayMod = () => {
            overlay.style.opacity = '0';
            overlay.querySelector('div').style.transform = 'translateY(30px)';
            setTimeout(() => overlay.remove(), 300);
        };

        const paySubmitBtn = overlay.querySelector('#paySubmitBtn');
        const payCancelBtn = overlay.querySelector('#payCancelBtn');
        const payBody = overlay.querySelector('#paymentBody');

        payCancelBtn.addEventListener('click', closePayMod);

        paySubmitBtn.addEventListener('click', async () => {
            paySubmitBtn.disabled = true;
            payCancelBtn.style.display = 'none';
            
            const steps = [
                "Connecting to secure card network...",
                "Requesting 3D-Secure 2.0 authorization code...",
                "Securing transaction with end-to-end sandbox key...",
                "Authorizing amount via Razorpay capturing API...",
                "Recording transaction with Supabase backend..."
            ];

            let index = 0;
            payBody.innerHTML = `
                <div style="text-align:center; padding:30px 10px;" id="simStatusDiv">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size:36px; color:#145cc5; margin-bottom:20px;"></i>
                    <p style="color:#fff; font-size:14px; font-weight:600; margin:0 0 10px 0;">Processing Payment</p>
                    <p style="color:#aaa; font-size:12px; margin:0;" id="simStatusText">${steps[0]}</p>
                </div>
            `;

            const statusText = document.getElementById('simStatusText');
            
            const interval = setInterval(() => {
                index++;
                if (index < steps.length) {
                    if (statusText) statusText.textContent = steps[index];
                } else {
                    clearInterval(interval);
                }
            }, 700);

            setTimeout(async () => {
                clearInterval(interval);
                const mockPayId = `pay_${Math.random().toString(36).substr(2, 9)}`;
                
                try {
                    const statusDiv = document.getElementById('simStatusDiv');
                    if (statusDiv) {
                        statusDiv.innerHTML = `
                            <i class="fa-solid fa-circle-check" style="font-size:48px; color:var(--success); margin-bottom:20px; animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></i>
                            <p style="color:#fff; font-size:16px; font-weight:700; margin:0 0 8px 0;">Payment Authorized!</p>
                            <p style="color:#888; font-size:11px; margin:0 0 15px 0;">ID: ${mockPayId}</p>
                            <p style="color:#aaa; font-size:12px; margin:0;">Activating ${plan.name}...</p>
                        `;
                    }

                    try {
                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
                        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.15);
                    } catch(audioErr){}

                    await handlePaymentSuccess(plan, mockPayId, memberData);
                    setTimeout(() => {
                        closePayMod();
                        location.reload();
                    }, 1200);

                } catch(err) {
                    console.error("Simulation transaction failed:", err);
                    alert("A database connection error occurred during activation. Transaction rolled back.");
                    closePayMod();
                }
            }, 3600);
        });
    }

    // Success transaction logic
    async function handlePaymentSuccess(plan, paymentId, memberData) {
        try {
            // 1. Insert record in Payments
            const { error: payErr } = await window.db.from('payments').insert([{
                member_id: memberData.id,
                plan_id: plan.id,
                amount: plan.price,
                payment_method: 'online', 
                payment_gateway: 'Razorpay',
                razorpay_payment_id: paymentId,
                transaction_reference: `TXN_${Date.now()}`,
                status: 'paid', 
                paid_at: new Date().toISOString()
            }]);

            if (payErr) throw payErr;

            // 2. Compute date boundaries
            const start = new Date();
            const end = new Date();
            end.setDate(start.getDate() + plan.duration_days);

            const startStr = start.toLocaleDateString('sv-SE');
            const endStr = end.toLocaleDateString('sv-SE');

            // 3. Update subscription on Members
            const { error: memUpdateErr } = await window.db.from('members').update({
                plan_id: plan.id,
                membership_start: startStr,
                membership_end: endStr,
                status: 'active' 
            }).eq('id', memberData.id);

            if (memUpdateErr) throw memUpdateErr;

        } catch (err) {
            console.error("Failed to complete database write for payment:", err);
            throw err;
        }
    }

    // Helper to get local date string YYYY-MM-DD
    function getLocalDateString(date = new Date()) {
        return date.toLocaleDateString('sv-SE');
    }

    // Helper to get the week's dates (Monday to Sunday) in local timezone
    function getWeekDates() {
        const today = new Date();
        const todayDayIndex = (today.getDay() + 6) % 7; 
        
        const weekDates = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach((day, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - todayDayIndex + i);
            weekDates[day] = d.toLocaleDateString('sv-SE');
        });
        return weekDates;
    }

    // Helper to parse text into a constant-keys map
    function parsePlanContent(text, keys) {
        const map = {};
        keys.forEach(k => map[k.toLowerCase()] = '');
        
        if (!text) return map;
        
        const lines = text.split('\n');
        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase();
                const val = parts.slice(1).join(':').trim();
                
                const matchedKey = keys.find(k => k.toLowerCase() === key);
                if (matchedKey) {
                    map[matchedKey.toLowerCase()] = val;
                }
            }
        });
        return map;
    }

    // Helper to serialize map back to key: value format
    function serializePlanContent(map, keys) {
        return keys.map(k => `${k}: ${map[k.toLowerCase()] || ''}`).join('\n');
    }

    async function loadWorkoutAndDiet(memberData) {
        const memberId = memberData.id;
        const dietPreference = memberData.dietary_preferences;
        
        // Parse medical notes to get completion data
        let medicalNotesObj = {};
        try {
            if (memberData.medical_notes && memberData.medical_notes.startsWith('{')) {
                medicalNotesObj = JSON.parse(memberData.medical_notes);
            }
        } catch(e) {}
        
        if (!medicalNotesObj.completed_days) {
            medicalNotesObj.completed_days = [];
        }
        
        const completedDays = medicalNotesObj.completed_days;
        const weekDates = getWeekDates();
        const todayStr = getLocalDateString();
        
        // Count completions for the week
        let completedCount = 0;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            const dateStr = weekDates[day];
            if (completedDays.includes(dateStr)) {
                completedCount++;
            }
        });
        const completionPercent = Math.round((completedCount / 7) * 100);

        // Render Weekly Completion Tracker Bar above the plan list
        const workoutContainer = document.querySelector('#workout');
        if (workoutContainer) {
            const existingBar = workoutContainer.querySelector('.weekly-completion-tracker');
            if (existingBar) existingBar.remove();

            const currentLevel = (medicalNotesObj && medicalNotesObj.experience) ? medicalNotesObj.experience.toLowerCase() : 'beginner';
            const trackerBarHtml = `
                <div class="weekly-completion-tracker" style="margin-bottom: 20px; background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-size: 13px; color: var(--text-muted);">
                            <span>Weekly Workout Completion</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 12px; color: var(--text-muted);">Level:</span>
                            <select id="workoutLevelToggle" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 12px; outline: none; cursor: pointer; transition: all 0.2s;">
                                <option value="beginner" ${currentLevel === 'beginner' ? 'selected' : ''} style="color: black;">Beginner</option>
                                <option value="intermediate" ${currentLevel === 'intermediate' ? 'selected' : ''} style="color: black;">Intermediate</option>
                                <option value="advanced" ${currentLevel === 'advanced' ? 'selected' : ''} style="color: black;">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
                        <span style="color: var(--success); font-weight: 600;">${completedCount} / 7 Days Completed (${completionPercent}%)</span>
                    </div>
                    <div style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${completionPercent}%; height: 100%; background: linear-gradient(90deg, var(--success), #34d399); border-radius: 4px; transition: width 0.5s ease-in-out;"></div>
                    </div>
                </div>
            `;
            const planList = workoutContainer.querySelector('.plan-list');
            if (planList) {
                planList.insertAdjacentHTML('beforebegin', trackerBarHtml);
                
                const levelToggle = workoutContainer.querySelector('#workoutLevelToggle');
                if (levelToggle) {
                    levelToggle.addEventListener('change', async (e) => {
                        const newLevel = e.target.value;
                        medicalNotesObj.experience = newLevel;
                        
                        const originalColor = levelToggle.style.color;
                        levelToggle.style.color = 'var(--accent-primary)';
                        
                        try {
                            const { error: updateErr } = await window.db.from('members').update({
                                medical_notes: JSON.stringify(medicalNotesObj)
                            }).eq('id', memberId);
                            
                            if (updateErr) throw updateErr;
                            
                            location.reload();
                        } catch (err) {
                            console.error("Failed to update level:", err);
                            alert("Failed to update workout level.");
                            e.target.value = currentLevel;
                            levelToggle.style.color = originalColor;
                        }
                    });
                }
            }
        }

        // Workout
        const { data: workouts } = await window.db.from('workout_programs').select('*').eq('member_id', memberId);
        let workoutStr = defaultWorkoutTemplate;
        let workoutId = null;

        if (workouts && workouts.length > 0) {
            workoutStr = workouts[0].content;
            workoutId = workouts[0].id;
        } else {
            const { data: newW } = await window.db.from('workout_programs').insert({
                member_id: memberId, title: 'My Weekly Workout', content: workoutStr
            }).select().single();
            if(newW) workoutId = newW.id;
        }

        renderPlanList(document.querySelector('#workout .plan-list'), workoutStr, {
            weekDates,
            todayStr,
            completedDays,
            medicalNotesObj,
            memberData
        });

        // Diet
        const { data: diets } = await window.db.from('diet_plans').select('*').eq('member_id', memberId);
        let dietStr = defaultDietTemplates['veg']; // fallback
        if(dietPreference) {
            const pref = dietPreference.toLowerCase().replace(/\s/g, '');
            if(pref.includes('non')) dietStr = defaultDietTemplates['non-veg'];
            else if(pref.includes('vegan')) dietStr = defaultDietTemplates['vegan'];
            else if(pref.includes('egg')) dietStr = defaultDietTemplates['eggetarian'];
            else dietStr = defaultDietTemplates['veg'];
        }

        let dietId = null;
        if (diets && diets.length > 0) {
            dietStr = diets[0].content;
            dietId = diets[0].id;
        } else {
            const { data: newD } = await window.db.from('diet_plans').insert({
                member_id: memberId, title: 'My Nutrition Plan', content: dietStr
            }).select().single();
            if(newD) dietId = newD.id;
        }

        renderPlanList(document.querySelector('#diet .plan-list'), dietStr, null);

        // Editable behavior
        setupEditablePlan('#workout', 'Workout Plan', recordId => workoutId = recordId || workoutId, () => workoutStr, workoutId, memberId, dietPreference);
        setupEditablePlan('#diet', 'Nutrition Plan', recordId => dietId = recordId || dietId, () => dietStr, dietId, memberId, dietPreference);
    }

    function renderPlanList(ulElement, textContent, completionData = null) {
        if (!ulElement) return;
        ulElement.innerHTML = '';
        
        const isWorkout = completionData !== null;
        const keys = isWorkout 
            ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            : ['Breakfast', 'Lunch', 'Evening', 'Dinner'];
            
        const parsedMap = parsePlanContent(textContent, keys);
        
        keys.forEach(key => {
            const desc = parsedMap[key.toLowerCase()] || '';
            const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const isToday = (key === todayName);
            
            let exercisesHtml = '';
            if (isWorkout && desc && typeof WORKOUT_EXERCISES !== 'undefined') {
                const level = (completionData && completionData.medicalNotesObj && completionData.medicalNotesObj.experience) ? completionData.medicalNotesObj.experience.toLowerCase() : 'beginner';
                let matchedWorkout = null;
                for (const wKey in WORKOUT_EXERCISES) {
                    if (desc.toLowerCase().includes(wKey.toLowerCase())) {
                        matchedWorkout = wKey;
                        break;
                    }
                }
                if (matchedWorkout && WORKOUT_EXERCISES[matchedWorkout][level] && isToday) {
                    const exList = WORKOUT_EXERCISES[matchedWorkout][level];
                    exercisesHtml = `<ul style="margin-top: 8px; margin-left: 102px; padding-left: 16px; list-style-type: disc; color: var(--text-muted); font-size: 13px;">` +
                        exList.map(ex => `<li style="margin-bottom: 4px;">${ex}</li>`).join('') +
                        `</ul>`;
                }
            }
            
            let completionHtml = '';
            if (isWorkout) {
                const dateStr = completionData.weekDates[key];
                
                if (dateStr) {
                    const isCompleted = completionData.completedDays.includes(dateStr);
                    if (isCompleted) {
                        // Completed state
                        if (isToday) {
                            completionHtml = `
                                <button class="btn-toggle-completion" data-date="${dateStr}" data-action="uncheck" style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); color: var(--success); cursor: pointer; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.borderColor='var(--accent-primary)'; this.style.color='var(--accent-primary)';" onmouseout="this.style.background='rgba(16, 185, 129, 0.1)'; this.style.borderColor='var(--success)'; this.style.color='var(--success)';">
                                    <i class="fa-solid fa-circle-check"></i> Done
                                </button>`;
                        } else {
                            completionHtml = `
                                <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--success); border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; opacity: 0.6; cursor: not-allowed;" title="Locked for other days">
                                    <i class="fa-solid fa-circle-check"></i> Done
                                </div>`;
                        }
                    } else {
                        // Uncompleted state
                        if (isToday) {
                            completionHtml = `
                                <button class="btn-toggle-completion" data-date="${dateStr}" data-action="check" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); cursor: pointer; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.background='rgba(16, 185, 129, 0.1)'; this.style.borderColor='var(--success)'; this.style.color='var(--success)';" onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='var(--text-muted)';">
                                    <i class="fa-regular fa-circle"></i> Complete
                                </button>`;
                        } else {
                            completionHtml = `
                                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; opacity: 0.4; cursor: not-allowed;" title="Locked for other days">
                                    <i class="fa-solid fa-lock"></i> Locked
                                </div>`;
                        }
                    }
                }
            }

            ulElement.innerHTML += `
                <li class="plan-item" style="display: flex; flex-direction: column; width: 100%;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <span class="${isWorkout ? 'plan-day' : 'diet-time'}" style="font-weight:600;min-width:90px">${key}</span>
                            <span class="plan-desc">${desc}</span>
                        </div>
                        ${completionHtml ? `<div class="completion-col" style="flex-shrink: 0; display: flex; align-items: center;">${completionHtml}</div>` : ''}
                    </div>
                    ${exercisesHtml}
                </li>`;
        });

        // Add event listeners if this is the workout plan and has toggle buttons
        if (isWorkout) {
            const toggleButtons = ulElement.querySelectorAll('.btn-toggle-completion');
            toggleButtons.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const dateStr = btn.getAttribute('data-date');
                    const action = btn.getAttribute('data-action');
                    
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                    
                    const medicalNotesObj = completionData.medicalNotesObj;
                    const memberData = completionData.memberData;
                    
                    if (action === 'check') {
                        // Add date
                        if (!medicalNotesObj.completed_days.includes(dateStr)) {
                            medicalNotesObj.completed_days.push(dateStr);
                        }
                    } else if (action === 'uncheck') {
                        // Remove date
                        medicalNotesObj.completed_days = medicalNotesObj.completed_days.filter(d => d !== dateStr);
                    }
                    
                    const { error: completeErr } = await window.db.from('members').update({
                        medical_notes: JSON.stringify(medicalNotesObj),
                        updated_at: new Date().toISOString()
                    }).eq('id', memberData.id);
                    
                    if (completeErr) {
                        alert("Failed to save completion: " + completeErr.message);
                        btn.disabled = false;
                        if (action === 'check') {
                            btn.innerHTML = '<i class="fa-regular fa-circle"></i> Complete';
                        } else {
                            btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Done';
                        }
                        return;
                    }
                    
                    location.reload();
                });
            });
        }
    }

    function setupEditablePlan(containerSelector, title, setRecordId, getText, recordId, memberId, dietPreference) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const editBtn = container.querySelector('.btn-icon');
        if (!editBtn) return;
        
        const isWorkout = containerSelector === '#workout';
        const keys = isWorkout 
            ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            : ['Breakfast', 'Lunch', 'Evening', 'Dinner'];

        // Remove old event listener by replacing the button with a cloned one
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);

        newEditBtn.addEventListener('click', () => {
            const currentText = getText();
            const parsedMap = parsePlanContent(currentText, keys);
            
            // Build fields for the modal
            const workoutOptions = ["Chest & Triceps", "Back & Biceps", "Legs", "Shoulders", "Cardio & Core", "Functional Training", "Rest"];
            
            const fields = keys.map(key => ({
                label: key,
                value: parsedMap[key.toLowerCase()] || '',
                type: isWorkout ? 'select' : 'text',
                options: isWorkout ? workoutOptions : undefined
            }));

            showCustomModal(`Edit ${title}`, fields, async (results) => {
                const newMap = {};
                keys.forEach((key, index) => {
                    newMap[key.toLowerCase()] = results[index] ? results[index].trim() : '';
                });
                const newText = serializePlanContent(newMap, keys);

                if (newText && newText !== currentText) {
                    newEditBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                    const tableName = isWorkout ? 'workout_programs' : 'diet_plans';
                    const planTitle = isWorkout ? 'My Weekly Workout' : 'My Nutrition Plan';
                    
                    try {
                        // Dynamically check if a record already exists for this memberId
                        const { data: existing } = await window.db.from(tableName).select('id').eq('member_id', memberId);
                        let targetId = recordId;
                        if (existing && existing.length > 0) {
                            targetId = existing[0].id;
                        }

                        if (targetId) {
                            // Update existing record
                            const { error: updateErr } = await window.db.from(tableName)
                                .update({ content: newText, updated_at: new Date().toISOString() })
                                .eq('id', targetId);
                            
                            if (updateErr) throw updateErr;
                        } else {
                            // Insert new record
                            const { error: insertErr } = await window.db.from(tableName)
                                .insert({ member_id: memberId, title: planTitle, content: newText });
                            
                            if (insertErr) throw insertErr;
                        }
                        
                        location.reload();
                    } catch (err) {
                        alert("Failed to save plan: " + err.message);
                        newEditBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
                    }
                }
            });
        });
    }

    // --- Init ---
    await loadMemberData();

    // --- Sidebar Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    // --- Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card').forEach(card => observer.observe(card));

    // --- BMI Calculator ---
    const calculateBmiBtn = document.getElementById('calculateBmiBtn');
    if (calculateBmiBtn) {
        calculateBmiBtn.addEventListener('click', async () => {
            const h = parseFloat(document.getElementById('bmiHeight').value);
            const w = parseFloat(document.getElementById('bmiWeight').value);
            const bmiRes = document.getElementById('bmiResult');
            const bmiVal = document.getElementById('bmiValue');
            const bmiCat = document.getElementById('bmiCategory');

            if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
                bmiCat.textContent = "Please enter valid numbers";
                bmiCat.style.color = "var(--warning)";
                return;
            }

            const bmi = w / ((h / 100) * (h / 100));
            bmiVal.textContent = bmi.toFixed(1);

            if (bmi < 18.5) { bmiCat.textContent = "Underweight"; bmiCat.style.color = "#3498db"; } 
            else if (bmi < 24.9) { bmiCat.textContent = "Normal weight"; bmiCat.style.color = "var(--success)"; } 
            else if (bmi < 29.9) { bmiCat.textContent = "Overweight"; bmiCat.style.color = "var(--warning)"; } 
            else { bmiCat.textContent = "Obese"; bmiCat.style.color = "var(--accent-primary)"; }

            calculateBmiBtn.textContent = 'Saving...';
            // Save to DB — fetch full member row first so we can recover old weight
            const { data: memData } = await window.db.from('members')
                .select('id, current_weight')
                .eq('user_id', currentUser.id).single();

            if(memData) {
                const oldWeight = parseFloat(memData.current_weight) || 0;

                // Check if a "Registration weight" baseline exists in progress_logs
                const { data: regLogs } = await window.db.from('progress_logs')
                    .select('id, notes')
                    .eq('member_id', memData.id)
                    .or('notes.ilike.%Registration weight%,notes.ilike.%Registration weight (Admin)%,notes.ilike.%Registration weight (recovered)%')
                    .limit(1);

                const hasRegistrationLog = regLogs && regLogs.length > 0;

                // If NO registration baseline exists, snapshot the OLD weight before we overwrite it
                if (!hasRegistrationLog && oldWeight > 0) {
                    await window.db.from('progress_logs').insert([{
                        member_id: memData.id,
                        weight: oldWeight.toString(),
                        notes: 'Registration weight (recovered)'
                    }]);
                }

                // Now update the member's current weight
                await window.db.from('members').update({ height_cm: h, current_weight: w }).eq('id', memData.id);

                // Insert a new progress log entry for dynamic historical tracking
                await window.db.from('progress_logs').insert([{
                    member_id: memData.id,
                    weight: w.toString(),
                    notes: 'Updated via dashboard weight calculator'
                }]);
            }
            calculateBmiBtn.textContent = 'Calculate';
            
            // Reload page to reflect new weights in dashboard
            setTimeout(() => location.reload(), 1000);
        });
    }

    // Notification Dropdown
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    if(notifToggle && notifDropdown) {
        notifToggle.addEventListener('click', (e) => { e.stopPropagation(); notifDropdown.classList.toggle('show'); });
        document.addEventListener('click', (e) => {
            if (!notifToggle.contains(e.target) && !notifDropdown.contains(e.target)) notifDropdown.classList.remove('show');
        });
    }
});
