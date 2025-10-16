import * as React from "react";
import type { Result, Scores, QuizVersion, AnswerValue } from "../types";
import { SCORING_MAP, EVIDENCE_TEXT, COMBINATION_ANALYSIS } from "../constants";
import Card from "./Card";
import Button from "./Button";
import { ArrowPathIcon } from "./icons/ArrowPathIcon";
import { LinkIcon } from "./icons/LinkIcon";
import Confetti from "react-confetti";
import { useTypewriter } from "../hooks/useTypewriter";
import { motion } from "framer-motion";
import { useWindowSize } from "react-use";

interface ResultScreenProps {
  quizVersion: QuizVersion;
  result: Result;
  scores: Scores;
  onRestart: () => void;
  onContinue: () => void;
  finalResultType: AnswerValue;
  answers: AnswerValue[];
  userName?: string;
}

// 「あなた」をuserNameで置換する関数
function replaceName(text: string, userName: string): string {
  return text.replace(/{name}/g, userName ? `${userName}さん` : "あなた");
}

const FullResult: React.FC<
  Omit<ResultScreenProps, "quizVersion" | "onContinue">
> = ({
  result,
  scores,
  onRestart,
  finalResultType,
  answers,
  userName = "",
}) => {
  // 安全なデータ参照
  const safeResult = result || {
    title: "-",
    description: "-",
    risk: "-",
    prescription: "-",
  };
  const safeScores = scores || { A: 0, B: 0, C: 0, D: 0 };
  const safeAnswers = Array.isArray(answers) ? answers : [];
  const evidenceItems = safeAnswers
    .map((answer, index) => {
      const questionNumber = index + 1;
      const scoring = SCORING_MAP[index] || {};
      const answeredType = scoring[answer];
      if (answeredType === finalResultType) {
        return {
          questionNumber,
          text:
            (EVIDENCE_TEXT[questionNumber] &&
              EVIDENCE_TEXT[questionNumber][answer]) ||
            "特徴的な回答です。",
        };
      }
      return null;
    })
    .filter(
      (item): item is { questionNumber: number; text: string } => item !== null
    )
    .slice(0, 3);

  const priority: AnswerValue[] = ["A", "B", "C", "D"];
  const sortedTypes = (Object.keys(safeScores) as AnswerValue[]).sort(
    (a, b) => {
      const scoreDiff = safeScores[b] - safeScores[a];
      if (scoreDiff !== 0) return scoreDiff;
      return priority.indexOf(a) - priority.indexOf(b);
    }
  );

  const secondaryType = sortedTypes.find((type) => type !== finalResultType);
  const combinationKey = secondaryType
    ? `${finalResultType}-${secondaryType}`
    : null;
  const combinationAnalysisText =
    (combinationKey && COMBINATION_ANALYSIS[combinationKey]) || null;

  const safeTitle = safeResult.title ?? "-";
  const typewriterTitle = useTypewriter(`【${safeTitle}】`, 60);
  const { width, height } = useWindowSize();

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.5, // 0.25→0.5に
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2 } }, // 0.7→1.2に
  };

  // 結果画面表示時に画面トップへスクロール
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative"
    >
      {/* Confetti（紙吹雪）エフェクト */}
      <Confetti
        width={width}
        height={height}
        numberOfPieces={300}
        recycle={false}
      />
      {/* タイプ名にアニメーション＋グラデーション＋ドロップシャドウ */}
      <motion.div variants={cardVariants}>
        <Card
          className="text-center animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="font-display text-lg sm:text-2xl text-slate-300 mb-2">
            あなたの『人生脚本』の真実は…
          </p>
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-amber-400 via-fuchsia-500 to-sky-400 bg-clip-text text-transparent drop-shadow-lg min-h-[2.5em]"
            style={{
              textShadow:
                "0 0 32px #fffbe6, 0 0 64px #a78bfa, 0 0 96px #fbbf24",
              letterSpacing: "0.08em",
            }}
          >
            【{safeResult.title}】
          </motion.h1>
        </Card>
      </motion.div>
      <motion.div variants={cardVariants}>
        <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="space-y-6 text-slate-300 leading-loose">
            <p className="whitespace-pre-wrap">
              {safeResult.description || "-"}
            </p>
            <div>
              <h3 className="font-bold text-amber-500 mb-2 text-lg">
                注意点：
              </h3>
              <p>{safeResult.risk || "-"}</p>
            </div>
          </div>
        </Card>
      </motion.div>
      {evidenceItems.length > 0 && (
        <motion.div variants={cardVariants}>
          <Card className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <h3 className="font-bold text-amber-500 mb-4 text-lg border-b border-slate-700 pb-2">
              あなたの回答傾向
            </h3>
            <div className="space-y-4 text-slate-300">
              {evidenceItems.map((item, index) => (
                <div key={index}>
                  <p className="font-semibold text-slate-100">
                    質問{item.questionNumber}での回答について：
                  </p>
                  <p className="pl-2 border-l-2 border-amber-500/50 mt-1">
                    {item.text || "-"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
      {combinationAnalysisText && (
        <motion.div variants={cardVariants}>
          <Card className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <h3 className="font-bold text-amber-500 mb-4 text-lg border-b border-slate-700 pb-2">
              あなたの魅力と成長のヒント
            </h3>
            <div className="space-y-4 text-slate-300 leading-loose">
              <p>{combinationAnalysisText || "-"}</p>
            </div>
          </Card>
        </motion.div>
      )}
      <motion.div variants={cardVariants}>
        <Card className="animate-fade-in" style={{ animationDelay: "1.0s" }}>
          <div className="space-y-6 text-slate-300 leading-loose">
            <div>
              <h3 className="font-bold text-amber-500 mb-2 text-lg">
                次の一歩：
              </h3>
              <p>{safeResult.prescription || "-"}</p>
            </div>
          </div>
        </Card>
      </motion.div>
      <Card className="animate-fade-in" style={{ animationDelay: "1.0s" }}>
        <div className="text-center space-y-4">
          <p className="text-slate-300">
            あなたの脚本を、より深く読み解き、書き換えるためのヒントを、公式HPやSNSで発信しています。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://yatagai-coaching.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="secondary" className="w-full">
                公式HPで、さらに詳しく知る
              </Button>
            </a>
          </div>
        </div>
      </Card>
      <div
        className="text-center pt-4 animate-fade-in"
        style={{ animationDelay: "1.2s" }}
      >
        <Button onClick={onRestart} variant="secondary">
          もう一度診断する
        </Button>
      </div>
    </motion.div>
  );
};

const ResultScreen: React.FC<ResultScreenProps> = (props) => {
  return <FullResult {...props} />;
};

export default ResultScreen;
