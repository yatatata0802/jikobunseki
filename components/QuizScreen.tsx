import React, { useState, useEffect, useRef } from "react";
import type { Question, AnswerValue } from "../types";
import Card from "./Card";
import Button from "./Button";

interface QuizScreenProps {
  question: Question;
  onAnswer: (answer: AnswerValue) => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  bgTheme?: string;
  userName?: string;
}

// replaceName関数・userName関連のprops・ロジックを全削除

const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  onAnswer,
  currentQuestionIndex,
  totalQuestions,
  bgTheme = "",
  userName = "",
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerValue | null>(
    null
  );
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [displayedQuestion, setDisplayedQuestion] = useState(
    currentQuestionIndex + 1
  );
  const prevIndex = useRef(currentQuestionIndex);

  // Reset local state when the question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsFadingOut(false);
  }, [currentQuestionIndex]);

  // 質問切り替え時のフェード＋ズームアニメーション用
  const [isEntering, setIsEntering] = useState(true);
  useEffect(() => {
    setIsEntering(false);
    const enterTimeout = setTimeout(() => setIsEntering(true), 10);
    return () => clearTimeout(enterTimeout);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (prevIndex.current !== currentQuestionIndex) {
      const start = prevIndex.current + 1;
      const end = currentQuestionIndex + 1;
      const step = start < end ? 1 : -1;
      let i = start;
      const interval = setInterval(() => {
        setDisplayedQuestion(i);
        if (i === end) {
          clearInterval(interval);
        } else {
          i += step;
        }
      }, 30);
      prevIndex.current = currentQuestionIndex;
      return () => clearInterval(interval);
    } else {
      setDisplayedQuestion(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex]);

  const handleSelectAnswer = (value: AnswerValue) => {
    if (selectedAnswer) return;
    setSelectedAnswer(value);
    setIsFadingOut(true);
    setTimeout(() => {
      onAnswer(value);
    }, 300); // Wait for fade-out animation
  };

  const progressPercentage =
    ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // 安全なデータ参照
  const safeQuestion = question || { text: "-", choices: [] };
  const safeChoices = Array.isArray(safeQuestion.choices)
    ? safeQuestion.choices
    : [];

  return (
    <div
      className={`relative w-full min-h-[60vh] transition-all duration-700 
        ${isFadingOut ? "opacity-0 scale-95 -translate-y-4 blur-sm" : ""}
        ${
          isEntering
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-105 translate-y-4"
        }
      `}
    >
      {/* 光のフラッシュ演出 */}
      {/* 波紋・光のリングのspanはCard側に統合したため削除 */}
      <Card
        className={`transition-opacity duration-300 ${
          isFadingOut ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="mb-6">
          <p className="text-amber-400 font-bold mb-2 text-lg">
            質問 {displayedQuestion}/{totalQuestions}
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-amber-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        {/* パーソナライズ表示 */}
        {userName && (
          <div className="text-lg font-bold text-amber-400 mb-2">
            {userName}さん、
          </div>
        )}
        <h2 className="text-lg sm:text-2xl font-bold mb-6 sm:mb-8 leading-relaxed break-words">
          {safeQuestion.text || "-"}
        </h2>
        <div
          className="grid grid-cols-1 gap-3 sm:gap-4 overflow-y-auto"
          style={{ maxHeight: "40vh" }}
        >
          {safeChoices.length > 0 ? (
            safeChoices.map(
              (choice: { value: AnswerValue; text: string }, idx: number) => (
                <Button
                  key={choice.value || idx}
                  onClick={() => handleSelectAnswer(choice.value)}
                  variant="secondary"
                  className={`w-full text-left justify-start !py-4 !px-5 text-base sm:text-lg min-h-16 sm:min-h-16 whitespace-pre-line break-words transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedAnswer === choice.value
                      ? "!bg-amber-600 ring-2 ring-amber-400 scale-[1.02]"
                      : "hover:bg-slate-700/80"
                  }`}
                  style={{ alignItems: "flex-start" }}
                  disabled={!!selectedAnswer}
                >
                  <span className="font-bold text-amber-400 w-6">
                    {choice.value || "-"}.
                  </span>
                  <span className="block">{choice.text || "-"}</span>
                </Button>
              )
            )
          ) : (
            <div className="text-slate-400">選択肢がありません</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QuizScreen;
