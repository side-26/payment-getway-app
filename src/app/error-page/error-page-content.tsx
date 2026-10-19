
"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPageContent() {
  const searchParams = useSearchParams();
  const authority = searchParams.get("authority");

  return (
    <main
      className="grid min-h-screen place-items-center bg-[#f5f8fc] p-5"
      dir="rtl"
    >
      <section className="w-full max-w-md rounded-xl border border-[#dce5f0] bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-red-50 text-3xl text-red-500">
          !
        </div>

        <h1 className="mb-3 text-xl font-bold text-[#18355e]">
          خطا در پردازش پرداخت
        </h1>

        <p className="mb-6 text-sm leading-7 text-[#536a88]">
          متأسفانه پردازش پرداخت با خطا مواجه شد.
          لطفاً دوباره تلاش کنید.
        </p>

        {authority && (
          <div className="mb-6 rounded-lg bg-[#f5f8fc] p-3">
            <p className="mb-1 text-xs text-[#8a99ad]">
              کد پیگیری
            </p>

            <p
              className="break-all text-sm font-medium text-[#18355e]"
              dir="ltr"
            >
              {authority}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full rounded-lg bg-[#24599f] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1c4784]"
        >
          بازگشت
        </button>
      </section>
    </main>
  );
}
