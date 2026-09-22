import Script from "next/script";

export const GSC_VERIFICATION = "VXpuFnwqw67_f4M7YpNEpvOKNTXmeD2-BGzLlSvq3f8";
export const GA4_ID = "G-TNFHV5HKFQ";
/** Google Ads, for conversion tracking and remarketing audiences. */
export const GOOGLE_ADS_ID = "AW-18468011419";

/**
 * GA4 and Google Ads, plus the two contact events worth counting.
 *
 * Both products ride one gtag.js load. The tag Google hands you pastes its own
 * `<script src=...gtag/js?id=...>`, but that file is the same library whatever
 * id is in the query string, so pasting it verbatim would download and run it
 * twice. One loader and one `config` call per product is the documented way to
 * run several Google tags on a page, and it is what the second `config` below
 * does.
 *
 * WhatsApp and phone taps are delegated from one listener on the document
 * rather than an `onClick` on each link. There are WhatsApp links in the
 * header, the mobile menu, the footer, the desk chat and several page bodies;
 * wiring each would mean turning server components into client ones and
 * remembering the next one. A single capture-phase listener matched on `href`
 * catches every link that exists today and every link added later.
 *
 * It is inline rather than a React island so it costs no hydration, and it is
 * wrapped in a guard so a blocked gtag cannot throw into a click handler that
 * is otherwise about to navigate the visitor to WhatsApp.
 */
const CONTACT_EVENTS = `
(function(){
  document.addEventListener('click', function(e){
    try {
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a || typeof window.gtag !== 'function') return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('wa.me/') > -1 || href.indexOf('whatsapp.com') > -1) {
        window.gtag('event', 'whatsapp_click', { link_url: href, page_path: location.pathname });
      } else if (href.indexOf('tel:') === 0) {
        window.gtag('event', 'phone_click', { link_url: href, page_path: location.pathname });
      }
    } catch (err) { /* measurement must never break a navigation */ }
  }, true);
})();
`;

export function Analytics() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
      <Script id="google-tags" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');gtag('config','${GOOGLE_ADS_ID}');`}
      </Script>
      <Script id="ga4-contact-events" strategy="afterInteractive">
        {CONTACT_EVENTS}
      </Script>
    </>
  );
}
