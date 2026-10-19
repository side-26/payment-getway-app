"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getPaymentDetail,
  type PaymentDetails,
} from "./actions";

import PaymentGateway from "./payment-gateway";

type PaymentState =
  | { status: "loading" }
  | { status: "success"; data: PaymentDetails }
  | { status: "error" };

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const authority = searchParams.get("authority") ?? "";

  const [state, setState] = useState<PaymentState>({
    status: "loading",
  });

  useEffect(() => {
    let active = true;

    if (!authority) {
      router.replace("/error-page");
      return;
    }

    async function loadPayment() {
      const result = await getPaymentDetail(authority);

      if (!active) return;

      if (!result.isSuccess) {
        setState({ status: "error" });

        router.replace(
          `/error-page?authority=${encodeURIComponent(authority)}`,
        );

        return;
      }

      setState({
        status: "success",
        data: result.data,
      });
    }

    void loadPayment();

    return () => {
      active = false;
    };
  }, [authority, router]);

  if (state.status !== "success") {
    return (
      <main
        className="grid min-h-screen place-items-center bg-[#f5f8fc]"
        dir="rtl"
      >
        <p className="text-sm text-[#536a88]">
          {state.status === "error"
            ? "در حال انتقال به صفحه خطا..."
            : "در حال دریافت اطلاعات پرداخت..."}
        </p>
      </main>
    );
  }

  return (
    <PaymentGateway
      paymentDetail={{
        ...state.data,
        authority,
      }}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>درحال بارگزاری...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}