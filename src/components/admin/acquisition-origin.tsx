import { CHANNEL_LABELS, type AcquisitionChannel } from "@/lib/acquisition";

interface AcquisitionOriginProps {
  channel: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  referrerDomain: string | null;
  landingPage: string | null;
}

function label(value: string | null) {
  return value?.trim() ? value : "—";
}

export function AcquisitionOrigin({
  channel,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
  utmTerm,
  referrerDomain,
  landingPage,
}: AcquisitionOriginProps) {
  const channelKey = (channel ?? "unknown") as AcquisitionChannel;
  const channelLabel = CHANNEL_LABELS[channelKey] ?? channel ?? "Desconhecido";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2">
      <h2 className="mb-3 text-sm font-medium text-slate-600">Origem (first-touch)</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">Canal</dt>
          <dd className="font-medium">{channelLabel}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">Landing page</dt>
          <dd className="break-all font-mono text-xs">{label(landingPage)}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">Referrer</dt>
          <dd>{label(referrerDomain)}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">utm_source</dt>
          <dd>{label(utmSource)}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">utm_medium</dt>
          <dd>{label(utmMedium)}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">utm_campaign</dt>
          <dd>{label(utmCampaign)}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">utm_content</dt>
          <dd>{label(utmContent)}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
          <dt className="text-slate-500">utm_term</dt>
          <dd>{label(utmTerm)}</dd>
        </div>
      </dl>
    </section>
  );
}
