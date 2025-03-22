```NOTIFICATIONS AND CONFIRMATIONS```
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
  
    setTimeout(() => notification.remove(), 3000);
  }
  
  function askToConfirm(message, title="Confirmation", confirmText="Confirm") {
    const confirmation = document.createElement("div");
    confirmation.className = `confirmation ${type}`;
    confirmation.innerHTML = 
    `
        <h1>${title}</h1>
          <p>${message}</p>
         <span>
          <button type="button" id="confirm" class="upgrade-btn">${ confirmText || "Confirm" }</button>
          <button type="button" id="cancel" class="logout-btn">Cancel</button>
         </span>
    `
    document.body.appendChild(confirmation);
    return new Promise((resolve) => {
      const confirmBtn = confirmation.querySelector("#confirm");
      const cancelBtn = confirmation.querySelector("#cancel");
      
      confirmBtn.addEventListener("click", () => {
        document.body.removeChild(confirmation);
        resolve(true);
      });
      
      cancelBtn.addEventListener("click", () => {
        confirmation.remove()
        resolve(false);
      });
    });
  }


```VALIDATION```
  function togglePassword() {
    const passwordInput = $("#password");
    const toggleButton = $(".toggle-password i");
    if (!passwordInput || !toggleButton) return;
    const isVisible = passwordInput.type === "password";
    passwordInput.type = isVisible ? "text" : "password";
    toggleButton.classList.toggle("fa-eye", !isVisible);
    toggleButton.classList.toggle("fa-eye-slash", isVisible);
  }
  
  function validateForm(data) {
    if (!/^[a-zA-Z\s]{2,}$/.test(data.firstName) || !/^[a-zA-Z\s]{2,}$/.test(data.lastName)) {
      alert("Please enter valid first and last names");
      return false;
    }
  
    if (!/^\+?[\d\s-]{10,}$/.test(data.phone)) {
      alert("Please enter a valid phone number");
      return false;
    }
  
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      alert("Please enter a valid email address");
      return false;
    }
  
    return true;
  }


  