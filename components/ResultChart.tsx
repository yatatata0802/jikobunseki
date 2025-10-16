import * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Scores, AnswerValue } from "../types";

declare const Chart: any;

interface ResultChartProps {
  scores: Scores;
  highlightType?: AnswerValue;
}

const TYPE_LABELS = ["理想主義者", "共感型", "革命家", "自由人", "現実主義者"];
const TYPE_KEYS: AnswerValue[] = ["A", "B", "C", "D", "E"];

const ResultChart: React.FC<ResultChartProps> = ({ scores, highlightType }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [animatedScores, setAnimatedScores] = useState<Scores>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  });

  // スコア数値のカウントアップアニメーション
  useEffect(() => {
    const types: AnswerValue[] = TYPE_KEYS;
    const target = { ...scores };
    const duration = 800;
    const steps = 24;
    let current = { ...animatedScores };
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const next: Scores = { ...current };
      types.forEach((type) => {
        next[type] = Math.round((target[type] || 0) * (frame / steps));
      });
      setAnimatedScores(next);
      if (frame >= steps) {
        setAnimatedScores(target);
        clearInterval(interval);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [scores]);

  useEffect(() => {
    if (chartRef.current && scores) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      const labels = TYPE_LABELS;
      const types: AnswerValue[] = TYPE_KEYS;
      // 0点のタイプも必ず含める
      const data = types.map((type) =>
        typeof animatedScores[type] === "number" ? animatedScores[type] : 0
      );

      chartInstanceRef.current = new Chart(ctx, {
        type: "radar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "診断スコア",
              data: data,
              fill: true,
              backgroundColor: "rgba(251, 191, 36, 0.15)",
              borderColor: "rgb(251, 191, 36)",
              pointBackgroundColor: "rgb(251, 191, 36)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgb(251, 191, 36)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              angleLines: {
                color: "rgba(255, 255, 255, 0.2)",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.2)",
              },
              pointLabels: {
                color: (context: any) =>
                  types[context.index] === highlightType
                    ? "#fcd34d"
                    : "#94a3b8",
                font: (context: any) => ({
                  size: types[context.index] === highlightType ? 16 : 14,
                  family: "'Noto Sans JP', sans-serif",
                  weight:
                    types[context.index] === highlightType ? "bold" : "normal",
                }),
              },
              ticks: {
                color: "#cbd5e1",
                backdropColor: "transparent",
                stepSize: 1,
              },
              suggestedMin: 0,
              suggestedMax: Math.max(5, ...data),
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
          animation: {
            duration: 1000,
            easing: "easeOutQuart",
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [scores, highlightType, animatedScores]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={chartRef} />
      <div className="flex flex-wrap justify-center gap-6 mt-4">
        {TYPE_KEYS.map((type, idx) => (
          <div key={type} className="flex flex-col items-center">
            <span
              className={`text-lg font-bold ${
                highlightType === type
                  ? "text-amber-400 scale-110"
                  : "text-slate-300"
              }`}
            >
              {TYPE_LABELS[idx]}
            </span>
            <span
              className={`text-2xl font-extrabold ${
                highlightType === type ? "text-amber-400" : "text-slate-100"
              } transition-all duration-300`}
            >
              {Number.isFinite(animatedScores[type]) ? animatedScores[type] : 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultChart;
