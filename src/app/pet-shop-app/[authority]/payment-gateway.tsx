"use client";

import { FormEvent, useEffect, useState } from "react";

type PaymentDetails = { amount: number; authority: string; status: string; expiresAt: string; appUrl: string; appName: string };

function remainingSeconds(expiresAt: string) {
  const timestamp = Date.parse(expiresAt);
  return Number.isNaN(timestamp) ? 0 : Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

function domain(appUrl: string) {
  try { return new URL(appUrl).hostname; } catch { return appUrl; }
}

export default function PaymentGateway({ payment }: { payment: PaymentDetails }) {
  const [seconds, setSeconds] = useState(() => remainingSeconds(payment.expiresAt));
  const [cardNumber, setCardNumber] = useState("");
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secondsPart = String(seconds % 60).padStart(2, "0");

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds(remainingSeconds(payment.expiresAt)), 1000);
    return () => window.clearInterval(timer);
  }, [payment.expiresAt]);

  async function handlePay() {
    const response = await fetch(`/api/gateway/payments/${payment.authority}/pay`, {
      method: "POST",
    });
    const result: { callbackUrl: string } = await response.json();
    window.location.href = result.callbackUrl;
  }

  async function handleCancel() {
    const response = await fetch(`/api/gateway/payments/${payment.authority}/cancel`, {
      method: "POST",
    });
    const result: { callbackUrl: string } = await response.json();
    window.location.href = result.callbackUrl;
  }

  function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handlePay();
  }
  function updateCardNumber(value: string) { setCardNumber(value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()); }

  return <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#dceafd_0%,#f5f8fc_43%,#e7f0fb_100%)] p-5 font-[Tahoma,Arial,sans-serif] text-[#18355e]" dir="rtl">
    <section className="grid w-full max-w-[1060px] overflow-hidden rounded-[18px] border border-[#1f4d8e]/12 bg-white shadow-[0_25px_70px_rgba(23,61,111,.18)] md:grid-cols-[36%_64%]" aria-label="درگاه پرداخت اینترنتی">
      <aside className="border-l border-[#dce5f0] bg-[#fbfcfe] max-md:border-b max-md:border-l-0">
        <div className="flex h-[51px] items-center justify-between bg-linear-to-r from-[#1c4784] to-[#24599f] px-[25px] text-sm font-bold text-white"><span>زمان باقی‌مانده</span><span className="font-mono text-xl tracking-[3px]" dir="ltr">{minutes}:{secondsPart}</span></div>
        <div className="p-6 text-center"><div className="mx-auto grid size-[72px] place-items-center rounded-full border border-[#cbdcf5] bg-[#edf4ff] text-3xl font-extrabold text-[#3276d6]">P</div><h1 className="mt-3 text-lg font-bold text-[#2d4870]">{payment.appName}</h1></div>
        <dl className="border-t border-[#dce5f0] text-[13px]">{[["نام فروشگاه", payment.appName], ["آدرس فروشگاه", domain(payment.appUrl)], ["کد پیگیری", payment.authority]].map(([label, value]) => <div className="flex gap-3.5 border-b border-[#dce5f0] px-6 py-3" key={label}><dt className="min-w-[94px] text-[#8a99ad]">{label}</dt><dd className="m-0 break-all text-[#3c5575]" dir="ltr">{value}</dd></div>)}</dl>
        <div className="flex items-center justify-between bg-[#159360] px-6 py-[17px] text-white"><span className="text-xs">مبلغ قابل پرداخت</span><strong dir="ltr">{new Intl.NumberFormat("fa-IR").format(payment.amount)} <small className="font-normal">ریال</small></strong></div>
      </aside>
      <form className="min-w-0" onSubmit={pay}><div className="flex h-[51px] items-center bg-linear-to-r from-[#1c4784] to-[#24599f] px-[25px] font-bold text-white">اطلاعات کارت</div><div className="space-y-[13px] p-[25px_44px_28px] max-md:p-6">
        <label className="grid grid-cols-[122px_1fr] items-center gap-[15px] text-[13px] font-bold text-[#536a88] max-md:grid-cols-1"><span>شماره کارت</span><input className="h-[42px] rounded-[7px] border border-[#ccd8e7] px-3 text-left text-[#264a7a] outline-none focus:border-[#4c90e5]" dir="ltr" value={cardNumber} inputMode="numeric" placeholder="0000  0000  0000  0000" onChange={(event) => updateCardNumber(event.target.value)} /></label>
        <label className="grid grid-cols-[122px_1fr] items-center gap-[15px] text-[13px] font-bold text-[#536a88] max-md:grid-cols-1"><span>رمز دوم</span><input className="h-[42px] rounded-[7px] border border-[#ccd8e7] px-3 text-[#264a7a] outline-none focus:border-[#4c90e5]" type="password" inputMode="numeric" placeholder="رمز پویا" /></label>
        <label className="grid grid-cols-[122px_1fr] items-center gap-[15px] text-[13px] font-bold text-[#536a88] max-md:grid-cols-1"><span>CVV2</span><input className="h-[42px] rounded-[7px] border border-[#ccd8e7] px-3 text-[#264a7a] outline-none focus:border-[#4c90e5]" dir="ltr" inputMode="numeric" maxLength={4} placeholder="••••" /></label>
        <label className="grid grid-cols-[122px_1fr] items-center gap-[15px] text-[13px] font-bold text-[#536a88] max-md:grid-cols-1"><span>ایمیل <em className="font-normal text-[#a3afbf]">(اختیاری)</em></span><input className="h-[42px] rounded-[7px] border border-[#ccd8e7] px-3 text-[#264a7a] outline-none focus:border-[#4c90e5]" type="email" placeholder="example@email.com" /></label>
        <div className="flex gap-3 pt-1"><button type="button" className="flex-1 rounded-[7px] bg-[#ef4b4d] p-3 font-bold text-white" onClick={() => void handleCancel()}>انصراف</button><button type="submit" className="flex-1 rounded-[7px] bg-[#21a566] p-3 font-bold text-white">پرداخت</button></div>
      </div></form>
    </section>
  </main>;
}
