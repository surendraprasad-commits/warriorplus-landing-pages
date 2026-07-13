document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // GLOBAL CLICK TRACKER
    // (called from onclick= on anchor tags)
    // =========================================
    window.trackClick = function(buttonId) {
        // Fire Meta Pixel custom event
        if (typeof fbq === 'function') {
            fbq('trackCustom', 'AffiliateClick', { button: buttonId });
        }
        // Log for debugging
        console.log('[HAF] CTA clicked:', buttonId);
    };

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
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

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
                const eased = 1 - Math.pow(1 - progress, 3);
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
            faqItems.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // =========================================
    // COUNTDOWN TIMER (localStorage Persistent)
    // =========================================
    const TIMER_KEY = 'haf_timer_end_v2';
    let timerEnd = localStorage.getItem(TIMER_KEY);

    if (!timerEnd || parseInt(timerEnd) < Date.now()) {
        // 2-hour countdown
        timerEnd = Date.now() + (2 * 60 * 60 * 1000);
        localStorage.setItem(TIMER_KEY, timerEnd.toString());
    } else {
        timerEnd = parseInt(timerEnd);
    }

    const hoursEl  = document.getElementById('timer-hours');
    const minsEl   = document.getElementById('timer-minutes');
    const secsEl   = document.getElementById('timer-seconds');

    function updateTimer() {
        const remaining = Math.max(0, timerEnd - Date.now());
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);

        if (hoursEl)  hoursEl.textContent  = String(h).padStart(2, '0');
        if (minsEl)   minsEl.textContent   = String(m).padStart(2, '0');
        if (secsEl)   secsEl.textContent   = String(s).padStart(2, '0');

        if (remaining <= 0) {
            clearInterval(timerInterval);
            if (hoursEl)  hoursEl.textContent  = '00';
            if (minsEl)   minsEl.textContent   = '00';
            if (secsEl)   secsEl.textContent   = '00';
        }
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // =========================================
    // OPTIONAL EMAIL CAPTURE FORM (Final Section)
    // Captures email then redirects to affiliate
    // =========================================
    const affiliateLink = 'https://warriorplus.com/o2/a/k5p7my6/0';

    const finalForm = document.getElementById('optin-form-final');
    if (finalForm) {
        finalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn     = finalForm.querySelector('button[type="submit"]');
            const ctaText = btn.querySelector('.cta-text');
            const email   = document.getElementById('final-email').value.trim();

            // Button loading state
            if (ctaText) ctaText.textContent = 'SENDING...';
            btn.disabled = true;

            // Fire Meta Pixel Lead Event
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', { content_name: 'human-ai-force-optional' });
            }

            // Try to save email, then redirect regardless
            if (email) {
                fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: '',
                        email: email,
                        landing_page: 'human-ai-force'
                    })
                })
                .then(res => res.json())
                .then(data => console.log('[HAF] Lead captured:', data))
                .catch(err => console.warn('[HAF] Lead capture error:', err))
                .finally(() => {
                    window.open(affiliateLink, '_blank');
                    if (ctaText) ctaText.textContent = '✅ Email Saved! Redirecting...';
                });
            } else {
                // No email entered — just redirect
                window.open(affiliateLink, '_blank');
                if (ctaText) ctaText.textContent = '✅ Redirecting...';
            }
        });
    }

    // =========================================
    // EXIT INTENT DETECTION
    // =========================================
    const exitOverlay = document.getElementById('exit-overlay');
    const exitClose   = document.getElementById('exit-close');
    let exitShown = sessionStorage.getItem('haf_exit_shown') === 'true';

    // Desktop: mouse leaves top of viewport
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget && !e.toElement && e.clientY < 10 && !exitShown) {
            showExitPopup();
        }
    });

    // Mobile: page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && !exitShown) {
            sessionStorage.setItem('haf_show_exit_on_return', 'true');
        }
        if (document.visibilityState === 'visible' &&
            sessionStorage.getItem('haf_show_exit_on_return') === 'true' &&
            !exitShown) {
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

    // Close exit popup when CTA in it is clicked
    const exitCtaBtn = document.getElementById('exit-cta-btn');
    if (exitCtaBtn) {
        exitCtaBtn.addEventListener('click', () => {
            closeExitPopup();
        });
    }

    // =========================================
    // SOCIAL PROOF TOASTS
    // =========================================
    const proofData = [
        { name: "Sarah J.", location: "Austin, TX",    action: "just grabbed access",    color: "linear-gradient(135deg, #10b981, #059669)", initials: "SJ" },
        { name: "Mark T.", location: "Toronto, ON",    action: "just used coupon AIFORCE2", color: "linear-gradient(135deg, #4f8cff, #8b5cf6)", initials: "MT" },
        { name: "James R.", location: "London, UK",   action: "just got instant access", color: "linear-gradient(135deg, #f59e0b, #ea580c)", initials: "JR" },
        { name: "Emily K.", location: "Sydney, AU",   action: "just grabbed access",    color: "linear-gradient(135deg, #ec4899, #8b5cf6)", initials: "EK" },
        { name: "Michael P.", location: "New York, NY", action: "just saved $2 at checkout", color: "linear-gradient(135deg, #06b6d4, #3b82f6)", initials: "MP" },
        { name: "Lisa M.", location: "Vancouver, BC", action: "just unlocked access",   color: "linear-gradient(135deg, #8b5cf6, #6366f1)", initials: "LM" },
        { name: "Robert D.", location: "Chicago, IL", action: "just got started",       color: "linear-gradient(135deg, #10b981, #14b8a6)", initials: "RD" },
    ];

    const proofToast   = document.getElementById('proof-toast');
    const proofAvatar  = document.getElementById('proof-avatar');
    const proofName    = document.getElementById('proof-name');
    const proofAction  = document.getElementById('proof-action');
    let proofIndex = 0;

    function showProofToast() {
        if (!proofToast) return;
        const data = proofData[proofIndex % proofData.length];
        proofAvatar.style.background = data.color;
        proofAvatar.textContent = data.initials;
        proofName.textContent   = data.name + ' from ' + data.location;
        proofAction.textContent = data.action;
        proofToast.classList.add('show');
        setTimeout(() => proofToast.classList.remove('show'), 4000);
        proofIndex++;
    }

    // First toast after 10s, cycle every 20–35s
    setTimeout(() => {
        showProofToast();
        setInterval(() => {
            showProofToast();
        }, 20000 + Math.floor(Math.random() * 15000));
    }, 10000);

    // =========================================
    // FLOATING MOBILE CTA (shows after scroll)
    // =========================================
    const floatingCTA = document.getElementById('floating-cta');
    if (floatingCTA) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                floatingCTA.classList.add('visible');
            } else {
                floatingCTA.classList.remove('visible');
            }
        }, { passive: true });
    }

    // =========================================
    // VIDEO DEMO (Click-to-Play)
    // =========================================
    const demoContainer = document.getElementById('demo-container');
    const demoOverlay   = document.getElementById('demo-overlay');
    const demoPoster    = document.getElementById('demo-poster');

    if (demoContainer && demoOverlay) {
        demoContainer.addEventListener('click', () => {
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
            demoContainer.onclick = null;

            // Track video play
            if (typeof fbq === 'function') {
                fbq('trackCustom', 'VideoPlay', { page: 'human-ai-force' });
            }
        });
    }

    // =========================================
    // SCROLL DEPTH TRACKING (Meta Pixel)
    // =========================================
    const trackableSections = ['hero', 'problem', 'solution', 'stats', 'bonuses', 'testimonials', 'faq', 'final-cta'];
    const trackedSections   = new Set();

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
