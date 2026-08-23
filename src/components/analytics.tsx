import Script from "next/script";

/**
 * Google Analytics 4.
 *
 * Só renderiza se NEXT_PUBLIC_GA_ID estiver definida — sem a env, o site não
 * carrega script nenhum de terceiro. Aqui `next/script` é o componente certo:
 * diferente do JSON-LD, isto é código executável.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
