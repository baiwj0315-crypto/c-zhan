import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CARDS, CHAPTERS, chapterTitle, queueFor, type Card } from "@/lib/content";
import { noteFor } from "@/lib/lessons";
import { CodeBlock } from "@/components/code-block";
import { Shell } from "@/components/shell";
import { useStudy } from "@/components/study-provider";

export function LearnPage() {
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "deck" ? "deck" : "list";
  const chapterRaw = Number(params.get("chapter") ?? 0);
  const chapter = Number.isFinite(chapterRaw) && chapterRaw >= 0 && chapterRaw <= 10 ? Math.trunc(chapterRaw) : 0;

  const { snapshot, saveCard } = useStudy();
  const [query, setQuery] = useState("");
  const [passed, setPassed] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setPassed([]);
    setFlipped(false);
    setHint(null);
    setOpenId(null);
  }, [chapter, mode]);

  const cut = new Set(snapshot.cutIds);
  const review = new Set(snapshot.reviewIds);
  const queue = queueFor(chapter, cut, review, new Set(passed));
  const card = queue[0];

  const filtered = CARDS.filter((item) => {
    if (chapter > 0 && item.chapter !== chapter) return false;
    if (!query.trim()) return true;
    const note = noteFor(item.id);
    const hay = `${item.term}${item.gloss}${item.explain}${note?.body ?? ""}${note?.pitfall ?? ""}`;
    return hay.toLowerCase().includes(query.trim().toLowerCase());
  });

  const groups = (chapter > 0 ? [chapter] : CHAPTERS.map((item) => item.id))
    .map((id) => ({ id, cards: filtered.filter((item) => item.chapter === id) }))
    .filter((group) => group.cards.length > 0);

  function setModeChapter(nextMode: "list" | "deck", nextChapter: number) {
    setParams({ mode: nextMode, chapter: String(nextChapter) });
  }

  function mark(status: "cut" | "review") {
    if (!card) return;
    try {
      saveCard(card.id, status);
      setPassed((prev) => [...prev, card.id]);
      setFlipped(false);
      setHint(null);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "保存失败");
    }
  }

  return (
    <Shell>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-medium">{chapter > 0 ? chapterTitle(chapter) : "知识点"}</h1>
        <div className="grid grid-cols-2 rounded-full bg-card p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setModeChapter("list", chapter)}
            className={`rounded-full px-3.5 py-1.5 ${mode === "list" ? "bg-accent font-medium text-bg" : "text-muted"}`}
          >
            学习
          </button>
          <button
            type="button"
            onClick={() => setModeChapter("deck", chapter)}
            className={`rounded-full px-3.5 py-1.5 ${mode === "deck" ? "bg-accent font-medium text-bg" : "text-muted"}`}
          >
            斩卡
          </button>
        </div>
      </div>

      <div className="-mx-4 mt-3.5 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
        <ChapterChip chapter={0} current={chapter} mode={mode} label="全部" onPick={setModeChapter} />
        {CHAPTERS.map((item) => (
          <ChapterChip key={item.id} chapter={item.id} current={chapter} mode={mode} label={item.title} onPick={setModeChapter} />
        ))}
      </div>

      {mode === "list" ? (
        <>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索"
            className="mt-3.5 w-full rounded-xl bg-card px-4 py-3 text-ink outline-none ring-1 ring-transparent focus:ring-accent/40"
          />
          <div className="mt-4 flex flex-col gap-6">
            {groups.map((group) => (
              <section key={group.id}>
                <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
                  <h2 className="text-sm font-medium text-muted">
                    <span className="mr-1.5 font-mono">{String(group.id).padStart(2, "0")}</span>
                    {chapterTitle(group.id)}
                  </h2>
                  <span className="text-xs text-muted">{group.cards.length}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {group.cards.map((item) => (
                    <PointArticle
                      key={item.id}
                      card={item}
                      status={cut.has(item.id) ? "已斩" : review.has(item.id) ? "再看" : null}
                      open={openId === item.id}
                      onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          {filtered.length === 0 ? <p className="mt-6 text-sm text-muted">没有匹配项</p> : null}
        </>
      ) : card ? (
        <div className="mt-4">
          <p className="text-xs text-muted">
            剩 {queue.length}
            {passed.length ? ` · 已过 ${passed.length}` : ""}
          </p>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFlipped((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setFlipped((value) => !value);
              }
            }}
            className="mt-2.5 w-full rounded-2xl bg-card p-5 text-left"
          >
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{chapterTitle(card.chapter)}</span>
              <span>·</span>
              <span>{card.level}</span>
            </div>
            <h2 className="mt-5 text-2xl font-medium">{card.term}</h2>
            {flipped ? <LessonBody card={card} /> : <p className="mt-8 text-center text-sm text-muted">点一下看讲解</p>}
          </div>
          {hint ? <p className="mt-3 text-sm text-warn">{hint}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => mark("review")} className="min-h-12 rounded-xl bg-card text-muted">
              再看
            </button>
            <button type="button" onClick={() => mark("cut")} className="min-h-12 rounded-xl bg-accent font-medium text-bg">
              斩了
            </button>
          </div>
          {flipped ? (
            <Link
              to={`/quiz?chapter=${card.chapter}&auto=1`}
              className="mt-2.5 flex min-h-11 items-center justify-center rounded-xl border border-line text-sm text-ink"
            >
              去做这章题
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-card p-5 text-center">
          <p className="font-medium">{chapter > 0 ? "这章暂无待斩" : "今日已斩完"}</p>
          <button
            type="button"
            onClick={() => setModeChapter("list", chapter)}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-accent font-medium text-bg"
          >
            回学习
          </button>
        </div>
      )}
    </Shell>
  );
}

function LessonBody({ card }: { card: Card }) {
  const note = noteFor(card.id);
  return (
    <div className="mt-4 space-y-3.5">
      <p className="text-sm leading-relaxed text-accent">{card.gloss}</p>
      <p className="text-sm leading-relaxed text-ink/90">{note?.body ?? card.explain}</p>
      {note && note.remember.length > 0 ? (
        <div>
          <p className="text-[11px] tracking-wide text-muted">先记住</p>
          <ul className="mt-1.5 flex flex-col gap-1 border-l-2 border-accent/70 pl-3">
            {note.remember.map((line) => (
              <li key={line} className="text-sm leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {note?.pitfall ? (
        <p className="rounded-xl bg-warn-dim px-3 py-2.5 text-sm leading-relaxed text-warn">
          <span className="font-medium text-ink/80">易错 · </span>
          {note.pitfall}
        </p>
      ) : null}
      {card.example ? <CodeBlock code={card.example} /> : null}
    </div>
  );
}

function PointArticle({
  card,
  status,
  open,
  onToggle,
}: {
  card: Card;
  status: string | null;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl bg-card">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium">{card.term}</h3>
            {status ? (
              <span className={`shrink-0 text-[11px] ${status === "已斩" ? "text-accent" : "text-warn"}`}>{status}</span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">{card.gloss}</p>
        </div>
        <span className="shrink-0 text-muted" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-line/50 px-4 pt-1 pb-4">
          <LessonBody card={card} />
          <Link
            to={`/quiz?chapter=${card.chapter}&auto=1`}
            className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-accent font-medium text-bg"
          >
            学完了，做这章题
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function ChapterChip({
  chapter,
  current,
  mode,
  label,
  onPick,
}: {
  chapter: number;
  current: number;
  mode: "list" | "deck";
  label: string;
  onPick: (mode: "list" | "deck", chapter: number) => void;
}) {
  const on = chapter === current;
  return (
    <button
      type="button"
      onClick={() => onPick(mode, chapter)}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${on ? "bg-accent font-medium text-bg" : "bg-card text-muted"}`}
    >
      {label}
    </button>
  );
}
