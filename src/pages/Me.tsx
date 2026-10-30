import { useState, type FormEvent } from "react";
import { Shell } from "@/components/shell";
import { useStudy } from "@/components/study-provider";
import { STORAGE_KEY } from "@/lib/storage";

export function MePage() {
  const { snapshot, createNote, removeNote, clearProgress } = useStudy();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [clearArmed, setClearArmed] = useState(false);
  const [clearedHint, setClearedHint] = useState<string | null>(null);

  const openWrongs = snapshot.wrongs.filter((row) => !row.mastered).length;

  function onCreate(event: FormEvent) {
    event.preventDefault();
    try {
      createNote(title, body);
      setTitle("");
      setBody("");
      setFormError(null);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : "笔记没写进去");
    }
  }

  return (
    <Shell>
      <p className="text-sm text-muted">我的</p>
      <h1 className="text-2xl font-medium">学习账本</h1>

      <section className="mt-5 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-lg font-medium">进度在本机</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          不需要登录。斩卡、做题、错题本和笔记都存在当前手机浏览器的本地存储里（键名{" "}
          <code className="rounded bg-bg px-1 font-mono text-xs">{STORAGE_KEY}</code>
          ）。清站点数据、换浏览器或换设备都不同步，也不会自动备份。
        </p>
      </section>

      <h2 className="mt-8 text-lg font-medium">本机数据</h2>
      <dl className="mt-4 overflow-hidden rounded-2xl border border-line">
        <Row label="已斩知识点" value={`${snapshot.cutIds.length} 条`} />
        <Row label="做题记录" value={`${snapshot.attempts} 条`} />
        <Row label="未掌握错题" value={`${openWrongs} 条`} />
        <Row label="笔记" value={`${snapshot.notes.length} 条`} />
        <Row label="连续天数" value={`${snapshot.streak} 天`} />
      </dl>

      <form onSubmit={onCreate} className="mt-5 flex flex-col gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={40}
          placeholder="笔记标题，例如：整除总是丢掉小数"
          className="w-full rounded-xl border border-line bg-card px-4 py-3 outline-none"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={800}
          rows={4}
          placeholder="写给以后的自己。比如一道题为什么错。"
          className="w-full resize-none rounded-xl border border-line bg-card px-4 py-3 outline-none"
        />
        {formError ? <p className="text-sm text-warn">{formError}</p> : null}
        <button
          type="submit"
          disabled={!title.trim() || !body.trim()}
          className="min-h-12 rounded-xl bg-accent text-bg disabled:opacity-40"
        >
          写入本机笔记
        </button>
      </form>

      <ul className="mt-5 flex flex-col gap-3">
        {snapshot.notes.map((note) => (
          <li key={note.id} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-medium">{note.title}</h3>
              <span className="shrink-0 text-xs text-muted">{note.createdAt}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{note.body}</p>
            <button
              type="button"
              onClick={() => {
                if (pendingDelete !== note.id) {
                  setPendingDelete(note.id);
                  return;
                }
                try {
                  removeNote(note.id);
                  setPendingDelete(null);
                } catch (caught) {
                  setFormError(caught instanceof Error ? caught.message : "没有删掉");
                }
              }}
              className="mt-3 min-h-11 text-sm text-warn"
            >
              {pendingDelete === note.id ? "再点一次确认删除" : "删除"}
            </button>
          </li>
        ))}
      </ul>
      {snapshot.notes.length === 0 ? <p className="mt-4 text-sm text-muted">还没有笔记。上面写一条，就会留在这里。</p> : null}

      <section className="mt-10 rounded-2xl border border-warn/40 bg-card p-5">
        <h2 className="text-lg font-medium text-warn">清除本地进度</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          会删掉本机全部斩卡、做题、错题和笔记，且无法恢复。清浏览器缓存也会有同样效果。
        </p>
        <button
          type="button"
          onClick={() => {
            if (!clearArmed) {
              setClearArmed(true);
              setClearedHint(null);
              return;
            }
            clearProgress();
            setClearArmed(false);
            setClearedHint("已清除本机进度");
          }}
          className="mt-4 min-h-12 w-full rounded-xl border border-warn text-warn"
        >
          {clearArmed ? "再点一次确认清除" : "清除本地进度"}
        </button>
        {clearedHint ? <p className="mt-3 text-sm text-muted">{clearedHint}</p> : null}
      </section>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-card px-4 py-3 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
