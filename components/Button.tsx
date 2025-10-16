import * as React from "react";
import { useRef, useState } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [energy, setEnergy] = useState(false);

  // 波紋＋バウンドアニメーション
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const button = btnRef.current;
    if (!button) return;
    // 波紋
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ripple.style.width = ripple.style.height = `${rect.width * 1.2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    // バウンド（scale）
    button.classList.add("animate-bounce-scale");
    setTimeout(() => button.classList.remove("animate-bounce-scale"), 350);
    // 回転
    button.classList.add("animate-rotate-once");
    setTimeout(() => button.classList.remove("animate-rotate-once"), 400);
    // エネルギー流れ
    setEnergy(true);
    setTimeout(() => setEnergy(false), 500);
    // 既存のonClickも呼ぶ
    if (props.onClick) props.onClick(e);
  };

  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg overflow-hidden";

  const variantClasses = {
    primary:
      "bg-amber-500 text-slate-900 hover:bg-amber-400 focus:ring-amber-400 hover:shadow-[0_0_32px_8px_rgba(251,191,36,0.5)]",
    secondary:
      "bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-500 hover:shadow-[0_0_32px_8px_rgba(251,191,36,0.3)]",
    outline:
      "bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 focus:ring-amber-400 hover:shadow-[0_0_32px_8px_rgba(251,191,36,0.5)]",
  };

  return (
    <button
      ref={btnRef}
      type="button"
      className={`relative overflow-hidden select-none font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200
        ${
          variant === "primary"
            ? "bg-amber-400 text-slate-900 hover:bg-amber-500"
            : "bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-400"
        }
        group
        ${className}
      `}
      onClick={handleClick}
      {...props}
      // グロー（hover時）
      style={{
        boxShadow: props.disabled ? undefined : "0 0 0 0 rgba(251,191,36,0.0)",
        transition: "box-shadow 0.3s",
      }}
    >
      {/* 光のリング */}
      <span className="absolute inset-0 pointer-events-none rounded-lg ring-2 ring-amber-300/40 group-hover:animate-pulse"></span>
      {/* エネルギー流れ演出 */}
      {energy && (
        <span
          className="absolute inset-0 pointer-events-none rounded-lg animate-energy-flow"
          style={{
            background:
              "linear-gradient(90deg, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.5) 50%, rgba(251,191,36,0.15) 100%)",
            filter: "blur(2px)",
            opacity: 0.8,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
