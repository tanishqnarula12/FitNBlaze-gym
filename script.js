// Wait for DOM to load completely
document.addEventListener('DOMContentLoaded', () => {

    // 1. Loader Animation
    const loaderWrapper = document.querySelector('.loader-wrapper');
    setTimeout(() => {
        loaderWrapper.style.opacity = '0';
        setTimeout(() => {
            loaderWrapper.style.display = 'none';
        }, 500);
    }, 1500);

    // 2. Set Current Year in Footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 3. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 4. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // 5. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;

            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    // Initial check
    revealOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', revealOnScroll);

    // 6. Highlight Active Link on Scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });


    // 7. Plan Selection & Payment Modal
    const selectButtons = document.querySelectorAll('.select-plan-btn');
    const planSelect = document.getElementById('plan');
    const paymentModalOverlay = document.getElementById('paymentModalOverlay');
    const paymentCloseBtn = document.getElementById('paymentCloseBtn');
    const paymentPlanName = document.getElementById('paymentPlanName');
    const paymentPlanAmount = document.getElementById('paymentPlanAmount');
    
    // Plan prices based on the website
    const planPrices = {
        '1 Month Plan': 2999,
        '3 Month Plan': 6999,
        '6 Month Plan': 9999,
        '12 Month Plan': 14999,
        'Group Classes 1 Month': 2499,
        'Yoga Class 1 Month': 2499,
        'Yoga Class 3 Months': 4599,
        'PT Per Day': 250,
        'Group Session': 4999,
        'PT One-on-One': 9999
    };
    
    let currentSelectedPlan = '';
    let currentSelectedPrice = 0;

    const closePaymentModal = () => {
        if(paymentModalOverlay) {
            paymentModalOverlay.classList.remove('active');
        }
    };

    if (paymentCloseBtn) {
        paymentCloseBtn.addEventListener('click', closePaymentModal);
    }

    if (paymentModalOverlay) {
        paymentModalOverlay.addEventListener('click', (e) => {
            if (e.target === paymentModalOverlay) {
                closePaymentModal();
            }
        });
    }

    selectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop scrolling to contact section
            
            const selectedPlan = btn.getAttribute('data-plan');
            currentSelectedPlan = selectedPlan;
            currentSelectedPrice = planPrices[selectedPlan] || 0;
            
            // Redirect to the new multi-step join form
            window.location.href = `auth/join.html?plan=${encodeURIComponent(currentSelectedPlan)}&price=${currentSelectedPrice}`;
        });
    });

    // Handle Payment Form Submission with Razorpay
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('payName').value;
            const email = document.getElementById('payEmail').value;
            const phone = document.getElementById('payPhone').value;
            
            if(!name || !email || !phone) return;
            
            // Razorpay Configuration
            const options = {
                "key": "rzp_test_SeEg9HEO5nnatC", // Test Key from User
                "amount": currentSelectedPrice * 100, // Amount in paise
                "currency": "INR",
                "name": "FIT 'N' BLAZE",
                "description": "Payment for " + currentSelectedPlan,
                "image": "./assets/FNB%20logo.png", // Official logo
                "handler": function (response) {
                    alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
                    closePaymentModal();
                    paymentForm.reset();
                },
                "prefill": {
                    "name": name,
                    "email": email,
                    "contact": phone
                },
                "theme": {
                    "color": "#ff2e2e" // primary accent color
                }
            };
            
            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function (response){
                alert("Payment Failed. Reason: " + response.error.description);
            });
            
            rzp.open();
        });
    }

    // 8. Lead Form WhatsApp Submission
    const leadForm = document.getElementById('leadForm');
    
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const plan = document.getElementById('plan').value;
            
            // Validate form (HTML5 handles basic validation via 'required', but just in case)
            if (!name || !phone) return;

            // Target Phone Number from user details
            const targetPhone = "916375309545";
            
            // Format WhatsApp Message
            const message = `Hi, I am ${name}, interested in ${plan}. My phone number is ${phone}. Please contact me.`;
            const encodedMessage = encodeURIComponent(message);
            
            // Generate WhatsApp URL
            const whatsappURL = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappURL, '_blank');
            
            // Reset form and show basic success feedback
            leadForm.reset();
            
            const btn = leadForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = 'Redirecting to WhatsApp <i class="fa-solid fa-check"></i>';
            btn.style.backgroundColor = '#25d366'; // WhatsApp Green
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = ''; // Restore original
            }, 3000);
        });
    }

    // 9. Stats Counter Animation (fires once on scroll-into-view)
    const statsRow = document.getElementById('statsRow');

    if (statsRow) {

        /**
         * easeOutCubic — smoother deceleration than easeOutExpo for small numbers.
         * Spends more time in the middle range, making counting visible for 5, 7, 10.
         */
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        /**
         * Animates a single counter from 0 → target.
         *
         * KEY FIX: For small targets (≤ 50), we multiply internally by a "frame budget"
         * factor so the animation runs through hundreds of virtual steps even if the
         * displayed integer only changes a few times. This makes 5→5 and 7→7 look
         * just as satisfying as 7000→7000.
         *
         * @param {HTMLElement} el    - span with data-target & data-suffix
         * @param {number}      delay - stagger start delay in ms
         */
        const animateCounter = (el, delay) => {
            const target   = parseInt(el.dataset.target, 10);
            const suffix   = el.dataset.suffix || '';

            // All entries get the same long duration — small numbers feel intentional
            const duration = 2000;

            // Virtual multiplier: small numbers get 1000 virtual steps per integer
            // so easing interpolates through thousands of frames before displaying
            // the same integer, making the slow-down animation clearly visible.
            const multiplier = target < 20 ? 1000 : target < 100 ? 100 : 1;
            const vTarget    = target * multiplier;   // e.g. 7 → 7000 (virtual)

            let startTime = null;
            let hasStarted = false;

            const step = (timestamp) => {
                // Hold until stagger delay passes
                if (!hasStarted) {
                    if (!startTime) startTime = timestamp;
                    if (timestamp - startTime < delay) {
                        requestAnimationFrame(step);
                        return;
                    }
                    // Reset so the animation duration starts fresh after delay
                    startTime = timestamp;
                    hasStarted = true;
                }

                const elapsed  = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased    = easeOutCubic(progress);
                const vCurrent = Math.round(eased * vTarget);
                const current  = Math.floor(vCurrent / multiplier);   // real display value

                el.textContent = current >= 1000
                    ? current.toLocaleString('en-IN') + suffix
                    : current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Lock to exact final value
                    el.textContent = target >= 1000
                        ? target.toLocaleString('en-IN') + suffix
                        : target + suffix;
                    // Fire the CSS glow-pulse "lock-in" flash
                    el.classList.add('done');
                }
            };

            requestAnimationFrame(step);
        };

        // Trigger once when the stats banner scrolls into view
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = statsRow.querySelectorAll('.diff__stat-count');
                    counters.forEach((counter, index) => {
                        // 150ms cascade stagger per stat (0ms, 150ms, 300ms, 450ms)
                        animateCounter(counter, index * 150);
                    });
                    statsObserver.unobserve(statsRow); // fire once only
                }
            });
        }, { threshold: 0.3 }); // fires when 30% of the banner is visible

        statsObserver.observe(statsRow);
    }

    // 10. Promo Popup Logic
    const promoPopup = document.getElementById('promoPopup');
    const promoCloseBtn = document.getElementById('promoCloseBtn');
    const promoLink = document.getElementById('promoLink');

    if (promoPopup) {
        // Show after 1.5 seconds if not already seen this session
        setTimeout(() => {
            if (!sessionStorage.getItem('promoShown')) {
                promoPopup.classList.add('active');
                sessionStorage.setItem('promoShown', 'true');
            }
        }, 1500);

        const closePromo = () => {
            promoPopup.classList.remove('active');
        };

        // Close on X click
        if (promoCloseBtn) promoCloseBtn.addEventListener('click', closePromo);

        // Close on background click
        promoPopup.addEventListener('click', (e) => {
            if (e.target === promoPopup) {
                closePromo();
            }
        });

        // Close when clicking the banner (navigating to contact)
        if (promoLink) promoLink.addEventListener('click', closePromo);
        
        // Listen for ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && promoPopup.classList.contains('active')) {
                closePromo();
            }
        });
    }

    // 11. Gym Image Gallery Carousel
    const galleryCarousel = document.getElementById('galleryCarousel');
    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');
    
    // Modal elements
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.querySelector('.modal-close');

    const imageData = [
        { src: './assets/fnb img1.PNG' },
        { src: './assets/fnb img2.PNG' },
        { src: './assets/fnb img3.PNG' },
        { src: './assets/fnb img4.PNG' },
        { src: './assets/fnb img6.PNG' },
        { src: './assets/fnb img8.PNG' },
        { src: './assets/fnb img9.PNG' }
    ];

    if (galleryCarousel) {
        // Render images
        imageData.forEach(image => {
            const card = document.createElement('div');
            card.classList.add('gallery-card');
            
            card.innerHTML = `
                <img src="${image.src}" alt="Fit N Blaze Facility" loading="lazy">
            `;
            
            // Add click event for modal
            card.addEventListener('click', () => {
                modalImg.src = image.src;
                if (modalCaption) modalCaption.textContent = '';
                modal.classList.add('active');
            });
            
            galleryCarousel.appendChild(card);
        });

        // Scroll functionality
        const scrollAmount = 340; // card width + gap
        
        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                galleryCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                galleryCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    // Close modal logic
    const closeModal = () => {
        if(modal) modal.classList.remove('active');
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // 12. Dynamic Pricing Toggle Logic (React State Mimic)
    const togglePricingBtn = document.getElementById('togglePricingBtn');
    const additionalPricing = document.getElementById('additionalPricing');
    const togglePricingText = document.getElementById('togglePricingText');
    
    if (togglePricingBtn && additionalPricing) {
        let showMore = false; // Mimicking: const [showMore, setShowMore] = useState(false);
        
        togglePricingBtn.addEventListener('click', () => {
            showMore = !showMore;
            
            if (showMore) {
                additionalPricing.classList.add('open');
                togglePricingBtn.classList.add('open');
                togglePricingText.textContent = 'Show Less Pricing';
            } else {
                additionalPricing.classList.remove('open');
                togglePricingBtn.classList.remove('open');
                togglePricingText.textContent = 'See More Pricing';
                
                // Optional: Scroll back to the top of the pricing section if they scroll down too far
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                    const rect = pricingSection.getBoundingClientRect();
                    if (rect.top < 0) {
                        window.scrollBy({ top: rect.top - 80, behavior: 'smooth' }); // -80px for header offset
                    }
                }
            }
        });
    }
});
