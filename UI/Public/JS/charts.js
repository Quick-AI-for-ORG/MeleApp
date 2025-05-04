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

  // Process vibration readings if available
  const processedData = processVibrationData(data);
  
  const chartData = {
    labels: processedData.labels,
    datasets: [
      {
        label: "Vibration Level",
        data: processedData.values,
        borderColor: "#16404d",
        backgroundColor: "rgba(22, 64, 77, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Anomaly Threshold",
        data: processedData.thresholdLine,
        borderColor: "rgba(255, 99, 132, 1)",
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      }
    ],
  };

  return new Chart(ctx, {
    type: "line",
    data: chartData,
    options: {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          display: true,
          text: "Anomaly Detection (Vibration)",
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const datasetIndex = context.datasetIndex;
              if (datasetIndex === 0) {
                // For vibration values
                const isAnomaly = value > processedData.threshold;
                return isAnomaly 
                  ? `Vibration: ${value} (ANOMALY DETECTED)`
                  : `Vibration: ${value}`;
              }
              return `Threshold: ${value}`;
            }
          }
        }
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
        backgroundColor: "rgba(207, 131, 9, 0.9)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return new Chart(ctx, {
    type: "bar",
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

function createFrameComparisonChart(canvasId, data = null) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const existingChart = Chart.getChart(canvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const processedData = processFrameComparisonData(data);

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: processedData.labels,
      datasets: [
        {
          label: "Frame 1",
          data: [processedData.frame1Average],
          backgroundColor: "rgba(252, 163, 17, 0.8)",
          barPercentage: 0.4,
        },
        {
          label: "Frame 2",
          data: [processedData.frame2Average],
          backgroundColor: "rgba(22, 64, 77, 0.8)",
          barPercentage: 0.4,
        },
      ],
    },
    options: {
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: true,
          min: processedData.minWeight,
          max: processedData.maxWeight,
          title: {
            display: true,
            text: "Weight (kg)",
          },
        },
        x: {
          title: {
            display: true,
            text: `Latest Reading: ${processedData.timestamp}`,
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

function processFrameComparisonData(readings) {
  if (!Array.isArray(readings)) {
    return {
      labels: ["Current"],
      frame1Average: 0,
      frame2Average: 0,
      minWeight: 0,
      maxWeight: 1,
      timestamp: "--:--:--",
    };
  }

  const frame1Readings = readings.filter(
    (r) => r.sensorType === "Weight" && r.frameNum === 1
  );
  const frame2Readings = readings.filter(
    (r) => r.sensorType === "Weight" && r.frameNum === 2
  );

  const frame1Values = frame1Readings.map((r) => Number(r.sensorValue));
  const frame2Values = frame2Readings.map((r) => Number(r.sensorValue));

  const frame1Average = frame1Values.length
    ? frame1Values.reduce((a, b) => a + b, 0) / frame1Values.length
    : 0;
  const frame2Average = frame2Values.length
    ? frame2Values.reduce((a, b) => a + b, 0) / frame2Values.length
    : 0;

  const allValues = [...frame1Values, ...frame2Values];
  const minWeight = Math.min(...allValues, 0);
  const maxWeight = Math.max(...allValues, 1);

  const timestamp = frame1Readings.length
    ? new Date(frame1Readings[0].createdAt).toLocaleTimeString()
    : "--:--:--";

  return {
    labels: ["Current"],
    frame1Average,
    frame2Average,
    minWeight,
    maxWeight,
    timestamp,
  };
}

function processVibrationData(readings) {
  console.log("Processing vibration data:", readings);
  
  if (!Array.isArray(readings)) {
    return {
      labels: ["6h ago", "5h ago", "4h ago", "3h ago", "2h ago", "1h ago", "Now"],
      values: [],
      threshold: 70,
      thresholdLine: [70, 70, 70, 70, 70, 70, 70],
    };
  }
  
  // Filter and process vibration readings
  const vibrationReadings = readings
    .filter(r => r.sensorType === "Vibration")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-7);
    
  // Calculate labels and values
  const labels = vibrationReadings.map(r => 
    new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  
  const values = vibrationReadings.map(r => Number(r.sensorValue));
  
  // Calculate threshold as 1.5x the average
  const avg = values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 50;
  const threshold = Math.max(70, avg * 1.5); // At least 70 or 1.5x average
  
  // Create threshold line
  const thresholdLine = new Array(labels.length).fill(threshold);
  
  return {
    labels: labels.length ? labels : ["6h ago", "5h ago", "4h ago", "3h ago", "2h ago", "1h ago", "Now"],
    values: values,
    threshold: threshold,
    thresholdLine: thresholdLine,
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
  } else if (chart.canvas.id === "frameComparisonChart") {
    const processedData = processFrameComparisonData(newData[0]);
    chart.data.datasets[0].data = [processedData.frame1Average];
    chart.data.datasets[1].data = [processedData.frame2Average];
    chart.options.scales.y.min = processedData.minWeight;
    chart.options.scales.y.max = processedData.maxWeight;
    chart.options.scales.x.title.text = `Latest Reading: ${processedData.timestamp}`;
  } else if (chart.canvas.id === "vibrationChart") {
    // Handle vibration chart update
    const processedData = processVibrationData(newData[0]);
    chart.data.labels = processedData.labels;
    chart.data.datasets[0].data = processedData.values;
    chart.data.datasets[1].data = processedData.thresholdLine;
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
  createFrameWeightChart,
  createFrameComparisonChart,
  updateChart,
};
