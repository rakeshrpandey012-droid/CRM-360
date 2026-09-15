import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * CircularChart - Donut chart showing lead/deal distribution across pipeline stages.
 * @param {Object[]} leads   - Array of lead objects with a `status` field.
 * @param {Object[]} stages  - Pipeline stage definitions: { id, label, chartColor? }
 * @param {string}   title   - Optional chart title shown in the centre.
 */
const CircularChart = ({ leads = [], stages = [], title = "Pipeline" }) => {
  const total = leads.length;

  const counts = stages.map((stage) =>
    leads.filter((lead) => lead.status === stage.id).length
  );

  const data = {
    labels: stages.map((s) => s.label),
    datasets: [
      {
        data: counts,
        backgroundColor: stages.map(
          (s) => s.chartColor || s.color || "#6b7280"
        ),
        borderColor: "transparent",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 12,
          font: { size: 11, weight: "600" },
          color: "#94a3b8",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            const pct = total ? ((value / total) * 100).toFixed(1) : 0;
            return ` ${label}: ${value} deals (${pct}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    animation: { animateRotate: true, animateScale: true },
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-48 h-48 sm:w-52 sm:h-52">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
            {total}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CircularChart;
