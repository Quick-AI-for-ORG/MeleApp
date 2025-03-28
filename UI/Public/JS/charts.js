// Chart configuration and utilities
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: "easeInOutQuart",
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
  },
};

// Empty state message plugin
const emptyStatePlugin = {
  id: "emptyState",
  afterDraw: (chart) => {
    const { ctx, width, height, data } = chart;
    const hasData = data.datasets.some((dataset) => dataset.data.length > 0);

    if (!hasData) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#666";
      ctx.fillText("No data available", width / 2, height / 2);
      ctx.restore();
    }
  },
};

// Chart creation functions
function createWeightChart(canvasId, data = null) {
  const ctx = document.getElementById(canvasId)?.getContext("2d");
  if (!ctx) return null;

  const defaultData = {
    labels: ["6h ago", "5h ago", "4h ago", "3h ago", "2h ago", "1h ago", "Now"],
    datasets: [
      {
        label: "Weight (kg)",
        data: data?.weights || [],
        borderColor: "#fca311",
        backgroundColor: "rgba(252, 163, 17, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return new Chart(ctx, {
    type: "line",
    data: defaultData,
    options: {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: "Hive Weight Trend",
        },
      },
    },
    plugins: [emptyStatePlugin],
  });
}

function createVibrationChart(canvasId, data = null) {
  const ctx = document.getElementById(canvasId)?.getContext("2d");
  if (!ctx) return null;

  const defaultData = {
    labels: ["6h ago", "5h ago", "4h ago", "3h ago", "2h ago", "1h ago", "Now"],
    datasets: [
      {
        label: "Vibration Level",
        data: data?.vibrations || [],
        borderColor: "#16404d",
        backgroundColor: "rgba(22, 64, 77, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return new Chart(ctx, {
    type: "line",
    data: defaultData,
    options: {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: "Hive Vibration Activity",
        },
      },
    },
    plugins: [emptyStatePlugin],
  });
}

function createAdminOverviewChart(canvasId, data = null) {
  const ctx = document.getElementById(canvasId)?.getContext("2d");
  if (!ctx) return null;

  const defaultData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Active Hives",
        data: data?.hives || Array(12).fill(0),
        borderColor: "#fca311",
        backgroundColor: "rgba(252, 163, 17, 0.1)",
        fill: true,
      },
      {
        label: "Active Users",
        data: data?.users || Array(12).fill(0),
        borderColor: "#16404d",
        backgroundColor: "rgba(22, 64, 77, 0.1)",
        fill: true,
      },
    ],
  };

  return new Chart(ctx, {
    type: "line",
    data: defaultData,
    options: {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: "System Overview",
        },
      },
    },
    plugins: [emptyStatePlugin],
  });
}

// Update functions
function updateChart(chart, newData) {
  if (!chart) return;

  chart.data.datasets.forEach((dataset, index) => {
    dataset.data = newData[index] || [];
  });

  chart.update();
}

// Export functions
window.Charts = {
  createWeightChart,
  createVibrationChart,
  createAdminOverviewChart,
  updateChart,
};
