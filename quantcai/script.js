document.addEventListener('DOMContentLoaded', () => {
    // Affiliate Link (Replace with your actual WarriorPlus Link)
    const AFFILIATE_LINK = 'https://warriorplus.com/o2/a/zxy59v0/0';

    // Handle all forms on the page
    const forms = document.querySelectorAll('.optin-form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Get the data
            const formData = new FormData(form);
            const name = formData.get('name');
            const email = formData.get('email');

            // 2. Here you would typically send the data to your autoresponder (e.g., via fetch)
            // Example:
            /*
            fetch('YOUR_WEBHOOK_OR_API_URL', {
                method: 'POST',
                body: JSON.stringify({ name, email }),
                headers: { 'Content-Type': 'application/json' }
            }).then(() => {
                window.location.href = AFFILIATE_LINK;
            }).catch(err => {
                console.error(err);
                // Redirect anyway so we don't lose the sale
                window.location.href = AFFILIATE_LINK;
            });
            */

            // For now, we simulate capturing the lead and redirect immediately
            console.log(`Lead Captured: ${name} (${email})`);
            
            // Fire Meta Pixel Lead Event
            if (typeof fbq === 'function') {
                fbq('track', 'Lead');
            }

            // 3. Redirect to affiliate offer
            window.location.href = AFFILIATE_LINK;
        });
    });

    // Handle smooth scrolling for anchor links (the mid-page CTAs)
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Highlight the form briefly to draw attention
                const nameInput = targetElement.querySelector('input[name="name"]');
                if(nameInput) {
                    setTimeout(() => {
                        nameInput.focus();
                    }, 500);
                }
            }
        });
    });
});
