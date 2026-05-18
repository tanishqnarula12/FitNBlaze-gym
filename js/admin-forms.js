// admin-forms.js - Logic for Add Member and Add Trainer admin forms

// --- UI Animations & General Interactions ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Show sticky action bar after a tiny delay for animation effect
    setTimeout(() => {
        const actionBar = document.getElementById('actionBar');
        if (actionBar) {
            actionBar.classList.add('visible');
        }
    }, 300);

    // Form inputs validation styling removal on input
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                input.classList.remove('invalid');
                input.style.borderColor = '';
            }
        });
        
        if(input.type === 'radio' || input.type === 'checkbox') {
            input.addEventListener('change', () => {
                const group = input.closest('.options-grid');
                if(group && group.style.borderColor) {
                    group.style.border = 'none';
                }
            });
        }
    });

});

// --- Validation Helper ---
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredInputs = form.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            const name = input.name;
            // Check if at least one in the group is checked
            const checked = form.querySelector(`input[name="${name}"]:checked`);
            
            if (!checked) {
                isValid = false;
                const container = form.querySelector(`input[name="${name}"]`).closest('.options-grid');
                if (container) {
                    container.style.border = '1px solid #ff4d4d';
                    container.style.borderRadius = '12px';
                    container.style.padding = '10px';
                }
            }
        } else {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
                input.style.borderColor = '#ff4d4d';
            }
        }
    });

    // specific phone regex validation
    const phone = form.querySelector('#phone');
    if (phone && phone.value && !phone.value.match(/^[0-9]{10}$/)) {
        isValid = false;
        phone.classList.add('invalid');
        phone.style.borderColor = '#ff4d4d';
    }

    return isValid;
}

// --- Init Member Form Logic ---
async function initMemberForm() {
    if(window.auth && window.auth.requireAuth) window.auth.requireAuth('admin');

    // Auto-fill Start Date to Today
    document.getElementById('startDate').valueAsDate = new Date();
    
    // Fetch active plans and populate dropdown
    const planSelect = document.getElementById('planSelect');
    if (window.db && planSelect) {
        // Auto-heal / seed the 10 correct website memberships into the DB
        try {
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

            const { data: existingPlans } = await window.db.from('plans').select('name');
            const existingNames = existingPlans ? existingPlans.map(p => p.name) : [];
            const toInsert = defaultPlans.filter(p => !existingNames.includes(p.name));
            if (toInsert.length > 0) {
                await window.db.from('plans').insert(toInsert);
            }

            // Deactivate old incorrect plans
            const oldPlanNames = ['1 Month Starter', '3 Month Transformation', '6 Month Elite', 'Starter', 'Transformation', 'Elite'];
            await window.db.from('plans').update({ is_active: false }).in('name', oldPlanNames);
        } catch (e) {
            console.error("Error auto-syncing plans:", e);
        }

        const { data: plans } = await window.db.from('plans').select('*').eq('is_active', true);
        if (plans) {
            planSelect.innerHTML = '<option value="" disabled selected>Choose a Plan...</option>';
            plans.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.setAttribute('data-price', p.price);
                opt.setAttribute('data-duration', p.duration_days + ' Days');
                opt.innerText = `${p.name} — ₹${parseInt(p.price).toLocaleString('en-IN')}`;
                planSelect.appendChild(opt);
            });
        }
    }

    // Fetch active trainers and populate dropdown in real-time
    const trainerAssigned = document.getElementById('trainerAssigned');
    if (window.db && trainerAssigned) {
        try {
            const { data: trainers } = await window.db
                .from('trainers')
                .select(`
                    id,
                    specialization,
                    users (
                        full_name,
                        is_active
                    )
                `);
            
            if (trainers && trainers.length > 0) {
                trainerAssigned.innerHTML = '<option value="">No Trainer (Self Workout)</option>';
                trainers.forEach(t => {
                    if (t.users && t.users.is_active) {
                        const opt = document.createElement('option');
                        opt.value = t.id;
                        opt.innerText = `${t.users.full_name} (${t.specialization || 'Fitness'})`;
                        trainerAssigned.appendChild(opt);
                    }
                });
            } else {
                trainerAssigned.innerHTML = '<option value="">No Trainer (Self Workout)</option>';
            }
        } catch (e) {
            console.error("Error fetching trainers:", e);
        }
    }

    // Generate Real Member ID
    let memberCustomId = "FNB---";
    if(window.db) {
        const { data } = await window.db.rpc('generate_member_id');
        if(data) {
            memberCustomId = data;
            document.getElementById('generatedMemberId').innerText = memberCustomId;
        }
    }

    // Auto-fill duration & price when plan changes
    const durationInput = document.getElementById('duration');
    const amountPaidInput = document.getElementById('amountPaid');

    if (planSelect) {
        planSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                durationInput.value = selectedOption.getAttribute('data-duration');
                amountPaidInput.value = selectedOption.getAttribute('data-price');
            }
        });
    }

    // Submit Action
    const btnSubmitMember = document.getElementById('btnSubmitMember');
    if (btnSubmitMember) {
        btnSubmitMember.addEventListener('click', async () => {
            if (validateForm('addMemberForm')) {
                const originalText = btnSubmitMember.innerHTML;
                btnSubmitMember.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
                btnSubmitMember.disabled = true;

                try {
                    // 1. Insert into users table
                    const { data: userData, error: userError } = await window.db.from('users').insert([{
                        role: 'member',
                        login_id: memberCustomId,
                        phone: document.getElementById('phone').value,
                        full_name: document.getElementById('fullName').value,
                        email: document.getElementById('email').value || null,
                        is_active: document.getElementById('accountStatus').value === 'Active'
                    }]).select().single();

                    if(userError) throw userError;

                    // 2. Insert into members table
                    const goalInput = document.querySelector('input[name="goal"]:checked');
                    const trainerVal = document.getElementById('trainerAssigned').value;
                    const assignedTrainerId = (trainerVal && trainerVal !== 'None' && trainerVal !== '') ? trainerVal : null;
                    
                    // Calculate membership end date based on plan duration
                    let durationDays = 30;
                    const selectedPlanOption = planSelect.options[planSelect.selectedIndex];
                    if (selectedPlanOption) {
                        const durationAttr = selectedPlanOption.getAttribute('data-duration');
                        if (durationAttr) {
                            const parsedDays = parseInt(durationAttr);
                            if (!isNaN(parsedDays)) {
                                durationDays = parsedDays;
                            }
                        }
                    }
                    const startDateVal = document.getElementById('startDate').value;
                    const startDateObj = startDateVal ? new Date(startDateVal) : new Date();
                    const endDateObj = new Date(startDateObj);
                    endDateObj.setDate(endDateObj.getDate() + durationDays);
                    const membershipEnd = endDateObj.toISOString().split('T')[0];

                    const { data: memberData, error: memberError } = await window.db.from('members').insert([{
                        user_id: userData.id,
                        custom_id: memberCustomId,
                        goal: goalInput ? goalInput.value : null,
                        current_weight: document.getElementById('currentWeight').value,
                        target_weight: document.getElementById('targetWeight').value,
                        height_cm: document.getElementById('height').value,
                        plan_id: planSelect.value || null,
                        assigned_trainer_id: assignedTrainerId,
                        status: document.getElementById('accountStatus').value.toLowerCase(),
                        medical_notes: document.getElementById('medical').value,
                        dietary_preferences: document.getElementById('dietary').value,
                        membership_start: startDateObj.toISOString().split('T')[0],
                        membership_end: membershipEnd
                    }]).select().single();

                    if(memberError) throw memberError;

                    // Seed initial registration weight in progress_logs
                    const weightVal = document.getElementById('currentWeight').value;
                    if (weightVal) {
                        try {
                            await window.db.from('progress_logs').insert([{
                                member_id: memberData.id,
                                weight: weightVal.toString(),
                                notes: 'Registration weight (Admin)'
                            }]);
                        } catch (e) {
                            console.warn("Failed to seed initial progress log in admin:", e);
                        }
                    }

                    // 3. Insert payment record
                    const amountPaid = document.getElementById('amountPaid').value;
                    if(amountPaid && amountPaid > 0 && planSelect.value) {
                        
                        let pMethod = document.getElementById('paymentMethod').value.toLowerCase();
                        if (pMethod === 'card') pMethod = 'online'; // Map to DB constraint
                        
                        let pStatus = document.getElementById('paymentStatus').value.toLowerCase();
                        if (pStatus === 'completed') pStatus = 'paid'; // Map to DB constraint

                        await window.db.from('payments').insert([{
                            member_id: memberData.id,
                            plan_id: planSelect.value,
                            amount: amountPaid,
                            payment_method: pMethod,
                            status: pStatus,
                            transaction_reference: document.getElementById('transactionRef').value,
                            paid_at: new Date().toISOString()
                        }]);
                    }

                    // Success
                    document.getElementById('successModal').classList.add('active');

                } catch (err) {
                    console.error("Error creating member:", err);
                    alert("Database Error: " + (err.message || JSON.stringify(err)));
                }

                btnSubmitMember.innerHTML = originalText;
                btnSubmitMember.disabled = false;
            } else {
                alert("Please fill out all required fields correctly.");
            }
        });
    }

    // Prevent enter submit
    document.getElementById('addMemberForm').addEventListener('submit', (e) => e.preventDefault());
}

// --- Init Trainer Form Logic ---
async function initTrainerForm() {
    if(window.auth && window.auth.requireAuth) window.auth.requireAuth('admin');
    
    // Auto-fill Joining Date to Today
    document.getElementById('joinDate').valueAsDate = new Date();
    
    // Generate Real Trainer ID
    let trainerCustomId = "TRN---";
    if(window.db) {
        const { data } = await window.db.rpc('generate_trainer_id');
        if(data) {
            trainerCustomId = data;
            document.getElementById('generatedTrainerId').innerText = trainerCustomId;
        }
    }

    // Submit Action
    const btnSubmitTrainer = document.getElementById('btnSubmitTrainer');
    if (btnSubmitTrainer) {
        btnSubmitTrainer.addEventListener('click', async () => {
            if (validateForm('addTrainerForm')) {
                const originalText = btnSubmitTrainer.innerHTML;
                btnSubmitTrainer.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
                btnSubmitTrainer.disabled = true;

                try {
                    // 1. Insert into users table
                    const { data: userData, error: userError } = await window.db.from('users').insert([{
                        role: 'trainer',
                        login_id: trainerCustomId,
                        phone: document.getElementById('phone').value,
                        full_name: document.getElementById('fullName').value,
                        email: document.getElementById('email').value || null,
                        is_active: document.getElementById('empStatus').value === 'Active'
                    }]).select().single();

                    if(userError) throw userError;

                    // 2. Insert into trainers table
                    const specInput = document.querySelector('input[name="specialization"]:checked');
                    
                    const { error: trainerError } = await window.db.from('trainers').insert([{
                        user_id: userData.id,
                        trainer_code: trainerCustomId,
                        specialization: specInput ? specInput.value : null,
                        experience_years: document.getElementById('experience').value,
                        certifications: document.getElementById('certifications').value,
                        // Custom field storing bio/salary temporarily inside certifications/notes if needed, or update DB schema.
                    }]);

                    if(trainerError) throw trainerError;

                    // Success
                    document.getElementById('successModal').classList.add('active');

                } catch(err) {
                    console.error("Error creating trainer:", err);
                    alert("Database Error: " + (err.message || JSON.stringify(err)));
                }

                btnSubmitTrainer.innerHTML = originalText;
                btnSubmitTrainer.disabled = false;
            } else {
                alert("Please fill out all required fields correctly.");
            }
        });
    }

    // Prevent enter submit
    document.getElementById('addTrainerForm').addEventListener('submit', (e) => e.preventDefault());
}
