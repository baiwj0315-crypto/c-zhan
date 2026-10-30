import { CARDS, cardById, questionById } from "@/lib/content";

export const STORAGE_KEY = "c-zhan-study-v1";

export type WrongRow = {
  questionId: string;
  wrongCount: number;
  lastChoice: number;
  mastered: boolean;
};

export type NoteRow = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
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
};

export type AnswerResult = {
  correct: boolean;
  answerIndex: number;
  explain: string;
  snapshot: StudySnapshot;
};

type StoredState = {
  version: 1;
  cards: Record<string, { status: "cut" | "review"; touchedOn: string }>;
  attempts: { questionId: string; correct: boolean; chosen: number; at: string }[];
  wrongs: Record<string, WrongRow>;
  notes: NoteRow[];
  days: string[];
  nextNoteId: number;
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
    version: 1,
    cards: {},
    attempts: [],
    wrongs: {},
    notes: [],
    days: [],
    nextNoteId: 1,
  };
}

function readRaw(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (parsed.version !== 1) return emptyState();
    return {
      version: 1,
      cards: parsed.cards ?? {},
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      wrongs: parsed.wrongs ?? {},
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      days: Array.isArray(parsed.days) ? parsed.days : [],
      nextNoteId: typeof parsed.nextNoteId === "number" ? parsed.nextNoteId : 1,
    };
  } catch {
    return emptyState();
  }
}

function writeRaw(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function touchDay(state: StoredState, day: string) {
  if (!state.days.includes(day)) state.days.push(day);
  state.days.sort();
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
  };
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

export function submitAnswer(questionId: string, chosen: number): AnswerResult {
  const question = questionById(questionId);
  if (!question) throw new Error("没有这道题");
  if (!Number.isInteger(chosen) || chosen < 0 || chosen >= question.options.length) {
    throw new Error("选项不对");
  }
  const correct = chosen === question.answer;
  const state = readRaw();
  const day = shanghaiDay();
  const now = new Date().toISOString();
  state.attempts.push({ questionId, correct, chosen, at: now });
  if (correct) {
    const existing = state.wrongs[questionId];
    if (existing) {
      state.wrongs[questionId] = { ...existing, mastered: true };
    }
  } else {
    const existing = state.wrongs[questionId];
    state.wrongs[questionId] = {
      questionId,
      wrongCount: (existing?.wrongCount ?? 0) + 1,
      lastChoice: chosen,
      mastered: false,
    };
  }
  touchDay(state, day);
  writeRaw(state);
  return {
    correct,
    answerIndex: question.answer,
    explain: question.explain,
    snapshot: toSnapshot(state),
  };
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
