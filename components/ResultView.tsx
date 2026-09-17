"use client";

import { useMemo, useState } from "react";
import type { ChapterScore, DrawnQuestion } from "@/lib/types";

interface Props {
  questions: DrawnQuestion[];
  answers: (number | null)[];
  onRetry: () => void;
  onHome: () => void;
}

const LETTERS = ["A", "B", "C", "D"];

export default function ResultView({ questions, answers, onRetry, onHome }: Props) {
  const [filter, setFilter] = useState<"wrong" | "all">("wrong");

  const correctCount = useMemo(
    () => questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0),
    [questions, answers],
  );
  const score = Math.round((correctCount / questions.length) * 100);

  const chapters = useMemo<ChapterScore[]>(() => {
    const map = new Map<string, ChapterScore>();
    questions.forEach((q, i) => {
      const row = map.get(q.chapter) ?? { chapter: q.chapter, subject: q.subject, total: 0, correct: 0 };
      row.total += 1;
      if (answers[i] === q.answer) row.correct += 1;
      map.set(q.chapter, row);
    });
    return [...map.values()].sort((a, b) => a.correct / a.total - b.correct / b.total);
  }, [questions, answers]);

  const mustWrong = questions.filter((q, i) => q.tier === "must" && answers[i] !== q.answer).length;
  const mustTotal = questions.filter((q) => q.tier === "must").length;

  const shown = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q, i }) => (filter === "all" ? true : answers[i] !== q.answer));

  return (
    <main className="wrap" style={{ paddingTop: 44, paddingBottom: 90 }}>
      <p className="eyebrow">測驗結果</p>

      <div
        className="card"
        style={{
          padding: "28px 26px",
          marginBottom: 22,
          display: "flex",
          gap: 34,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="mono" style={{ fontSize: 52, fontWeight: 600, lineHeight: 1, color: scoreColor(score) }}>
            {score}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>分（滿分 100）</div>
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <Line label="答對" value={`${correctCount} / ${questions.length} 題`} />
          <Line label="答錯" value={`${questions.length - correctCount} 題`} />
          {mustTotal > 0 && (
            <Line
              label="必考題"
              value={`答錯 ${mustWrong} / ${mustTotal} 題`}
              tone={mustWrong > 0 ? "bad" : "good"}
            />
          )}
        </div>
      </div>

      {/* 章節弱點 */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 26 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>章節正確率（由低到高）</h2>
        <div style={{ display: "grid", gap: 9 }}>
          {chapters.map((c) => {
            const pct = Math.round((c.correct / c.total) * 100);
            return (
              <div key={c.chapter} style={{ display: "grid", gridTemplateColumns: "1fr 88px 52px", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "var(--ink-2)" }}>{c.chapter}</span>
                <span style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                  <span
                    style={{ display: "block", width: `${pct}%`, height: "100%", background: scoreColor(pct) }}
                  />
                </span>
                <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "right" }}>
                  {c.correct}/{c.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 檢討區 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, marginRight: 8 }}>逐題檢討</h2>
        <button className={`btn ${filter === "wrong" ? "" : "quiet"}`} style={{ padding: "6px 14px", fontSize: 13.5 }} onClick={() => setFilter("wrong")}>
          只看錯題（{questions.length - correctCount}）
        </button>
        <button className={`btn ${filter === "all" ? "" : "quiet"}`} style={{ padding: "6px 14px", fontSize: 13.5 }} onClick={() => setFilter("all")}>
          全部題目
        </button>
      </div>

      {shown.length === 0 && (
        <div className="card" style={{ padding: "26px 24px", textAlign: "center", color: "var(--good)" }}>
          全部答對，這份試卷沒有需要檢討的題目。
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {shown.map(({ q, i }) => {
          const mine = answers[i];
          const right = mine === q.answer;
          return (
            <article
              key={q.id}
              className="card"
              style={{ padding: "20px 22px", borderLeft: `3px solid ${right ? "var(--good)" : "var(--danger)"}` }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  第 {i + 1} 題
                </span>
                <span className={`tag s${q.subject}`}>科目{q.subject === 1 ? "一" : "二"}</span>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{q.chapter}</span>
                {q.tier === "must" && <span className="tag must">必考</span>}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 13,
                    fontWeight: 700,
                    color: right ? "var(--good)" : "var(--danger)",
                  }}
                >
                  {right ? "答對" : mine === null ? "未作答" : "答錯"}
                </span>
              </div>

              <p style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.6, margin: "0 0 14px" }}>{q.q}</p>

              <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
                {q.options.map((opt, oi) => {
                  const isAnswer = oi === q.answer;
                  const isMine = oi === mine;
                  const bg = isAnswer ? "var(--good-wash)" : isMine ? "var(--danger-wash)" : "transparent";
                  const bd = isAnswer ? "var(--good)" : isMine ? "var(--danger)" : "var(--line)";
                  return (
                    <div
                      key={oi}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "26px 1fr auto",
                        gap: 10,
                        padding: "10px 13px",
                        border: `1px solid ${bd}`,
                        background: bg,
                        borderRadius: 2,
                        fontSize: 14.5,
                        lineHeight: 1.6,
                      }}
                    >
                      <span className="mono" style={{ color: "var(--ink-3)", fontWeight: 600 }}>
                        {LETTERS[oi]}
                      </span>
                      <span>{opt}</span>
                      <span style={{ fontSize: 12, whiteSpace: "nowrap", color: isAnswer ? "var(--good)" : "var(--danger)", fontWeight: 700 }}>
                        {isAnswer ? "正解" : isMine ? "你的答案" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  borderLeft: "3px solid var(--accent)",
                  background: "var(--accent-wash)",
                  padding: "13px 16px",
                  fontSize: 14.5,
                  lineHeight: 1.75,
                }}
              >
                <strong style={{ display: "block", fontSize: 12.5, letterSpacing: "0.04em", marginBottom: 4 }}>
                  {right ? "解析" : "為什麼會錯"}
                </strong>
                {q.explain}
              </div>

              <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", margin: "12px 0 0" }}>
                出處：{q.source}　·　題號 {q.id}
              </p>
            </article>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" }}>
        <button className="btn" style={{ padding: "12px 28px" }} onClick={onRetry}>
          再刷一份（重新抽題）
        </button>
        <button className="btn quiet" style={{ padding: "12px 24px" }} onClick={onHome}>
          回到設定頁
        </button>
      </div>
    </main>
  );
}

function Line({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color = tone === "bad" ? "var(--danger)" : tone === "good" ? "var(--good)" : "var(--ink)";
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 15 }}>
      <span style={{ color: "var(--ink-3)", minWidth: 60 }}>{label}</span>
      <span className="mono" style={{ color, fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function scoreColor(pct: number) {
  if (pct >= 80) return "var(--good)";
  if (pct >= 60) return "var(--signal)";
  return "var(--danger)";
}
