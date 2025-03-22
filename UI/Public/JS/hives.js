/*Notifications and Confirmations*/
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
  
    setTimeout(() => notification.remove(), 3000);
  }
  
  function askToConfirm(message, title="Confirmation", confirmText="Confirm") {
    const confirmation = document.createElement("div");
    confirmation.className = `confirmation`;
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
    confirmation.scrollIntoView();
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



/*Fetching Hive Data*/
const apiaries = JSON.parse($('#apiariesInjection').dataset.apiaries)

