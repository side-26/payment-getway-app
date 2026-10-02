import { redirect } from "next/navigation";

import PaymentGateway from "./payment-gateway";

type PaymentDetails = {
  amount: number;
  authority: string;
  status: string;
  expiresAt: string;
  appUrl: string;
  appName: string;
};

function isPaymentDetails(value: unknown): value is PaymentDetails {
  if (!value || typeof value !== "object") return false;
  const payment = value as Record<string, unknown>;
  return typeof payment.amount === "number" && typeof payment.authority === "string" && typeof payment.status === "string" && typeof payment.expiresAt === "string" && typeof payment.appUrl === "string" && typeof payment.appName === "string";
}

async function getPayment(authority: string): Promise<PaymentDetails> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL is not configured");
  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/gateway/payments/${encodeURIComponent(authority)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Payment lookup failed: ${response.status}`);
  const payment: unknown = await response.json();
  if (!isPaymentDetails(payment)) throw new Error("Invalid payment response");
  return payment;
}

export default async function Page({ params }: PageProps<"/pet-shop-app/[authority]">) {
  const { authority } = await params;
  let payment: PaymentDetails;
  try {
    payment = await getPayment(authority);
  } catch {
    redirect("/error-page");
  }
  return <PaymentGateway payment={payment} />;
}
