console.log('Login validation script loaded');

window.addEventListener('DOMContentLoaded', function() {
    console.log('Login script loaded!'); // Debug log
    
    const form = document.querySelector('.login-form');
    console.log('Form found:', form); // Debug log
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        // Make sure container exists, if not create it
        let container = document.getElementById('toastsContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastsContainer';
            container.className = 'toasts-container';
            document.body.appendChild(container);
        }

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted'); // Debug log

            const email = document.getElementById('mail').value;
            const password = document.getElementById('password').value;

            if (!email || !email.includes('@')) {
                showToast('Please enter a valid email address');
                return;
            }

            if (!password || password.length < 8) {
                showToast('Password must be at least 8 characters');
                return;
            }

            this.submit();
        });
    }
});
