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
        const apiaryElement = this.closest('.nested-dropdown').querySelector('.nested-trigger span');
        const apiaryName = apiaryElement ? apiaryElement.textContent : '';
        
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
});

function updateTitles(apiaryName, hiveName = '') {
  const apiaryTitle = document.getElementById('currentApiaryTitle');
  const hiveTitle = document.getElementById('currentHiveTitle');
  
  if (apiaryTitle) {
      apiaryTitle.textContent = apiaryName;
  }
  
  if (hiveTitle) {
      if (hiveName) {
          hiveTitle.textContent = hiveName;
          hiveTitle.classList.add('active');
      } else {
          hiveTitle.textContent = '';
          hiveTitle.classList.remove('active');
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
  const apiaryDashboard = document.querySelector('.apiary-dashboard');
  const hiveDashboard = document.querySelector('.hive-dashboard');
  
  if (showHive) {
      apiaryDashboard.style.display = 'none';
      hiveDashboard.style.display = 'block';
      initializeHiveCharts();
  } else {
      apiaryDashboard.style.display = 'block';
      hiveDashboard.style.display = 'none';
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
              datasets: [{
                  label: "Weight (kg)",
                  data: [32.5, 33.1, 34.2, 33.8, 35.2, 34.9, 35.2],
                  backgroundColor: "#fca311",
                  borderRadius: 5,
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: { display: false }
              },
              scales: {
                  y: {
                      beginAtZero: false,
                      min: 30,
                      max: 38,
                      grid: { display: false }
                  },
                  x: {
                      grid: { display: false }
                  }
              }
          }
      });
  }

  // Vibration Chart
  const vibrationCtx = document.getElementById("vibrationChart");
  if (vibrationCtx) {
      new Chart(vibrationCtx.getContext("2d"), {
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
              plugins: {
                  legend: { display: false }
              },
              scales: {
                  y: {
                      beginAtZero: true,
                      grid: { display: false }
                  },
                  x: {
                      grid: { display: false }
                  }
              }
          }
      });
  }
}

// Beekeeper Management Functions
function openModal(mode, beekeeperId = null) {
    const modal = document.getElementById('beekeeperModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('beekeeperForm');

    modalTitle.textContent = mode === 'add' ? 'Add New Beekeeper' : 'Edit Beekeeper';
    
    if (mode === 'edit' && beekeeperId) {
        // TODO: Fetch beekeeper data and populate form
        // This would be implemented when backend is ready
    } else {
        form.reset();
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('beekeeperModal');
    modal.style.display = 'none';
}

function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // TODO: Send data to backend
    console.log('Form data:', data);
    
    closeModal();
}

function confirmDelete(beekeeperId) {
    if (confirm('Are you sure you want to delete this beekeeper?')) {
        // TODO: Send delete request to backend
        console.log('Deleting beekeeper:', beekeeperId);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('beekeeperModal');
    if (event.target === modal) {
        closeModal();
    }
}
