import { useState, useEffect } from "react";

/**
 * useTypewriter
 * @param text 表示したいテキスト
 * @param speed 1文字ごとの表示速度（ミリ秒）
 * @returns タイプライター表示中のテキスト（undefinedにならない）
 */
export function useTypewriter(
  text: string | undefined | null,
  speed: number = 50
): string {
  const safeText = typeof text === "string" ? text : "";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!safeText) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed((prev = "") => (prev ?? "") + (safeText[i] ?? ""));
      i++;
      if (i >= safeText.length) {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [safeText, speed]);

  return displayed || safeText;
}
