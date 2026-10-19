
"use client";

import {
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import {
  cancelPayment,
  payPayment,
  type PaymentDetails,
} from "./actions";

import { usePaymentAction } from "./use-payment-action";

type PaymentGatewayDetails = PaymentDetails & {
  authority: string;
};

function calculateRemainingSeconds(
  expiresAtTimestamp: number,
  currentTimestamp: number,
) {
  return Number.isNaN(expiresAtTimestamp)
    ? 0
    : Math.max(
        0,
        Math.ceil(
          (expiresAtTimestamp - currentTimestamp) / 1000,
        ),
      );
}

let currentTimestamp = 0;

const clockListeners = new Set<() => void>();

let clockTimer: ReturnType<typeof setInterval> | undefined;

function subscribeToClock(onStoreChange: () => void) {
  clockListeners.add(onStoreChange);

  if (!clockTimer) {
    currentTimestamp = Date.now();

    clockTimer = setInterval(() => {
      currentTimestamp = Date.now();

      clockListeners.forEach((listener) => listener());
    }, 1000);
  }

  return () => {
    clockListeners.delete(onStoreChange);

    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

function getClockSnapshot() {
  return currentTimestamp;
}

function getServerClockSnapshot() {
  return 0;
}

function usePaymentCountdown(expiresAt: string) {
  const expiresAtTimestamp = useMemo(
    () => Date.parse(expiresAt),
    [expiresAt],
  );

  const now = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot,
  );

  const remainingSeconds = calculateRemainingSeconds(
    expiresAtTimestamp,
    now,
  );

  return {
    minutes: String(
      Math.floor(remainingSeconds / 60),
    ).padStart(2, "0"),

    seconds: String(
      remainingSeconds % 60,
    ).padStart(2, "0"),

    isExpired: now !== 0 && remainingSeconds === 0,
  };
}

function domain(appUrl: string) {
  try {
    return new URL(appUrl).hostname;
  } catch {
    return appUrl;
  }
}

function paymentStatusLabel(status: string) {
  return status === "pending"
    ? "در انتظار پرداخت"
    : status;
}

export default function PaymentGateway({
  paymentDetail,
}: {
  paymentDetail: PaymentGatewayDetails;
}) {
  const {
    authority,
    appUrl,
    companyName,
    expiresAt,
    finalPrice,
    status,
  } = paymentDetail;

  const { minutes, seconds, isExpired } =
    usePaymentCountdown(expiresAt);

  const payAction = usePaymentAction(payPayment);
  const cancelAction = usePaymentAction(cancelPayment);

  // Prevent simultaneous payment operations.
  const submittingRef = useRef(false);

  const isBusy =
    payAction.isLoading || cancelAction.isLoading;

  const canPay =
    status === "pending" && !isExpired;

  async function handlePay() {
    if (submittingRef.current || !canPay) {
      return;
    }

    submittingRef.current = true;

    try {
      await payAction.action(authority);
    } finally {
      submittingRef.current = false;
    }
  }

  async function handleCancel() {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    try {
      await cancelAction.action(authority);
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#dceafd_0%,#f5f8fc_43%,#e7f0fb_100%)] p-5 text-[#18355e]"
      dir="rtl"
    >
      <section
        className="grid w-full max-w-[1060px] overflow-hidden rounded-[18px] border border-[#1f4d8e]/12 bg-white shadow-[0_25px_70px_rgba(23,61,111,.18)] md:grid-cols-[36%_64%]"
        aria-label="درگاه پرداخت اینترنتی"
      >
        <aside className="border-l border-[#dce5f0] bg-[#fbfcfe] max-md:border-b max-md:border-l-0">
          <div className="flex h-[51px] items-center justify-between bg-linear-to-r from-[#1c4784] to-[#24599f] px-[25px] text-sm font-bold text-white">
            <span>زمان باقی‌مانده</span>

            <span
              className={`font-mono text-xl tracking-[3px] ${
                isExpired ? "text-red-500" : ""
              }`}
              dir="ltr"
            >
              {minutes}:{seconds}
            </span>
          </div>

          <div className="p-6 text-center">
            <div className="mx-auto grid size-[72px] place-items-center rounded-full border border-[#cbdcf5] bg-[#edf4ff] text-3xl font-extrabold text-[#3276d6]">
              P
            </div>

            <h1 className="mt-3 text-lg font-bold text-[#2d4870]">
              {companyName}
            </h1>
          </div>

          <dl className="border-t border-[#dce5f0] text-[13px]">
            {[
              ["نام فروشگاه", companyName],
              ["آدرس فروشگاه", domain(appUrl)],
              ["کد پیگیری", authority],
              ["وضعیت", paymentStatusLabel(status)],
            ].map(([label, value]) => (
              <div
                className="flex gap-3.5 border-b border-[#dce5f0] px-6 py-3"
                key={label}
              >
                <dt className="min-w-[94px] text-[#8a99ad]">
                  {label}
                </dt>

                <dd
                  className="m-0 break-all text-[#3c5575]"
                  dir="ltr"
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center justify-between bg-[#159360] px-6 py-[17px] text-white">
            <span className="text-xs">
              مبلغ قابل پرداخت
            </span>

            <strong dir="ltr">
              {new Intl.NumberFormat("fa-IR").format(
                finalPrice,
              )}{" "}
              <small className="font-normal">
                تومان
              </small>
            </strong>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex h-[51px] items-center bg-linear-to-r from-[#1c4784] to-[#24599f] px-[25px] font-bold text-white">
            تأیید پرداخت آزمایشی
          </div>

          <div className="space-y-5 p-[25px_44px_28px] max-md:p-6">
            <p className="text-sm leading-7 text-[#536a88]">
              این صفحه یک درگاه پرداخت آزمایشی است.
              برای شبیه‌سازی پرداخت موفق، گزینه پرداخت را
              انتخاب کنید. برای انصراف از تراکنش،
              گزینه انصراف را بزنید.
            </p>

            {isExpired && (
              <p
                className="rounded-md bg-red-50 p-3 text-sm text-red-600"
                role="alert"
              >
                زمان پرداخت به پایان رسیده است.
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                className="flex-1 rounded-[7px] bg-[#ef4b4d] p-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isBusy}
                onClick={() => {
                  void handleCancel();
                }}
              >
                {cancelAction.isLoading
                  ? "در حال انصراف..."
                  : "انصراف"}
              </button>

              <button
                type="button"
                className="flex-1 rounded-[7px] bg-[#21a566] p-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isBusy || !canPay}
                onClick={() => {
                  void handlePay();
                }}
              >
                {payAction.isLoading
                  ? "در حال پرداخت..."
                  : "پرداخت"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
