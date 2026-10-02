

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const DEFAULT_COMPANY_NAME = "پت‌شاپ هاپو";
const DEFAULT_ORIGIN_DOMAIN = "hapoo-petshop.ir";
const DEFAULT_PRICE = "۱,۲۸۰,۰۰۰";

const InfoIcon = () => <span className="info-icon" aria-hidden="true">i</span>;

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatPrice(value: string) {
  const latinDigits = value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  const amount = Number(latinDigits.replace(/[\s,٬]/g, ""));

  return Number.isFinite(amount) && amount >= 0
    ? new Intl.NumberFormat("fa-IR").format(amount)
    : value;
}

export default function Page() {
  const searchParams = useSearchParams();
  const [seconds, setSeconds] = useState(14 * 60 + 32);
  const [cardNumber, setCardNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const companyName = searchParams.get("company-name")?.trim() || DEFAULT_COMPANY_NAME;
  const originDomain = searchParams.get("origin-domain")?.trim() || DEFAULT_ORIGIN_DOMAIN;
  const price = formatPrice(searchParams.get("price")?.trim() || DEFAULT_PRICE);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="gateway-page" dir="rtl">
      <div className="gateway-backdrop" />
      <section className="gateway-shell" aria-label="درگاه پرداخت اینترنتی">
        <header className="gateway-header">
          <div className="secure-mark" aria-label="پرداخت امن">
            <svg viewBox="0 0 58 58" aria-hidden="true"><path d="M29 5 48 12v14c0 13-8 23-19 27C18 49 10 39 10 26V12L29 5Z" fill="#e7f1ff" stroke="#3276d6" strokeWidth="2"/><path d="M21 27v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#3276d6" strokeWidth="3" strokeLinecap="round"/><rect x="17" y="26" width="24" height="18" rx="4" fill="#3276d6"/><circle cx="29" cy="34" r="2" fill="white"/><path d="M29 36v4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>پرداخت امن</span>
          </div>
          <div className="gateway-title"><span className="title-line" />درگاه پرداخت اینترنتی<span className="title-line" /></div>
          <div className="brand"><span className="brand-paw">♣</span><span>پت‌پی</span></div>
        </header>

        <div className="gateway-grid">
          <aside className="merchant-card">
            <div className="timer"><span>زمان باقی‌مانده</span><span className="timer-clock">{minutes}:{remainingSeconds}</span></div>
            <div className="merchant-heading">اطلاعات پذیرنده</div>
            <div className="merchant-logo"><span>p</span><small>pet shop</small></div>
            <div className="merchant-name">{companyName}</div>
            <dl className="merchant-details">
              <div><dt>نام فروشگاه</dt><dd>{companyName}</dd></div>
              <div><dt>آدرس فروشگاه</dt><dd className="ltr">{originDomain}</dd></div>
              <div><dt>کد پذیرنده</dt><dd className="ltr">871 948 211</dd></div>
              <div><dt>شماره ترمینال</dt><dd className="ltr">481 203 76</dd></div>
            </dl>
            <div className="total"><span>مبلغ قابل پرداخت</span><strong>{price} <small>ریال</small></strong></div>
          </aside>

          <form className="payment-card" onSubmit={pay}>
            <div className="card-heading"><span className="card-icon">▣</span> اطلاعات کارت</div>
            <div className="form-content">
              <label><span>شماره کارت</span><div className="input-wrap"><input value={cardNumber} inputMode="numeric" placeholder="0000  0000  0000  0000" onChange={(event) => setCardNumber(formatCardNumber(event.target.value))} /><span className="input-icon">▦</span></div></label>
              <label><span>رمز دوم</span><div className="input-wrap"><input type="password" inputMode="numeric" placeholder="رمز پویا" /><span className="input-icon">▦</span></div></label>
              <label><span>CVV2</span><div className="input-wrap"><input inputMode="numeric" maxLength={4} placeholder="● ● ● ●" /><span className="input-icon">▦</span></div></label>
              <label><span>تاریخ انقضا</span><div className="expiry"><input inputMode="numeric" placeholder="ماه" maxLength={2} /><i>/</i><input inputMode="numeric" placeholder="سال" maxLength={2} /></div></label>
              <label><span>کد امنیتی <InfoIcon /></span><div className="captcha-row"><div className="captcha">۷۳۵۸۲</div><button type="button" className="refresh" aria-label="تغییر کد امنیتی">↻</button><input inputMode="numeric" placeholder="کد امنیتی" /></div></label>
              <label><span>ایمیل <em>(اختیاری)</em></span><div className="input-wrap"><input type="email" placeholder="example@email.com" /></div></label>
              {submitted && <p className="success-message" role="status">اطلاعات شما ثبت شد. در حال انتقال به بانک...</p>}
              <div className="actions"><button type="button" className="cancel" onClick={() => setSubmitted(false)}>انصراف</button><button type="submit" className="pay">پرداخت</button></div>
            </div>
          </form>
        </div>
        <footer className="gateway-footer"><span>© ۱۴۰۵ پت‌پی</span><span>پرداخت امن و سریع برای دوست‌داشتنی‌های شما</span><span className="support">پشتیبانی ۲۴ ساعته <b>۰۲۱-۸۸۸۸۸۸۸۸</b></span></footer>
      </section>
    </main>
  );
}
