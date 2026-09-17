"use client";

import { useEffect, useMemo, useState } from "react";
import type { DrawnQuestion } from "@/lib/types";

interface Props {
  questions: DrawnQuestion[];
  answers: (number | null)[];
  onAnswer: (index: number, choice: number) => void;
  onSubmit: () => void;
  onQuit: () => void;
}

const LETTERS = ["A", "B", "C", "D"];

export default function QuizRunner({ questions, answers, onAnswer, onSubmit, onQuit }: Props) {
  const [cursor, setCursor] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const q = questions[cursor];

  const answeredCount = useMemo(() => answers.filter((a) => a !== null).length, [answers]);
  const unanswered = questions.length - answeredCount;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") setCursor((c) => Math.min(c + 1, questions.length - 1));
      if (e.key === "ArrowLeft") setCursor((c) => Math.max(c - 1, 0));
      const n = ["1", "2", "3", "4"].indexOf(e.key);
      if (n >= 0 && n < q.options.length) onAnswer(cursor, n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, q, questions.length, onAnswer]);

  const pick = (choice: number) => {
    onAnswer(cursor, choice);
    if (cursor < questions.length - 1) {
      window.setTimeout(() => setCursor((c) => Math.min(c + 1, questions.length - 1)), 140);
    }
  };

  const handleSubmit = () => {
    if (unanswered > 0) {
      const ok = window.confirm(`還有 ${unanswered} 題未作答，未作答一律計為答錯。確定要交卷嗎？`);
      if (!ok) return;
    }
    onSubmit();
  };

  return (
    <>
      {/* 進度列 */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--surface)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          className="wrap"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 20px",
            flexWrap: "wrap",
          }}
        >
          <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
            {cursor + 1} / {questions.length}
          </span>
          <div
            style={{
              flex: 1,
              minWidth: 100,
              height: 6,
              background: "var(--surface-2)",
              borderRadius: 3,
              overflow: "hidden",
            }}
            role="progressbar"
            aria-valuenow={answeredCount}
            aria-valuemin={0}
            aria-valuemax={questions.length}
          >
            <div
              style={{
                width: `${(answeredCount / questions.length) * 100}%`,
                height: "100%",
                background: "var(--accent)",
              }}
            />
          </div>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>已答 {answeredCount}</span>
          <button className="btn quiet" style={{ padding: "6px 14px", fontSize: 13.5 }} onClick={() => setShowGrid((s) => !s)}>
            {showGrid ? "收起題號" : "題號一覽"}
          </button>
          <button className="btn" style={{ padding: "6px 16px", fontSize: 13.5 }} onClick={handleSubmit}>
            交卷
          </button>
          <button
            className="btn quiet"
            style={{ padding: "6px 14px", fontSize: 13.5 }}
            onClick={() => {
              if (window.confirm("退出後這份試卷會作廢，下次進入會重新抽題。確定要退出嗎？")) onQuit();
            }}
          >
            退出
          </button>
        </div>

        {showGrid && (
          <div className="wrap" style={{ padding: "0 20px 14px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(40px,1fr))",
                gap: 6,
              }}
            >
              {questions.map((_, i) => {
                const done = answers[i] !== null;
                const here = i === cursor;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setCursor(i);
                      setShowGrid(false);
                    }}
                    className="mono"
                    style={{
                      padding: "6px 0",
                      fontSize: 13,
                      borderRadius: 2,
                      border: `1px solid ${here ? "var(--accent)" : "var(--line-2)"}`,
                      background: done ? "var(--accent-wash)" : "transparent",
                      color: here ? "var(--accent)" : "var(--ink-2)",
                      fontWeight: here ? 700 : 400,
                    }}
                    aria-label={`第 ${i + 1} 題${done ? "（已作答）" : "（未作答）"}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 題目 */}
      <main className="wrap" style={{ paddingTop: 30, paddingBottom: 90 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <span className={`tag s${q.subject}`}>科目{q.subject === 1 ? "一" : "二"}</span>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{q.chapter}</span>
          {q.tier === "must" && <span className="tag must">必考</span>}
        </div>

        <h2 style={{ fontSize: 20, lineHeight: 1.6, fontWeight: 700, margin: "0 0 22px", textWrap: "balance" }}>
          {q.q}
        </h2>

        <div style={{ display: "grid", gap: 10 }}>
          {q.options.map((opt, i) => {
            const selected = answers[cursor] === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                style={{
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 12,
                  alignItems: "start",
                  padding: "14px 16px",
                  borderRadius: 2,
                  border: `1px solid ${selected ? "var(--accent)" : "var(--line)"}`,
                  background: selected ? "var(--accent-wash)" : "var(--surface)",
                  color: "var(--ink)",
                  fontSize: 15.5,
                  lineHeight: 1.65,
                }}
                aria-pressed={selected}
              >
                <span
                  className="mono"
                  style={{ color: selected ? "var(--accent)" : "var(--ink-3)", fontWeight: 600, paddingTop: 1 }}
                >
                  {LETTERS[i]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          <button className="btn quiet" onClick={() => setCursor((c) => Math.max(c - 1, 0))} disabled={cursor === 0}>
            上一題
          </button>
          <button
            className="btn quiet"
            onClick={() => setCursor((c) => Math.min(c + 1, questions.length - 1))}
            disabled={cursor === questions.length - 1}
          >
            下一題
          </button>
          {answers[cursor] !== null && (
            <button className="btn quiet" onClick={() => onAnswer(cursor, -1)}>
              清除本題
            </button>
          )}
        </div>

        <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 20 }}>
          鍵盤：← → 切換題目，1–4 直接選答案。
        </p>
      </main>
    </>
  );
}
