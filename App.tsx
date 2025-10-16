import React, {
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
import Particles from "react-tsparticles";
import type {
  AppState,
  AnswerValue,
  Scores,
  QuizVersion,
  Question,
} from "./types";
import { QUIZ_QUESTIONS, RESULTS, SCORING_MAP } from "./constants";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import { AnimatePresence, motion } from "framer-motion";

interface QuizState {
  appState: AppState;
  quizVersion: QuizVersion | null;
  answers: AnswerValue[];
  currentQuestionIndex: number;
  finalResultType: AnswerValue | null;
  scores: Scores | null;
  // userName削除
}

type QuizAction =
  | { type: "SELECT_VERSION"; payload: QuizVersion }
  | { type: "ANSWER_QUESTION"; payload: AnswerValue }
  | { type: "RESTART_QUIZ" }
  | { type: "CONTINUE_TO_FULL" };

const initialState: QuizState = {
  appState: "choice",
  quizVersion: null,
  answers: [],
  currentQuestionIndex: 0,
  finalResultType: null,
  scores: null,
  // userName削除
};

const TRIAL_QUESTIONS = QUIZ_QUESTIONS.slice(0, 5);
const TRIAL_SCORING_MAP = SCORING_MAP.slice(0, 5);

const calculateScoresAndResult = (
  answers: AnswerValue[],
  isTrial: boolean
): { scores: Scores; finalResultType: AnswerValue | null } => {
  const scoringMap = isTrial ? TRIAL_SCORING_MAP : SCORING_MAP;
  if (answers.length === 0)
    return { scores: { A: 0, B: 0, C: 0, D: 0, E: 0 }, finalResultType: null };
  const scores: Scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  answers.forEach((answer, index) => {
    const questionScoring = scoringMap[index];
    if (questionScoring) {
      const resultType = questionScoring[answer];
      if (resultType) {
        scores[resultType]++;
      }
    }
  });
  const priority: AnswerValue[] = ["A", "B", "C", "D", "E"];
  const sortedTypes = (Object.keys(scores) as AnswerValue[]).sort((a, b) => {
    const scoreDiff = scores[b] - scores[a];
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    return priority.indexOf(a) - priority.indexOf(b);
  });
  return { scores, finalResultType: sortedTypes[0] };
};

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case "SELECT_VERSION":
      return {
        ...initialState,
        appState: "quiz",
        quizVersion: action.payload,
        // userName削除
      };
    case "RESTART_QUIZ":
      return initialState;
    case "CONTINUE_TO_FULL":
      if (state.quizVersion !== "trial") return state;
      return {
        ...state,
        appState: "quiz",
        quizVersion: "full",
        currentQuestionIndex: 5, // Start from question 6
        finalResultType: null,
        scores: null,
      };
    case "ANSWER_QUESTION": {
      if (!state.quizVersion) return state; // Should not happen

      const newAnswers = [...state.answers, action.payload];
      const questionCount = state.quizVersion === "trial" ? 5 : 10;
      const isLastQuestion = state.currentQuestionIndex === questionCount - 1;

      if (isLastQuestion) {
        const { scores, finalResultType } = calculateScoresAndResult(
          newAnswers,
          state.quizVersion === "trial"
        );
        return {
          ...state,
          answers: newAnswers,
          appState: "result",
          finalResultType: finalResultType,
          scores: scores,
        };
      } else {
        return {
          ...state,
          answers: newAnswers,
          currentQuestionIndex: state.currentQuestionIndex + 1,
        };
      }
    }
    default:
      return state;
  }
};

// ドラマチックな心理演出テーマ（質問ごとに）
const BG_THEMES = [
  // Q1: 始まり・静寂（深い紫）
  "bg-gradient-to-br from-purple-900/80 via-indigo-900/60 to-slate-900/90",
  // Q2: 迷い・思考（青系）
  "bg-gradient-to-br from-blue-900/80 via-cyan-800/60 to-slate-900/90",
  // Q3: 決断・情熱（赤系）
  "bg-gradient-to-br from-rose-900/80 via-pink-700/60 to-slate-900/90",
  // Q4: 覚醒・希望（金色）
  "bg-gradient-to-br from-amber-600/80 via-yellow-400/60 to-slate-900/90",
  // Q5: 静かな自信（緑系）
  "bg-gradient-to-br from-emerald-900/80 via-green-700/60 to-slate-900/90",
  // Q6: 未来・解放（空色）
  "bg-gradient-to-br from-sky-800/80 via-sky-400/60 to-slate-900/90",
  // Q7: 直感・ひらめき（紫ピンク）
  "bg-gradient-to-br from-fuchsia-800/80 via-pink-500/60 to-slate-900/90",
  // Q8: 成長・変化（オレンジ）
  "bg-gradient-to-br from-orange-800/80 via-orange-400/60 to-slate-900/90",
  // Q9: 調和・安定（青緑）
  "bg-gradient-to-br from-teal-800/80 via-cyan-400/60 to-slate-900/90",
  // Q10: 覚醒・祝福（ゴールド×白）
  "bg-gradient-to-br from-yellow-400/80 via-amber-200/60 to-white/90",
];

// 質問ごとにパーティクルカラーも切り替え
const PARTICLE_COLORS = [
  ["#a78bfa", "#6366f1", "#818cf8"], // Q1:紫
  ["#38bdf8", "#0ea5e9", "#2563eb"], // Q2:青
  ["#f472b6", "#be185d", "#f43f5e"], // Q3:赤
  ["#fbbf24", "#fde68a", "#fff9c4"], // Q4:金
  ["#34d399", "#10b981", "#6ee7b7"], // Q5:緑
  ["#38bdf8", "#7dd3fc", "#bae6fd"], // Q6:空色
  ["#e879f9", "#f472b6", "#a21caf"], // Q7:紫ピンク
  ["#fb923c", "#fdba74", "#fbbf24"], // Q8:オレンジ
  ["#2dd4bf", "#06b6d4", "#67e8f9"], // Q9:青緑
  ["#fde68a", "#fff9c4", "#fff"], // Q10:ゴールド×白
];

// 質問ごとにパーティクルの形状も切り替え
const PARTICLE_SHAPES = [
  "circle", // Q1: 丸
  "star", // Q2: 星
  "heart", // Q3: ハート
  "diamond", // Q4: ダイヤ
  "triangle", // Q5: 三角
  "square", // Q6: 四角
  "polygon", // Q7: 多角形
  "edge", // Q8: エッジ
  "char", // Q9: 文字
  "circle", // Q10: 丸（祝福）
];

const App: React.FC = () => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [flash, setFlash] = useState(false);
  const prevQuestionIndex = useRef(state.currentQuestionIndex);
  const [particleCount, setParticleCount] = useState(60);
  const prevAppState = useRef(state.appState);
  const [ripple, setRipple] = useState(false);

  useEffect(() => {
    if (
      state.appState === "quiz" &&
      prevQuestionIndex.current !== state.currentQuestionIndex
    ) {
      setFlash(true);
      const timeout = setTimeout(() => setFlash(false), 350); // フラッシュの長さ
      prevQuestionIndex.current = state.currentQuestionIndex;
      return () => clearTimeout(timeout);
    }
    prevQuestionIndex.current = state.currentQuestionIndex;
  }, [state.currentQuestionIndex, state.appState]);

  // 結果発表時にパーティクル爆発
  useEffect(() => {
    if (state.appState === "result" && prevAppState.current !== "result") {
      setParticleCount(500);
      const timeout = setTimeout(() => setParticleCount(60), 1800); // 1.8秒後に通常数へ
      prevAppState.current = state.appState;
      return () => clearTimeout(timeout);
    }
    prevAppState.current = state.appState;
  }, [state.appState]);

  // 画面切り替え時の波紋・光のリング
  useEffect(() => {
    setRipple(true);
    const timeout = setTimeout(() => setRipple(false), 700);
    return () => clearTimeout(timeout);
  }, [state.appState]);

  const handleSelectVersion = useCallback(() => {
    dispatch({ type: "SELECT_VERSION", payload: "trial" });
  }, []);

  const handleAnswer = useCallback((answer: AnswerValue) => {
    dispatch({ type: "ANSWER_QUESTION", payload: answer });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: "RESTART_QUIZ" });
  }, []);

  const handleContinue = useCallback(() => {
    dispatch({ type: "CONTINUE_TO_FULL" });
  }, []);

  const renderContent = () => {
    let content = null;
    switch (state.appState) {
      case "choice":
        content = <StartScreen onSelectVersion={handleSelectVersion} />;
        break;
      case "quiz": {
        if (!state.quizVersion) return null;
        const questionCount = state.quizVersion === "trial" ? 5 : 10;
        const questionsForVersion =
          state.quizVersion === "trial"
            ? TRIAL_QUESTIONS
            : QUIZ_QUESTIONS.slice(0, questionCount);
        const bgTheme =
          BG_THEMES[state.currentQuestionIndex % BG_THEMES.length];
        content = (
          <QuizScreen
            question={questionsForVersion[state.currentQuestionIndex]}
            onAnswer={handleAnswer}
            currentQuestionIndex={state.currentQuestionIndex}
            totalQuestions={questionCount}
            bgTheme={bgTheme}
          />
        );
        break;
      }
      case "result": {
        if (!state.finalResultType || !state.scores || !state.quizVersion)
          return null;
        const resultData = RESULTS[state.finalResultType];
        content = (
          <ResultScreen
            quizVersion={state.quizVersion}
            result={resultData}
            scores={state.scores}
            answers={state.answers}
            onRestart={handleRestart}
            onContinue={handleContinue}
            finalResultType={state.finalResultType}
          />
        );
        break;
      }
      default:
        content = null;
    }
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state.appState}
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -30 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ width: "100%" }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 overflow-y-auto relative">
      {/* 波紋・光のリング演出 */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key="ripple"
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: "50%",
                boxShadow: "0 0 80px 40px #fffbe6, 0 0 0 8px #ffe066",
                border: "2px solid #fffbe6",
                background:
                  "radial-gradient(circle, #fffbe6 40%, transparent 80%)",
                opacity: 0.8,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Particles
        id="tsparticles"
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          particles: {
            number: {
              value: particleCount,
              density: { enable: true, value_area: 800 },
            },
            color: {
              value:
                PARTICLE_COLORS[
                  state.currentQuestionIndex % PARTICLE_COLORS.length
                ],
            },
            shape: {
              type: PARTICLE_SHAPES[
                state.currentQuestionIndex % PARTICLE_SHAPES.length
              ],
            },
            opacity: { value: 0.25, random: true },
            size: { value: 3, random: { enable: true, minimumValue: 1 } },
            move: {
              enable: true,
              speed: 1.2,
              direction: "none",
              outModes: { default: "out" },
              angle: { value: 0, offset: 0 },
              spin: { enable: true, acceleration: 0.05 },
              random: true,
            },
            links: {
              enable: true,
              distance: 120,
              color: "#fbbf24",
              opacity: 0.15,
              width: 1,
            },
          },
          detectRetina: true,
          zLayers: 0,
        }}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      <motion.main
        key={state.currentQuestionIndex}
        initial={{ scale: 1.25, opacity: 0.92 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0.88 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className={`w-full max-w-4xl mx-auto relative z-10 ${
          BG_THEMES[state.currentQuestionIndex % BG_THEMES.length]
        }`}
      >
        {renderContent()}
      </motion.main>
    </div>
  );
};

export default App;
