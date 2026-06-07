import { useState, useRef, useCallback } from 'preact/hooks';

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
