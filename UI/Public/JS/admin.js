// Global variables
let currentDeleteInfo = null;

// Confirmation modal functions
function showConfirmModal(type, id, name) {
  const modal = document.getElementById("confirmationModal");
  const message = document.getElementById("confirmMessage");

  currentDeleteInfo = { type, id };

  // Get name from span if not provided for apiaries
  if (type === "apiary" && !name) {
    const row = document.querySelector(`[data-${type}-id="${id}"]`);
    if (row) {
      const nameSpan = row.querySelector("[data-name]");
      if (nameSpan) name = nameSpan.dataset.name;
    }
  }

  message.textContent = `Are you sure you want to delete ${type} "${name}"?`;
  modal.style.display = "flex";

  // Set event handlers
  modal.querySelector(".close").onclick = hideConfirmModal;
  document.getElementById("confirmDeleteBtn").onclick = handleDelete;
}

function hideConfirmModal() {
  document.getElementById("confirmationModal").style.display = "none";
  currentDeleteInfo = null;
}

// Delete operation
async function handleDelete() {
  if (!currentDeleteInfo) return;

  const { type, id } = currentDeleteInfo;

  try {
    const response = await fetch(`/admin/${type}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [`${type}Id`]: id }),
    });

    const result = await response.json();

    if (result.success) {
      // Remove element from UI
      const element = document.querySelector(`[data-${type}-id="${id}"]`);
      if (element) element.remove();

      // Update stats counter
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

// Modal management
function showAddModal(type) {
  const modalId = `add${type.charAt(0).toUpperCase() + type.slice(1)}Modal`;
  document.getElementById(modalId).style.display = "flex";
}

function showEditModal(type, id) {
  const capType = type.charAt(0).toUpperCase() + type.slice(1);
  const modal = document.getElementById(`add${capType}Modal`);
  const form = document.getElementById(`add${capType}Form`);
  const title = modal.querySelector(".modal-header h3");
  const submitBtn = modal.querySelector(".submit-btn");

  // Update modal for edit mode
  title.textContent = `Edit ${capType}`;
  submitBtn.textContent = "Update";

  // Get current data
  const item = document.querySelector(`[data-${type}-id="${id}"]`);
  if (item && type === "user") {
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

  modal.style.display = "flex";
}

function closeAddModal(type) {
  const capType = type.charAt(0).toUpperCase() + type.slice(1);
  const modal = document.getElementById(`add${capType}Modal`);
  modal.style.display = "none";

  const form = document.getElementById(`add${capType}Form`);
  if (form) {
    form.reset();
    delete form.dataset.mode;
    delete form.dataset.id;
    if (type === "user") form.password.style.display = "block";
  }
}

// Form validation
function validatePrice(input) {
  if (input.value < 0) input.value = 0;
  input.value = parseFloat(input.value).toFixed(2);
}

// Form submission
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
  const capType = type.charAt(0).toUpperCase() + type.slice(1);
  const endpoint = `/admin/${isEdit ? "update" : "add"}${capType}`;

  if (isEdit) data.userId = form.dataset.id;

  try {
    const response = await fetch(endpoint, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        type === "product"
          ? {
              name: form.name.value,
              price: parseFloat(form.price.value),
              description: form.description.value,
              subscription: form.subscription?.value || "",
              sensorTypes: Array.from(
                form.querySelectorAll('input[name="sensorTypes"]:checked')
              ).map((input) => input.value),
            }
          : data
      ),
    });

    const result = await response.json();
    if (result.success) {
      showNotification(
        `${type} ${isEdit ? "updated" : "added"} successfully`,
        "success"
      );
      closeAddModal(type);
      location.reload(); // Reload to show new data
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

// Notifications
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// View All functionality
function showViewAllModal(type) {
  const modal = document.getElementById("viewAllModal");
  const title = document.getElementById("viewAllTitle");
  const tableHead = document.getElementById("viewAllTableHead");
  const tableBody = document.getElementById("viewAllTableBody");

  if (!modal || !title || !tableHead || !tableBody) {
    console.error("Required modal elements not found");
    return;
  }

  // Get existing items from the page
  const items = Array.from(document.querySelectorAll(`[data-${type}-id]`));

  // Clear previous content
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  // Update title and show modal
  title.textContent = `All ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
  modal.style.display = "flex";

  // Define headers and create table header
  const headers = getHeadersForType(type);
  tableHead.innerHTML = `<tr>${headers
    .map((h) => `<th>${h}</th>`)
    .join("")}</tr>`;

  // Display items
  items.forEach((item) => {
    const row = document.createElement("tr");
    const cells = getTableCellsFromItem(item, type);
    row.innerHTML = cells;
    tableBody.appendChild(row);
  });
}

function closeViewAllModal() {
  document.getElementById("viewAllModal").style.display = "none";
}

function getHeadersForType(type) {
  const headers = {
    user: ["Name", "Email", "Role", "Joined Date"],
    product: ["Name", "Price", "Description", "Added Date"],
    sensor: ["Type", "Model", "Status", "Description", "Hive"],
    hive: ["Apiary", "Frames", "Dimensions", "Added Date"],
    apiary: ["Name", "Location", "Hive Count", "Added Date"],
    hiveupgrade: ["ID", "Operational Status", "Created Date"],
    question: ["Email", "Message", "Date"],
    threat: ["Type", "Action", "Severity", "Date"],
  };

  return headers[type] || [];
}

function getTableCellsFromItem(item, type) {
  const info = item.querySelector(".activity-info");

  switch (type) {
    case "user":
      return `
        <td>${info.querySelector("h4").textContent.trim()}</td>
        <td>${info.querySelector("p").textContent.trim()}</td>
        <td>${info.querySelector(".user-role").textContent.trim()}</td>
        <td>${info
          .querySelector(".timestamp")
          .textContent.replace("Joined ", "")}</td>
      `;
    case "question":
      return `
        <td>${info.querySelector("h4").textContent.trim()}</td>
        <td>${info.querySelector("p").textContent.trim()}</td>
        <td>${info.querySelector(".timestamp").textContent.trim()}</td>
      `;
    case "threat":
      return `
        <td>${info.querySelector("h4").textContent.trim()}</td>
        <td>${info.querySelector(".threat-action").textContent.trim()}</td>
        <td>${info
          .querySelector(".timestamp")
          .textContent.replace("Reported ", "")}</td>
      `;
    // Add other cases as needed
    default:
      return "";
  }
}

async function fetchAllItems(type) {
  try {
    const response = await fetch(`/admin/getAll${type}s`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.success) return data.items || [];
    throw new Error(data.error || "Failed to fetch items");
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

    // Add cells with data
    cells.forEach((cell) => {
      const td = document.createElement("td");
      td.innerHTML = cell;
      row.appendChild(td);
    });

    // Add actions column
    const actionsTd = document.createElement("td");
    actionsTd.innerHTML = `
      <div class="table-actions">
        <button class="action-btn edit" onclick="showEditModal('${type}', '${
      item._id
    }')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" onclick="showConfirmModal('${type}', '${
      item._id
    }', '${item.name || item._id}')">
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
      const role = item.role || "beekeeper";
      return [
        `${item.firstName || ""} ${item.lastName || ""}`,
        item.email,
        `<span class="user-role ${role}">${role}</span>`,
        new Date(item.createdAt).toLocaleDateString(),
      ];

    case "product":
      return [
        item.name,
        `${parseFloat(item.price).toFixed(2)}`,
        `${
          item.description || "No description"
        } <span class="product-counter">${item.counter || 0} units</span>`,
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

    case "hiveupgrade":
      return [
        item._id,
        `<span class="operational-status ${
          item.operational ? "active" : "inactive"
        }">${item.operational ? "Operational" : "Non-operational"}</span>`,
        new Date(item.createdAt).toLocaleDateString(),
      ];

    case "question":
      return [
        item.email,
        item.message,
        new Date(item.createdAt).toLocaleDateString(),
      ];

    case "threat":
      return [
        item.threatType,
        item.action,
        `<span class="severity-level ${
          item.severity?.toLowerCase() || "unknown"
        }">${item.severity || "Unknown"}</span>`,
        new Date(item.createdAt).toLocaleDateString(),
      ];

    default:
      return [];
  }
}
