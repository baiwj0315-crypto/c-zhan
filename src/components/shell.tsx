import { NavLink, useLocation } from "react-router-dom";
import { BookMarked, CircleUser, House, Library, PencilLine } from "lucide-react";
import type { ReactNode } from "react";
import { useStudy } from "@/components/study-provider";

const TABS = [
  { to: "/", label: "首页", icon: House, end: true },
  { to: "/learn", label: "知识点", icon: Library, end: false },
  { to: "/quiz", label: "做题", icon: PencilLine, end: false },
  { to: "/wrongs", label: "错题本", icon: BookMarked, end: false },
  { to: "/me", label: "我的", icon: CircleUser, end: false },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { snapshot } = useStudy();
  const openWrongs = snapshot.wrongs.filter((row) => !row.mastered).length;

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
        <main className="flex-1 px-4 pt-5 pb-24">{children}</main>
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line/60 bg-bg/95 backdrop-blur-md"
        aria-label="主导航"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((tab) => {
            const on = tab.end ? location.pathname === tab.to : location.pathname.startsWith(tab.to);
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                aria-current={on ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${on ? "text-accent" : "text-muted"}`}
              >
                <Icon className="size-[22px]" strokeWidth={on ? 2 : 1.6} aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.to === "/wrongs" && openWrongs > 0 ? (
                  <span className="absolute top-1.5 right-2.5 grid min-w-4 place-items-center rounded-full bg-warn px-1 text-[10px] leading-4 text-bg">
                    {openWrongs > 9 ? "9+" : openWrongs}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
