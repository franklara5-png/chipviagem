/** Intensidade de uso: 0 = nenhum, 1 = leve, 2 = moderado, 3 = pesado */
export type UsageIntensity = 0 | 1 | 2 | 3;

export const INTENSITY_LABELS: Record<UsageIntensity, string> = {
  0: "Nenhum",
  1: "Leve",
  2: "Moderado",
  3: "Pesado",
};

export type HabitKey =
  | "maps"
  | "whatsapp"
  | "video"
  | "social"
  | "streaming"
  | "music"
  | "hotspot";

export interface HabitConfig {
  key: HabitKey;
  label: string;
  description: string;
  /** MB por hora em cada nível de intensidade (0 = não usa) */
  mbPerHour: Record<UsageIntensity, number>;
  /** Horas médias de uso por dia em cada nível */
  hoursPerDay: Record<UsageIntensity, number>;
}

/**
 * Premissas de consumo (valores conservadores para viagem):
 * - Maps/GPS: ~5 MB/h (navegação com mapas baixados consome menos)
 * - WhatsApp: ~15 MB/h (texto + alguns áudios; vídeos em Wi-Fi não contam)
 * - Chamadas de vídeo: ~300 MB/h em qualidade média (Zoom/FaceTime)
 * - Redes sociais: ~150 MB/h (scroll Instagram/TikTok com imagens)
 * - Streaming vídeo: ~1.000 MB/h em HD (Netflix/YouTube 720p)
 * - Música streaming: ~50 MB/h (Spotify qualidade normal)
 * - Hotspot notebook: ~200 MB/h (e-mail, navegação leve)
 */
export const HABITS: HabitConfig[] = [
  {
    key: "maps",
    label: "Maps / GPS",
    description: "Google Maps, Waze, Apple Maps",
    mbPerHour: { 0: 0, 1: 5, 2: 5, 3: 5 },
    hoursPerDay: { 0: 0, 1: 0.5, 2: 1.5, 3: 3 },
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Mensagens, áudios e ligações de voz",
    mbPerHour: { 0: 0, 1: 10, 2: 15, 3: 25 },
    hoursPerDay: { 0: 0, 1: 1, 2: 2, 3: 4 },
  },
  {
    key: "video",
    label: "Chamadas de vídeo",
    description: "Zoom, FaceTime, Google Meet",
    mbPerHour: { 0: 0, 1: 200, 2: 300, 3: 450 },
    hoursPerDay: { 0: 0, 1: 0.25, 2: 0.5, 3: 1 },
  },
  {
    key: "social",
    label: "Redes sociais",
    description: "Instagram, TikTok, Facebook",
    mbPerHour: { 0: 0, 1: 80, 2: 150, 3: 250 },
    hoursPerDay: { 0: 0, 1: 0.5, 2: 1, 3: 2 },
  },
  {
    key: "streaming",
    label: "Streaming de vídeo",
    description: "Netflix, YouTube, Prime Video",
    mbPerHour: { 0: 0, 1: 500, 2: 1000, 3: 1500 },
    hoursPerDay: { 0: 0, 1: 0.5, 2: 1, 3: 2 },
  },
  {
    key: "music",
    label: "Música",
    description: "Spotify, Apple Music, YouTube Music",
    mbPerHour: { 0: 0, 1: 40, 2: 50, 3: 70 },
    hoursPerDay: { 0: 0, 1: 1, 2: 2, 3: 4 },
  },
  {
    key: "hotspot",
    label: "Hotspot pro notebook",
    description: "E-mail e navegação no laptop",
    mbPerHour: { 0: 0, 1: 100, 2: 200, 3: 350 },
    hoursPerDay: { 0: 0, 1: 0.5, 2: 1.5, 3: 3 },
  },
];

export const SAFETY_MARGIN = 0.3;

export interface UsageInput {
  days: number;
  habits: Record<HabitKey, UsageIntensity>;
}

export function habitDailyMb(habit: HabitConfig, intensity: UsageIntensity): number {
  return habit.mbPerHour[intensity] * habit.hoursPerDay[intensity];
}

export function calculateDailyMb(habits: Record<HabitKey, UsageIntensity>): number {
  return HABITS.reduce((sum, h) => sum + habitDailyMb(h, habits[h.key]), 0);
}

export function calculateTotalMb(input: UsageInput): number {
  const daily = calculateDailyMb(input.habits);
  const raw = daily * input.days;
  return Math.ceil(raw * (1 + SAFETY_MARGIN));
}

export function mbToGb(mb: number): number {
  return Math.round((mb / 1024) * 10) / 10;
}

export function parseIntensity(value: string | null): UsageIntensity {
  const n = parseInt(value ?? "0", 10);
  if (n >= 0 && n <= 3) return n as UsageIntensity;
  return 0;
}

export function buildShareUrl(
  base: string,
  input: UsageInput,
  destino?: string
): string {
  const params = new URLSearchParams();
  params.set("dias", String(input.days));
  for (const h of HABITS) {
    params.set(h.key, String(input.habits[h.key]));
  }
  if (destino) params.set("destino", destino);
  return `${base}?${params.toString()}`;
}
