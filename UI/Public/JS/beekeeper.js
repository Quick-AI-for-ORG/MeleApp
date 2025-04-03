/******************************
 *   UTILITY FUNCTIONS        *
 ******************************/
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const toggleDisplay = (el, show) =>
  el && (el.style.display = show ? "block" : "none");

/******************************
 *   STATE VARIABLES          *
 ******************************/
let selectedApiaryId = null;
let selectedHiveId = null;
let beekeepers = [];
let hiveDataCache = {};

/******************************
 *  APIARY MANAGEMENT FUNCTIONS *
 ******************************/
function setSelectedApiary(apiaryId) {
  selectedApiaryId = apiaryId;
  const apiaryInput = $("#apiary");
  if (apiaryInput) apiaryInput.value = apiaryId;
  const apiaries = JSON.parse($("#apiariesInjection").dataset.apiaries);
  let apiary = apiaries.find((apiary) => apiary._id === apiaryId);
  $("#totalHives").innerText = apiary.numberOfHives || 0;
  $("#totalTemperature").innerText = apiary.temperature || 0;
  $("#totalHumidity").innerText = apiary.humidity || 0;
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

async function fetchHiveData(hiveId) {
  try {
    console.log("Fetching hive data for:", hiveId);

    // Show loading state
    document.body.classList.add("loading-hive");
    const loadingElements = `
      <div class="loading-wings"></div>
      <div class="loading-text"></div>
    `;
    const dashboard = $(".hive-dashboard");
    dashboard.insertAdjacentHTML("beforeend", loadingElements);

    // Check cache first
    if (hiveDataCache[hiveId]) {
      updateHiveDashboard(hiveDataCache[hiveId]);
    }

    const apiaries = JSON.parse($("#apiariesInjection").dataset.apiaries);
    let currentHive = null;

    for (const apiary of apiaries) {
      const hive = apiary.hives.find((h) => h._id === hiveId);
      if (hive) {
        currentHive = hive;
        selectedHiveId = hiveId;
        break;
      }
    }

    if (!currentHive) {
      throw new Error("Hive not found in current data");
    }

    // Fetch all hive data in one call
    const response = await fetch("/keeper/getHive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: hiveId }),
    });

    const result = await response.json();
    console.log("Hive data response:", result);

    if (result.success.status) {
      const newData = {
        ...currentHive,
        ...result.data,
      };

      if (result.data.readings && result.data.readings.length > 0) {
        console.log("Processing readings:", result.data.readings);

        const processedData = processSensorReadings(result.data.readings);
        updateSensorTables(processedData);

        const weightChart = Chart.getChart("weightChart");
        if (weightChart) {
          console.log(
            "Updating weight chart with readings:",
            result.data.readings
          );
          Charts.updateChart(weightChart, [result.data.readings]);
        }

        const latestTemps = processedData.temperature[0]?.sensors || [];
        const latestHumids = processedData.humidity[0]?.sensors || [];

        const avgTemp = latestTemps.length
          ? (
              latestTemps.reduce((a, b) => a + b, 0) / latestTemps.length).toFixed(1)
          : "0.0";
        const avgHumid = latestHumids.length
          ? (
              latestHumids.reduce((a, b) => a + b, 0) / latestHumids.length
            ).toFixed(1)
          : "0.0";

        $(".weather-card.hive-temp .weather-value .value").textContent =
          avgTemp;
        $(".weather-card.hive-humidity .weather-value .value").textContent =
          avgHumid;
      }

      // Update cache and dashboard
      hiveDataCache[hiveId] = newData;
      updateHiveDashboard(newData);
    }
  } catch (error) {
    console.error("Error in fetchHiveData:", error);
    showNotification("Error loading hive data: " + error.message, "error");
  } finally {
    // Remove loading state
    document.body.classList.remove("loading-hive");
    const wings = $(".loading-wings");
    const text = $(".loading-text");
    if (wings) wings.remove();
    if (text) text.remove();
  }
}

function updateHiveDashboard(hiveData) {
  // Use nullish coalescing operator to handle null/undefined values
  const data = hiveData || {};

  // Update frames count
  $(".weather-card.frames .weather-value .value").textContent =
    data.numberOfFrames || "0";

  // Update sensors count (using length of sensors array)
  $(".weather-card.sensors .weather-value .value").textContent =
    (data.sensors && data.sensors.length) || "0";

  let temp = 0.0,
    humid = 0.0;
  let countTemp = 0,
    countHumid = 0;
  if (data.readings && data.readings.length > 0) {
    for (let i = 0; i < data.readings.length; i++) {
      if (data.readings[i].sensorType == "Temperature") {
        countTemp++;
        temp += Number(data.readings[i].sensorValue);
      }
      if (data.readings[i].sensorType == "Humidity") {
        countHumid++;
        humid += Number(data.readings[i].sensorValue);
      }
    }
    if (countTemp > 0) temp = (temp / countTemp).toFixed(2);
    else temp = "0.0";

    if (countHumid > 0) humid = (humid / countHumid).toFixed(2);
    else humid = "0.0";
  }
  // Update temperature with one decimal place
  $(".weather-card.hive-temp .weather-value .value").textContent = temp;

  // Update humidity as whole number
  $(".weather-card.hive-humidity .weather-value .value").textContent = humid;

  // Update threats count (using length of threats array)
  $(".weather-card.hive-threats .weather-value .value").textContent =
    (data.threats && data.threats.length) || "0";

  // Update installed kits list
  const kitsList = $(".kits-list");
  if (kitsList) {
    if (
      data.products &&
      Array.isArray(data.products) &&
      data.products.length > 0
    ) {
      kitsList.innerHTML = data.products
        .map(
          (product) => `
        <div class="kit-item">
          <div class="kit-info">
            <h4>${product.name}</h4>
            <span class="kit-status active">Installed</span>
          </div>
          ${
            $("#sessionRole").value === "Owner"
              ? `
            <button class="kit-action-btn" onclick="requestKitRemoval('${product._id}')">
              <i class="fas fa-times"></i>
              Request Removal
            </button>
          `
              : ""
          }
        </div>
      `
        )
        .join("");
    } else {
      kitsList.innerHTML = `
        <div class="no-data-message">
          <i class="fas fa-box-open"></i>
          <p>No kits installed in this hive</p>
        </div>
      `;
    }
  }

  // Handle sensor data tables
  if (data.sensors && data.sensors.length > 0) {
    const sensorData = {
      temperature: data.sensors.map((s) => ({
        timestamp: s.timestamp,
        average: s.temperature,
        sensors: s.temperatureReadings || [],
      })),
      humidity: data.sensors.map((s) => ({
        timestamp: s.timestamp,
        average: s.humidity,
        sensors: s.humidityReadings || [],
      })),
    };
    updateSensorTables(sensorData);
  } else {
    // Fill tables with default empty rows
    const emptyRow = "<tr>" + "<td>--</td>".repeat(9) + "</tr>";
    const tables = document.querySelectorAll(".sensor-table tbody");
    tables.forEach((table) => {
      table.innerHTML = emptyRow.repeat(3); // Show 3 empty rows
    });
  }

  // Handle threats display
  const threatsList = $(".threats-list");
  if (threatsList) {
    if (
      data.threats &&
      Array.isArray(data.threats) &&
      data.threats.length > 0
    ) {
    } else {
      threatsList.innerHTML = `
        <div class="no-data-message">
          <i class="fas fa-shield-check"></i>
          <p>No threats detected</p>
        </div>
      `;
    }
  }

  // Update timestamp if available
  const timeElements = document.querySelectorAll(".weather-time");
  const timestamp =
    data.updatedAt || data.lastUpdated || data.timestamp
      ? new Date(
          data.updatedAt || data.lastUpdated || data.timestamp
        ).toLocaleTimeString()
      : "--:--:--";
  timeElements.forEach((el) => {
    el.textContent = `Last updated: ${timestamp}`;
  });

  console.log("Updated hive dashboard with data:", data);
}

function processSensorReadings(readings) {
  if (!Array.isArray(readings)) {
    console.error("No readings data available");
    return { temperature: [], humidity: [] };
  }

  // Initialize three rows for each type
  const groupedReadings = {
    temperature: [
      new Array(7).fill(null),
      new Array(7).fill(null),
      new Array(7).fill(null),
    ],
    humidity: [
      new Array(7).fill(null),
      new Array(7).fill(null),
      new Array(7).fill(null),
    ],
  };

  readings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const counts = { temperature: 0, humidity: 0 };
  const timestamps = { temperature: [], humidity: [] };

  // Process readings for 21 sensors (3 rows × 7 sensors)
  readings.forEach((reading) => {
    const type = reading.sensorType.toLowerCase();
    if (type !== "temperature" && type !== "humidity") return;

    if (counts[type] < 21) {
      // Increased to handle 21 readings
      const rowIndex = Math.floor(counts[type] / 7);
      const sensorIndex = counts[type] % 7;

      groupedReadings[type][rowIndex][sensorIndex] = Number(
        reading.sensorValue
      );

      // Store timestamp for first reading of each row
      if (sensorIndex === 0) {
        timestamps[type][rowIndex] = new Date(
          reading.createdAt
        ).toLocaleTimeString();
      }

      counts[type]++;
    }
  });

  const calculateRowAverage = (values) => {
    const validValues = values.filter((v) => v !== null);
    return validValues.length
      ? validValues.reduce((a, b) => a + b, 0) / validValues.length
      : 0;
  };

  return {
    temperature: groupedReadings.temperature.map((row, i) => ({
      timestamp: timestamps.temperature[i] || "--:--:--",
      average: calculateRowAverage(row),
      sensors: row,
    })),
    humidity: groupedReadings.humidity.map((row, i) => ({
      timestamp: timestamps.humidity[i] || "--:--:--",
      average: calculateRowAverage(row),
      sensors: row,
    })),
  };
}

function updateSensorTables(sensorData) {
  const formatTableRows = (readings) => {
    if (!Array.isArray(readings) || readings.length === 0) {
      return "<tr>" + "<td>--</td>".repeat(9) + "</tr>";
    }

    return readings
      .map((reading) => {
        const sensorValues = reading.sensors
          .map((val) => (val !== null ? val.toFixed(1) : "--"))
          .join("</td><td>");

        return `
        <tr>
          <td>${reading.timestamp}</td>
          <td>${reading.average.toFixed(1)}</td>
          <td>${sensorValues}</td>
        </tr>
      `;
      })
      .join("");
  };

  const tempTable = $(".table-card:first-child tbody");
  const humidityTable = $(".table-card:last-child tbody");

  if (tempTable) tempTable.innerHTML = formatTableRows(sensorData.temperature);
  if (humidityTable)
    humidityTable.innerHTML = formatTableRows(sensorData.humidity);
}

function toggleDashboards(showHive = false, hiveId = null) {
  const apiaryDashboard = $(".apiary-dashboard");
  const hiveDashboard = $(".hive-dashboard");

  if (showHive && hiveId) {
    console.log("Switching to hive view for hive:", hiveId);
    fetchHiveData(hiveId);
    // Remove the automatic refresh interval
    if (window.hiveDataInterval) {
      clearInterval(window.hiveDataInterval);
      window.hiveDataInterval = null;
    }
  }

  toggleDisplay(apiaryDashboard, !showHive);
  toggleDisplay(hiveDashboard, showHive);
}

/******************************
 *  BEEKEEPER MANAGEMENT FUNCTIONS *
 ******************************/
async function fetchBeekeepers(apiaryId) {
  try {
    const response = await fetch("/keeper/getApiaryKeepers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiary: apiaryId }),
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

  container.innerHTML =
    beekeepers && beekeepers.length
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
       ${
         beekeeper._id === $("#sessionId").value
           ? `<span class="beekeeper-info">
       <a href="/keeper/profile" class="edit-sessioned">
                    <i class="fa-solid fa-user-pen"></i>                
              </a>
       </span>`
           : `
      <button class="contact-btn" onclick="window.location.href='mailto:${beekeeper.email}'">
        <i class="fas fa-envelope"></i>
      </button>`
       }
      ${
        $("#sessionRole").value != "Owner"
          ? ""
          : `
      <div class="beekeeper-actions">
        <button class="action-btn edit" onclick="openModal('edit', '${beekeeper.email}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" onclick="confirmDelete('${beekeeper.email}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      `
      }
    </div>
  `;
}

function updateBeekeepersCount() {
  const countElement = $(
    ".weather-card.total-beekeepers .weather-value .value"
  );
  if (countElement) countElement.textContent = beekeepers.length;
}

/******************************
 *  MODAL MANAGEMENT FUNCTIONS *
 ******************************/
function openModal(mode, beekeeperId = null) {
  const modal = $("#beekeeperModal");
  const form = $("#beekeeperForm");
  const modalTitle = $("#modalTitle");
  const passwordGroup = $(".password-group");
  const apiaryInput = $("#apiary");

  if (!modal || !form) return;

  modalTitle.textContent =
    mode === "add" ? "Add New Beekeeper" : "Edit Beekeeper";
  passwordGroup.style.display = mode === "add" ? "block" : "none";

  if (apiaryInput) apiaryInput.value = selectedApiaryId;

  if (mode === "edit" && beekeeperId) {
    const beekeeper = beekeepers.find((b) => b.id === beekeeperId);
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
  if (id == "beekeeperModal") {
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

/******************************
 *  BEEKEEPER FORM HANDLING FUNCTIONS   *
 ******************************/
function validateForm(data) {
  if (
    !/^[a-zA-Z\s]{2,}$/.test(data.firstName) ||
    !/^[a-zA-Z\s]{2,}$/.test(data.lastName)
  ) {
    showNotification("Please enter valid first and last names", "error");
    return false;
  }

  if (!/^\+?[\d\s-]{10,}$/.test(data.phone)) {
    showNotification("Please enter a valid phone number", "error");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    showNotification("Please enter a valid email address", "error");
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
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.success.status) {
      showNotification(
        `Beekeeper ${isEdit ? "updated" : "added"} successfully`,
        "success"
      );
      fetchBeekeepers(selectedApiaryId);
      closeModal("beekeeperModal");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    showNotification(
      error.message || `Error ${isEdit ? "updating" : "adding"} beekeeper`,
      "error"
    );
  }
}

async function confirmDelete(beekeeper) {
  const confirmation = await askToConfirm(
    "Are you sure you want to delete this beekeeper?",
    "Delete Beekeeper",
    "Delete"
  );
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
      } else showNotification(result.message, "error");
    } catch (error) {
      showNotification("Failed, Please try again.", "error");
    }
  }
}

/******************************
 *  UPGRADE & KIT MANAGEMENT  *
 ******************************/
function openUpgradeModal() {
  const products = JSON.parse($("#injectedProducts").dataset.products);
  const modal = $("#upgradeModal");
  if (modal) {
    modal.style.display = "block";
    displayAvailableUpgrades(products);
  }
}

function displayAvailableUpgrades(products) {
  const upgradesList = $("#upgradesList");
  if (!upgradesList) return;

  const installedKits = Array.from($$(".kit-info h4")).map((el) =>
    el.textContent.trim()
  );

  upgradesList.innerHTML =
    products && products.length
      ? products
          .map((product) => {
            const isInstalled = installedKits.includes(product.name);
            return `
          <div class="upgrade-item ${isInstalled ? "installed" : ""}">
            <input type="checkbox" class="upgrade-checkbox" value="${
              product._id
            }" 
              ${isInstalled ? "checked disabled" : ""}>
            <div class="upgrade-info">
              <span class="upgrade-name">${product.name}</span>
              ${
                isInstalled
                  ? '<span class="upgrade-status">(Already Installed)</span>'
                  : product.description
                  ? `<p class="upgrade-description">${product.description}</p>`
                  : ""
              }
            </div>
          </div>
        `;
          })
          .join("")
      : "<p>No upgrades available.</p>";
}

async function purchaseUpgrades() {
  const selectedUpgrades = Array.from(
    $$(".upgrade-checkbox:checked:not(:disabled)")
  ).map((cb) => cb.value);

  if (!selectedUpgrades.length) {
    showNotification("Please select at least one upgrade", "error");
    return;
  }
  const confirmation = await askToConfirm(
    "Are you sure you want to purchase these upgrades?",
    "Purchase Upgrade",
    "Purchase"
  );
  if (confirmation) {
    try {
      const response = await fetch("/keeper/addHiveUpgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hive: selectedHiveId,
          productIds: selectedUpgrades,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.success) {
        showNotification("Upgrades purchased successfully", "success");
        closeModal("upgradeModal");
        fetchHiveData(selectedHiveId);
      } else {
        throw new Error(result.message || "Error purchasing upgrades");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(`Error processing purchase: ${error.message}`, "error");
    }
  }
}

async function requestKitRemoval(kitId) {
  const kitNames = {
    rimba: "The Mele-RIMBA Kit",
    monitoring: "Internal Hive Monitoring Kit",
    thermohygro: "ThermoHygro-Regulators Kit",
    scanner: "Yield Scanner Kit",
    intrusion: "On Door Intrusion Prevention Kit",
  };

  const confirmation = await askToConfirm(
    `Are you sure you want to request removal of ${kitNames[kitId]}?`,
    `${kitNames[kitId]}`,
    "Remove"
  );
  if (confirmation) {
    showNotification(
      `Removal request for ${kitNames[kitId]} has been sent to the administrator.`,
      "success"
    );

    const response = await fetch("/keeper/removeUpgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hiveRef: selectedHiveId, productRef: kitId }),
    });

    if (!response.ok) {
      showNotification("Failed to send removal request", "error");
      return;
    }
    const result = await response.json();
    if (result.success.status) {
      showNotification(result.message, "success");
      fetchHiveData(selectedHiveId);
    } else {
      showNotification(result.message, "error");
    }
  }
}

/******************************
 *  NOTIFICATION & CONFIRMATION *
 ******************************/
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

function askToConfirm(
  message,
  title = "Confirmation",
  confirmText = "Confirm"
) {
  const confirmation = document.createElement("div");
  confirmation.className = `confirmation`;
  confirmation.innerHTML = `
      <h1>${title}</h1>
        <p>${message}</p>
       <span>
        <button type="button" id="confirm" class="upgrade-btn">${
          confirmText || "Confirm"
        }</button>
        <button type="button" id="cancel" class="logout-btn">Cancel</button>
       </span>
  `;
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
      confirmation.remove();
      resolve(false);
    });
  });
}

/******************************
 *  EVENT LISTENERS & INIT    *
 ******************************/
function setupEventListeners() {
  const apiaryDropdown = $("#apiaryDropdown");
  const dropdownContent = $(".dropdown-content");

  if (apiaryDropdown && dropdownContent) {
    apiaryDropdown.addEventListener("click", function (e) {
      e.preventDefault();
      const isActive = dropdownContent.classList.toggle("active");
      dropdownContent.style.display = isActive ? "block" : "none";

      const icon = this.querySelector(".fa-chevron-down");
      if (icon)
        icon.style.transform = isActive ? "rotate(180deg)" : "rotate(0deg)";
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".nested-trigger")) {
      e.preventDefault();
      e.stopPropagation();

      const trigger = e.target.closest(".nested-trigger");
      const content = trigger.nextElementSibling;
      const isHiveTrigger = trigger.closest(".hive-item");

      // Get hive ID if it's a hive trigger
      const hiveId = isHiveTrigger ? trigger.dataset.hiveId : null;

      // Update titles
      const nameSpan = trigger.querySelector("span");
      if (nameSpan) {
        const name = nameSpan.textContent;
        if (isHiveTrigger) {
          const apiaryElement = trigger
            .closest(".nested-dropdown")
            .querySelector(".nested-trigger span");
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
        if (chevron)
          chevron.style.transform = isVisible
            ? "rotate(90deg)"
            : "rotate(0deg)";
      }

      toggleDashboards(isHiveTrigger, hiveId);
    }
  });

  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) closeModal(e.target.id);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();

  // Initialize chart instances as global variables
  let weightChart = null;
  let vibrationChart = null;
  let hiveWeightChart = null;

  // Function to safely create/update charts
  function initializeCharts() {
    console.log("Initializing charts...");

    // Destroy existing charts if they exist
    if (weightChart) {
      console.log("Destroying existing weight chart");
      weightChart.destroy();
    }

    // Create new chart instances
    console.log("Creating new weight chart");
    weightChart = Charts.createFrameWeightChart("weightChart");
    console.log("Weight chart initialized:", weightChart);

    // Initialize other charts...
    vibrationChart = Charts.createVibrationChart("vibrationChart");
    hiveWeightChart = Charts.createWeightChart("hiveWeightChart");
  }

  // Initialize charts
  initializeCharts();

  // Set up periodic chart updates
  setInterval(async function () {
    try {
      const response = await fetch("/api/getHiveData");
      const data = await response.json();

      if (data.success) {
        Charts.updateChart(weightChart, [data.weightData]);
        Charts.updateChart(vibrationChart, [data.vibrationData]);
        Charts.updateChart(hiveWeightChart, [data.hiveWeightData]);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  }, 300000); // Every 5 minutes
});
