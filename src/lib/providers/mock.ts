import QRCode from "qrcode";
import type {
  EsimDelivery,
  EsimProvider,
  EsimUsage,
  ProviderOrder,
  ProviderOrderStatus,
  ProviderPlan,
} from "./types";

const MOCK_CATALOG: ProviderPlan[] = [
  { id: "mock-jp-3gb-7d", name: "Japão 3GB — 7 dias", countryCodes: ["JP"], region: "Ásia", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 4.5 },
  { id: "mock-jp-5gb-15d", name: "Japão 5GB — 15 dias", countryCodes: ["JP"], region: "Ásia", dataAmountMb: 5120, validityDays: 15, wholesalePriceUsd: 7.2 },
  { id: "mock-jp-10gb-30d", name: "Japão 10GB — 30 dias", countryCodes: ["JP"], region: "Ásia", dataAmountMb: 10240, validityDays: 30, wholesalePriceUsd: 12.0 },
  { id: "mock-us-3gb-7d", name: "EUA 3GB — 7 dias", countryCodes: ["US"], region: "América do Norte", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.8 },
  { id: "mock-us-5gb-15d", name: "EUA 5GB — 15 dias", countryCodes: ["US"], region: "América do Norte", dataAmountMb: 5120, validityDays: 15, wholesalePriceUsd: 6.5 },
  { id: "mock-us-10gb-30d", name: "EUA 10GB — 30 dias", countryCodes: ["US"], region: "América do Norte", dataAmountMb: 10240, validityDays: 30, wholesalePriceUsd: 11.0 },
  { id: "mock-eu-3gb-7d", name: "Europa Regional 3GB — 7 dias", countryCodes: ["FR", "DE", "IT", "ES", "PT", "NL", "BE", "AT", "CH"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 4.0 },
  { id: "mock-eu-5gb-15d", name: "Europa Regional 5GB — 15 dias", countryCodes: ["FR", "DE", "IT", "ES", "PT", "NL", "BE", "AT", "CH"], region: "Europa", dataAmountMb: 5120, validityDays: 15, wholesalePriceUsd: 7.0 },
  { id: "mock-eu-10gb-30d", name: "Europa Regional 10GB — 30 dias", countryCodes: ["FR", "DE", "IT", "ES", "PT", "NL", "BE", "AT", "CH"], region: "Europa", dataAmountMb: 10240, validityDays: 30, wholesalePriceUsd: 12.5 },
  { id: "mock-ar-3gb-7d", name: "Argentina 3GB — 7 dias", countryCodes: ["AR"], region: "América do Sul", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 5.5 },
  { id: "mock-ar-5gb-15d", name: "Argentina 5GB — 15 dias", countryCodes: ["AR"], region: "América do Sul", dataAmountMb: 5120, validityDays: 15, wholesalePriceUsd: 8.5 },
  { id: "mock-cl-3gb-7d", name: "Chile 3GB — 7 dias", countryCodes: ["CL"], region: "América do Sul", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 5.0 },
  { id: "mock-cl-5gb-15d", name: "Chile 5GB — 15 dias", countryCodes: ["CL"], region: "América do Sul", dataAmountMb: 5120, validityDays: 15, wholesalePriceUsd: 8.0 },
  { id: "mock-pt-3gb-7d", name: "Portugal 3GB — 7 dias", countryCodes: ["PT"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.5 },
  { id: "mock-pt-5gb-15d", name: "Portugal 5GB — 15 dias", countryCodes: ["PT"], region: "Europa", dataAmountMb: 5120, validityDays: 15, wholesalePriceUsd: 6.0 },
  { id: "mock-fr-3gb-7d", name: "França 3GB — 7 dias", countryCodes: ["FR"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.8 },
  { id: "mock-it-3gb-7d", name: "Itália 3GB — 7 dias", countryCodes: ["IT"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.8 },
  { id: "mock-es-3gb-7d", name: "Espanha 3GB — 7 dias", countryCodes: ["ES"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.5 },
  { id: "mock-mx-3gb-7d", name: "México 3GB — 7 dias", countryCodes: ["MX"], region: "América do Norte", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 4.2 },
  { id: "mock-ca-3gb-7d", name: "Canadá 3GB — 7 dias", countryCodes: ["CA"], region: "América do Norte", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 4.5 },
  { id: "mock-gb-3gb-7d", name: "Reino Unido 3GB — 7 dias", countryCodes: ["GB"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 4.0 },
  { id: "mock-de-3gb-7d", name: "Alemanha 3GB — 7 dias", countryCodes: ["DE"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.8 },
  { id: "mock-gr-3gb-7d", name: "Grécia 3GB — 7 dias", countryCodes: ["GR"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 4.2 },
  { id: "mock-tr-3gb-7d", name: "Turquia 3GB — 7 dias", countryCodes: ["TR"], region: "Europa", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.5 },
  { id: "mock-th-3gb-7d", name: "Tailândia 3GB — 7 dias", countryCodes: ["TH"], region: "Ásia", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 3.2 },
  { id: "mock-ae-3gb-7d", name: "Dubai/EAU 3GB — 7 dias", countryCodes: ["AE"], region: "Oriente Médio", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 5.0 },
  { id: "mock-co-3gb-7d", name: "Colômbia 3GB — 7 dias", countryCodes: ["CO"], region: "América do Sul", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 5.5 },
  { id: "mock-pe-3gb-7d", name: "Peru 3GB — 7 dias", countryCodes: ["PE"], region: "América do Sul", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 5.5 },
  { id: "mock-uy-3gb-7d", name: "Uruguai 3GB — 7 dias", countryCodes: ["UY"], region: "América do Sul", dataAmountMb: 3072, validityDays: 7, wholesalePriceUsd: 6.0 },
  { id: "mock-global-5gb-15d", name: "Global 5GB — 15 dias", countryCodes: ["GLOBAL"], region: "Global", dataAmountMb: 5120, validityDays: 15, wholesalePriceUsd: 18.0 },
  { id: "mock-global-10gb-30d", name: "Global 10GB — 30 dias", countryCodes: ["GLOBAL"], region: "Global", dataAmountMb: 10240, validityDays: 30, wholesalePriceUsd: 32.0 },
];

const orders = new Map<string, { planId: string; ref: string; status: ProviderOrderStatus["status"] }>();

function generateIccid(): string {
  return `89${Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join("")}`;
}

export class MockProvider implements EsimProvider {
  async getCatalog(): Promise<ProviderPlan[]> {
    return MOCK_CATALOG;
  }

  async getPlan(providerPlanId: string): Promise<ProviderPlan | null> {
    return MOCK_CATALOG.find((p) => p.id === providerPlanId) ?? null;
  }

  async createOrder(providerPlanId: string, ref: string): Promise<ProviderOrder> {
    const plan = await this.getPlan(providerPlanId);
    if (!plan) throw new Error(`Plano não encontrado: ${providerPlanId}`);

    const providerOrderId = `mock-order-${ref}-${Date.now()}`;
    orders.set(providerOrderId, { planId: providerPlanId, ref, status: "completed" });

    return { providerOrderId, status: "completed" };
  }

  async getOrderStatus(providerOrderId: string): Promise<ProviderOrderStatus> {
    const order = orders.get(providerOrderId);
    if (!order) return { providerOrderId, status: "failed", error: "Pedido não encontrado" };
    return { providerOrderId, status: order.status };
  }

  async getEsimDetails(providerOrderId: string): Promise<EsimDelivery> {
    const order = orders.get(providerOrderId);
    if (!order) throw new Error(`Pedido não encontrado: ${providerOrderId}`);

    const iccid = generateIccid();
    const smdpAddress = "rsp.mock.esim.provider";
    const activationCode = `LPA:1$${smdpAddress}$MOCK-${providerOrderId.slice(-8)}`;
    const qrCodeUrl = await QRCode.toDataURL(activationCode, { width: 300, margin: 2 });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return { iccid, qrCodeUrl, smdpAddress, activationCode, expiresAt };
  }

  async getUsage(iccid: string): Promise<EsimUsage | null> {
    return {
      iccid,
      dataUsedMb: Math.floor(Math.random() * 500),
      dataTotalMb: 3072,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }
}

export const mockProvider = new MockProvider();
