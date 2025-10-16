import React, { useState } from "react";
import type { QuizVersion } from "../types";
import Card from "./Card";
import { EyeIcon } from "./icons/EyeIcon";
import { BrainCircuitIcon } from "./icons/BrainCircuitIcon";

interface StartScreenProps {
  onSelectVersion: () => void;
}

const ChoiceCard: React.FC<{
  onClick: () => void;
  title: string;
  description: string;
}> = ({ onClick, title, description }) => (
  <div
    onClick={onClick}
    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-purple-900/50 hover:-translate-y-2 group"
  >
    <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);

const StartScreen: React.FC<StartScreenProps> = ({ onSelectVersion }) => {
  // 覚悟モーダル関連の状態・ロジックを全削除
  const handleChoice = () => {
    onSelectVersion();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full text-center p-2 sm:p-4 min-h-[80vh] animate-fade-in">
      {/* 覚悟モーダル削除済み */}
      <div className="mb-8 flex flex-col items-center justify-center w-full">
        <h1
          className="font-display font-bold text-center"
          style={{
            background:
              "linear-gradient(90deg, #fffbe6 0%, #fbbf24 40%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 32px #fffbe6, 0 0 64px #a78bfa, 0 0 96px #fbbf24",
            letterSpacing: "0.08em",
            lineHeight: 1.15,
          }}
        >
          <span className="text-5xl sm:text-7xl md:text-8xl">魅セルジブン</span>
          <br />
          <span
            style={{
              fontSize: "2.5em",
              color: "#FFD700",
              textShadow: "0 0 24px #fffbe6, 0 0 48px #fbbf24",
              display: "inline-block",
              margin: "0.1em 0",
            }}
          >
            ×
          </span>
          <br />
          <span className="text-5xl sm:text-7xl md:text-8xl">踊ルココロ</span>
        </h1>
        <div className="mt-3 sm:mt-4">
          <span
            className="text-xl sm:text-3xl text-white font-bold"
            style={{ textShadow: "0 0 8px #fff" }}
          >
            “なりたい自分”へ
          </span>
        </div>
        <div
          className="mt-4 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="text-base sm:text-lg text-amber-400 font-bold block">
            監修：矢田谷充則（自己実現コーチ）
          </span>
        </div>
        <p
          className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-400 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          あなたの人生を変える自己分析へようこそ
        </p>
      </div>
      <div className="w-full max-w-full grid grid-cols-1 justify-items-center gap-4 sm:gap-6">
        <ChoiceCard
          onClick={handleChoice}
          title="診断スタート"
          description="5つの質問に答えて、あなたの『人生脚本』タイプを診断しましょう。"
        />
      </div>
      {/* 簡易鼓動アニメーション用CSSも削除済み */}
    </div>
  );
};

export default StartScreen;
