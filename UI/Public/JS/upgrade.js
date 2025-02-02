document.addEventListener('DOMContentLoaded', function() {
    // Range slider for frames
    const framesSlider = document.getElementById('framesCount');
    const framesOutput = document.getElementById('framesOutput');
    
    framesSlider.addEventListener('input', function() {
        framesOutput.textContent = `${this.value} frames`;
    });

    // Form validation
    const form = document.querySelector('.upgrade-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validate dimensions
        const length = document.getElementById('length').value;
        const width = document.getElementById('width').value;
        const height = document.getElementById('height').value;

        if (length <= 0 || width <= 0 || height <= 0) {
            alert('Please enter valid dimensions');
            return;
        }

        // Validate agreement
        const agreement = document.getElementById('agreement');
        if (!agreement.checked) {
            alert('Please agree to the terms and conditions');
            return;
        }

        // If all validations pass, submit the form
        this.submit();
    });
});
