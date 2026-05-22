// join.js - Multi-step Form Logic

document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentStep = 1;
    const totalSteps = 5;
    const formData = {};

    // DOM Elements
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressBar = document.getElementById('progressBar');
    
    const navButtons = document.getElementById('navButtons');
    const btnNext = document.querySelector('.btn-next');
    const btnPrev = document.querySelectorAll('.btn-prev'); // Multiple prev buttons
    const proceedPaymentBtn = document.getElementById('proceedPaymentBtn');
    const paymentModal = document.getElementById('paymentModal');
    const newMemberId = document.getElementById('newMemberId');

    // Initialize UI
    updateUI();
    
    // Parse URL Parameters for Plan info
    const urlParams = new URLSearchParams(window.location.search);
    const planFromUrl = urlParams.get('plan');
    const priceFromUrl = urlParams.get('price');
    
    if(planFromUrl && priceFromUrl) {
        document.getElementById('planName').innerText = planFromUrl;
        document.getElementById('planPrice').innerText = '₹' + parseInt(priceFromUrl).toLocaleString('en-IN');
        document.querySelector('.total-amount').innerText = '₹' + parseInt(priceFromUrl).toLocaleString('en-IN');
        
        // Auto-duration based on plan name
        let durationStr = '30 Days';
        const planLower = planFromUrl.toLowerCase();
        if (planLower.includes('per day') || planLower.includes('pt per day')) {
            durationStr = '1 Day';
        } else if (planLower.includes('3 month')) {
            durationStr = '90 Days';
        } else if (planLower.includes('6 month')) {
            durationStr = '180 Days';
        } else if (planLower.includes('12 month') || planLower.includes('1 year') || planLower.includes('12-month')) {
            durationStr = '365 Days';
        } else if (planLower.includes('1 month') || planLower.includes('group classes') || planLower.includes('yoga class') || planLower.includes('group session') || planLower.includes('one-on-one')) {
            durationStr = '30 Days';
        }
        document.getElementById('planDuration').innerText = durationStr;
    }

    // Prevent Form Submit on Enter
    document.getElementById('joinForm').addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // Next Button Click
    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            saveStepData(currentStep);
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
                
                // If moving to step 5, populate review data
                if (currentStep === 5) {
                    populateReview();
                }
            }
        }
    });

    // Prev Button Click
    btnPrev.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });
    });

    // Update UI based on currentStep
    function updateUI() {
        // Update form steps visibility
        formSteps.forEach(step => {
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update indicators
        stepIndicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            
            if (stepNum === currentStep) {
                indicator.classList.add('active');
            } else if (stepNum < currentStep) {
                indicator.classList.add('completed');
                indicator.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else {
                indicator.innerHTML = stepNum;
            }
        });

        // Update progress bar width
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Navigation button logic
        if (currentStep === 1) {
            btnPrev[0].style.visibility = 'hidden';
        } else {
            btnPrev[0].style.visibility = 'visible';
        }

        // Hide main nav buttons on final step (Step 5 has its own buttons)
        if (currentStep === totalSteps) {
            navButtons.style.display = 'none';
        } else {
            navButtons.style.display = 'flex';
        }
    }

    // Validate inputs for current step
    function validateStep(step) {
        const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        const requiredInputs = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            // Reset visual error
            input.style.borderColor = '';
            
            if (input.type === 'radio' || input.type === 'checkbox') {
                const name = input.name;
                const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
                
                if (!checked) {
                    isValid = false;
                    // highlight container
                    if(input.type === 'radio') {
                        currentStepEl.querySelector('.radio-grid').style.border = '1px solid #ff4d4d';
                        currentStepEl.querySelector('.radio-grid').style.borderRadius = '12px';
                    }
                } else {
                    if(input.type === 'radio') {
                        currentStepEl.querySelector('.radio-grid').style.border = 'none';
                    }
                }
            } else {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff4d4d';
                }
            }
        });

        // Specific phone validation
        if(step === 1) {
            const phone = document.getElementById('phone');
            if(phone.value && !phone.value.match(/^[0-9]{10}$/)) {
                isValid = false;
                phone.style.borderColor = '#ff4d4d';
            }
        }

        if (!isValid) {
            alert("Please fill all required fields correctly to proceed.");
        }

        return isValid;
    }

    // Extract data from step and store in formData object
    function saveStepData(step) {
        if (step === 1) {
            formData.name = document.getElementById('fullName').value;
            formData.phone = document.getElementById('phone').value;
            formData.email = document.getElementById('email').value || 'Not provided';
            formData.gender = document.getElementById('gender').value;
        } 
        else if (step === 2) {
            const goalInput = document.querySelector('input[name="goal"]:checked');
            formData.goal = goalInput ? goalInput.value : '';
            formData.weightRaw = document.getElementById('currentWeight').value;
            formData.targetRaw = document.getElementById('targetWeight').value;
            formData.weight = formData.weightRaw + ' kg';
            formData.target = formData.targetRaw + ' kg';
            formData.experience = document.getElementById('experience').value;
        }
        else if (step === 3) {
            const types = [];
            document.querySelectorAll('input[name="trainingType"]:checked').forEach(cb => {
                types.push(cb.value);
            });
            formData.trainingTypes = types.join(', ') || 'None selected';
            formData.dietary = document.getElementById('dietary').value;
        }
        else if (step === 4) {
            formData.plan = document.getElementById('planName').innerText;
            formData.price = document.getElementById('planPrice').innerText;
        }
    }

    // Populate Step 5 Review Grid
    function populateReview() {
        const reviewGrid = document.querySelector('.review-grid');
        reviewGrid.innerHTML = `
            <div class="review-item">
                <span class="review-label">Name</span>
                <span class="review-value">${formData.name}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Phone</span>
                <span class="review-value">${formData.phone}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Primary Goal</span>
                <span class="review-value">${formData.goal}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Current Weight -> Target</span>
                <span class="review-value">${formData.weight} -> ${formData.target}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Training Preferences</span>
                <span class="review-value">${formData.trainingTypes}</span>
            </div>
            <div class="review-item">
                <span class="review-label">Selected Plan</span>
                <span class="review-value text-primary">${formData.plan}</span>
            </div>
        `;
    }

    // Proceed to Payment (Razorpay Integration)
    proceedPaymentBtn.addEventListener('click', () => {
        // Change button state
        const originalText = proceedPaymentBtn.innerHTML;
        proceedPaymentBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
        proceedPaymentBtn.disabled = true;

        // Parse price from formData (remove ₹ and commas, convert to number)
        let priceAmount = 0;
        if(formData.price) {
            priceAmount = parseInt(formData.price.replace(/[^\d]/g, ''));
        }
        
        // Ensure we have a valid price
        if(priceAmount <= 0) {
            alert("Invalid plan price. Please select a valid plan.");
            proceedPaymentBtn.innerHTML = originalText;
            proceedPaymentBtn.disabled = false;
            return;
        }

        // Razorpay Configuration
        const options = {
            "key": "rzp_live_SsPPJh5gmmyL2r", // Live Key
            "amount": priceAmount * 100, // Amount in paise
            "currency": "INR",
            "name": "FIT 'N' BLAZE",
            "description": "Payment for " + formData.plan,
            "image": "../assets/FNB%20logo.png", // Official logo path relative to auth page
            "handler": async function (response) {
                // Success Handler
                try {
                    let memberIdStr = `FNB---`;

                    if (window.db) {
                        // 1. Generate REAL member ID
                        const { data: idData } = await window.db.rpc('generate_member_id');
                        if (idData) memberIdStr = idData;
                        
                        // 2. Insert User
                        const { data: userData, error: userError } = await window.db.from('users').insert([{
                            role: 'member',
                            login_id: memberIdStr,
                            phone: formData.phone,
                            full_name: formData.name,
                            email: formData.email !== 'Not provided' ? formData.email : null,
                            is_active: true
                        }]).select().single();

                        if (userError) throw userError;

                        // 3. Lookup Plan ID and Duration intelligently (flexible matching to handle direct/fuzzy matches)
                        const { data: allPlans } = await window.db.from('plans').select('id, name, duration_days, price');
                        let planData = null;
                        if (allPlans && allPlans.length > 0) {
                            const planLower = formData.plan.toLowerCase();
                            // First try exact or near-exact name match
                            planData = allPlans.find(p => p.name.toLowerCase() === planLower || p.name.toLowerCase().includes(planLower) || planLower.includes(p.name.toLowerCase()));
                            
                            // Second try price matching
                            if (!planData && priceAmount) {
                                planData = allPlans.find(p => Math.abs(Number(p.price) - priceAmount) < 10);
                            }
                            
                            // Third try duration matching based on plan name keywords
                            if (!planData) {
                                let targetDays = 30;
                                if (planLower.includes('per day') || planLower.includes('pt per day')) {
                                    targetDays = 1;
                                } else if (planLower.includes('3 month') || planLower.includes('transformation')) {
                                    targetDays = 90;
                                } else if (planLower.includes('6 month') || planLower.includes('elite')) {
                                    targetDays = 180;
                                } else if (planLower.includes('12 month') || planLower.includes('1 year') || planLower.includes('12-month') || planLower.includes('365 days')) {
                                    targetDays = 365;
                                }
                                planData = allPlans.find(p => p.duration_days === targetDays);
                            }
                        }

                        const planId = planData ? planData.id : null;
                        const durationDays = planData ? (planData.duration_days || 30) : 30;

                        // Calculate membership end date
                        const startDateObj = new Date();
                        const endDateObj = new Date(startDateObj);
                        endDateObj.setDate(endDateObj.getDate() + durationDays);
                        const membershipEnd = endDateObj.toISOString().split('T')[0];

                        // 4. Insert Member
                        const { data: memberData, error: memberError } = await window.db.from('members').insert([{
                            user_id: userData.id,
                            custom_id: memberIdStr,
                            goal: formData.goal,
                            current_weight: parseInt(formData.weight) || null,
                            target_weight: parseInt(formData.target) || null,
                            plan_id: planId,
                            status: 'active',
                            dietary_preferences: formData.dietary,
                            membership_start: startDateObj.toISOString().split('T')[0],
                            membership_end: membershipEnd,
                            medical_notes: JSON.stringify({ experience: formData.experience || 'beginner', completed_days: [] })
                        }]).select().single();

                        if (memberError) throw memberError;

                        // Seed initial registration weight in progress_logs (clean number)
                        const regWeight = formData.weightRaw || parseInt(formData.weight);
                        if (regWeight) {
                            try {
                                await window.db.from('progress_logs').insert([{
                                    member_id: memberData.id,
                                    weight: regWeight.toString(),
                                    notes: 'Registration weight'
                                }]);
                            } catch (e) {
                                console.warn("Failed to seed initial progress log during registration:", e);
                            }
                        }

                        // 5. Insert Payment
                        if (planId) {
                            await window.db.from('payments').insert([{
                                member_id: memberData.id,
                                plan_id: planId,
                                amount: priceAmount,
                                payment_method: 'online',
                                status: 'paid',
                                transaction_reference: response.razorpay_payment_id,
                                paid_at: new Date().toISOString()
                            }]);
                        }
                    } else {
                        // Fallback mock if DB is missing
                        const randomId = Math.floor(100 + Math.random() * 900);
                        memberIdStr = `FNB${randomId}`;
                    }

                    newMemberId.innerText = memberIdStr;
                    
                    // Show Success Modal
                    paymentModal.classList.add('active');
                    
                    // Reset button
                    proceedPaymentBtn.innerHTML = originalText;
                    proceedPaymentBtn.disabled = false;
                    
                    // Auto Download PDF Receipt
                    setTimeout(() => {
                        downloadReceiptPDF(memberIdStr, response.razorpay_payment_id);
                    }, 500); 

                } catch (err) {
                    console.error("Account Creation Error:", err);
                    alert("Database Error: " + (err.message || JSON.stringify(err)));
                    proceedPaymentBtn.innerHTML = originalText;
                    proceedPaymentBtn.disabled = false;
                }
            },
            "prefill": {
                "name": formData.name || "",
                "email": formData.email === 'Not provided' ? "" : formData.email,
                "contact": formData.phone || ""
            },
            "theme": {
                "color": "#e63946" // brand accent color
            }
        };
        
        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response){
            alert("Payment Failed. Reason: " + response.error.description);
            proceedPaymentBtn.innerHTML = originalText;
            proceedPaymentBtn.disabled = false;
        });
        
        rzp.open();
    });

    // Auto PDF Generation Logic
    function downloadReceiptPDF(memberId, paymentId) {
        if(typeof html2pdf === 'undefined') return;
        
        // Generate a cooler Transaction ID if Razorpay ID is missing or too long/weird
        const actualPaymentId = paymentId || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const receiptHtml = `
            <div style="padding: 50px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #ffffff; width: 800px; box-sizing: border-box;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e63946; padding-bottom: 20px;">
                    <div>
                        <h1 style="color: #e63946; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">FIT 'N' BLAZE</h1>
                        <p style="margin: 5px 0 0; color: #555; font-size: 14px; font-weight: 500;">Premium Fitness Club & MMA</p>
                        <p style="margin: 2px 0 0; color: #777; font-size: 12px;">Jaipur, Rajasthan</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: 700; text-transform: uppercase;">Receipt</h2>
                        <p style="margin: 5px 0 0; color: #555; font-size: 14px;">Date: <strong>${new Date().toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</strong></p>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; width: 45%; border-left: 4px solid #e63946;">
                        <p style="margin: 0 0 5px 0; color: #777; font-size: 12px; text-transform: uppercase;">Billed To</p>
                        <h3 style="margin: 0 0 5px 0; color: #1a1a1a; font-size: 18px;">${formData.name}</h3>
                        <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;">Phone: ${formData.phone}</p>
                        <p style="margin: 0; color: #555; font-size: 14px;">Goal: ${formData.goal}</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; width: 45%; border-left: 4px solid #1a1a1a;">
                        <p style="margin: 0 0 5px 0; color: #777; font-size: 12px; text-transform: uppercase;">Membership Details</p>
                        <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;">Member ID: <strong style="color: #e63946; font-size: 16px;">${memberId}</strong></p>
                        <p style="margin: 0; color: #555; font-size: 14px;">Transaction ID: <strong style="font-family: monospace; font-size: 14px;">${actualPaymentId}</strong></p>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                    <thead>
                        <tr style="background-color: #1a1a1a; color: #ffffff;">
                            <th style="padding: 15px; text-align: left; font-size: 14px; border-radius: 6px 0 0 0;">Description</th>
                            <th style="padding: 15px; text-align: right; font-size: 14px; border-radius: 0 6px 0 0;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 20px 15px; color: #333; font-size: 16px; font-weight: 500;">
                                ${formData.plan}
                                <div style="font-size: 13px; color: #777; margin-top: 4px; font-weight: 400;">Inclusive of all premium facility access and selected goals.</div>
                            </td>
                            <td style="padding: 20px 15px; text-align: right; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                                ${formData.price}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 15px; text-align: right; font-size: 16px; font-weight: 700; color: #1a1a1a;">Total Paid:</td>
                            <td style="padding: 20px 15px; text-align: right; font-size: 24px; font-weight: 800; color: #e63946;">
                                ${formData.price}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #1a1a1a; font-weight: 600; font-size: 16px;">Welcome to the Fit 'N' Blaze Family!</p>
                    <p style="margin: 0; color: #777; font-size: 13px;">Please show this receipt at the front desk to activate your biometric access.</p>
                    <p style="margin: 5px 0 0; color: #999; font-size: 12px;">This is a computer-generated document and requires no physical signature.</p>
                </div>
            </div>
        `;

        const opt = {
            margin:       0.25,
            filename:     `FitNBlaze_receipt_${formData.name ? formData.name.replace(/\s+/g, '_') : 'Member'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false, windowWidth: 800 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        // Use html2pdf to auto-download directly from string
        html2pdf().set(opt).from(receiptHtml).save();
    }

});
