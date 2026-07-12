document.addEventListener('DOMContentLoaded', () => {
    // Modal Elements
    const modal = document.getElementById('emailModal');
    const openBtns = document.querySelectorAll('.open-modal');
    const closeBtn = document.querySelector('.close-modal');
    const leadForm = document.getElementById('leadForm');

    // ** IMPORTANT CONFIGURATION **
    // Replace this URL with your actual WarriorPlus Affiliate Link
    const AFFILIATE_LINK = "https://warriorplus.com/o2/a/khh712j/0"; 

    // Open modal when any CTA button is clicked
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('show');
        });
    });

    // Close modal function
    const closeModal = () => {
        modal.classList.remove('show');
    };

    // Close on X click
    closeBtn.addEventListener('click', closeModal);

    // Close on background click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle Form Submission
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page refresh

        const submitBtn = leadForm.querySelector('.submit-button');
        const originalText = submitBtn.textContent;

        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;

        // Visual feedback
        submitBtn.textContent = "Processing...";
        submitBtn.style.opacity = '0.8';

        // ---------------------------------------------------------
        // TODO: INTEGRATE EMAIL CAPTURE HERE
        // If you use an autoresponder (like Mailchimp, GetResponse),
        // you would normally send an AJAX/fetch request to their API 
        // or a webhook here with the `name` and `email` variables.
        // ---------------------------------------------------------
        
        console.log(`Captured Lead -> Name: ${name}, Email: ${email}`);

        // Fire Meta Pixel Lead Event
        if (typeof fbq === 'function') {
            fbq('track', 'Lead');
        }

        // Simulate network delay for effect, then redirect to affiliate link
        setTimeout(() => {
            window.location.href = AFFILIATE_LINK;
        }, 800);
    });
});
