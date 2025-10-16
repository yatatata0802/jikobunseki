import React, { useRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Ripple effect
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = cardRef.current;
    if (!card) return;
    const circle = document.createElement("span");
    const diameter = Math.max(card.clientWidth, card.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${
      e.clientX - card.getBoundingClientRect().left - radius
    }px`;
    circle.style.top = `${
      e.clientY - card.getBoundingClientRect().top - radius
    }px`;
    circle.className = "ripple";
    card.appendChild(circle);
    setTimeout(() => {
      circle.remove();
    }, 600);
    if (props.onClick) props.onClick(e);
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-slate-950/50 p-6 sm:p-8 transition-all duration-300 cursor-pointer overflow-hidden group hover:scale-105 hover:ring-4 hover:ring-amber-300/40 ${className}`}
      {...props}
      onClick={handleClick}
    >
      {/* エネルギー流れ演出（z-10, 枠線より下） */}
      <span className="absolute inset-0 pointer-events-none rounded-2xl z-10 opacity-70 group-active:animate-energy-flow"></span>
      {/* 枠線・影の重複を防ぐため、hover:shadowは削除し、ringのみ残す */}
      {children}
    </div>
  );
};

export default Card;
