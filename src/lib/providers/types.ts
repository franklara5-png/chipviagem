export interface ProviderPlan {
  id: string;
  name: string;
  countryCodes: string[];
  region: string;
  dataAmountMb: number;
  validityDays: number;
  wholesalePriceUsd: number;
  description?: string;
}

export interface ProviderOrder {
  providerOrderId: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface ProviderOrderStatus {
  providerOrderId: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export interface EsimDelivery {
  iccid: string;
  qrCodeUrl: string;
  smdpAddress: string;
  activationCode: string;
  expiresAt?: Date;
}

export interface EsimUsage {
  iccid: string;
  dataUsedMb: number;
  dataTotalMb: number;
  expiresAt?: Date;
}

export interface EsimProvider {
  getCatalog(): Promise<ProviderPlan[]>;
  getPlan(providerPlanId: string): Promise<ProviderPlan | null>;
  createOrder(providerPlanId: string, ref: string): Promise<ProviderOrder>;
  getOrderStatus(providerOrderId: string): Promise<ProviderOrderStatus>;
  getEsimDetails(providerOrderId: string): Promise<EsimDelivery>;
  getUsage?(iccid: string): Promise<EsimUsage | null>;
}
