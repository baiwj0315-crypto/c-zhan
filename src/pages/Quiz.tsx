import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CHAPTERS,
  DAILY_GOAL,
  QUESTIONS,
  cardById,
  chapterTitle,
  isTextAnswer,
  questionKind,
  type Question,
} from "@/lib/content";
import { pickQuestions } from "@/lib/storage";
import { CodeBlock } from "@/components/code-block";
import { Shell } from "@/components/shell";
import { useStudy } from "@/components/study-provider";

const KIND_LABEL: Record<string, string> = {
  choice: "选择",
  judge: "判断",
  fill: "填空",
  output: "看输出",
};

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
  const [fillValue, setFillValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<string | null>(null);
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
  const progressPct = items && items.length ? Math.round(((step + (submitted ? 1 : 0)) / items.length) * 100) : 0;

  function start(nextChapter: number) {
    const chosen = pickQuestions(nextChapter, DAILY_GOAL);
    setChapter(nextChapter);
    setItems(chosen);
    setStep(0);
    resetQuestionState();
    setScore(0);
    setDone(false);
    setError(null);
  }

  function resetQuestionState() {
    setPicked(null);
    setFillValue("");
    setSubmitted(false);
    setWasCorrect(null);
    setVerdict(null);
    setAnswerText(null);
  }

  function choose(index: number) {
    if (!current || submitted) return;
    try {
      const result = answer(current.id, { choice: index });
      setPicked(index);
      setSubmitted(true);
      setWasCorrect(result.correct);
      setVerdict(result.explain);
      setAnswerText(result.answerText);
      if (result.correct) setScore((value) => value + 1);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "这题没记下来");
    }
  }

  function submitFill() {
    if (!current || submitted) return;
    try {
      const result = answer(current.id, { text: fillValue });
      setSubmitted(true);
      setWasCorrect(result.correct);
      setVerdict(result.explain);
      setAnswerText(result.answerText);
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
    resetQuestionState();
  }

  const related =
    current?.cardIds
      ?.map((id) => cardById(id)?.term)
      .filter(Boolean)
      .join(" · ") ?? "";

  return (
    <Shell>
      <p className="text-sm text-muted">做题</p>
      <h1 className="text-2xl font-medium">
        {items && !done ? `${chapter > 0 ? chapterTitle(chapter) : "综合"} · ${step + 1}/${items.length}` : "选一组题"}
      </h1>

      {items && !done ? (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              进度 {step + 1}/{items.length}
            </span>
            <span>已对 {score}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${Math.max(progressPct, items.length ? ((step + 0.15) / items.length) * 100 : 0)}%` }}
            />
          </div>
        </div>
      ) : null}

      {!items || done ? (
        <div className="mt-5">
          {done && items ? (
            <section className="mb-5 rounded-2xl border border-line bg-card p-5">
              <p className="text-sm text-muted">这一组</p>
              <p className="mt-2 text-3xl font-medium">
                {score}
                <span className="text-lg text-muted">/{items.length}</span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${items.length ? Math.round((score / items.length) * 100) : 0}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted">
                答错已进错题本；关联知识点的掌握度已更新。选题会少重复刚做过的题。
              </p>
              <Link to="/wrongs" className="mt-4 flex min-h-12 items-center justify-center rounded-xl border border-line">
                去错题本
              </Link>
            </section>
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              每组约 {DAILY_GOAL} 题。优先抽很久没做、从没做过或错过的题；支持选择、判断、填空和看输出。
            </p>
          )}
          <button
            type="button"
            onClick={() => start(0)}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-accent text-bg"
          >
            综合 {DAILY_GOAL} 题
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full border border-line px-2 py-0.5">{chapterTitle(current.chapter)}</span>
            <span className="rounded-full border border-line px-2 py-0.5">
              {KIND_LABEL[questionKind(current)] ?? "题目"}
            </span>
            {current.source ? <span className="rounded-full border border-line px-2 py-0.5">{current.source}</span> : null}
          </div>
          <h2 className="mt-2 text-lg leading-snug font-medium">{current.prompt}</h2>
          {related ? <p className="mt-1.5 text-xs text-muted">考点：{related}</p> : null}
          {current.code ? (
            <div className="mt-4">
              <CodeBlock code={current.code} />
            </div>
          ) : null}

          {isTextAnswer(current) ? (
            <div className="mt-4">
              <input
                value={fillValue}
                onChange={(event) => setFillValue(event.target.value)}
                disabled={submitted}
                placeholder="在这里填写答案"
                className="w-full rounded-xl border border-line bg-card px-4 py-3 outline-none disabled:opacity-70"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitFill();
                  }
                }}
              />
              {!submitted ? (
                <button
                  type="button"
                  onClick={submitFill}
                  disabled={!fillValue.trim()}
                  className="mt-3 min-h-12 w-full rounded-xl bg-accent text-bg disabled:opacity-40"
                >
                  提交
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {(current.options ?? []).map((option, index) => {
                const revealed = submitted;
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
                    key={`${current.id}-${option}-${index}`}
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
          )}

          {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}

          {submitted ? (
            <div className="mt-4 rounded-xl border border-line bg-card/80 px-4 py-3">
              <p className={`text-sm font-medium ${wasCorrect ? "text-accent" : "text-warn"}`}>
                {wasCorrect ? "答对了" : "答错了"}
                {!wasCorrect && answerText ? ` · 答案：${answerText}` : null}
              </p>
              {verdict ? <p className="mt-2 text-sm leading-relaxed text-muted">{verdict}</p> : null}
            </div>
          ) : null}

          {submitted ? (
            <button type="button" onClick={next} className="mt-4 min-h-12 w-full rounded-xl bg-accent text-bg">
              {step + 1 >= (items?.length ?? 0) ? "看结果" : "下一题"}
            </button>
          ) : null}
        </div>
      ) : null}
    </Shell>
  );
}
