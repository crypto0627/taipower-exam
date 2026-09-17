"use client";

import { useState } from "react";
import type { QuizConfig, Subject } from "@/lib/types";
import { MUST_RATIO } from "@/lib/draw";

interface Props {
  stats: {
    total: number;
    subject1: number;
    subject2: number;
    must: number;
    chapters: { chapter: string; count: number }[];
  };
  onStart: (config: QuizConfig) => void;
}

const SIZES = [20, 50, 100];

export default function StartScreen({ stats, onStart }: Props) {
  const [size, setSize] = useState(100);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [pin, setPin] = useState(true);

  const available = subject === 1 ? stats.subject1 : subject === 2 ? stats.subject2 : stats.total;

  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <p className="eyebrow">台電電力交易平台專業人員資格測驗</p>
      <h1
        style={{
          fontSize: "clamp(28px,5vw,42px)",
          fontWeight: 900,
          letterSpacing: "-0.015em",
          margin: "0 0 14px",
          lineHeight: 1.2,
        }}
      >
        刷題系統
      </h1>
      <p style={{ color: "var(--ink-2)", maxWidth: "62ch", margin: "0 0 32px" }}>
        每次隨機抽題、選項順序也會打亂。交卷後會列出所有答錯的題目，附上正解、解析與條文出處。
        離開測驗就重新抽一份，<strong>不記錄任何作答紀錄</strong>。
      </p>

      <div
        className="card"
        style={{
          padding: "22px 24px",
          marginBottom: 24,
          display: "grid",
          gap: 4,
          gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
        }}
      >
        <Stat label="題庫總題數" value={stats.total} />
        <Stat label="科目一" value={stats.subject1} />
        <Stat label="科目二" value={stats.subject2} />
        <Stat label="必考題" value={stats.must} accent />
      </div>

      <div className="card" style={{ padding: "24px 24px 28px", marginBottom: 28 }}>
        <Field label="題數">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SIZES.map((n) => (
              <button
                key={n}
                className={`btn ${size === n ? "" : "quiet"}`}
                onClick={() => setSize(n)}
                aria-pressed={size === n}
              >
                {n} 題
              </button>
            ))}
          </div>
        </Field>

        <Field label="科目範圍">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className={`btn ${subject === null ? "" : "quiet"}`}
              onClick={() => setSubject(null)}
              aria-pressed={subject === null}
            >
              兩科都考
            </button>
            <button
              className={`btn ${subject === 1 ? "" : "quiet"}`}
              onClick={() => setSubject(1)}
              aria-pressed={subject === 1}
            >
              只考科目一
            </button>
            <button
              className={`btn ${subject === 2 ? "" : "quiet"}`}
              onClick={() => setSubject(2)}
              aria-pressed={subject === 2}
            >
              只考科目二
            </button>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 0" }}>
            兩科都考時，科目一與科目二依 3 : 7 配題。此範圍可用題數 {available} 題。
          </p>
        </Field>

        <Field label="必考題">
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={pin}
              onChange={(e) => setPin(e.target.checked)}
              style={{ width: 17, height: 17, accentColor: "var(--accent)" }}
            />
            <span style={{ fontSize: 15 }}>
              優先抽必考題（題庫共 {stats.must} 題），最多佔一份試卷的 {Math.round(MUST_RATIO * 100)}%
            </span>
          </label>
        </Field>

        <button
          className="btn"
          style={{ marginTop: 26, padding: "13px 34px", fontSize: 16 }}
          onClick={() => onStart({ size, subject, pinMustQuestions: pin })}
        >
          開始測驗
        </button>
      </div>

      <details className="card" style={{ padding: "16px 22px" }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
          題庫章節分布
        </summary>
        <ul style={{ margin: "14px 0 4px", paddingLeft: 20, color: "var(--ink-2)", fontSize: 14.5 }}>
          {stats.chapters.map((c) => (
            <li key={c.chapter} style={{ margin: "5px 0" }}>
              {c.chapter} — <span className="mono">{c.count}</span> 題
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{label}</div>
      <div
        className="mono"
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: accent ? "var(--danger)" : "var(--ink)",
          lineHeight: 1.3,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 12.5,
          letterSpacing: "0.06em",
          color: "var(--ink-3)",
          marginBottom: 9,
          fontFamily: '"IBM Plex Mono", monospace',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
