import Link from "next/link";

export default function ErrorPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f5f8fc] p-6 font-[Tahoma,Arial,sans-serif] text-[#18355e]" dir="rtl"><section className="w-full max-w-md rounded-[18px] bg-white p-8 text-center shadow-[0_20px_55px_rgba(23,61,111,.16)]"><h1 className="text-xl font-bold">بازیابی اطلاعات پرداخت ممکن نیست</h1><p className="mt-3 text-sm leading-7 text-[#526985]">لطفاً چند لحظه دیگر دوباره تلاش کنید یا به فروشگاه بازگردید.</p><Link href="/" className="mt-6 inline-block rounded-[7px] bg-[#3276d6] px-5 py-3 text-sm font-bold text-white">بازگشت به صفحه اصلی</Link></section></main>;
}
