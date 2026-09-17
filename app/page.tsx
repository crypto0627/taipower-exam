"use client";

import { useCallback, useMemo, useState } from "react";
import { QUESTION_BANK } from "@/data";
import { drawQuiz, poolStats } from "@/lib/draw";
import type { DrawnQuestion, QuizConfig } from "@/lib/types";
import StartScreen from "@/components/StartScreen";
import QuizRunner from "@/components/QuizRunner";
import ResultView from "@/components/ResultView";

type Phase = "idle" | "running" | "done";

export default function Page() {
  const stats = useMemo(() => poolStats(QUESTION_BANK), []);

  const [phase, setPhase] = useState<Phase>("idle");
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<DrawnQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const start = useCallback((cfg: QuizConfig) => {
    const drawn = drawQuiz(QUESTION_BANK, cfg);
    setConfig(cfg);
    setQuestions(drawn);
    setAnswers(new Array(drawn.length).fill(null));
    setPhase("running");
    window.scrollTo({ top: 0 });
  }, []);

  const answer = useCallback((index: number, choice: number) => {
    setAnswers((prev) => {
      const next = prev.slice();
      next[index] = choice < 0 ? null : choice;
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    setPhase("done");
    window.scrollTo({ top: 0 });
  }, []);

  // 退出／回首頁：整份試卷作廢，不留任何紀錄
  const reset = useCallback(() => {
    setQuestions([]);
    setAnswers([]);
    setPhase("idle");
    window.scrollTo({ top: 0 });
  }, []);

  const retry = useCallback(() => {
    if (config) start(config);
    else reset();
  }, [config, start, reset]);

  if (phase === "running") {
    return (
      <QuizRunner
        questions={questions}
        answers={answers}
        onAnswer={answer}
        onSubmit={submit}
        onQuit={reset}
      />
    );
  }

  if (phase === "done") {
    return <ResultView questions={questions} answers={answers} onRetry={retry} onHome={reset} />;
  }

  return <StartScreen stats={stats} onStart={start} />;
}
