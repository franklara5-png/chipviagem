const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";

function getApiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurado");
  return key;
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: getApiKey(),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errors?.[0]?.description ?? `Asaas API error: ${res.status}`);
  }
  return data as T;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  billingType: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
}

export async function createCustomer(data: {
  name: string;
  email: string;
  cpfCnpj: string;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpfCnpj.replace(/\D/g, ""),
    }),
  });
}

export async function createPixPayment(data: {
  customerId: string;
  value: number;
  description: string;
  externalReference: string;
}): Promise<AsaasPayment> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: data.customerId,
      billingType: "PIX",
      value: data.value,
      dueDate: dueDate.toISOString().split("T")[0],
      description: data.description,
      externalReference: data.externalReference,
    }),
  });
}

export async function getPixQrCode(paymentId: string) {
  return asaasFetch<{ encodedImage: string; payload: string; expirationDate: string }>(
    `/payments/${paymentId}/pixQrCode`
  );
}

export async function createCardPayment(data: {
  customerId: string;
  value: number;
  description: string;
  externalReference: string;
  creditCardToken: string;
}): Promise<AsaasPayment> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: data.customerId,
      billingType: "CREDIT_CARD",
      value: data.value,
      dueDate: dueDate.toISOString().split("T")[0],
      description: data.description,
      externalReference: data.externalReference,
      creditCardToken: data.creditCardToken,
    }),
  });
}

export async function tokenizeCreditCard(data: {
  customerId: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}) {
  return asaasFetch<{ creditCardToken: string }>("/creditCard/tokenizeCreditCard", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
}

export function getAsaasPanelUrl(paymentId: string): string {
  const base =
    process.env.ASAAS_ENV === "production"
      ? "https://www.asaas.com"
      : "https://sandbox.asaas.com";
  return `${base}/payment/show/${paymentId}`;
}
