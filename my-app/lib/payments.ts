import { apiJson } from "@/lib/auth";

export interface PaymentApplicationSummary {
  id: number;
  status: string;
  major: string;
  year: number;
  room_preference?: string;
  submitted_at: string;
}

export interface PaymentRecord {
  id: number;
  application_id: number;
  status: string;
  amount_kzt: number;
  currency: string;
  payment_reference: string;
  provider_checkout_url?: string | null;
  provider_session_id?: string | null;
  provider_transaction_id?: string | null;
  provider_message?: string | null;
  customer_phone?: string | null;
  instructions?: string | null;
  initiated_at: string;
  paid_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentSummaryResponse {
  application: PaymentApplicationSummary;
  payable: boolean;
  provider: string;
  merchant_name?: string;
  amount_kzt: number;
  currency: string;
  payment: PaymentRecord | null;
}

export const getApplicationPaymentSummary = (applicationId: number) =>
  apiJson<PaymentSummaryResponse>(`/payments/application/${applicationId}`, {
    method: "GET",
  });

export const initiateApplicationPayment = (applicationId: number) =>
  apiJson<PaymentSummaryResponse>(
    `/payments/application/${applicationId}/initiate`,
    {
      method: "POST",
    },
  );

export const syncApplicationPayment = (
  applicationId: number,
  stripeSessionId?: string | null,
) =>
  apiJson<PaymentSummaryResponse>(
    `/payments/application/${applicationId}/sync${
      stripeSessionId
        ? `?session_id=${encodeURIComponent(stripeSessionId)}`
        : ""
    }`,
    {
      method: "POST",
    },
  );
