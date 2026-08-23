/**
 * Renderiza JSON-LD direto no HTML do servidor.
 *
 * NÃO usar `next/script` aqui: com a estratégia padrão (afterInteractive) o
 * script é injetado no cliente e o conteúdo não aparece na resposta HTML —
 * só no payload RSC. Crawlers que não executam JS (e o Rich Results Test)
 * simplesmente não enxergam o dado estruturado.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify é seguro aqui: o payload é montado no servidor a
          // partir de dados próprios. Escapamos "<" para evitar quebra de tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
