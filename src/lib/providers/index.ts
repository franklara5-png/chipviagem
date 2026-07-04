import type { EsimProvider } from "./types";
import { mockProvider } from "./mock";
// import { EsimAccessProvider } from "./esimaccess";
// import { BappyProvider } from "./bappy";

export function getProvider(): EsimProvider {
  const provider = process.env.ESIM_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
      return mockProvider;
    // case "esimaccess":
    //   return new EsimAccessProvider();
    // case "bappy":
    //   return new BappyProvider();
    default:
      throw new Error(`Provider desconhecido: ${provider}`);
  }
}

export * from "./types";
