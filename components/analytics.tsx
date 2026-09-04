import Script from "next/script";

export const GSC_VERIFICATION = "VXpuFnwqw67_f4M7YpNEpvOKNTXmeD2-BGzLlSvq3f8";
export const GA4_ID = "G-TNFHV5HKFQ";

export function Analytics() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`}
      </Script>
    </>
  );
}
