import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
)



import React, { useState, useEffect } from 'react'


function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}


function LineGraph({ data }) {
  const [view, setView] = useState('hour');
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const updateTheme = () => setTheme(getTheme());
    window.addEventListener("storage", updateTheme);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
    return () => {
      window.removeEventListener("storage", updateTheme);
      observer.disconnect();
    };
  }, []);

  // Colors for dark/light mode
  const isDark = theme === "dark";
  const textColor = isDark ? '#fff' : '#23272b';
  const gridColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const borderColor = '#36A2EB';
  const bgColor = isDark ? 'rgba(54,162,235,0.12)' : 'rgba(54,162,235,0.2)';


  // Map view to Chart.js time unit and display granularity
  // year: show weeks, month: show days, day: show hours, hour: show minutes
  let timeUnit = 'day';
  let displayFormats = {};
  let tooltipFormat = 'yyyy-MM-dd HH:mm';
  if (view === 'year') {
    timeUnit = 'week';
    displayFormats = { week: 'yyyy-ww' };
    tooltipFormat = 'yyyy-ww';
  } else if (view === 'month') {
    timeUnit = 'day';
    displayFormats = { day: 'yyyy-MM-dd' };
    tooltipFormat = 'yyyy-MM-dd';
  } else if (view === 'day') {
    timeUnit = 'hour';
    displayFormats = { hour: 'HH:mm' };
    tooltipFormat = 'yyyy-MM-dd HH:mm';
  } else if (view === 'hour') {
    timeUnit = 'minute';
    displayFormats = { minute: 'HH:mm' };
    tooltipFormat = 'yyyy-MM-dd HH:mm';
  }

  // Limit data scope for each view
  let filteredData = data;
  if (data.length > 0) {
    const now = new Date();
    let cutoff;
    if (view === 'hour') {
      cutoff = new Date(now);
      cutoff.setHours(now.getHours() - 1, now.getMinutes(), 0, 0); // last 60 minutes
    } else if (view === 'day') {
      cutoff = new Date(now);
      cutoff.setHours(now.getHours() - 23, 0, 0, 0); // last 24 hours
    } else if (view === 'month') {
      cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 29); // last 30 days
    } else if (view === 'year') {
      cutoff = new Date(now);
      cutoff.setMonth(now.getMonth() - 11); // last 12 months
    } else {
      cutoff = null;
    }
    if (cutoff) {
      filteredData = data.filter(point => {
        const d = new Date(point.date);
        return d >= cutoff && d <= now;
      });
    }
  }

  const chartData = {
    labels: filteredData.map(point => point.date),
    datasets: [
      {
        label: 'Total Value',
        data: filteredData.map(point => point.totalValue),
        borderColor: borderColor,
        backgroundColor: bgColor,
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor }
      },
      title: {
        display: true,
        text: 'Portfolio Performance Over Time',
        color: textColor
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#23272b' : '#fff',
        titleColor: isDark ? '#fff' : '#23272b',
        bodyColor: isDark ? '#fff' : '#23272b',
        borderColor: borderColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeUnit,
          tooltipFormat: tooltipFormat,
          displayFormats: displayFormats,
        },
        title: { display: true, text: 'Date', color: textColor },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        title: { display: true, text: 'Value ($)', color: textColor },
        beginAtZero: true,
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  }

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{ gap: 8, display: 'flex' }}>
          {['hour', 'day', 'week', 'month', 'year'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                border: v === view ? `2px solid ${borderColor}` : '1px solid #ccc',
                background: v === view ? (isDark ? '#1a2636' : '#eaf6fd') : (isDark ? '#23272b' : '#fff'),
                color: v === view ? borderColor : textColor,
                fontWeight: v === view ? 700 : 400,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <Line data={chartData} options={options} />
    </div>
  )
}

export default LineGraph