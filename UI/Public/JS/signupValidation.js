console.log("Signup validation script loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded for signup validation");
  const form = document.querySelector(".signup-form");
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const confirmPasswordInput = document.querySelector(".cpw");
  const phoneInput = document.querySelector('input[name="phoneNumber"]');
  const passwordError = document.querySelector(".pswe");

  // Email validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Phone validation
  function isValidPhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
  }

  // Password validation (at least 8 chars, 1 uppercase, 1 number)
  function isValidPassword(password) {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span class="message">${message}</span>
        `;

    const container = document.getElementById("toastsContainer");
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  emailInput.addEventListener("input", function () {
    this.classList.toggle("invalid", !isValidEmail(this.value));
  });

  phoneInput.addEventListener("input", function () {
    this.classList.toggle("invalid", !isValidPhone(this.value));
  });

  passwordInput.addEventListener("input", function () {
    this.classList.toggle("invalid", !isValidPassword(this.value));
  });

  confirmPasswordInput.addEventListener("input", function () {
    const isMatch = this.value === passwordInput.value;
    this.classList.toggle("invalid", !isMatch);
    passwordError.style.display = isMatch ? "none" : "block";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!isValidEmail(emailInput.value)) {
      showToast("Please enter a valid email address");
      emailInput.classList.add("invalid");
      return;
    }

    if (!isValidPhone(phoneInput.value)) {
      showToast("Please enter a valid phone number starting with +20");
      phoneInput.classList.add("invalid");
      return;
    }

    if (!isValidPassword(passwordInput.value)) {
      showToast("Password must have 8+ characters, 1 uppercase & 1 number");
      passwordInput.classList.add("invalid");
      return;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      showToast("Passwords do not match");
      confirmPasswordInput.classList.add("invalid");
      return;
    }

    this.submit();
  });

  emailInput.addEventListener("input", function () {
    this.classList.remove("invalid");
  });

  phoneInput.addEventListener("input", function () {
    this.classList.remove("invalid");
  });

  passwordInput.addEventListener("input", function () {
    this.classList.remove("invalid");
  });

  confirmPasswordInput.addEventListener("input", function () {
    this.classList.remove("invalid");
  });
});
