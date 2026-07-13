document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // SCROLL REVEAL (IntersectionObserver)
    // =========================================
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    scrollElements.forEach(el => scrollObserver.observe(el));

    // =========================================
    // ANIMATED STAT COUNTERS
    // =========================================
    const counters = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('stats');
    if (statsSection) counterObserver.observe(statsSection);

    function animateCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (target === 0) {
                counter.textContent = '0';
                return;
            }

            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                counter.textContent = Math.floor(eased * target);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(update);
        });
    }

    // =========================================
    // FAQ ACCORDION
    // =========================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all others
            faqItems.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // =========================================
    // SCROLL-TO-FORM BUTTONS
    // =========================================
    const scrollButtons = document.querySelectorAll('.scroll-to-form');
    const heroOptin = document.getElementById('main-optin');
    const finalOptin = document.getElementById('final-optin');

    scrollButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // If hero optin is above viewport, scroll to final; otherwise scroll to hero
            const heroRect = heroOptin.getBoundingClientRect();
            const target = heroRect.bottom < 0 ? finalOptin : heroOptin;
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Micro-animation on target
            setTimeout(() => {
                target.style.transform = 'scale(1.02)';
                target.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    target.style.transform = '';
                }, 300);
            }, 600);
        });
    });

    // =========================================
    // FORM SUBMISSION
    // =========================================
    const affiliateLink = "https://warriorplus.com/o2/a/k5p7my6/0";

    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const ctaText = btn.querySelector('.cta-text');
        const originalText = ctaText ? ctaText.textContent : btn.textContent;

        // Loading state
        btn.classList.add('loading');
        if (ctaText) {
            ctaText.textContent = 'PROCESSING...';
        } else {
            btn.textContent = 'PROCESSING...';
        }
        btn.disabled = true;

        // Fire Meta Pixel Lead Event
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
        }

        const formData = new FormData(form);
        const name = formData.get('fname') || '';
        const email = formData.get('email') || '';

        // Save lead to Neon DB, then redirect
        fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                landing_page: 'human-ai-force'
            })
        })
        .then(res => res.json())
        .then(data => console.log('Lead captured:', data))
        .catch(err => console.error('Lead capture error:', err))
        .finally(() => {
            // Always redirect even if API fails
            window.location.href = affiliateLink;
        });
    }

    // Bind all opt-in forms
    const formIds = ['optin-form-hero', 'optin-form-final', 'optin-form-exit'];
    formIds.forEach(id => {
        const form = document.getElementById(id);
        if (form) form.addEventListener('submit', handleFormSubmit);
    });

    // =========================================
    // COUNTDOWN TIMER (localStorage Persistent)
    // =========================================
    const TIMER_KEY = 'haf_timer_end';
    let timerEnd = localStorage.getItem(TIMER_KEY);

    if (!timerEnd || parseInt(timerEnd) < Date.now()) {
        // 2-hour countdown
        timerEnd = Date.now() + (2 * 60 * 60 * 1000);
        localStorage.setItem(TIMER_KEY, timerEnd.toString());
    } else {
        timerEnd = parseInt(timerEnd);
    }

    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    function updateTimer() {
        const remaining = Math.max(0, timerEnd - Date.now());
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);

        if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');

        if (remaining <= 0) {
            clearInterval(timerInterval);
            const bar = document.getElementById('urgency-bar');
            if (bar) {
                const textEl = bar.querySelector('.urgency-text');
                if (textEl) textEl.innerHTML = '<strong>OFFER EXPIRED</strong> — Prices increasing soon';
            }
        }
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // =========================================
    // EXIT INTENT DETECTION
    // =========================================
    const exitOverlay = document.getElementById('exit-overlay');
    const exitClose = document.getElementById('exit-close');
    let exitShown = sessionStorage.getItem('haf_exit_shown') === 'true';

    // Desktop: mouse leaves viewport top
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget && !e.toElement && e.clientY < 10 && !exitShown) {
            showExitPopup();
        }
    });

    // Mobile: page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && !exitShown) {
            sessionStorage.setItem('haf_show_exit_on_return', 'true');
        }
        if (document.visibilityState === 'visible' && sessionStorage.getItem('haf_show_exit_on_return') === 'true' && !exitShown) {
            sessionStorage.removeItem('haf_show_exit_on_return');
            showExitPopup();
        }
    });

    function showExitPopup() {
        if (exitShown) return;
        exitShown = true;
        sessionStorage.setItem('haf_exit_shown', 'true');
        if (exitOverlay) {
            exitOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeExitPopup() {
        if (exitOverlay) {
            exitOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (exitClose) exitClose.addEventListener('click', closeExitPopup);
    if (exitOverlay) {
        exitOverlay.addEventListener('click', (e) => {
            if (e.target === exitOverlay) closeExitPopup();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && exitOverlay && exitOverlay.classList.contains('active')) {
            closeExitPopup();
        }
    });

    // =========================================
    // SOCIAL PROOF TOASTS
    // =========================================
    const proofData = [
        { name: "Sarah J.", location: "Austin, TX", action: "just unlocked access", color: "linear-gradient(135deg, #10b981, #059669)", initials: "SJ" },
        { name: "Mark T.", location: "Toronto, ON", action: "just claimed bonuses", color: "linear-gradient(135deg, #4f8cff, #8b5cf6)", initials: "MT" },
        { name: "James R.", location: "London, UK", action: "just got access", color: "linear-gradient(135deg, #f59e0b, #ea580c)", initials: "JR" },
        { name: "Emily K.", location: "Sydney, AU", action: "just signed up", color: "linear-gradient(135deg, #ec4899, #8b5cf6)", initials: "EK" },
        { name: "Michael P.", location: "New York, NY", action: "just unlocked access", color: "linear-gradient(135deg, #06b6d4, #3b82f6)", initials: "MP" },
        { name: "Lisa M.", location: "Vancouver, BC", action: "just claimed bonuses", color: "linear-gradient(135deg, #8b5cf6, #6366f1)", initials: "LM" },
        { name: "Robert D.", location: "Chicago, IL", action: "just got started", color: "linear-gradient(135deg, #10b981, #14b8a6)", initials: "RD" },
    ];

    const proofToast = document.getElementById('proof-toast');
    const proofAvatar = document.getElementById('proof-avatar');
    const proofName = document.getElementById('proof-name');
    const proofAction = document.getElementById('proof-action');
    let proofIndex = 0;

    function showProofToast() {
        if (!proofToast) return;
        const data = proofData[proofIndex % proofData.length];
        proofAvatar.style.background = data.color;
        proofAvatar.textContent = data.initials;
        proofName.textContent = data.name + ' from ' + data.location;
        proofAction.textContent = data.action;

        proofToast.classList.add('show');

        setTimeout(() => {
            proofToast.classList.remove('show');
        }, 4000);

        proofIndex++;
    }

    // First toast after 8s, then cycle every 20-35s
    setTimeout(() => {
        showProofToast();
        setInterval(() => {
            showProofToast();
        }, 20000 + Math.floor(Math.random() * 15000));
    }, 8000);

    // =========================================
    // FLOATING MOBILE CTA
    // =========================================
    const floatingCTA = document.getElementById('floating-cta');

    if (floatingCTA) {
        const showThreshold = 400;

        window.addEventListener('scroll', () => {
            if (window.scrollY > showThreshold) {
                floatingCTA.classList.add('visible');
            } else {
                floatingCTA.classList.remove('visible');
            }
        }, { passive: true });
    }

    // =========================================
    // VIDEO DEMO (Click-to-Play / On-Demand)
    // =========================================
    const demoContainer = document.getElementById('demo-container');
    const demoOverlay = document.getElementById('demo-overlay');
    const demoPoster = document.getElementById('demo-poster');

    if (demoContainer && demoOverlay) {
        demoContainer.addEventListener('click', () => {
            // Lazy-load video on demand to avoid 55MB initial payload
            const video = document.createElement('video');
            video.src = 'Initial_Scene_-_2026-07-12_202607121817.mp4';
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;object-fit:cover;border-radius:inherit;';

            demoOverlay.style.display = 'none';
            if (demoPoster) demoPoster.style.display = 'none';
            demoContainer.appendChild(video);
            demoContainer.style.cursor = 'default';

            // Prevent further clicks from creating more videos
            demoContainer.onclick = null;
        });
    }

    // =========================================
    // SCROLL DEPTH TRACKING (Meta Pixel Custom Events)
    // =========================================
    const trackableSections = ['hero', 'problem', 'solution', 'stats', 'bonuses', 'testimonials', 'faq', 'final-cta'];
    const trackedSections = new Set();

    const depthObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !trackedSections.has(entry.target.id)) {
                trackedSections.add(entry.target.id);
                if (typeof fbq === 'function') {
                    fbq('trackCustom', 'ScrollDepth', { section: entry.target.id });
                }
            }
        });
    }, { threshold: 0.5 });

    trackableSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) depthObserver.observe(el);
    });

});
