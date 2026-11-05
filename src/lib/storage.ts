import {
  CARDS,
  CHAPTERS,
  DAILY_GOAL,
  QUESTIONS,
  cardById,
  checkQuestionAnswer,
  correctLabel,
  questionById,
  type Question,
} from "@/lib/content";

export const STORAGE_KEY = "c-zhan-study-v1";

export type MasteryLevel = "未练" | "需复习" | "初识" | "较熟" | "掌握";

export type WrongRow = {
  questionId: string;
  wrongCount: number;
  /** 选择题上次选项下标；填空题为 -1 */
  lastChoice: number;
  /** 上次作答原文（填空或选项文字） */
  lastText?: string;
  mastered: boolean;
};

export type NoteRow = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
};

export type CardMastery = {
  cardId: string;
  streak: number;
  correct: number;
  wrong: number;
  lastAt: string;
  level: MasteryLevel;
};

export type ChapterMastery = {
  chapter: number;
  title: string;
  total: number;
  practiced: number;
  mastered: number;
  review: number;
  /** 0–100，按知识点等级加权 */
  pct: number;
};

export type StudySnapshot = {
  today: string;
  streak: number;
  cutIds: string[];
  reviewIds: string[];
  todayCut: number;
  attempts: number;
  correct: number;
  wrongs: WrongRow[];
  notes: NoteRow[];
  totalCards: number;
  cardMastery: CardMastery[];
  chapterMastery: ChapterMastery[];
};

export type AnswerPayload = {
  choice?: number;
  text?: string;
};

export type AnswerResult = {
  correct: boolean;
  answerIndex?: number;
  answerText: string;
  explain: string;
  snapshot: StudySnapshot;
};

type LastAnswered = {
  at: string;
  correct: boolean;
};

type MasteryRow = {
  streak: number;
  correct: number;
  wrong: number;
  lastAt: string;
};

type StoredState = {
  version: 2;
  cards: Record<string, { status: "cut" | "review"; touchedOn: string }>;
  attempts: { questionId: string; correct: boolean; chosen: number; text?: string; at: string }[];
  wrongs: Record<string, WrongRow>;
  notes: NoteRow[];
  days: string[];
  nextNoteId: number;
  /** 每题最近作答 */
  lastAnswered: Record<string, LastAnswered>;
  /** 知识点掌握 */
  mastery: Record<string, MasteryRow>;
};

function shanghaiDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(iso: string, amount: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const next = new Date(Date.UTC(year, (month ?? 1) - 1, (day ?? 1) + amount));
  return next.toISOString().slice(0, 10);
}

function streakFrom(days: string[], today: string): number {
  const set = new Set(days);
  let cursor = today;
  if (!set.has(cursor)) {
    cursor = addDays(today, -1);
    if (!set.has(cursor)) return 0;
  }
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

function asStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function emptyState(): StoredState {
  return {
    version: 2,
    cards: {},
    attempts: [],
    wrongs: {},
    notes: [],
    days: [],
    nextNoteId: 1,
    lastAnswered: {},
    mastery: {},
  };
}

function levelFrom(row: MasteryRow | undefined): MasteryLevel {
  if (!row || (row.correct === 0 && row.wrong === 0)) return "未练";
  if (row.streak <= 0) return "需复习";
  if (row.streak === 1) return "初识";
  // streak 2–5：较熟；≥6 才算掌握（收紧，避免题少时很快满进度）
  if (row.streak < 6) return "较熟";
  return "掌握";
}

function levelWeight(level: MasteryLevel): number {
  switch (level) {
    case "未练":
      return 0;
    case "需复习":
      return 10;
    case "初识":
      return 25;
    case "较熟":
      return 55;
    case "掌握":
      return 100;
  }
}

function readRaw(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as {
      version?: number;
      cards?: StoredState["cards"];
      attempts?: StoredState["attempts"];
      wrongs?: StoredState["wrongs"];
      notes?: NoteRow[];
      days?: string[];
      nextNoteId?: number;
      lastAnswered?: Record<string, LastAnswered>;
      mastery?: Record<string, MasteryRow>;
    };
    // 兼容 v1：接受 version 1/缺失，升级字段
    if (parsed.version !== undefined && parsed.version !== 1 && parsed.version !== 2) {
      return emptyState();
    }
    const attempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
    const lastAnswered: Record<string, LastAnswered> = { ...(parsed.lastAnswered ?? {}) };
    // 从旧 attempts 回填 lastAnswered（仅缺省时）
    for (const row of attempts) {
      if (!row?.questionId || !row.at) continue;
      const prev = lastAnswered[row.questionId];
      if (!prev || prev.at < row.at) {
        lastAnswered[row.questionId] = { at: row.at, correct: !!row.correct };
      }
    }
    return {
      version: 2,
      cards: parsed.cards ?? {},
      attempts,
      wrongs: parsed.wrongs ?? {},
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      days: Array.isArray(parsed.days) ? parsed.days : [],
      nextNoteId: typeof parsed.nextNoteId === "number" ? parsed.nextNoteId : 1,
      lastAnswered,
      mastery: parsed.mastery ?? {},
    };
  } catch {
    return emptyState();
  }
}

function writeRaw(state: StoredState) {
  state.version = 2;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function touchDay(state: StoredState, day: string) {
  if (!state.days.includes(day)) state.days.push(day);
  state.days.sort();
}

function updateMastery(state: StoredState, cardIds: string[], correct: boolean, at: string) {
  for (const cardId of cardIds) {
    if (!cardById(cardId)) continue;
    const prev = state.mastery[cardId] ?? { streak: 0, correct: 0, wrong: 0, lastAt: "" };
    if (correct) {
      state.mastery[cardId] = {
        streak: prev.streak + 1,
        correct: prev.correct + 1,
        wrong: prev.wrong,
        lastAt: at,
      };
    } else {
      state.mastery[cardId] = {
        streak: 0,
        correct: prev.correct,
        wrong: prev.wrong + 1,
        lastAt: at,
      };
    }
  }
}

function buildCardMastery(state: StoredState): CardMastery[] {
  return CARDS.map((card) => {
    const row = state.mastery[card.id];
    return {
      cardId: card.id,
      streak: row?.streak ?? 0,
      correct: row?.correct ?? 0,
      wrong: row?.wrong ?? 0,
      lastAt: row?.lastAt ?? "",
      level: levelFrom(row),
    };
  });
}


function toSnapshot(state: StoredState): StudySnapshot {
  const today = shanghaiDay();
  const cutIds: string[] = [];
  const reviewIds: string[] = [];
  let todayCut = 0;
  for (const [id, row] of Object.entries(state.cards)) {
    if (!cardById(id)) continue;
    if (row.status === "cut") {
      cutIds.push(id);
      if (row.touchedOn === today) todayCut += 1;
    } else if (row.status === "review") {
      reviewIds.push(id);
    }
  }
  const attempts = state.attempts.length;
  const correct = state.attempts.filter((row) => row.correct).length;
  const wrongs = Object.values(state.wrongs)
    .filter((row) => questionById(row.questionId))
    .sort((a, b) => b.wrongCount - a.wrongCount);
  const cardMastery = buildCardMastery(state);
  return {
    today,
    streak: streakFrom(state.days, today),
    cutIds,
    reviewIds,
    todayCut,
    attempts,
    correct,
    wrongs,
    notes: [...state.notes],
    totalCards: CARDS.length,
    cardMastery,
    chapterMastery: buildChapterMasteryFixed(cardMastery),
  };
}

function buildChapterMasteryFixed(cards: CardMastery[]): ChapterMastery[] {
  return CHAPTERS.map((chapter) => {
    const scoped = cards.filter((row) => cardById(row.cardId)?.chapter === chapter.id);
    const total = scoped.length;
    const practiced = scoped.filter((row) => row.level !== "未练").length;
    // 章节「掌握」计数只计真正掌握，避免「较熟」就把进度刷满
    const mastered = scoped.filter((row) => row.level === "掌握").length;
    const review = scoped.filter((row) => row.level === "需复习").length;
    const pct = total
      ? Math.round(scoped.reduce((sum, row) => sum + levelWeight(row.level), 0) / total)
      : 0;
    return {
      chapter: chapter.id,
      title: chapter.title,
      total,
      practiced,
      mastered,
      review,
      pct,
    };
  });
}

export function loadSnapshot(): StudySnapshot {
  return toSnapshot(readRaw());
}

export function clearAllProgress(): StudySnapshot {
  localStorage.removeItem(STORAGE_KEY);
  return toSnapshot(emptyState());
}

export function saveCard(cardId: string, status: "cut" | "review"): StudySnapshot {
  if (!cardById(cardId)) throw new Error("没有这张卡片");
  if (status !== "cut" && status !== "review") throw new Error("状态不对");
  const state = readRaw();
  const day = shanghaiDay();
  state.cards[cardId] = { status, touchedOn: day };
  touchDay(state, day);
  writeRaw(state);
  return toSnapshot(state);
}

export function submitAnswer(questionId: string, payload: AnswerPayload): AnswerResult {
  const question = questionById(questionId);
  if (!question) throw new Error("没有这道题");

  const correct = checkQuestionAnswer(question, payload);
  const options = question.options ?? [];
  const chosen =
    typeof payload.choice === "number" && Number.isInteger(payload.choice) ? payload.choice : -1;
  const text =
    payload.text?.trim() ||
    (chosen >= 0 && chosen < options.length ? options[chosen] : undefined);

  if (!isTextLike(question)) {
    if (chosen < 0 || chosen >= options.length) throw new Error("选项不对");
  } else if (!(payload.text ?? "").trim()) {
    throw new Error("请先填写答案");
  }

  const state = readRaw();
  const day = shanghaiDay();
  const now = new Date().toISOString();
  state.attempts.push({ questionId, correct, chosen, text, at: now });
  state.lastAnswered[questionId] = { at: now, correct };

  if (correct) {
    const existing = state.wrongs[questionId];
    if (existing) {
      state.wrongs[questionId] = { ...existing, mastered: true, lastText: text };
    }
  } else {
    const existing = state.wrongs[questionId];
    state.wrongs[questionId] = {
      questionId,
      wrongCount: (existing?.wrongCount ?? 0) + 1,
      lastChoice: chosen,
      lastText: text,
      mastered: false,
    };
  }

  updateMastery(state, question.cardIds ?? [], correct, now);
  touchDay(state, day);
  writeRaw(state);

  return {
    correct,
    answerIndex: question.answer,
    answerText: correctLabel(question),
    explain: question.explain,
    snapshot: toSnapshot(state),
  };
}

function isTextLike(question: Question): boolean {
  const kind = question.kind ?? "choice";
  if (kind === "fill") return true;
  if (kind === "output" && (!question.options || question.options.length === 0)) return true;
  return false;
}

export function masterWrong(questionId: string): StudySnapshot {
  if (!questionById(questionId)) throw new Error("没有这道题");
  const state = readRaw();
  const existing = state.wrongs[questionId];
  if (existing) {
    state.wrongs[questionId] = { ...existing, mastered: true };
    writeRaw(state);
  }
  return toSnapshot(state);
}

function cleanText(value: string, max: number, label: string): string {
  const text = value.trim();
  if (!text) throw new Error(`请填写${label}`);
  if (text.length > max) throw new Error(`${label}太长了`);
  return text;
}

export function addNote(title: string, body: string): StudySnapshot {
  const state = readRaw();
  const note: NoteRow = {
    id: state.nextNoteId,
    title: cleanText(title, 40, "标题"),
    body: cleanText(body, 800, "内容"),
    createdAt: asStamp(new Date().toISOString()),
  };
  state.nextNoteId += 1;
  state.notes = [note, ...state.notes].slice(0, 50);
  writeRaw(state);
  return toSnapshot(state);
}

export function deleteNote(id: number): StudySnapshot {
  if (!Number.isInteger(id) || id <= 0) throw new Error("笔记不存在");
  const state = readRaw();
  state.notes = state.notes.filter((note) => note.id !== id);
  writeRaw(state);
  return toSnapshot(state);
}

/**
 * 选题：优先从没做过 / 错过 / 很久没做的题；压低刚做过的；本轮不重复。
 */
export function pickQuestions(chapter: number, size = DAILY_GOAL): Question[] {
  const pool =
    chapter > 0 ? QUESTIONS.filter((item) => item.chapter === chapter) : [...QUESTIONS];
  if (pool.length === 0) return [];

  const state = readRaw();
  const now = Date.now();
  const halfHour = 30 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;

  const scored = pool.map((question) => {
    let score = Math.random() * 40;
    const last = state.lastAnswered[question.id];
    const wrong = state.wrongs[question.id];

    if (!last) {
      score += 1200;
    } else {
      const age = Math.max(0, now - new Date(last.at).getTime());
      if (age < halfHour) score -= 900;
      else score += Math.min(age / dayMs, 14) * 60;
      if (!last.correct) score += 420;
    }

    if (wrong && !wrong.mastered) score += 380;

    // 关联知识点若「需复习 / 未练」，略加分
    for (const cardId of question.cardIds ?? []) {
      const level = levelFrom(state.mastery[cardId]);
      if (level === "未练") score += 40;
      if (level === "需复习") score += 70;
      if (level === "掌握") score -= 25;
    }

    return { question, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const limit =
    chapter > 0
      ? Math.min(Math.max(size, 1), pool.length <= size + 2 ? pool.length : size)
      : Math.min(size, pool.length);

  const picked: Question[] = [];
  const usedCards = new Set<string>();

  for (const row of scored) {
    if (picked.length >= limit) break;
    // 轻微鼓励覆盖不同知识点，但不强阻塞
    const overlap = (row.question.cardIds ?? []).filter((id) => usedCards.has(id)).length;
    if (overlap > 0 && picked.length + 1 < limit && Math.random() < 0.35) {
      continue;
    }
    picked.push(row.question);
    for (const id of row.question.cardIds ?? []) usedCards.add(id);
  }

  // 若因多样性跳过导致不足，再按分数补齐
  if (picked.length < limit) {
    for (const row of scored) {
      if (picked.length >= limit) break;
      if (picked.some((item) => item.id === row.question.id)) continue;
      picked.push(row.question);
    }
  }

  return picked;
}
