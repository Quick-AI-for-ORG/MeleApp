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

// Show add modal
function showAddModal(type) {
  const modal = document.getElementById(
    `add${type.charAt(0).toUpperCase() + type.slice(1)}Modal`
  );
  modal.style.display = "flex";
}

// Show edit modal
function showEditModal(type, id) {
  const modal = document.getElementById(
    `add${type.charAt(0).toUpperCase() + type.slice(1)}Modal`
  );
  const form = document.getElementById(
    `add${type.charAt(0).toUpperCase() + type.slice(1)}Form`
  );
  const title = modal.querySelector(".modal-header h3");
  const submitBtn = modal.querySelector(".submit-btn");

  // Update modal for edit mode
  title.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  submitBtn.textContent = "Update";

  // Get current data
  const item = document.querySelector(`[data-${type}-id="${id}"]`);
  if (item) {
    if (type === "user") {
      const name = item.querySelector("h4").textContent.trim().split(" ");
      const email = item.querySelector("p").textContent.trim();

      form.firstName.value = name[0] || "";
      form.lastName.value = name[1] || "";
      form.email.value = email;
      form.password.style.display = "none"; // Hide password field for edit
      form.dataset.mode = "edit";
      form.dataset.id = id;
    }
  }

  modal.style.display = "flex";
}

// Close add modal
function closeAddModal(type) {
  const modal = document.getElementById(
    `add${type.charAt(0).toUpperCase() + type.slice(1)}Modal`
  );
  modal.style.display = "none";
  const form = document.getElementById(
    `add${type.charAt(0).toUpperCase() + type.slice(1)}Form`
  );
  if (form) {
    form.reset();
    delete form.dataset.mode;
    delete form.dataset.id;
    if (type === "user") {
      form.password.style.display = "block";
    }
  }
}

// Add this new function for price validation
function validatePrice(input) {
  if (input.value < 0) {
    input.value = 0;
  }
  // Format to 2 decimal places
  input.value = parseFloat(input.value).toFixed(2);
}

// Handle form submission
async function handleAdd(event, type) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validate price for products
  if (type === "product") {
    const price = parseFloat(data.price);
    if (price < 0) {
      showNotification("Price cannot be negative", "error");
      return;
    }
    data.price = price.toFixed(2);
  }

  const isEdit = form.dataset.mode === "edit";
  const endpoint = isEdit
    ? `/admin/update${type.charAt(0).toUpperCase() + type.slice(1)}`
    : `/admin/add${type.charAt(0).toUpperCase() + type.slice(1)}`;

  if (isEdit) {
    data.userId = form.dataset.id; // Add ID for update
  }

  try {
    const response = await fetch(endpoint, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success) {
      showNotification(
        `${type} ${isEdit ? "updated" : "added"} successfully`,
        "success"
      );
      closeAddModal(type);
      // Reload the page to show new data
      location.reload();
    } else {
      showNotification(
        `Error ${isEdit ? "updating" : "adding"} ${type}`,
        "error"
      );
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification(
      `Error ${isEdit ? "updating" : "adding"} ${type}`,
      "error"
    );
  }
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
