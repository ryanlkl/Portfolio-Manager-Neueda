import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Colors);

function PieChart({stocks}) {

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
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="container p-6">
        <div className="row px-5">
            <div className="col px-6">
                <Doughnut data={data} />
            </div>
        </div>
    </div>
    
  )
}

export default PieChart