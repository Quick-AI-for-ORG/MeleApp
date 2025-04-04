// Auto-hide alerts
setTimeout(() => {
  const alert = document.querySelector(".alert");
  if (alert) {
    alert.style.display = "none";
  }
}, 5000);

function toggleEdit() {
  const form = document.getElementById("profileForm");
  const inputs = form.getElementsByTagName("input");
  const actions = form.querySelector(".form-actions");
  const passwordGroup = form.querySelector(".password-group");

  for (let input of inputs) {
    if (!input.disabled) {
      input.readOnly = false;
    }
  }

  actions.style.display = "flex";
  passwordGroup.style.display = "block";
  document.querySelector(".edit-btn").style.display = "none";
}

function cancelEdit() {
  const form = document.getElementById("profileForm");
  const inputs = form.getElementsByTagName("input");
  const actions = form.querySelector(".form-actions");
  const passwordGroup = form.querySelector(".password-group");

  for (let input of inputs) {
    if (!input.disabled) {
      input.readOnly = true;
    }
  }

  actions.style.display = "none";
  passwordGroup.style.display = "none";
  document.querySelector(".edit-btn").style.display = "block";
  form.reset();
}

function validateForm() {
  const form = document.getElementById("profileForm");
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (
    !/^[A-Za-z\s]{2,}$/.test(firstName) ||
    !/^[A-Za-z\s]{2,}$/.test(lastName)
  ) {
    showError("Names must contain at least 2 letters and only alphabets");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("Please enter a valid email address");
    return false;
  }

  if (password && password.length < 6) {
    showError("Password must be at least 6 characters long");
    return false;
  }

  return true;
}

function showError(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-danger";
  alertDiv.textContent = message;

  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  document
    .querySelector(".profile-header")
    .insertAdjacentElement("beforebegin", alertDiv);

  setTimeout(() => alertDiv.remove(), 5000);
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.querySelector(".toggle-password i");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleBtn.classList.replace("fa-eye-slash", "fa-eye");
  }
}
