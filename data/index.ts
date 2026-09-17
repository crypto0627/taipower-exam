import type { Question } from "@/lib/types";

import { s1PowerSystem } from "./questions/s1-power-system";
import { s1Dispatch } from "./questions/s1-dispatch";
import { s1Ancillary } from "./questions/s1-ancillary";
import { s1Market } from "./questions/s1-market";

import { s2General } from "./questions/s2-general";
import { s2Participation } from "./questions/s2-participation";
import { s2Products } from "./questions/s2-products";
import { s2Operation } from "./questions/s2-operation";
import { s2Settlement } from "./questions/s2-settlement";
import { s2Compliance } from "./questions/s2-compliance";
import { s2Capacity } from "./questions/s2-capacity";
import { s2Future } from "./questions/s2-future";

/**
 * 全題庫。
 *
 * 要新增題目：在 data/questions/ 建立（或編輯）一個檔案，匯出 Question[]，
 * 然後在上面 import、加進下面的陣列即可。開發模式會自動熱更新。
 */
export const QUESTION_BANK: Question[] = [
  ...s1PowerSystem,
  ...s1Dispatch,
  ...s1Ancillary,
  ...s1Market,
  ...s2General,
  ...s2Participation,
  ...s2Products,
  ...s2Operation,
  ...s2Settlement,
  ...s2Compliance,
  ...s2Capacity,
  ...s2Future,
];

/** 開發時檢查 id 是否重複 —— 重複會讓抽題去重誤判 */
if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const q of QUESTION_BANK) {
    if (seen.has(q.id)) dupes.push(q.id);
    seen.add(q.id);
  }
  if (dupes.length) {
    // eslint-disable-next-line no-console
    console.warn("[題庫] 發現重複的題號：", dupes.join(", "));
  }
}
