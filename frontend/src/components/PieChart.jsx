import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function PieChart({ stocks }) {
  const theme = getTheme();
  const isDark = theme === "dark";
  const legendColor = isDark ? "#fff" : "#23272b";
  const tooltipBg = isDark ? "#23272b" : "#fff";
  const tooltipText = isDark ? "#fff" : "#23272b";
  const tooltipBorder = isDark ? "#51cf66" : "#198754";
  const bg = isDark ? "#181b20" : "#fff";
  const borderColor = isDark ? "#181b20" : "#fff";

  const COLORS = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
    "#9966FF", "#FF9F40", "#C9CBCF", "#B4FF9F",
    "#FFB4B4", "#B4D4FF", "#FFD6A5", "#FDFFB6"
  ];

  const data = {
    labels: stocks.map(stock => stock.ticker),
    datasets: [
      {
        data: stocks.map(stock => stock.totalValue),
        backgroundColor: stocks.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 2,
        borderColor: borderColor
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: legendColor,
          font: { size: 14, weight: 600 },
          padding: 18,
          boxWidth: 18,
        }
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: $${Number(value).toFixed(2)}`;
          }
        }
      }
    },
    cutout: "65%",
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div
      style={{
        background: bg,
        borderRadius: 16,
        padding: "32px 16px",
        minHeight: 340,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div style={{ width: 320, height: 320 }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

export default PieChart;