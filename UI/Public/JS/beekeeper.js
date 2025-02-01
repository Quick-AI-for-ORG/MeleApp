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
  document
    .getElementById("apiaryDropdown")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const content = document.querySelector(".dropdown-content");
      content.style.display =
        content.style.display === "block" ? "none" : "block";

      // Rotate icon
      const icon = this.querySelector(".fa-chevron-down");
      icon.style.transform =
        content.style.display === "block" ? "rotate(180deg)" : "rotate(0deg)";
    });

  // Nested dropdowns functionality
  const nestedTriggers = document.querySelectorAll(".nested-trigger");
  nestedTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const content = this.nextElementSibling;
      content.style.display =
        content.style.display === "block" ? "none" : "block";

      // Rotate chevron
      const chevron = this.querySelector(".fa-chevron-right");
      if (chevron) {
        chevron.style.transform =
          content.style.display === "block" ? "rotate(90deg)" : "rotate(0deg)";
      }
    });
  });

  // Initialize charts
  initializeCharts();
});

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
