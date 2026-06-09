import { useState, useRef, useCallback, useEffect } from 'preact/hooks';

// Shared UI helpers for the admin islands: a toast-like status that auto-clears,
// and a consistent status renderer with proper ARIA live-region semantics.

export type StatusKind = 'ok' | 'err' | 'info';
export type StatusMsg = { text: string; kind: StatusKind } | null;

export function useStatus() {
  const [status, setStatus] = useState<StatusMsg>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string, kind: StatusKind = 'ok', opts?: { sticky?: boolean }) => {
      if (timer.current) clearTimeout(timer.current);
      setStatus({ text, kind });
      if (!opts?.sticky) {
        const ms = kind === 'err' ? 6000 : 2800;
        timer.current = setTimeout(() => setStatus(null), ms);
      }
    },
    []
  );

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setStatus(null);
  }, []);

  return { status, show, clear };
}

export function Status({ status, class: cls = '' }: { status: StatusMsg; class?: string }) {
  const color =
    status?.kind === 'err' ? 'text-magenta' : status?.kind === 'ok' ? 'text-cyan' : 'text-mute';
  return (
    <span
      role="status"
      aria-live="polite"
      class={`text-sm transition-opacity ${status ? 'opacity-100' : 'opacity-0'} ${color} ${cls}`}
    >
      {status?.text ?? ''}
    </span>
  );
}

// Warns before leaving the page (native browser prompt) while `dirty` is true.
// In this MPA every nav link is a full navigation, so this also guards against
// losing edits when switching admin sections, reloading, or closing the tab.
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}

// Small amber marker placed beside a save button to signal pending, unsaved edits.
export function UnsavedDot() {
  return (
    <span class="text-magenta text-[11px] whitespace-nowrap">
      <span aria-hidden="true">●</span> שינויים לא נשמרו
    </span>
  );
}

// Themed, promise-based replacement for window.confirm() that matches the glass UI.
// Usage: const { confirm, confirmElement } = useConfirm();  ... if (!(await confirm('…'))) return;
// Render {confirmElement} somewhere in the component's JSX.
export type ConfirmOpts = { title?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean };
type ConfirmState = { message: string; opts: ConfirmOpts; resolve: (v: boolean) => void };

export function useConfirm() {
  const [pending, setPending] = useState<ConfirmState | null>(null);

  const confirm = useCallback(
    (message: string, opts: ConfirmOpts = {}) =>
      new Promise<boolean>((resolve) => {
        setPending((prev) => {
          prev?.resolve(false); // cancel any already-open prompt
          return { message, opts, resolve };
        });
      }),
    []
  );

  const settle = useCallback((value: boolean) => {
    setPending((prev) => {
      prev?.resolve(value);
      return null;
    });
  }, []);

  const confirmElement = pending ? (
    <ConfirmDialog
      message={pending.message}
      opts={pending.opts}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, confirmElement };
}

function ConfirmDialog({
  message,
  opts,
  onConfirm,
  onCancel,
}: {
  message: string;
  opts: ConfirmOpts;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { title, confirmLabel = 'אישור', cancelLabel = 'ביטול', danger } = opts;
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title ?? 'אישור פעולה'} aria-describedby="confirm-dialog-msg">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />
      <div class="glass rounded-2xl p-6 w-full max-w-sm text-start relative z-10 space-y-5 confirm-pop">
        {title && <h2 class="font-display font-semibold text-lg text-fg">{title}</h2>}
        <p id="confirm-dialog-msg" class="text-fg/85 text-sm leading-relaxed">{message}</p>
        <div class="flex flex-row-reverse items-center gap-3">
          <button ref={confirmRef} type="button" onClick={onConfirm} class={`rounded-full px-5 py-2.5 eyebrow text-[11px] transition ${danger ? 'btn-danger text-magenta' : 'btn-neon text-fg'}`}>
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} class="rounded-full px-4 py-2.5 eyebrow text-[11px] text-mute hover:text-fg transition">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Persisted preference (localStorage) for showing the Russian (RU) twin fields.
// The RU fields roughly double every form, yet most editing is Hebrew-only — this
// lets an editor collapse them. Hiding is purely visual; RU values are never touched.
const RU_PREF_KEY = 'admin:showRu';

export function useShowRu(): [boolean, () => void] {
  const [show, setShow] = useState(true);
  useEffect(() => {
    try { setShow(localStorage.getItem(RU_PREF_KEY) !== '0'); } catch {}
  }, []);
  const toggle = useCallback(() => {
    setShow((v) => {
      const next = !v;
      try { localStorage.setItem(RU_PREF_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  }, []);
  return [show, toggle];
}

export function RuToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={show ? 'true' : 'false'} onClick={onToggle} title="הצגה או הסתרה של שדות הרוסית בטופס" class="inline-flex flex-row-reverse items-center gap-2.5 eyebrow text-[10px] text-mute hover:text-fg transition shrink-0">
      <span class={`relative h-5 w-9 rounded-full border transition-colors ${show ? 'bg-cyan/25 border-cyan/60' : 'bg-white/5 border-white/15'}`}>
        <span class={`absolute top-1/2 right-0.5 h-4 w-4 -translate-y-1/2 rounded-full transition-transform duration-200 ${show ? '-translate-x-4 bg-cyan' : 'bg-mute'}`}></span>
      </span>
      <span>שדות רוסית (RU)</span>
    </button>
  );
}

// Glass skeleton loaders — shown on initial fetch instead of bare "טוען…" text.
const range = (n: number) => Array.from({ length: n });

export function CardsSkeleton({ count = 3, lines = 2 }: { count?: number; lines?: number }) {
  return (
    <div class="space-y-4" role="status" aria-busy="true" aria-label="טוען…">
      {range(count).map((_, i) => (
        <div key={i} class="glass rounded-2xl p-6 space-y-4">
          <div class="skeleton h-3 w-28 rounded" />
          {range(lines).map((__, j) => (
            <div key={j} class="skeleton h-9 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div class="space-y-2" role="status" aria-busy="true" aria-label="טוען…">
      {range(count).map((_, i) => (
        <div key={i} class="glass rounded-xl px-4 py-3 flex items-center justify-between">
          <div class="skeleton h-4 w-40 rounded" />
          <div class="skeleton h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" role="status" aria-busy="true" aria-label="טוען…">
      {range(count).map((_, i) => (
        <div key={i} class="glass rounded-xl overflow-hidden">
          <div class="skeleton h-32 w-full" />
          <div class="p-2">
            <div class="skeleton h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
