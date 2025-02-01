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
  // Initialize charts
  initializeCharts();

  // Handle main dropdown
  const apiaryDropdown = document.getElementById('apiaryDropdown');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  if (apiaryDropdown && dropdownContent) {
      apiaryDropdown.addEventListener('click', function(e) {
          e.preventDefault();
          dropdownContent.classList.toggle('show');
          const icon = this.querySelector('.fa-chevron-down');
          if (icon) {
              icon.style.transform = dropdownContent.classList.contains('show') 
                  ? 'rotate(180deg)' 
                  : 'rotate(0)';
          }
      });
  }

  // Handle nested dropdowns
  document.querySelectorAll('.nested-trigger').forEach(trigger => {
      trigger.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const content = this.nextElementSibling;
          const icon = this.querySelector('.fa-chevron-right');
          
          // Close all other nested dropdowns at the same level
          const siblings = this.parentElement.parentElement.querySelectorAll('.nested-content');
          siblings.forEach(sibling => {
              if (sibling !== content) {
                  sibling.classList.remove('show');
                  const siblingIcon = sibling.previousElementSibling.querySelector('.fa-chevron-right');
                  if (siblingIcon) siblingIcon.style.transform = 'rotate(0)';
              }
          });
          
          content.classList.toggle('show');
          if (icon) {
              icon.style.transform = content.classList.contains('show') 
                  ? 'rotate(90deg)' 
                  : 'rotate(0)';
          }
      });
  });
});

function initializeCharts() {
  // Payment Chart
  const paymentCtx = document.getElementById("paymentChart");
  if (paymentCtx) {
    new Chart(paymentCtx.getContext("2d"), {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Revenue",
            data: [3000, 4500, 3500, 5000, 4800, 5500],
            borderColor: "#fca311",
            tension: 0.4,
            fill: false,
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
        },
        scales: {
          y: {
            beginAtZero: true,
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
