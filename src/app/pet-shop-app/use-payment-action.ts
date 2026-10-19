"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentAction = (
  authority: string,
) => Promise<{ callbackUrl: string }>;

export function usePaymentAction(paymentAction: PaymentAction) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const action = useCallback(
    async (authority: string) => {
      if (isLoading) return;

      setIsLoading(true);

      try {
        const { callbackUrl } = await paymentAction(authority);

        window.location.assign(callbackUrl);
      } catch (error) {
        console.error("Payment action failed", error);

        router.push(
          `/error-page?authority=${encodeURIComponent(authority)}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [paymentAction, router, isLoading],
  );

  return {
    isLoading,
    action,
  };
}