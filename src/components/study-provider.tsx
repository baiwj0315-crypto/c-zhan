import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addNote,
  clearAllProgress,
  deleteNote,
  loadSnapshot,
  masterWrong,
  saveCard,
  submitAnswer,
  type AnswerResult,
  type StudySnapshot,
} from "@/lib/storage";

type StudyContextValue = {
  snapshot: StudySnapshot;
  saveCard: (cardId: string, status: "cut" | "review") => void;
  answer: (questionId: string, chosen: number) => AnswerResult;
  master: (questionId: string) => void;
  createNote: (title: string, body: string) => void;
  removeNote: (id: number) => void;
  clearProgress: () => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<StudySnapshot>(() => loadSnapshot());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === "c-zhan-study-v1") {
        setSnapshot(loadSnapshot());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = useCallback((next: StudySnapshot) => {
    setSnapshot(next);
  }, []);

  const value = useMemo<StudyContextValue>(
    () => ({
      snapshot,
      saveCard: (cardId, status) => refresh(saveCard(cardId, status)),
      answer: (questionId, chosen) => {
        const result = submitAnswer(questionId, chosen);
        refresh(result.snapshot);
        return result;
      },
      master: (questionId) => refresh(masterWrong(questionId)),
      createNote: (title, body) => refresh(addNote(title, body)),
      removeNote: (id) => refresh(deleteNote(id)),
      clearProgress: () => refresh(clearAllProgress()),
    }),
    [snapshot, refresh],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const value = useContext(StudyContext);
  if (!value) throw new Error("StudyProvider missing");
  return value;
}
