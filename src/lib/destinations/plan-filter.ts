import { and, eq, sql, type SQL } from "drizzle-orm";
import { plans } from "@/db/schema";

export function getPlanFilterForDestination(countryCode: string): SQL | undefined {
  const active = eq(plans.isActive, true);

  switch (countryCode) {
    case "EU":
      return and(active, eq(plans.region, "Europa"));
    case "GLOBAL":
      return and(active, eq(plans.region, "Global"));
    case "ASIA":
      return and(active, eq(plans.region, "Ásia"));
    case "SAM":
      return and(active, eq(plans.region, "América do Sul"));
    default:
      return and(active, sql`${countryCode} = ANY(${plans.countryCodes})`);
  }
}
