import { Link } from "react-router-dom";
import { CHAPTERS, CARDS, DAILY_GOAL } from "@/lib/content";
import { Shell } from "@/components/shell";
import { useStudy } from "@/components/study-provider";

export function HomePage() {
  const { snapshot } = useStudy();

  return (
    <Shell>
      <p className="text-xs tracking-wide text-accent">C程序设计 · 第5版</p>
      <h1 className="mt-1.5 text-2xl font-medium tracking-tight">先看懂，再斩</h1>

      <section className="mt-5 rounded-2xl bg-card p-4">
        <p className="text-sm text-muted">进度保存在本机浏览器</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="今日" value={`${Math.min(snapshot.todayCut, DAILY_GOAL)}/${DAILY_GOAL}`} />
          <Stat label="连续" value={`${snapshot.streak}天`} />
          <Stat
            label="正确率"
            value={snapshot.attempts ? `${Math.round((snapshot.correct / snapshot.attempts) * 100)}%` : "—"}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          已斩 {snapshot.cutIds.length}/{snapshot.totalCards}
          {snapshot.reviewIds.length ? ` · 再看 ${snapshot.reviewIds.length}` : ""}
        </p>
        <Link
          to="/quiz?chapter=0&auto=1"
          className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-accent font-medium text-bg"
        >
          去做题
        </Link>
        <Link
          to="/learn?mode=list&chapter=0"
          className="mt-2 flex min-h-11 items-center justify-center rounded-xl text-sm text-muted"
        >
          先学知识点
        </Link>
      </section>

      <h2 className="mt-7 text-xs text-muted">十章</h2>
      <ul className="mt-2 flex flex-col gap-1.5">
        {CHAPTERS.map((chapter) => {
          const points = CARDS.filter((card) => card.chapter === chapter.id);
          const cut = snapshot.cutIds.filter((id) => points.some((card) => card.id === id)).length;
          const pct = points.length ? Math.round((cut / points.length) * 100) : 0;
          return (
            <li key={chapter.id}>
              <Link
                to={`/quiz?chapter=${chapter.id}&auto=1`}
                className="block rounded-2xl bg-card px-4 py-3.5 active:bg-line/40"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 shrink-0 font-mono text-sm text-muted">{String(chapter.id).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{chapter.title}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {cut}/{points.length}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">{chapter.blurb}</p>
                  </div>
                </div>
                <div className="mt-2.5 ml-9 h-0.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg/60 px-2 py-2 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-0.5 text-lg font-medium tabular-nums">{value}</p>
    </div>
  );
}
