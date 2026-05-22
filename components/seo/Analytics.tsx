import Script from 'next/script'

// Analytics IDs are alphanumeric (with optional dashes). This validator is
// defense-in-depth so a malformed env value never gets templated into an
// inline script tag.
const ID_PATTERN = /^[A-Za-z0-9-]+$/

function isValidId(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0 && ID_PATTERN.test(value)
}

// Server component. Reads NEXT_PUBLIC_* env vars at render time and emits the
// Yandex.Metrica and GA4 snippets when configured. Renders nothing when the
// corresponding env var is unset or malformed.
export function Analytics() {
  const yandexId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID
  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

  const hasYandex = isValidId(yandexId)
  const hasGa4 = isValidId(ga4Id)

  if (!hasYandex && !hasGa4) return null

  return (
    <>
      {hasYandex && (
        <>
          <Script id="ym-init" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(${yandexId}, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true});`}
          </Script>
          <noscript>
            <div>
              <img
                src={`https://mc.yandex.ru/watch/${yandexId}`}
                style={{ position: 'absolute', left: '-9999px' }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {hasGa4 && (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}');`}
          </Script>
        </>
      )}
    </>
  )
}
