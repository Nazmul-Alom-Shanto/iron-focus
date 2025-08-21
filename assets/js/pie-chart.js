
let listForPieChart;
let currentPath = ['Pie Chart'];
const previousBtn = document.getElementById("backBtn");

async function initChart() {
  const log = await readLogs();
  listForPieChart = logsToPieChartList(log);

  const tagTree = buildTagTree(listForPieChart);
// navigator.clipboard.writeText(JSON.stringify(tagTree, null, 2));

  document.getElementById("backBtn").addEventListener("click", () => {
  if (currentPath.length > 1) {
    currentPath.pop();
    updateTitle();
    renderChart();
  }
});

function renderChart() {
 const summaryContainer = document.querySelector('.tag-summary-container');
 summaryContainer.innerHTML = '';
  const { node, total } = getCurrentNodeMeta(currentPath, tagTree);
  console.log(`currentPath is ${currentPath}`);
  console.log(`total value at the top of renderChart ${total}`);
  const labels = [];
  const data = []; 
 const backgroundColor = [
  // Original 6
  "#4BC0C0", // Teal
  "#FF6384", // Pinkish red
  "#FFCD56", // Soft yellow
  "#36A2EB", // Sky blue
  "#9966FF", // Purple
  "#FF9F40", // Orange

  // 9 additional colors
  "#8BC34A", // Light green
  "#E91E63", // Deep pink
  "#00ACC1", // Cyan blue
  "#F44336", // Bright red
  "#FFEB3B", // Lemon yellow
  "#3F51B5", // Indigo
  "#795548", // Brown
  "#009688", // Teal green
  "#C2185B"  // Raspberry pink
];


  let sumOfChildren = 0;

  for (const [tag, val] of Object.entries(node)) {
    if (val.total > 0) {
      labels.push(tag);
      data.push(val.total);
      sumOfChildren += val.total;
    }
  }

  const otherAmount = total - sumOfChildren;

  if (otherAmount > 0) {
    labels.push("others");
    data.push(otherAmount);
  }

  if (window.pieChart) {
    window.pieChart.destroy();
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

  const labelPlugin = {
  id: 'tagLabels',
  afterDraw(chart) {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((arc, index) => {
      const { x, y } = arc.tooltipPosition();
      const value = data.datasets[0].data[index];
      const label = data.labels[index];

      const percent = ((value / total) * 100).toFixed(1);
      const formatted = formatHours(value);
      const lines = [
        `${label}`,
        `${formatted}`, `(${percent}%)`
      ];

      // Draw background box
      const padding = 6;
      const lineHeight = 16;
      const width = 80;
      const height = lines.length * lineHeight + padding * 2;

      const boxX = x - 50;
      const boxY = y - height / 2;

      // Box with rounded corners
      drawRoundedRect(ctx, boxX, boxY, width, height, 6);
      ctx.fillStyle = "#3339";
      ctx.fill();

      // Pointer arrow (triangle)
      ctx.beginPath();
      ctx.moveTo(x - 60, y);
      ctx.lineTo(boxX, y - 6);
      ctx.lineTo(boxX, y + 6);
      ctx.closePath();
      ctx.fillStyle = "#3339";
      ctx.fill();

      // Draw text
      ctx.fillStyle = "#fff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";

      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + padding, boxY + padding + lineHeight * (i + 0.8));
      });
    });
  }
};
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const {ctx, chartArea: {width, height, left, top}} = chart;
    ctx.save();

    const text = 'Your Text Here'; // e.g. total or label
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = left + width / 2;
    const centerY = top + height / 2;
    ctx.fillText(text, centerX, centerY);

    ctx.restore();
  }
};


  const ctx = document.getElementById("tagChart").getContext("2d");
  window.pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 0
      }]
    }, 
    plugins: [],
    options: {
     onClick: function (evt, elements) {
  // const tagInfoDiv = document.getElementById("tagDetails");

  if (elements.length > 0) {
    const i = elements[0].index;
    const clicked = labels[i];

    if (clicked !== "others" && node[clicked]) {
      const fullPath = [...currentPath, clicked];
      const time = node[clicked].total;
      const percent = ((time / total) * 100).toFixed(1);

      // tagInfoDiv.innerHTML = `
      //   <strong>Tag:</strong> ${fullPath.join(" > ")}<br>
      //   <strong>Total Time:</strong> ${time} h<br>
      //   <strong>Share of Parent:</strong> ${percent}%
      // `;
      // tagInfoDiv.style.display = "block";

      if (hasVisibleChildren(node[clicked].children)) {
        currentPath.push(clicked);
        updateTitle();
        renderChart();
      }
    } else {
      // tagInfoDiv.style.display = "none";
    }
  } else {
    // Clicked center — go up
    if (currentPath.length > 1) {
      currentPath.pop();
      updateTitle();
      renderChart();
    }
    // tagInfoDiv.style.display = "none";
  }
}
,
      plugins: {
        tooltip: {
           enabled: true  ,
      callbacks: {
        label: function(context) {
          const tag = context.label;
          const value = context.raw; // duration in hours 
          const percent = ((value / total) * 100).toFixed(1);
          const formatted = formatHours(value); // e.g., 2.5h → 2h 30m
          return [
            `${tag}`,
            `${formatted}`,
            `(${percent}%)`
          ];
        },
        title: function() {
          // Return empty array to remove title (optional)
          return [];
        }
      }
    },
        legend: { position: "bottom" }
      },
      cutout: "60%"
    }
  });
  const meta = pieChart.getDatasetMeta(0);
const firstArc = meta.data[0]; // A Chart.ArcElement

const centerX = firstArc.x;
const centerY = firstArc.y;
previousBtn.style.left = `${centerX}px`;
previousBtn.style.top = `${centerY}px`;

  labels.forEach((label, i) => {
    const value = data[i];
    const percent = total === 0 ? 100 : ((value / total) * 100).toFixed(1);
  console.log(`total value progress show ${total}`);
    const formatted = formatHours(value);

    const item = document.createElement('div');
    item.classList.add('tag-summary-item');
    item.style.borderLeftColor = backgroundColor[i % backgroundColor.length];

    item.innerHTML = `
      <span class="color-dot" style="background:${backgroundColor[i % backgroundColor.length]}"></span>
      <div class="tag-label">${label}</div>
      <div class="time">${formatted}</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percent}%; background: ${backgroundColor[i % backgroundColor.length]}"></div>
      </div>
      <div class="percent-label" style"width : '50px'">${percent}%</div>
    `;

    summaryContainer.appendChild(item);
  });

}

renderChart();
};

initChart();

function logsToPieChartList(data){
    const res = [];
    for(const log of data){
        const pie = {};
        pie.tags = Array.isArray(log.tags) ? log.tags : [];
        const duration = ((parseFloat(log?.givenTime) || 0) + (parseFloat(log?.extraAlocatedTime) || 0))/ 60;
        pie.duration = duration;
        if(pie.tags.length === 0) pie.tags = ["others"];
        res.push(pie);
    }
    return res;
}


function buildTagTree(listForPieChart) {
  const tree = { total: 0, children: {} };

  for (const task of listForPieChart) {
    tree.total += task.duration; // Add to global total
    let current = tree.children;

    for (const tag of task.tags) {
      if (!current[tag]) current[tag] = { total: 0, children: {} };
      current[tag].total += task.duration;
      current = current[tag].children;
    }
  }

  return {'Pie Chart' : tree};
}


// Step 2: Go to current path in tree
function getNodeFromPath(path, tree) {
  let node = tree;
  for (const tag of path) {
    node = node[tag]?.children || {};
  }
  return node;
}

// Step 3: Get current node's data and parent’s total
function getCurrentNodeMeta(path, tree) {
  let node = tree;
  let parent = null;

  for (const tag of path) {
    parent = node;
    node = node[tag]?.children || {};
  }

  const parentTag = path[path.length - 1];
  const total = parent?.[parentTag]?.total || 0;

  return { node, total };
}

// Step 4: Render chart

// Step 5: Check if children have values
function hasVisibleChildren(children) {
  return Object.values(children).some(c => c.total > 0);
}

// Step 6: Update header label
function updateTitle() {
  const title = currentPath.length > 1 ? currentPath.slice(1,).join(" → ") : "Total Time";
  document.getElementById("chartTitle").textContent = title;

  previousBtn.style.display = currentPath.length > 1 ? "block" : "none";
}

function formatHours(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}
