document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animation
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Smooth scroll to form buttons
    const scrollButtons = document.querySelectorAll('.scroll-to-form');
    const targetForm = document.getElementById('optin-form-2');

    scrollButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            targetForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the form slightly to draw attention
            setTimeout(() => {
                targetForm.closest('.optin-box').style.transform = 'scale(1.02)';
                targetForm.closest('.optin-box').style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    targetForm.closest('.optin-box').style.transform = 'scale(1)';
                }, 300);
            }, 500);
        });
    });

    // Form submission handlers (Mocking for bridge page)
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        
        // Show loading state
        button.innerHTML = 'PROCESSING... <span style="display:inline-block; animation: spin 1s linear infinite;">⏳</span>';
        button.style.opacity = '0.8';
        button.disabled = true;

        // Fire Meta Pixel Lead Event
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
        }

        const formData = new FormData(form);
        const name = formData.get('fname') || '';
        const email = formData.get('email') || '';

        // Real API call to save email to Neon DB, then redirect
        fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: name, 
                email: email, 
                landing_page: 'human-ai-force' 
            })
        })
        .then(response => response.json())
        .then(data => console.log('Lead captured successfully:', data))
        .catch(err => console.error('Error capturing lead:', err))
        .finally(() => {
            // Placeholder for WarriorPlus Affiliate Link
            const affiliateLink = "https://warriorplus.com/o2/a/k5p7my6/0"; 
            window.location.href = affiliateLink;
        });
    };

    document.getElementById('optin-form-1').addEventListener('submit', handleFormSubmit);
    document.getElementById('optin-form-2').addEventListener('submit', handleFormSubmit);

    // Countdown Timer Logic
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        let timeRemaining = 10 * 60; // 10 minutes in seconds

        const updateTimer = () => {
            const minutes = Math.floor(timeRemaining / 60);
            let seconds = timeRemaining % 60;
            if (seconds < 10) seconds = '0' + seconds;
            
            timerElement.textContent = `${minutes}:${seconds}`;
            
            if (timeRemaining > 0) {
                timeRemaining--;
            } else {
                timerElement.textContent = "EXPIRED";
                clearInterval(timerInterval);
            }
        };

        const timerInterval = setInterval(updateTimer, 1000);
        updateTimer(); // initial call
    }
});
