let selectedApiaryId = null;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const toggleDisplay = (el, show) => el && (el.style.display = show ? "block" : "none");

function setSelectedApiary(apiaryId) {
  selectedApiaryId = apiaryId;
  const apiaryInput = $("#apiary");
  if (apiaryInput) apiaryInput.value = apiaryId;
  fetchBeekeepers(apiaryId);
}

function updateTitles(apiaryName, hiveName = "") {
  const apiaryTitle = $("#currentApiaryTitle");
  const hiveTitle = $("#currentHiveTitle");
  if (apiaryTitle) apiaryTitle.textContent = apiaryName;
  if (hiveTitle) {
    hiveTitle.textContent = hiveName;
    hiveTitle.classList[hiveName ? "add" : "remove"]("active");
  }
}

function toggleDashboards(showHive = false) {
  const apiaryDashboard = $(".apiary-dashboard");
  const hiveDashboard = $(".hive-dashboard");
  
  toggleDisplay(apiaryDashboard, !showHive);
  toggleDisplay(hiveDashboard, showHive);
  
  showHive ? initializeHiveCharts() : initializeCharts();
}

function createChart(ctx, config) {
  if (!ctx) return null;
  return new Chart(ctx.getContext("2d"), config);
}

function setupEventListeners() {
  const apiaryDropdown = $("#apiaryDropdown");
  const dropdownContent = $(".dropdown-content");
  
  if (apiaryDropdown && dropdownContent) {
    apiaryDropdown.addEventListener("click", function(e) {
      e.preventDefault();
      const isActive = dropdownContent.classList.toggle("active");
      dropdownContent.style.display = isActive ? "block" : "none";
      
      const icon = this.querySelector(".fa-chevron-down");
      if (icon) icon.style.transform = isActive ? "rotate(180deg)" : "rotate(0deg)";
    });
  }
  
  document.addEventListener("click", function(e) {
    if (e.target.closest(".nested-trigger")) {
      e.preventDefault();
      e.stopPropagation();
      
      const trigger = e.target.closest(".nested-trigger");
      const content = trigger.nextElementSibling;
      const isHiveTrigger = trigger.closest(".hive-item");
      
      // Update titles
      const nameSpan = trigger.querySelector("span");
      if (nameSpan) {
        const name = nameSpan.textContent;
        if (isHiveTrigger) {
          const apiaryElement = trigger.closest(".nested-dropdown").querySelector(".nested-trigger span");
          const apiaryName = apiaryElement ? apiaryElement.textContent : "";
          updateTitles(apiaryName, name);
        } else {
          updateTitles(name);
          
          const apiaryId = trigger.dataset.apiaryId;
          if (apiaryId) setSelectedApiary(apiaryId);
        }
      }
      
      if (content) {
        const isVisible = content.classList.toggle("show");
        content.style.display = isVisible ? "block" : "none";
        
        const chevron = trigger.querySelector(".fa-chevron-right");
        if (chevron) chevron.style.transform = isVisible ? "rotate(90deg)" : "rotate(0deg)";
      }
      
      toggleDashboards(isHiveTrigger);
    }
  });
  
  window.addEventListener("click", function(e) {
    if (e.target.classList.contains("modal")) closeModal(e.target.id);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  setupEventListeners();
  
  // Auto-select first apiary
  setTimeout(() => {
    const firstApiaryTrigger = $(".nested-dropdown > .nested-trigger");
    if (firstApiaryTrigger) {
      const apiaryId = firstApiaryTrigger.dataset.apiaryId;
      setSelectedApiary(apiaryId);
      firstApiaryTrigger.click();
      
      const dropdownContent = $(".dropdown-content");
      if (dropdownContent) {
        dropdownContent.style.display = "block";
        dropdownContent.classList.add("active");
        
        const mainDropdownIcon = $("#apiaryDropdown .fa-chevron-down");
        if (mainDropdownIcon) mainDropdownIcon.style.transform = "rotate(180deg)";
      }
    }
  }, 100);
  
  refreshBeekeepersList();
  updateBeekeepersCount();
});

// Chart configurations
const chartConfigs = {
  weight: {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Hive Weight (kg)",
        data: [32.5, 33.1, 34.2, 33.8, 35.2, 34.9, 35.2],
        backgroundColor: "#fca311",
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: false, min: 30, max: 38, grid: { display: false } },
        x: { grid: { display: false } }
      }
    }
  },
  
  line: (color, bgColor) => ({
    type: "line",
    data: {
      labels: monthlyData.labels,
      datasets: [{
        data: [25, 30, 35, 25, 30, 35, 40, 35, 40, 35, 40, 35],
        borderColor: color,
        backgroundColor: bgColor,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { display: false }, x: { display: false } }
    }
  }),
  
  vibration: {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Vibration Level",
        data: [2.1, 1.8, 2.3, 1.9, 2.4, 2.0, 1.7],
        borderColor: "#4F46E5",
        tension: 0.4,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { display: false } },
        x: { grid: { display: false } }
      }
    }
  }
};

function initializeCharts() {
  createChart($("#weightChart"), chartConfigs.weight);
  createChart($("#tasksChart"), chartConfigs.line("#4F46E5", "rgba(79, 70, 229, 0.1)"));
  createChart($("#projectsChart"), chartConfigs.line("#EF4444", "rgba(239, 68, 68, 0.1)"));
}

function initializeHiveCharts() {
  createChart($("#hiveWeightChart"), chartConfigs.weight);
  createChart($("#vibrationChart"), chartConfigs.vibration);
}

// Beekeeper management
let beekeepers = [];

async function fetchBeekeepers(apiaryId) {
  try {
    const response = await fetch("/keeper/getApiaryKeepers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiary: apiaryId })
    });

    const result = await response.json();
    if (!result.success.status) showNotification(result.message, "error");
    
    beekeepers = result.data;
    refreshBeekeepersList();
    updateBeekeepersCount();
  } catch (error) {
    console.error("Error fetching beekeepers:", error);
    showNotification("Error loading beekeepers", "error");
  }
}

function refreshBeekeepersList() {
  const container = $(".beekeepers-grid");
  if (!container) return;
  
  container.innerHTML = beekeepers && beekeepers.length 
    ? beekeepers.map(createBeekeeperCard).join("")
    : `<div class="no-data-message">
         <i class="fas fa-user-slash"></i>
         <p>No beekeepers assigned to this apiary</p>
       </div>`;
}

function createBeekeeperCard(beekeeper) {
  return `
    <div class="beekeeper-card" data-id="${beekeeper._id}">
      <div class="beekeeper-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="beekeeper-info">
        <h3>${beekeeper.name}</h3>
        <p class="role">Bee${beekeeper.role}</p>
      </div>
       ${(beekeeper._id === $('#sessionId').value) ? `<span class="beekeeper-info">
       <a href="/keeper/profile" class="edit-sessioned">
                    <i class="fa-solid fa-user-pen"></i>                
              </a>
       </span>` : `
      <button class="contact-btn" onclick="window.location.href='mailto:${beekeeper.email}'">
        <i class="fas fa-envelope"></i>
      </button>`}
      ${ ($('#sessionRole').value != "Owner") ? "" : `
      <div class="beekeeper-actions">
        <button class="action-btn edit" onclick="openModal('edit', '${beekeeper.email}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" onclick="confirmDelete('${beekeeper.email}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      `}
    </div>
  `;
}


function openModal(mode, beekeeperId = null) {
  const modal = $("#beekeeperModal");
  const form = $("#beekeeperForm");
  const modalTitle = $("#modalTitle");
  const passwordGroup = $(".password-group");
  const apiaryInput = $("#apiary");

  if (!modal || !form) return;
  
  modalTitle.textContent = mode === "add" ? "Add New Beekeeper" : "Edit Beekeeper";
  passwordGroup.style.display = mode === "add" ? "block" : "none";
  
  if (apiaryInput) apiaryInput.value = selectedApiaryId;

  if (mode === "edit" && beekeeperId) {
    const beekeeper = beekeepers.find(b => b.id === beekeeperId);
    if (beekeeper) {
      form.firstName.value = beekeeper.firstName;
      form.lastName.value = beekeeper.lastName;
      form.email.value = beekeeper.email;
      form.phone.value = beekeeper.phone;
      form.dataset.mode = "edit";
      form.dataset.id = beekeeperId;
    }
  } else {
    form.reset();
    form.dataset.mode = "add";
    delete form.dataset.id;
  }

  modal.style.display = "block";
}

function closeModal(id) {
  $("#" + id).style.display = "none";
  if( id == "beekeeperModal"){
  const form = $("#beekeeperForm");
  if (form) {
    form.reset();
    delete form.dataset.mode;
    delete form.dataset.id;
    }
  }
}

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

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  if (!selectedApiaryId) {
    showNotification("Please select an apiary first", "error");
    return;
  }
  
  data.apiary = selectedApiaryId;

  if (!validateForm(data)) return;

  const isEdit = form.dataset.mode === "edit";
  const endpoint = `/keeper/${isEdit ? "updateBeekeeper" : "assignKeeper"}`;
  
  try {
    const response = await fetch(endpoint, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success.status) {
      showNotification(`Beekeeper ${isEdit ? "updated" : "added"} successfully`, "success");
      fetchBeekeepers(selectedApiaryId);
      closeModal("beekeeperModal");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification(error.message || `Error ${isEdit ? "updating" : "adding"} beekeeper`, "error");
  }
}

async function confirmDelete(beekeeper) {
  const confirmation = await askToConfirm("Are you sure you want to delete this beekeeper?", "Delete Beekeeper", "Delete");
  if (confirmation) {
    try {
      const response = await fetch(`/keeper/removeKeeper?email=${beekeeper}`, {
        method: "DELETE",
      });
      if (!response.ok) showNotification("Failed, Please try again.", "error");
      const result = await response.json();
      console.log(result);
      if (result.success.status) {
        showNotification(result.message, "success");
        fetchBeekeepers(selectedApiaryId);
      } 
      else showNotification(result.message, "error");
    } catch (error) {
      showNotification("Failed, Please try again.", "error");
    }
  }
}

function updateBeekeepersCount() {
  const countElement = $(".weather-card.total-beekeepers .weather-value .value");
  if (countElement) countElement.textContent = beekeepers.length;
}

// Upgrades and kit management
function openUpgradeModal(id) {
  const modal = $("#upgradeModal");
  if (modal) {
    modal.style.display = "block";
    fetchAvailableUpgrades();
  }
}



async function fetchAvailableUpgrades() {
  try {
    const response = await fetch("/keeper/getProducts");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    if (result.success.status) displayAvailableUpgrades(result.data);
  } catch (error) {
    console.error("Error fetching upgrades:", error);
    showNotification(`Error fetching upgrades: ${error.message}`, "error");
  }
}

function displayAvailableUpgrades(products) {
  const upgradesList = $("#upgradesList");
  if (!upgradesList) return;
  
  const installedKits = Array.from($$(".kit-info h4")).map(el => el.textContent.trim());

  upgradesList.innerHTML = products && products.length 
    ? products.map(product => {
        const isInstalled = installedKits.includes(product.name);
        return `
          <div class="upgrade-item ${isInstalled ? "installed" : ""}">
            <input type="checkbox" class="upgrade-checkbox" value="${product._id}" 
              ${isInstalled ? "checked disabled" : ""}>
            <div class="upgrade-info">
              <span class="upgrade-name">${product.name}</span>
              ${isInstalled 
                ? '<span class="upgrade-status">(Already Installed)</span>' 
                : product.description ? `<p class="upgrade-description">${product.description}</p>` : ""}
            </div>
          </div>
        `;
      }).join("")
    : "<p>No upgrades available.</p>";
}

async function purchaseUpgrades() {
  const selectedUpgrades = Array.from($$(".upgrade-checkbox:checked:not(:disabled)")).map(cb => cb.value);

  if (!selectedUpgrades.length) {
    showNotification("Please select at least one upgrade", "error");
    return;
  }

  if (confirm("Are you sure you want to purchase these upgrades?")) {
    try {
      const response = await fetch("/api/purchaseProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedUpgrades })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.success) {
        showNotification("Upgrades purchased successfully", "success");
        closeModal("upgradeModal");
        location.reload();
      } else {
        throw new Error(result.message || "Error purchasing upgrades");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(`Error processing purchase: ${error.message}`, "error");
    }
  }
}

function requestKitRemoval(kitId) {
  const kitNames = {
    rimba: "The Mele-RIMBA Kit",
    monitoring: "Internal Hive Monitoring Kit",
    thermohygro: "ThermoHygro-Regulators Kit",
    scanner: "Yield Scanner Kit",
    intrusion: "On Door Intrusion Prevention Kit"
  };

  if (confirm(`Are you sure you want to request removal of ${kitNames[kitId]}?`)) {
    showNotification(`Removal request for ${kitNames[kitId]} has been sent to the administrator.`, 'success');
  }
}

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