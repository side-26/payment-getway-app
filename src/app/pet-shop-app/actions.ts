type PaymentOperation = "pay" | "cancel";

export type PaymentDetails = {
  finalPrice: number;
  status: string;
  expiresAt: string;
  appUrl: string;
  companyName: string;
};

export type PaymentDetailsResult =
  | { isSuccess: true; data: PaymentDetails }
  | { isSuccess: false; error: string };

export type PaymentActionResult = {
  callbackUrl: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function getBackendUrl(): string {
  if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }

  return BACKEND_URL.replace(/\/$/, "");
}

function isPaymentDetails(value: unknown): value is PaymentDetails {
  if (!value || typeof value !== "object") return false;

  const payment = value as Record<string, unknown>;

  return (
    typeof payment.finalPrice === "number" &&
    Number.isFinite(payment.finalPrice) &&
    typeof payment.status === "string" &&
    typeof payment.expiresAt === "string" &&
    typeof payment.appUrl === "string" &&
    typeof payment.companyName === "string"
  );
}

function callbackUrlFromResponse(
  value: unknown,
  operation: PaymentOperation,
): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const result = value as Record<string, unknown>;

  if (typeof result.callbackUrl === "string") {
    return result.callbackUrl;
  }

  if (!result.data || typeof result.data !== "object") {
    return undefined;
  }

  const data = result.data as Record<string, unknown>;

  if (typeof data.callbackUrl === "string") {
    return data.callbackUrl;
  }

  return operation === "cancel" && typeof data.appUrl === "string"
    ? data.appUrl
    : undefined;
}

export async function getPaymentDetail(
  authority: string,
): Promise<PaymentDetailsResult> {
  try {
    if (!authority) {
      throw new Error("Payment authority is required");
    }

    const response = await fetch(
      `${getBackendUrl()}/gateway/payments/${encodeURIComponent(authority)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Payment lookup failed: ${response.status}`);
    }

    const result: unknown = await response.json();

    const payment =
      result && typeof result === "object"
        ? (result as Record<string, unknown>).data
        : undefined;

    if (!isPaymentDetails(payment)) {
      throw new Error("Invalid payment response");
    }

    return {
      isSuccess: true,
      data: payment,
    };
  } catch (error) {
    console.error("Unable to retrieve payment details", error);

    return {
      isSuccess: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to retrieve payment details",
    };
  }
}

async function submitPayment(
  authority: string,
  operation: PaymentOperation,
): Promise<PaymentActionResult> {
  if (!authority) {
    throw new Error("Payment authority is required");
  }

  const response = await fetch(
    `${getBackendUrl()}/gateway/payments/${encodeURIComponent(authority)}/${operation}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(`Payment ${operation} failed: ${response.status}`);
  }

  const result: unknown = await response.json();

  if (
    !result ||
    typeof result !== "object" ||
    (result as Record<string, unknown>).isSuccess !== true
  ) {
    throw new Error(`Payment ${operation} was not successful`);
  }

  const callbackUrl = callbackUrlFromResponse(result, operation);

  if (!callbackUrl) {
    throw new Error("Invalid payment action response");
  }

  const parsedUrl = new URL(callbackUrl);

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    throw new Error("Invalid callback URL protocol");
  }

  return { callbackUrl: parsedUrl.href };
}

export async function payPayment(authority: string) {
  return submitPayment(authority, "pay");
}

export async function cancelPayment(authority: string) {
  return submitPayment(authority, "cancel");
}