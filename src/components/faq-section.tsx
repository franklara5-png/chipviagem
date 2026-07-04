interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection({ items, title = "Perguntas frequentes" }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold text-ink">{title}</h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-lg border border-slate-200 bg-white p-4"
          >
            <summary className="cursor-pointer font-medium text-ink marker:content-none">
              <span className="flex items-center justify-between">
                {item.question}
                <span className="text-primary transition group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
