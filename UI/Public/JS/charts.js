function createChart(ctx, config) {
    if (!ctx) return null;
    return new Chart(ctx.getContext("2d"), config);
  }
  
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
  