import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CHAPTERS, QUESTIONS, chapterTitle, type Question } from "@/lib/content";
import { CodeBlock } from "@/components/code-block";
import { Shell } from "@/components/shell";
import { useStudy } from "@/components/study-provider";

export function QuizPage() {
  const [params] = useSearchParams();
  const startChapterRaw = Number(params.get("chapter") ?? 0);
  const startChapter =
    Number.isFinite(startChapterRaw) && startChapterRaw >= 0 && startChapterRaw <= 10 ? Math.trunc(startChapterRaw) : 0;
  const auto = params.get("auto") === "1";

  const { answer } = useStudy();
  const [chapter, setChapter] = useState(0);
  const [items, setItems] = useState<Question[] | null>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    if (!auto || autoStarted || items) return;
    start(startChapter);
    setAutoStarted(true);
  }, [auto, autoStarted, items, startChapter]);

  const current = items?.[step];

  function start(nextChapter: number) {
    const pool = nextChapter > 0 ? QUESTIONS.filter((item) => item.chapter === nextChapter) : QUESTIONS;
    const size = nextChapter > 0 ? pool.length : 6;
    const chosen = [...pool].sort(() => Math.random() - 0.5).slice(0, size);
    setChapter(nextChapter);
    setItems(chosen);
    setStep(0);
    setPicked(null);
    setVerdict(null);
    setScore(0);
    setDone(false);
    setError(null);
  }

  function choose(index: number) {
    if (!current || picked !== null) return;
    try {
      const result = answer(current.id, index);
      setPicked(index);
      setVerdict(result.explain);
      if (result.correct) setScore((value) => value + 1);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "这题没记下来");
    }
  }

  function next() {
    if (!items) return;
    if (step + 1 >= items.length) {
      setDone(true);
      return;
    }
    setStep((value) => value + 1);
    setPicked(null);
    setVerdict(null);
  }

  return (
    <Shell>
      <p className="text-sm text-muted">做题</p>
      <h1 className="text-2xl font-medium">
        {items && !done ? `${chapter > 0 ? chapterTitle(chapter) : "综合"} · ${step + 1}/${items.length}` : "选一组题"}
      </h1>

      {!items || done ? (
        <div className="mt-5">
          {done && items ? (
            <section className="mb-5 rounded-2xl border border-line bg-card p-5">
              <p className="text-sm text-muted">这一组</p>
              <p className="mt-2 text-3xl font-medium">
                {score}
                <span className="text-lg text-muted">/{items.length}</span>
              </p>
              <p className="mt-2 text-sm text-muted">答错的已经放进错题本。答对过的错题会标成已掌握。</p>
              <Link to="/wrongs" className="mt-4 flex min-h-12 items-center justify-center rounded-xl border border-line">
                去错题本
              </Link>
            </section>
          ) : (
            <p className="text-sm leading-relaxed text-muted">点一下就判。错了会写进本机错题本，下次还能重做。</p>
          )}
          <button
            type="button"
            onClick={() => start(0)}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-accent text-bg"
          >
            综合 6 题
          </button>
          <ul className="mt-3 flex flex-col gap-2">
            {CHAPTERS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => start(item.id)}
                  className="flex min-h-12 w-full items-center justify-between rounded-xl border border-line bg-card px-4"
                >
                  <span>
                    {String(item.id).padStart(2, "0")} {item.title}
                  </span>
                  <span className="text-sm text-muted">
                    {QUESTIONS.filter((question) => question.chapter === item.id).length} 题
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : current ? (
        <div className="mt-5">
          <p className="text-xs text-muted">{chapterTitle(current.chapter)}</p>
          <h2 className="mt-2 text-lg leading-snug font-medium">{current.prompt}</h2>
          {current.code ? (
            <div className="mt-4">
              <CodeBlock code={current.code} />
            </div>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            {current.options.map((option, index) => {
              const revealed = picked !== null;
              const isAnswer = index === current.answer;
              const isPicked = index === picked;
              const tone = !revealed
                ? "border-line bg-card"
                : isAnswer
                  ? "border-accent bg-card text-accent"
                  : isPicked
                    ? "border-warn bg-card text-warn"
                    : "border-line bg-card text-muted";
              return (
                <button
                  key={option}
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(index)}
                  className={`min-h-12 rounded-xl border px-4 text-left ${tone}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
          {verdict ? <p className="mt-4 text-sm leading-relaxed text-muted">{verdict}</p> : null}
          {picked !== null ? (
            <button type="button" onClick={next} className="mt-4 min-h-12 w-full rounded-xl bg-accent text-bg">
              {step + 1 >= (items?.length ?? 0) ? "看结果" : "下一题"}
            </button>
          ) : null}
        </div>
      ) : null}
    </Shell>
  );
}
