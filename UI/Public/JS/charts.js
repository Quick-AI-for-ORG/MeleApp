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

// Add new chart options for frame weights
const frameWeightChartOptions = {
  ...chartOptions,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Weight (kg)",
      },
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      title: {
        display: true,
        text: "Frame Number",
      },
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: "Frame Weights Distribution",
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
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = canvas.getContext("2d");
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
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = canvas.getContext("2d");
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

function createFrameWeightChart(canvasId, data = null) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const processedData = processFrameWeightData(data);

  const chartData = {
    labels: processedData.labels,
    datasets: [
      {
        label: "Weight per Frame (kg)",
        data: processedData.values,
        borderColor: "#fca311",
        backgroundColor: "rgba(252, 163, 17, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return new Chart(ctx, {
    type: "bar", // Changed to bar chart for better frame weight visualization
    data: chartData,
    options: {
      ...frameWeightChartOptions,
      scales: {
        ...frameWeightChartOptions.scales,
        y: {
          ...frameWeightChartOptions.scales.y,
          title: {
            display: true,
            text: "Weight (kg)",
          },
        },
      },
    },
    plugins: [emptyStatePlugin],
  });
}

function processFrameWeightData(readings) {
  console.log("Processing frame weight data, raw readings:", readings);

  if (!Array.isArray(readings)) {
    console.log("No readings array provided");
    return { labels: [], values: [] };
  }

  // Filter weight sensor readings (using same logic as Temperature/Humidity)
  const weightReadings = readings.filter((r) => r.sensorType == "Weight");
  console.log("Filtered weight readings:", weightReadings);

  // Sort by timestamp, newest first (like in processSensorReadings)
  weightReadings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Group readings by frame number
  const frameGroups = {};
  weightReadings.forEach((reading) => {
    const frameNum = reading.frameNum || 0;
    if (!frameGroups[frameNum]) {
      frameGroups[frameNum] = [];
    }
    frameGroups[frameNum].push(Number(reading.sensorValue));
  });

  console.log("Grouped by frame:", frameGroups);

  // Calculate averages per frame
  const frames = Object.entries(frameGroups)
    .map(([frameNum, values]) => ({
      frameNum: Number(frameNum),
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
    }))
    .sort((a, b) => a.frameNum - b.frameNum);

  console.log("Processed frames:", frames);

  return {
    labels: frames.map((f) => `Frame ${f.frameNum}`),
    values: frames.map((f) => f.average),
  };
}

// Update functions
function updateChart(chart, newData) {
  if (!chart) return;

  if (chart.config.type === "bar" && chart.canvas.id === "weightChart") {
    console.log("Updating frame weight chart with data:", newData);
    // Process frame weight data
    const processedData = processFrameWeightData(newData[0]);
    chart.data.labels = processedData.labels;
    chart.data.datasets[0].data = processedData.values;
    console.log("Updated chart data:", chart.data);
  } else {
    // Handle other charts as before
    chart.data.datasets.forEach((dataset, index) => {
      dataset.data = newData[index] || [];
    });
  }

  chart.update();
}

// Export functions
window.Charts = {
  createWeightChart,
  createVibrationChart,
  createAdminOverviewChart,
  createFrameWeightChart,
  updateChart,
};
