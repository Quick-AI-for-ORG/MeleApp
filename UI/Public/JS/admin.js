// Global variables to store delete information
let currentDeleteInfo = null;

// Show confirmation modal
function showConfirmModal(type, id, name) {
  const modal = document.getElementById("confirmationModal");
  const message = document.getElementById("confirmMessage");
  const closeBtn = modal.querySelector(".close");

  // Store the delete information
  currentDeleteInfo = { type, id };

  // Set confirmation message
  message.textContent = `Are you sure you want to delete ${type} "${name}"?`;

  // Show the modal
  modal.style.display = "flex"; // Changed from 'block' to 'flex'

  // Add event listeners
  closeBtn.onclick = hideConfirmModal;

  // Confirm delete button event
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  confirmBtn.onclick = handleDelete;
}

// Hide confirmation modal
function hideConfirmModal() {
  const modal = document.getElementById("confirmationModal");
  modal.style.display = "none";
  currentDeleteInfo = null;
}

// Handle the actual delete operation
async function handleDelete() {
  if (!currentDeleteInfo) return;

  const { type, id } = currentDeleteInfo;

  try {
    const response = await fetch(`/admin/${type}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [`${type}Id`]: id }),
    });

    const result = await response.json();

    if (result.success) {
      // Remove the element from the UI
      const element = document.querySelector(`[data-${type}-id="${id}"]`);
      if (element) {
        element.remove();
      }

      // Update the stats counter
      const statsCounter = document.querySelector(
        `.stat-card.${type}s .stat-value`
      );
      if (statsCounter) {
        statsCounter.textContent = parseInt(statsCounter.textContent) - 1;
      }

      showNotification(`${type} deleted successfully`, "success");
    } else {
      showNotification("Error deleting item", "error");
    }
  } catch (error) {
    console.error("Delete error:", error);
    showNotification("Error deleting item", "error");
  }

  hideConfirmModal();
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Close button in modal
  const closeBtn = document.querySelector(".modal .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideConfirmModal);
  }

  // Confirm delete button
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", handleDelete);
  }

  // Close modal when clicking outside
  window.onclick = function (event) {
    const modal = document.getElementById("confirmationModal");
    if (event.target === modal) {
      hideConfirmModal();
    }
  };
});
