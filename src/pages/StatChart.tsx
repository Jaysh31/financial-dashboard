import React from "react";
import ReactECharts from "echarts-for-react";

interface StatChartProps {
  revenue: number[];
  expenses: number[];
  months: string[];
}

const StatChart: React.FC<StatChartProps> = ({ revenue, expenses, months }) => {
  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1a1c23",
      borderColor: "#333",
      textStyle: { color: "#fff" },
    },
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 30,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#888" } },
      axisLabel: { color: "#bbb" },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#888" } },
      splitLine: { lineStyle: { color: "#333" } },
      axisLabel: { color: "#bbb" },
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        smooth: true,
        data: revenue,
        symbol: "none",
        lineStyle: {
          width: 3,
          color: "#4CAF50" // Material green
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.4)" }, // #3b82f6
              { offset: 1, color: "rgba(59, 130, 246, 0)" },
            ],
          },
        },
      },
      {
        name: "Expenses",
        type: "line",
        smooth: true,
        data: expenses,
        symbol: "none",
        lineStyle: {
          width: 3,
          color: "#ef4444" // Tailwind's red-500
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(250, 204, 21, 0.4)" }, // #facc15
              { offset: 1, color: "rgba(250, 204, 21, 0)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ width: "100%", height: "100%" }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default StatChart;
