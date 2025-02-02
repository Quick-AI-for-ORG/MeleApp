document.addEventListener("DOMContentLoaded", function () {
  // Range slider for frames
  const framesSlider = document.getElementById("framesCount");
  const framesOutput = document.getElementById("framesOutput");

  framesSlider.addEventListener("input", function () {
    framesOutput.textContent = `${this.value} frames`;
  });

  // Prevent unchecking readonly checkboxes
  document
    .querySelectorAll('input[type="checkbox"][readonly]')
    .forEach((checkbox) => {
      checkbox.addEventListener("click", function (e) {
        e.preventDefault();
        return false;
      });
    });

  // Form validation
  const form = document.querySelector(".upgrade-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (validateForm()) {
      // Show confirmation modal
      const modal = document.getElementById('confirmationModal');
      modal.style.display = 'flex';
      
      // Don't submit form automatically
      return false;
    }
  });
});

function closeConfirmation() {
  const modal = document.getElementById('confirmationModal');
  modal.style.display = 'none';
  // Now submit the form and redirect
  document.querySelector('.upgrade-form').submit();
}

function validateForm() {
  const length = document.getElementById("length").value;
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  const agreement = document.getElementById("agreement");

  if (length <= 0 || width <= 0 || height <= 0) {
    alert("Please enter valid dimensions");
    return false;
  }

  if (!agreement.checked) {
    alert("Please agree to the terms and conditions");
    return false;
  }

  return true;
}
