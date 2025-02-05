// Global variables to store delete information
let currentDeleteInfo = null;

// Show confirmation modal
function showConfirmModal(type, id, name) {
  const modal = document.getElementById("confirmationModal");
  const message = document.getElementById("confirmMessage");
  const closeBtn = modal.querySelector(".close");

  // Store the delete information
  currentDeleteInfo = { type, id };

  // For apiaries, get the name from the span if not provided
  if (type === "apiary" && !name) {
    const row = document.querySelector(`[data-${type}-id="${id}"]`);
    if (row) {
      const nameSpan = row.querySelector("[data-name]");
      if (nameSpan) {
        name = nameSpan.dataset.name;
      }
    }
  }

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
      const role = item
        .querySelector(".user-role")
        .textContent.trim()
        .toLowerCase();

      form.firstName.value = name[0] || "";
      form.lastName.value = name[1] || "";
      form.email.value = email;
      form.role.value = role;
      form.password.style.display = "none";
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

// View All functionality
function showViewAllModal(type) {
  if (!type) {
    console.error("No type provided to showViewAllModal");
    return;
  }

  const modal = document.getElementById("viewAllModal");
  const title = document.getElementById("viewAllTitle");
  const tableHead = document.getElementById("viewAllTableHead");
  const tableBody = document.getElementById("viewAllTableBody");

  if (!modal || !title || !tableHead || !tableBody) {
    console.error("Required modal elements not found");
    return;
  }

  // Clear previous content
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  // Show loading state
  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  // Update title and show modal
  title.textContent = `All ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
  modal.style.display = "flex";

  // Define headers and fetch data
  const headers = getHeadersForType(type);
  tableHead.innerHTML = `<tr>${headers
    .map((h) => `<th>${h}</th>`)
    .join("")}<th>Actions</th></tr>`;

  // Fetch and display data
  fetchAllItems(type)
    .then((items) => {
      if (items && items.length > 0) {
        displayItems(items, type);
      } else {
        tableBody.innerHTML = `<tr><td colspan="${
          headers.length + 1
        }">No items found</td></tr>`;
      }
    })
    .catch((error) => {
      console.error("Error in showViewAllModal:", error);
      tableBody.innerHTML = `<tr><td colspan="${
        headers.length + 1
      }">Error loading data</td></tr>`;
      showNotification("Error loading data", "error");
    });
}

function closeViewAllModal() {
  const modal = document.getElementById("viewAllModal");
  modal.style.display = "none";
}

function getHeadersForType(type) {
  switch (type) {
    case "user":
      return ["Name", "Email", "Role", "Joined Date"];
    case "product":
      return ["Name", "Price", "Description", "Added Date"];
    case "sensor":
      return ["Type", "Model", "Status", "Description", "Hive"];
    case "hive":
      return ["Apiary", "Frames", "Dimensions", "Added Date"];
    case "apiary":
      return ["Name", "Location", "Hive Count", "Added Date"];
    default:
      return [];
  }
}

async function fetchAllItems(type) {
  try {
    console.log(`Fetching all ${type}s...`);
    const response = await fetch(`/admin/getAll${type}s`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Fetched ${type}s:`, data);
    if (data.success) {
      return data.items || [];
    } else {
      throw new Error(data.error || "Failed to fetch items");
    }
  } catch (error) {
    console.error(`Error fetching ${type}s:`, error);
    showNotification(`Error fetching ${type}s: ${error.message}`, "error");
    return [];
  }
}

function displayItems(items, type) {
  const tableBody = document.getElementById("viewAllTableBody");
  tableBody.innerHTML = "";

  items.forEach((item) => {
    const row = document.createElement("tr");
    const cells = getCellsForType(item, type);

    cells.forEach((cell) => {
      const td = document.createElement("td");
      td.innerHTML = cell;
      row.appendChild(td);
    });

    // Add actions column
    const actionsTd = document.createElement("td");
    actionsTd.innerHTML = `
      <div class="table-actions">
        <button class="action-btn edit" onclick="showEditModal('${type}', '${item._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" onclick="showConfirmModal('${type}', '${item._id}', '${item.name}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    row.appendChild(actionsTd);

    tableBody.appendChild(row);
  });
}

function getCellsForType(item, type) {
  switch (type) {
    case "user":
      return [
        `${item.firstName || ""} ${item.lastName || ""}`,
        item.email,
        `<span class="user-role ${item.role || "beekeeper"}">${
          item.role || "beekeeper"
        }</span>`,
        new Date(item.createdAt).toLocaleDateString(),
      ];
    case "product":
      return [
        item.name,
        `$${parseFloat(item.price).toFixed(2)}`,
        item.description || "No description",
        new Date(item.createdAt).toLocaleDateString(),
      ];
    case "sensor":
      return [
        item.sensorType,
        item.modelName,
        `<span class="sensor-status ${item.status?.toLowerCase()}">${
          item.status === "on" ? "On" : "Off"
        }</span>`,
        item.description || "No description",
        item.hiveName || "Unassigned",
      ];
    case "hive":
      return [
        item.apiaryName || "Unassigned",
        item.numberOfFrames || "0",
        item.dimentions
          ? `${item.dimentions.length}x${item.dimentions.width}x${item.dimentions.height}`
          : "N/A",
        new Date(item.createdAt).toLocaleDateString(),
      ];
    case "apiary":
      return [
        `<span data-name="${item.name}">${
          item.name || "Unnamed Apiary"
        }</span>`,
        item.location || "No location",
        item.hiveCount || "0",
        new Date(item.createdAt).toLocaleDateString(),
      ];
    default:
      return [];
  }
}

function filterItems() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const tbody = document.getElementById("viewAllTableBody");
  const rows = tbody.getElementsByTagName("tr");

  for (let row of rows) {
    const cells = row.getElementsByTagName("td");
    let shouldShow = false;

    for (let cell of cells) {
      if (cell.textContent.toLowerCase().indexOf(filter) > -1) {
        shouldShow = true;
        break;
      }
    }

    row.style.display = shouldShow ? "" : "none";
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Update View All button listeners
  document.querySelectorAll(".view-all").forEach((button) => {
    button.addEventListener("click", function () {
      // Get the type from the closest activity-card
      const cardClass = this.closest(".activity-card").className;
      // Extract the type (users, products, etc.)
      const match = cardClass.match(
        /\b(users|products|sensors|hives|apiaries)-list\b/
      );
      if (match) {
        const type = match[1].slice(0, -1); // Remove 's' from the end
        console.log("Opening view all for:", type);
        showViewAllModal(type);
      } else {
        console.error("Could not determine type from class:", cardClass);
      }
    });
  });

  // Update modal close handlers
  document.querySelectorAll(".modal .close").forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      if (modal) {
        if (modal.id === "viewAllModal") {
          closeViewAllModal();
        } else if (modal.id === "confirmationModal") {
          hideConfirmModal();
        } else {
          const type = modal.id
            .replace("add", "")
            .replace("Modal", "")
            .toLowerCase();
          closeAddModal(type);
        }
      }
    });
  });

  // Window click handler for modals
  window.onclick = function (event) {
    if (event.target.classList.contains("modal")) {
      const modalId = event.target.id;
      if (modalId === "viewAllModal") {
        closeViewAllModal();
      } else if (modalId === "confirmationModal") {
        hideConfirmModal();
      } else {
        const type = modalId
          .replace("add", "")
          .replace("Modal", "")
          .toLowerCase();
        closeAddModal(type);
      }
    }
  };
});
