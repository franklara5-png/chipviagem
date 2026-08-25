/**
 * Início do dia em um fuso horário arbitrário, sem depender de date-fns-tz
 * (não instalado neste repo). Funciona mesmo que o fuso tenha horário de
 * verão, porque calcula o offset real na data em questão em vez de assumir
 * um deslocamento fixo.
 */

function getOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const map: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );

  return asUtc - date.getTime();
}

export function startOfTodayInTimeZone(timeZone: string, now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value);
  const day = Number(parts.find((p) => p.type === "day")!.value);

  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offsetMs = getOffsetMs(timeZone, guess);
  return new Date(guess.getTime() - offsetMs);
}
