"use client";

import { Check, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface PackingChecklistItem {
  id: string;
  label: string;
  note?: string;
}

export interface PackingChecklistGroup {
  id: string;
  title: string;
  description?: string;
  items: readonly PackingChecklistItem[];
}

interface PackingChecklistProps {
  groups: readonly PackingChecklistGroup[];
}

const STORAGE_KEY = "nordic-trip-packing-checklist:v1";

export function PackingChecklist({ groups }: PackingChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set());
  const [storageReady, setStorageReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const clearDialogRef = useRef<HTMLDialogElement>(null);
  const progressLabelId = useId();

  const itemIds = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => item.id)),
    [groups],
  );
  const totalItems = itemIds.length;
  const completedItems = checkedItems.size;
  const completion = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  useEffect(() => {
    let cancelled = false;
    let restoredItems = new Set<string>();
    let canPersist = true;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const allowedIds = new Set(itemIds);
          restoredItems = new Set(
            parsed.filter(
              (value): value is string =>
                typeof value === "string" && allowedIds.has(value),
            ),
          );
        }
      }
    } catch {
      canPersist = false;
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setCheckedItems(restoredItems);
      setStorageAvailable(canPersist);
      setStorageReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [itemIds]);

  useEffect(() => {
    if (!storageReady) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedItems]));
    } catch {
      queueMicrotask(() => setStorageAvailable(false));
    }
  }, [checkedItems, storageReady]);

  function toggleItem(itemId: string) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function openClearConfirmation() {
    if (checkedItems.size > 0) {
      clearDialogRef.current?.showModal();
    }
  }

  function clearAll() {
    setCheckedItems(new Set());
  }

  return (
    <section aria-labelledby="packing-checklist-title" className="space-y-8">
      <div className="surface-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">行李進度</p>
            <h2 id="packing-checklist-title" className="section-title mt-2">
              9 月北歐四國 packing checklist
            </h2>
            <p id={progressLabelId} className="mt-3 text-base font-semibold text-[var(--pine-900)]" aria-live="polite">
              已完成 {completedItems}／{totalItems} 項（{completion}%）
            </p>
          </div>

          <button
            type="button"
            onClick={openClearConfirmation}
            disabled={completedItems === 0}
            className="button-secondary min-h-11 self-start disabled:cursor-not-allowed disabled:opacity-45 sm:self-auto"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            全部清除
          </button>
        </div>

        <div
          className="mt-5 h-2.5 overflow-hidden rounded-full bg-[var(--mist-200)]"
          role="progressbar"
          aria-labelledby={progressLabelId}
          aria-valuemin={0}
          aria-valuemax={totalItems}
          aria-valuenow={completedItems}
        >
          <div
            className="h-full origin-left rounded-full bg-[var(--brass-500)] transition-transform duration-300 motion-reduce:transition-none"
            style={{ transform: `scaleX(${completion / 100})` }}
          />
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl bg-[var(--mist-100)] p-4 text-sm leading-6 text-[var(--stone-700)]">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--pine-700)]" />
          <p>
            勾選進度只存於這台裝置的這個瀏覽器，不會上傳，也不會跨裝置同步。
            {!storageAvailable && " 目前瀏覽器未允許儲存；本次開啟期間仍可正常勾選。"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <fieldset key={group.id} className="surface-card min-w-0 p-6 sm:p-7">
            <legend className="px-1 font-serif text-2xl font-semibold text-[var(--pine-950)]">
              {group.title}
            </legend>
            {group.description ? <p className="text-muted mt-2 leading-7">{group.description}</p> : null}

            <div className="mt-5 space-y-3">
              {group.items.map((item) => {
                const isChecked = checkedItems.has(item.id);

                return (
                  <label
                    key={item.id}
                    className="group flex min-h-14 cursor-pointer items-start gap-4 rounded-2xl border border-[var(--stone-200)] bg-[var(--snow)] p-4 transition-colors hover:border-[var(--brass-400)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--brass-500)]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[var(--pine-700)]"
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-base font-semibold leading-6 transition-colors ${
                          isChecked ? "text-[var(--stone-500)] line-through" : "text-[var(--pine-950)]"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.note ? <span className="text-muted mt-1 block text-sm leading-6">{item.note}</span> : null}
                    </span>
                    {isChecked ? (
                      <Check aria-label="已完成" className="ml-auto mt-0.5 h-5 w-5 shrink-0 text-[var(--pine-700)]" />
                    ) : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <dialog
        ref={clearDialogRef}
        aria-labelledby="clear-checklist-title"
        aria-describedby="clear-checklist-description"
        className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-[var(--radius-card)] border border-[var(--stone-200)] bg-[var(--snow)] p-0 text-[var(--stone-700)] shadow-2xl backdrop:bg-[var(--pine-950)]/55"
      >
        <form method="dialog" className="p-6 sm:p-8">
          <p className="eyebrow">請再確認</p>
          <h3 id="clear-checklist-title" className="mt-2 font-serif text-3xl font-semibold text-[var(--pine-950)]">
            要清除所有勾選嗎？
          </h3>
          <p id="clear-checklist-description" className="mt-3 text-base leading-7">
            清除後，這台裝置上的 {completedItems} 項完成紀錄會重設；行李清單本身不會被刪除。
          </p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="submit" value="cancel" className="button-secondary min-h-11">
              保留進度
            </button>
            <button type="submit" value="confirm" onClick={clearAll} className="button-primary min-h-11">
              確認全部清除
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

export default PackingChecklist;
