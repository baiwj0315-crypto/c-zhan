import { useState } from "react";
import { questionById } from "@/lib/content";
import { CodeBlock } from "@/components/code-block";
import { Shell } from "@/components/shell";
import { useStudy } from "@/components/study-provider";

export function WrongsPage() {
  const { snapshot, answer, master } = useStudy();
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [redoId, setRedoId] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = snapshot.wrongs.filter((row) => (onlyOpen ? !row.mastered : true));
  const redo = redoId ? questionById(redoId) : null;

  function choose(index: number) {
    if (!redo || picked !== null) return;
    try {
      const result = answer(redo.id, index);
      setPicked(index);
      setVerdict(result.correct ? `对了。${result.explain}` : result.explain);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "没有记下来");
    }
  }

  return (
    <Shell>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">回看</p>
          <h1 className="text-2xl font-medium">错题本</h1>
        </div>
        <button type="button" onClick={() => setOnlyOpen((value) => !value)} className="min-h-11 text-sm text-accent">
          {onlyOpen ? "含已掌握" : "只看未掌握"}
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">做错会留在本机。重做对了，或你自己标成已掌握，就不再挡在未掌握里。</p>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="text-lg font-medium">{onlyOpen ? "没有未掌握的错题" : "错题本还是空的"}</h2>
          <p className="mt-2 text-sm text-muted">去做一组题。答错的会自动出现在这里。</p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {rows.map((row) => {
            const question = questionById(row.questionId);
            if (!question) return null;
            const yours = question.options[row.lastChoice] ?? "—";
            const right = question.options[question.answer];
            return (
              <li key={row.questionId} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{row.mastered ? "已掌握" : `错了 ${row.wrongCount} 次`}</span>
                </div>
                <p className="mt-2 font-medium">{question.prompt}</p>
                <p className="mt-2 text-sm text-muted">
                  你上次选的是「{yours}」。答案是「{right}」。
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRedoId(question.id);
                      setPicked(null);
                      setVerdict(null);
                      setError(null);
                    }}
                    className="min-h-11 rounded-xl bg-accent text-bg"
                  >
                    重做
                  </button>
                  <button
                    type="button"
                    disabled={row.mastered}
                    onClick={() => {
                      try {
                        master(question.id);
                      } catch (caught) {
                        setError(caught instanceof Error ? caught.message : "没有标上");
                      }
                    }}
                    className="min-h-11 rounded-xl border border-line disabled:opacity-40"
                  >
                    标成已掌握
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}

      {redo ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-bg/80" onClick={() => setRedoId(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="重做错题"
            className="max-h-dvh w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-card p-5 pb-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">重做</p>
              <button type="button" onClick={() => setRedoId(null)} className="min-h-11 px-2 text-sm text-muted">
                关闭
              </button>
            </div>
            <h2 className="mt-2 text-lg font-medium">{redo.prompt}</h2>
            {redo.code ? (
              <div className="mt-3">
                <CodeBlock code={redo.code} />
              </div>
            ) : null}
            <div className="mt-4 flex flex-col gap-2">
              {redo.options.map((option, index) => {
                const revealed = picked !== null;
                const tone = !revealed
                  ? "border-line"
                  : index === redo.answer
                    ? "border-accent text-accent"
                    : index === picked
                      ? "border-warn text-warn"
                      : "border-line text-muted";
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={revealed}
                    onClick={() => choose(index)}
                    className={`min-h-12 rounded-xl border bg-bg px-4 text-left ${tone}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {verdict ? <p className="mt-4 text-sm leading-relaxed text-muted">{verdict}</p> : null}
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
