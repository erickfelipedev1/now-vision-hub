import { LayoutDashboard, X } from "lucide-react";
import { companies, user } from "@/data/mock";

export type View = "overview" | "nlg" | "j4s";

export function Sidebar({
  view,
  onNavigate,
  open,
  onClose,
}: {
  view: View;
  onNavigate: (v: View) => void;
  open: boolean;
  onClose: () => void;
}) {
  const itemCls = (active: boolean) =>
    `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
      active
        ? "bg-accent text-foreground"
        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
    }`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <LogoGrupoNow className="h-8 w-auto" />
          <button onClick={onClose} className="text-muted-foreground lg:hidden" aria-label="Fechar menu">
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            Geral
          </p>
          <button className={itemCls(view === "overview")} onClick={() => onNavigate("overview")}>
            <LayoutDashboard className="size-4" />
            Visão geral
          </button>

          <p className="px-3 pb-2 pt-5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            Empresas
          </p>
          {companies.map((c) => (
            <button key={c.id} className={itemCls(view === c.id)} onClick={() => onNavigate(c.id)}>
              <span className="size-3 rounded-[3px]" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-foreground">
              GR
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] text-foreground">{user.name}</div>
              <div className="text-[11px] text-text-tertiary">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
