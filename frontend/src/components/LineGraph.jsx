import React from 'react'
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

function LineGraph({ data }) {
  // Prepare data for Chart.js
  const chartData = {
    labels: data.map(point => point.date),
    datasets: [
      {
        label: 'Total Value',
        data: data.map(point => point.totalValue),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54,162,235,0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Portfolio Performance Over Time' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          tooltipFormat: 'yyyy-MM-dd HH:mm',
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'yyyy-MM-dd',
          },
        },
        title: { display: true, text: 'Date' },
      },
      y: {
        title: { display: true, text: 'Value ($)' },
        beginAtZero: true,
      },
    },
  }

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

export default LineGraph