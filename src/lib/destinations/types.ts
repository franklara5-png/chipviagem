import type { DestinationFaq, DestinationTip } from "@/db/schema";

export interface DestinationSeed {
  slug: string;
  name: string;
  countryCode: string;
  region: string;
  flagEmoji: string;
  heroText: string;
  intro: string;
  tipsJson: DestinationTip[];
  faqJson: DestinationFaq[];
  relatedPostSlugs: string[];
}
