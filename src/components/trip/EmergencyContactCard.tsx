"use client";

import { ContactRound, Eraser, LockKeyhole } from "lucide-react";

const inputClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[var(--stone-200)] bg-[var(--snow)] px-4 py-3 text-base text-[var(--pine-950)] outline-none transition-colors placeholder:text-[var(--stone-500)] focus-visible:border-[var(--pine-700)] focus-visible:ring-2 focus-visible:ring-[var(--brass-400)]";

export function EmergencyContactCard() {
  return (
    <section aria-labelledby="emergency-contact-title" className="surface-card p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--mist-100)] text-[var(--pine-700)]">
          <ContactRound aria-hidden="true" className="h-6 w-6" />
        </span>
        <div>
          <p className="eyebrow">暫時填寫區</p>
          <h2 id="emergency-contact-title" className="section-title mt-2">
            緊急聯絡資訊
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            請在取得最終行前資料後自行填寫。此處不預填姓名或電話，也不會保存、上傳或傳送任何內容；重新整理頁面後，填寫內容即會消失。
          </p>
        </div>
      </div>

      <form className="mt-7" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
        <fieldset>
          <legend className="sr-only">可暫時填寫的緊急聯絡欄位</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-base font-semibold text-[var(--pine-950)]">
              聯絡對象稱呼
              <input
                type="text"
                name="contact-name"
                placeholder="例如：家人、領隊或旅行社窗口"
                className={inputClassName}
              />
            </label>

            <label className="block text-base font-semibold text-[var(--pine-950)]">
              關係或單位
              <input type="text" name="contact-role" placeholder="請自行填寫" className={inputClassName} />
            </label>

            <label className="block text-base font-semibold text-[var(--pine-950)]">
              聯絡電話（含國碼）
              <input
                type="tel"
                name="contact-phone"
                inputMode="tel"
                placeholder="請依最終資料填寫"
                className={inputClassName}
              />
            </label>

            <label className="block text-base font-semibold text-[var(--pine-950)]">
              備用聯絡方式
              <input type="text" name="alternate-contact" placeholder="請自行填寫" className={inputClassName} />
            </label>

            <label className="block text-base font-semibold text-[var(--pine-950)] sm:col-span-2">
              緊急協助備註
              <textarea
                name="contact-notes"
                rows={3}
                placeholder="可暫時整理保險協助窗口、集合應變方式或其他提醒"
                className={inputClassName}
              />
            </label>
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-[var(--mist-100)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-3 text-sm leading-6 text-[var(--stone-700)]">
            <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--pine-700)]" />
            這是純頁面暫存欄位。若要隨身攜帶，請另行寫在紙本或安全的個人裝置中。
          </p>
          <button type="reset" className="button-secondary min-h-11 shrink-0">
            <Eraser aria-hidden="true" className="h-4 w-4" />
            清除本頁填寫內容
          </button>
        </div>
      </form>
    </section>
  );
}

export default EmergencyContactCard;
