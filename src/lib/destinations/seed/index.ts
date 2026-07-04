import type { DestinationSeed } from "../types";
import { europeDestinations } from "./europe";
import { americasDestinations } from "./americas";
import { asiaPacificDestinations } from "./asia-pacific";
import { africaGlobalDestinations } from "./africa-global";

export const allDestinations: DestinationSeed[] = [
  ...europeDestinations,
  ...americasDestinations,
  ...asiaPacificDestinations,
  ...africaGlobalDestinations,
];

export {
  europeDestinations,
  americasDestinations,
  asiaPacificDestinations,
  africaGlobalDestinations,
};
