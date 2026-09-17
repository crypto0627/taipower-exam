/**
 * 題庫資料型別
 *
 * 新增題目時只要照這個介面寫，放進 data/questions/ 底下任一檔案即可，
 * 抽題引擎會自動納入。
 */

/** 考試科目：1 = 電力系統與電力市場基礎知識；2 = 電力交易平台市場規則 */
export type Subject = 1 | 2;

/**
 * 重要度分級
 * - `must`   必考題：核心數字、條文門檻，每次測驗都會出現
 * - `core`   重要題：常考觀念，優先於細節題被抽中
 * - `detail` 細節題：補完整度用，抽中機率較低
 */
export type Tier = "must" | "core" | "detail";

export interface Question {
  /** 全題庫唯一。命名慣例：<章節代碼>-<流水號>，例如 "PRD-014" */
  id: string;
  subject: Subject;
  /** 章節名稱，結果頁會依此統計弱點 */
  chapter: string;
  tier: Tier;
  /** 題幹 */
  q: string;
  /** 選項，固定四個；作答時會被打亂 */
  options: [string, string, string, string];
  /** 正解在 options 中的索引（0-3），以「未打亂前」的順序為準 */
  answer: 0 | 1 | 2 | 3;
  /** 解析：為什麼這是對的、以及錯選常見的原因 */
  explain: string;
  /** 條文／文件出處 */
  source: string;
}

/** 抽題後、進入作答狀態的題目（選項已打亂） */
export interface DrawnQuestion extends Omit<Question, "options" | "answer"> {
  options: string[];
  /** 打亂後的正解索引 */
  answer: number;
}

export interface QuizConfig {
  /** 每份試卷題數 */
  size: number;
  /** 只抽特定科目；null = 兩科都抽 */
  subject: Subject | null;
  /** 是否強制納入所有必考題 */
  pinMustQuestions: boolean;
}

export interface ChapterScore {
  chapter: string;
  subject: Subject;
  total: number;
  correct: number;
}
