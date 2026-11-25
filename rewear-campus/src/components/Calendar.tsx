import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, cx, parseISO, toISO, todayISO } from '../lib/util';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Rental calendar: pick a pickup date; the rental window (pickup → return) is highlighted. */
export function RentalCalendar({ value, days, isAvailable, onSelect, min, max, markers }: {
  value: string | null; days: number; isAvailable: (iso: string) => boolean; onSelect: (iso: string) => void; min: string; max: string; markers?: Record<string, string>;
}) {
  const [cursor, setCursor] = useState(() => { const d = parseISO(value ?? min); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const cells = useMemo(() => {
    const first = new Date(cursor);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const start = new Date(first); start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);
  const end = value ? addDays(value, days) : null;
  const t = todayISO();
  const canPrev = toISO(new Date(cursor.getFullYear(), cursor.getMonth(), 0)) >= min.slice(0, 8) + '01';
  const canNext = toISO(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) <= max;
  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <button type="button" className="h-10 w-10 grid place-items-center rounded-full hover:bg-tint disabled:opacity-30" disabled={!canPrev} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <p className="font-semibold text-sm" aria-live="polite">{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</p>
        <button type="button" className="h-10 w-10 grid place-items-center rounded-full hover:bg-tint disabled:opacity-30" disabled={!canNext} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] text-muted font-semibold mb-1">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <span key={d}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-y-1" role="grid">
        {cells.map((d) => {
          const iso = toISO(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const outOfRange = iso < min || iso > max;
          const avail = !outOfRange && isAvailable(iso);
          const isStart = iso === value;
          const inRange = value && end && iso > value && iso <= end;
          const isEnd = iso === end;
          return (
            <button
              key={iso}
              type="button"
              disabled={!avail}
              onClick={() => onSelect(iso)}
              aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]}${avail ? '' : ', unavailable'}${isStart ? ', pickup' : ''}${isEnd ? ', return' : ''}`}
              aria-pressed={isStart}
              className={cx('relative h-10 text-[13px] tnum transition',
                !inMonth && 'opacity-35',
                inRange && 'bg-sage/40 dark:bg-sage/20',
                isEnd && 'rounded-r-full',
                isStart ? 'bg-brand text-onbrand rounded-full font-bold' : avail ? 'hover:bg-tint rounded-full font-semibold' : 'text-muted/60 line-through decoration-1',
              )}
            >
              {d.getDate()}
              {iso === t && !isStart && <span className="absolute left-1/2 -translate-x-1/2 bottom-1 h-1 w-1 rounded-full bg-terra" />}
              {markers?.[iso] && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gold" />}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-brand" />Pickup</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-5 rounded-full bg-sage/60" />Rental window</span>
        <span className="flex items-center gap-1.5"><span className="line-through">12</span>Unavailable</span>
      </div>
    </div>
  );
}
