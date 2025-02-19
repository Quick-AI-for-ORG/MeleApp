// Sample data for charts
const monthlyData = {
  labels: [
    "JAN/23",
    "FEB/23",
    "MAR/23",
    "APR/23",
    "MAY/23",
    "JUN/23",
    "JUL/23",
    "AUG/23",
    "SEP/23",
    "OCT/23",
    "NOV/23",
    "DEC/23",
  ],
  datasets: [
    {
      label: "Payment Record",
      data: [20, 35, 25, 45, 15, 35, 45, 20, 35, 25, 30, 20],
      borderColor: "#3b82f6",
      tension: 0.4,
      fill: false,
      pointRadius: 0,
    },
  ],
};

document.addEventListener("DOMContentLoaded", function () {
  // Main dropdown functionality
  const apiaryDropdown = document.getElementById("apiaryDropdown");
  const dropdownContent = document.querySelector(".dropdown-content");

  if (apiaryDropdown && dropdownContent) {
    apiaryDropdown.addEventListener("click", function (e) {
      e.preventDefault();
      dropdownContent.style.display =
        dropdownContent.style.display === "block" ? "none" : "block";

      // Toggle active class for styling
      dropdownContent.classList.toggle("active");

      // Rotate icon
      const icon = this.querySelector(".fa-chevron-down");
      if (icon) {
        icon.style.transform = dropdownContent.classList.contains("active")
          ? "rotate(180deg)"
          : "rotate(0deg)";
      }
    });
  }

  // Handle nested dropdowns
  document
    .querySelectorAll(".nested-dropdown > .nested-trigger")
    .forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Update title
        const apiaryName = this.querySelector("span").textContent;
        updateTitles(apiaryName);

        // Toggle nested content
        const content = this.nextElementSibling;
        if (content) {
          content.style.display =
            content.style.display === "block" ? "none" : "block";
          content.classList.toggle("show");

          // Rotate chevron
          const chevron = this.querySelector(".fa-chevron-right");
          if (chevron) {
            chevron.style.transform = content.classList.contains("show")
              ? "rotate(90deg)"
              : "rotate(0deg)";
          }
        }
        toggleDashboards(false);
      });
    });

  // Handle hive triggers
  document
    .querySelectorAll(".hive-item > .nested-trigger")
    .forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const hiveName = this.querySelector("span").textContent;
        const apiaryElement = this.closest(".nested-dropdown").querySelector(
          ".nested-trigger span"
        );
        const apiaryName = apiaryElement ? apiaryElement.textContent : "";

        updateTitles(apiaryName, hiveName);

        const content = this.nextElementSibling;
        if (content) {
          content.style.display =
            content.style.display === "block" ? "none" : "block";
          content.classList.toggle("show");

          const chevron = this.querySelector(".fa-chevron-right");
          if (chevron) {
            chevron.style.transform = content.classList.contains("show")
              ? "rotate(90deg)"
              : "rotate(0deg)";
          }
        }
        toggleDashboards(true);
      });
    });

  // Initialize charts
  initializeCharts();

  // Close modal when clicking outside
  const modal = document.getElementById("beekeeperModal");
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  // Close modal when clicking the X button
  const closeButton = document.querySelector(".close-modal");
  if (closeButton) {
    closeButton.addEventListener("click", function (event) {
      event.preventDefault();
      closeModal();
    });
  }

  // Close modal when clicking Cancel button
  const cancelButton = document.querySelector(".cancel-btn");
  if (cancelButton) {
    cancelButton.addEventListener("click", function (event) {
      event.preventDefault();
      closeModal();
    });
  }
});

function updateTitles(apiaryName, hiveName = "") {
  const apiaryTitle = document.getElementById("currentApiaryTitle");
  const hiveTitle = document.getElementById("currentHiveTitle");

  if (apiaryTitle) {
    apiaryTitle.textContent = apiaryName;
  }

  if (hiveTitle) {
    if (hiveName) {
      hiveTitle.textContent = hiveName;
      hiveTitle.classList.add("active");
    } else {
      hiveTitle.textContent = "";
      hiveTitle.classList.remove("active");
    }
  }
}

function initializeCharts() {
  // Weight Chart
  const weightCtx = document.getElementById("weightChart");
  if (weightCtx) {
    new Chart(weightCtx.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Hive Weight (kg)",
            data: [32.5, 33.1, 34.2, 33.8, 35.2, 34.9, 35.2],
            backgroundColor: "#fca311",
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          annotation: {
            annotations: {
              weightStats: {
                type: "label",
                xValue: 3,
                yValue: 36,
                backgroundColor: "rgba(255,255,255,0.8)",
                content: ["Current Weight: 35.2 kg", "Weekly Average: 33.8 kg"],
                font: {
                  size: 12,
                },
                padding: 8,
                borderRadius: 6,
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 30,
            max: 38,
            grid: {
              display: false,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  // Initialize other charts
  initializeTasksChart();
  initializeProjectsChart();
}

// Function to initialize Tasks Completed chart
function initializeTasksChart() {
  const tasksData = {
    labels: monthlyData.labels,
    datasets: [
      {
        data: [25, 30, 35, 25, 30, 35, 40, 35, 40, 35, 40, 35],
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const tasksCtx = document.getElementById("tasksChart").getContext("2d");
  new Chart(tasksCtx, {
    type: "line",
    data: tasksData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          display: false,
        },
        x: {
          display: false,
        },
      },
    },
  });
}

// Function to initialize Projects chart
function initializeProjectsChart() {
  const projectsData = {
    labels: monthlyData.labels,
    datasets: [
      {
        data: [20, 25, 30, 25, 30, 35, 30, 35, 40, 35, 40, 35],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const projectsCtx = document.getElementById("projectsChart").getContext("2d");
  new Chart(projectsCtx, {
    type: "line",
    data: projectsData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          display: false,
        },
        x: {
          display: false,
        },
      },
    },
  });
}

function toggleDashboards(showHive = false) {
  const apiaryDashboard = document.querySelector(".apiary-dashboard");
  const hiveDashboard = document.querySelector(".hive-dashboard");

  if (showHive) {
    apiaryDashboard.style.display = "none";
    hiveDashboard.style.display = "block";
    initializeHiveCharts();
  } else {
    apiaryDashboard.style.display = "block";
    hiveDashboard.style.display = "none";
    initializeCharts();
  }
}

function initializeHiveCharts() {
  // Weight Chart
  const weightCtx = document.getElementById("hiveWeightChart");
  if (weightCtx) {
    new Chart(weightCtx.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Weight (kg)",
            data: [32.5, 33.1, 34.2, 33.8, 35.2, 34.9, 35.2],
            backgroundColor: "#fca311",
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 30,
            max: 38,
            grid: { display: false },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  // Vibration Chart
  const vibrationCtx = document.getElementById("vibrationChart");
  if (vibrationCtx) {
    new Chart(vibrationCtx.getContext("2d"), {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Vibration Level",
            data: [2.1, 1.8, 2.3, 1.9, 2.4, 2.0, 1.7],
            borderColor: "#4F46E5",
            tension: 0.4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: false },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }
}

// Beekeeper Management
const defaultBeekeepers = [
  {
    id: "1",
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@example.com",
    phone: "+201234567890",
    role: "Senior Beekeeper",
    hives: 12,
    experience: 8,
    isActive: true,
  },
  {
    id: "2",
    firstName: "Sara",
    lastName: "Mohamed",
    email: "sara.mohamed@example.com",
    phone: "+201234567891",
    role: "Apiary Manager",
    hives: 15,
    experience: 5,
    isActive: false,
  },
];

// Initialize data storage
let beekeepers =
  JSON.parse(localStorage.getItem("beekeepers")) || defaultBeekeepers;

// Initialize beekeepers display on page load
document.addEventListener("DOMContentLoaded", () => {
  refreshBeekeepersList();
  updateBeekeepersCount();
});

function refreshBeekeepersList() {
  const container = document.querySelector(".beekeepers-grid");
  container.innerHTML = "";
  beekeepers.forEach((beekeeper) => {
    container.insertAdjacentHTML("beforeend", createBeekeeperCard(beekeeper));
  });
}

function createBeekeeperCard(beekeeper) {
  return `
        <div class="beekeeper-card" data-id="${beekeeper.id}">
            <div class="beekeeper-avatar">
                <i class="fas fa-user-circle"></i>
                <div class="status-badge ${
                  beekeeper.isActive ? "active" : ""
                }"></div>
            </div>
            <div class="beekeeper-info">
                <h3>${beekeeper.firstName} ${beekeeper.lastName}</h3>
                <p class="role">${beekeeper.role || "New Beekeeper"}</p>
                <div class="stats">
                    <div class="stat-item">
                        <i class="fas fa-box-open"></i>
                        <span>${beekeeper.hives || 0} Hives</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-clock"></i>
                        <span>${beekeeper.experience || 0} Years</span>
                    </div>
                </div>
            </div>
            <button class="contact-btn" onclick="window.location.href='mailto:${
              beekeeper.email
            }'">
                <i class="fas fa-envelope"></i>
            </button>
            <div class="beekeeper-actions">
                <button class="action-btn edit" onclick="openModal('edit', '${
                  beekeeper.id
                }')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="confirmDelete('${
                  beekeeper.id
                }')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function openModal(mode, beekeeperId = null) {
  const modal = document.getElementById("beekeeperModal");
  const form = document.getElementById("beekeeperForm");
  const modalTitle = document.getElementById("modalTitle");
  const passwordGroup = document.querySelector(".password-group");

  modalTitle.textContent =
    mode === "add" ? "Add New Beekeeper" : "Edit Beekeeper";
  passwordGroup.style.display = mode === "add" ? "block" : "none";

  if (mode === "edit" && beekeeperId) {
    const beekeeper = beekeepers.find((b) => b.id === beekeeperId);
    if (beekeeper) {
      // Populate form with existing data
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

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  if (!validateForm(data)) return;

  const isEdit = form.dataset.mode === "edit";

  if (isEdit) {
    const beekeeperId = form.dataset.id;
    // Find the beekeeper to maintain existing data
    const existingBeekeeper = beekeepers.find((b) => b.id === beekeeperId);
    if (existingBeekeeper) {
      // Update only the form fields while preserving other data
      const updatedBeekeeper = {
        ...existingBeekeeper,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      };

      // Update in array
      const index = beekeepers.findIndex((b) => b.id === beekeeperId);
      beekeepers[index] = updatedBeekeeper;

      // Save to localStorage
      localStorage.setItem("beekeepers", JSON.stringify(beekeepers));

      // Refresh the display
      refreshBeekeepersList();
    }
  } else {
    // Add new beekeeper
    const newId = Date.now().toString();
    const newBeekeeper = {
      id: newId,
      ...data,
      role: "New Beekeeper",
      hives: 0,
      experience: 0,
      isActive: true,
    };
    beekeepers.unshift(newBeekeeper);
    localStorage.setItem("beekeepers", JSON.stringify(beekeepers));
    refreshBeekeepersList();
    updateBeekeepersCount();
  }

  closeModal();
}

function validateForm(data) {
  if (
    !/^[a-zA-Z\s]{2,}$/.test(data.firstName) ||
    !/^[a-zA-Z\s]{2,}$/.test(data.lastName)
  ) {
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

function confirmDelete(beekeeperId) {
  if (confirm("Are you sure you want to delete this beekeeper?")) {
    beekeepers = beekeepers.filter((b) => b.id !== beekeeperId);
    localStorage.setItem("beekeepers", JSON.stringify(beekeepers));
    refreshBeekeepersList();
    updateBeekeepersCount();
  }
}

function updateBeekeepersCount() {
  const countElement = document.querySelector(
    ".weather-card.total-beekeepers .weather-value .value"
  );
  if (countElement) {
    countElement.textContent = beekeepers.length;
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("beekeeperModal");
  if (event.target === modal) {
    closeModal();
  }
  if (event.target.classList.contains("modal")) {
    if (event.target.id === "upgradeModal") {
      closeUpgradeModal();
    } else if (event.target.id === "beekeeperModal") {
      closeModal();
    }
  }
};

function closeModal() {
  const modal = document.getElementById("beekeeperModal");
  if (modal) {
    modal.style.display = "none";
    // Reset form
    const form = document.getElementById("beekeeperForm");
    if (form) {
      form.reset();
      delete form.dataset.mode;
      delete form.dataset.id;
    }
  }
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleButton = document.querySelector(".toggle-password i");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleButton.classList.remove("fa-eye");
    toggleButton.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleButton.classList.remove("fa-eye-slash");
    toggleButton.classList.add("fa-eye");
  }
}

function requestKitRemoval(kitId) {
  const kitNames = {
    rimba: "The Mele-RIMBA Kit",
    monitoring: "Internal Hive Monitoring Kit",
    thermohygro: "ThermoHygro-Regulators Kit",
    scanner: "Yield Scanner Kit",
    intrusion: "On Door Intrusion Prevention Kit",
  };

  if (
    confirm(`Are you sure you want to request removal of ${kitNames[kitId]}?`)
  ) {
    // Here you would normally send a request to the server
    // For now, just show a notification
    alert(
      `Removal request for ${kitNames[kitId]} has been sent to the administrator.`
    );
  }
}

function openUpgradeModal() {
  const modal = document.getElementById("upgradeModal");
  modal.style.display = "block";
  fetchAvailableUpgrades();
}

function closeUpgradeModal() {
  const modal = document.getElementById("upgradeModal");
  modal.style.display = "none";
}

async function fetchAvailableUpgrades() {
  try {
    // Update endpoint to use the existing getProducts controller
    const response = await fetch("/keeper/getProducts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Fetched products:", result);

    if (result.data) {
      displayAvailableUpgrades(result.data);
    } else {
      throw new Error("No products data received");
    }
  } catch (error) {
    console.error("Error fetching upgrades:", error);
    showNotification(`Error fetching upgrades: ${error.message}`, "error");
  }
}

function displayAvailableUpgrades(products) {
  const upgradesList = document.getElementById("upgradesList");
  const installedKits = Array.from(
    document.querySelectorAll(".kit-info h4")
  ).map((el) => el.textContent.trim());

  if (!products || products.length === 0) {
    upgradesList.innerHTML = "<p>No upgrades available.</p>";
    return;
  }

  upgradesList.innerHTML = products
    .map((product) => {
      const isInstalled = installedKits.includes(product.name);
      return `
          <div class="upgrade-item ${isInstalled ? "installed" : ""}">
              <input type="checkbox" 
                  class="upgrade-checkbox" 
                  value="${product._id}"
                  ${isInstalled ? "checked disabled" : ""}
              >
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
    .join("");
}

async function purchaseUpgrades() {
  const selectedUpgrades = Array.from(
    document.querySelectorAll(".upgrade-checkbox:checked:not(:disabled)")
  ).map((cb) => cb.value);

  if (selectedUpgrades.length === 0) {
    showNotification("Please select at least one upgrade", "error");
    return;
  }

  if (confirm("Are you sure you want to purchase these upgrades?")) {
    try {
      const response = await fetch("/api/purchaseProducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds: selectedUpgrades }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        showNotification("Upgrades purchased successfully", "success");
        closeUpgradeModal();
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

function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
