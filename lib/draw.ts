import type { Question, DrawnQuestion, QuizConfig, Subject } from "./types";

/** Fisher–Yates，不改動原陣列 */
export function shuffle<T>(input: readonly T[]): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 把一題的選項打亂，並換算新的正解索引 */
export function shuffleOptions(q: Question): DrawnQuestion {
  const indexed = q.options.map((text, i) => ({ text, i }));
  const mixed = shuffle(indexed);
  return {
    ...q,
    options: mixed.map((o) => o.text),
    answer: mixed.findIndex((o) => o.i === q.answer),
  };
}

/** 科目一 : 科目二 的目標比例（依官方測驗範圍設定為 3 : 7） */
const SUBJECT_RATIO: Record<Subject, number> = { 1: 0.3, 2: 0.7 };

/**
 * 必考題在一份試卷中的佔比上限。
 *
 * 題庫的必考題數量可能多於這個額度，此時每份試卷會「隨機抽一批必考題」，
 * 讓必考題之間也能輪替，避免每次抽出來的卷子有一大半完全相同。
 * 想讓每份試卷都塞滿必考題，把這個值調成 1。
 */
export const MUST_RATIO = 0.6;

/**
 * 扣掉必考題後，剩餘名額中「重要題（core）」的佔比，其餘給細節題（detail）。
 * 設成 1 會完全抽不到細節題，等於浪費四成題庫。
 */
export const CORE_SHARE = 0.6;

/**
 * 抽出一份試卷。
 *
 * 規則：
 * 1. `pinMustQuestions` 為真時，先抽必考題（must），最多佔 MUST_RATIO。
 * 2. 依 科目一 3 : 科目二 7 算出各科在整份試卷的目標題數，扣掉必考題已佔的名額後補齊。
 * 3. 同科目內，重要題（core）與細節題（detail）按 CORE_SHARE 分配，任一層不足時互相補位。
 * 4. 最後打亂題序，並逐題打亂選項。
 *
 * 題庫不足 size 時回傳全部可用題目，不會重複出題。
 */
export function drawQuiz(pool: readonly Question[], config: QuizConfig): DrawnQuestion[] {
  const { size, subject, pinMustQuestions } = config;

  const available = subject ? pool.filter((q) => q.subject === subject) : pool.slice();
  if (available.length <= size) return shuffle(available).map(shuffleOptions);

  const picked: Question[] = [];
  const used = new Set<string>();

  const take = (qs: Question[], n: number) => {
    for (const q of qs) {
      if (picked.length >= size || n <= 0) break;
      if (used.has(q.id)) continue;
      used.add(q.id);
      picked.push(q);
      n--;
    }
  };

  if (pinMustQuestions) {
    take(shuffle(available.filter((q) => q.tier === "must")), Math.ceil(size * MUST_RATIO));
  }

  const subjects: Subject[] = subject ? [subject] : [1, 2];

  // 各科目在「整份試卷」中的目標題數（已含必考題佔掉的名額）
  const target = new Map<Subject, number>();
  if (subjects.length === 1) {
    target.set(subjects[0], size);
  } else {
    let assigned = 0;
    subjects.forEach((s, idx) => {
      const n = idx === subjects.length - 1 ? size - assigned : Math.round(size * SUBJECT_RATIO[s]);
      target.set(s, Math.max(0, n));
      assigned += n;
    });
  }

  for (const s of subjects) {
    const already = picked.filter((q) => q.subject === s).length;
    const want = Math.max(0, (target.get(s) ?? 0) - already);
    if (want === 0) continue;

    const bySubject = available.filter((q) => q.subject === s && !used.has(q.id));

    // 重要題與細節題按比例分配，讓細節題也有機會被抽到
    const before = picked.length;
    take(shuffle(bySubject.filter((q) => q.tier === "core")), Math.round(want * CORE_SHARE));
    const gotCore = picked.length - before;
    take(shuffle(bySubject.filter((q) => q.tier === "detail")), want - gotCore);

    // 某一層題目不夠時，用該科目剩下的任何題目補滿
    const short = want - (picked.length - before);
    if (short > 0) {
      take(shuffle(available.filter((q) => q.subject === s && !used.has(q.id))), short);
    }
  }

  // 某一科題目不夠時，用剩下的任何題目補滿
  if (picked.length < size) {
    take(shuffle(available.filter((q) => !used.has(q.id))), size - picked.length);
  }

  return shuffle(picked).map(shuffleOptions);
}

/** 題庫統計，給首頁顯示 */
export function poolStats(pool: readonly Question[]) {
  const byChapter = new Map<string, number>();
  for (const q of pool) byChapter.set(q.chapter, (byChapter.get(q.chapter) ?? 0) + 1);
  return {
    total: pool.length,
    subject1: pool.filter((q) => q.subject === 1).length,
    subject2: pool.filter((q) => q.subject === 2).length,
    must: pool.filter((q) => q.tier === "must").length,
    chapters: [...byChapter.entries()].map(([chapter, count]) => ({ chapter, count })),
  };
}
