/**
 * Review-source marks.
 *
 * Inline SVG rather than `<Image src="/brand/trust/…">` on purpose: these
 * render at 16–40px beside text, where a raster mark goes soft, and they
 * appear on nearly every page — inlining them costs no request and lets the
 * mark inherit its box from the type around it. The `.svg` files under
 * /public/brand/trust are the same artwork, kept for OG images and anywhere
 * a URL is needed.
 *
 * Both marks are third-party trademarks used to identify the platform a
 * review came from. They are never recoloured or combined with our own.
 */

export function GoogleWordmark({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 168"
      className={className}
      role="img"
      aria-label="Google"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M496.052455,102.672055 L510.255737,112.140909 C505.6459,118.931075 494.619668,130.580258 475.557368,130.580258 C451.885231,130.580258 434.255719,112.2655 434.255719,88.967133 C434.255719,64.1736841 452.072116,47.3540078 473.563925,47.3540078 C495.180323,47.3540078 505.77049,64.5474546 509.19672,73.8294242 L511.065574,78.5638516 L455.373756,101.613038 C459.609823,109.960581 466.213103,114.196648 475.557368,114.196648 C484.901633,114.196648 491.380323,109.586811 496.052455,102.672055 L496.052455,102.672055 Z M452.383592,87.6589359 L489.573765,72.2097517 C487.518026,67.0392586 481.413107,63.3638478 474.124581,63.3638478 C464.842612,63.3638478 451.947526,71.5868007 452.383592,87.6589359 L452.383592,87.6589359 Z"
        fill="#FF302F"
      />
      <path d="M407.406531,4.93104632 L425.347519,4.93104632 L425.347519,126.780257 L407.406531,126.780257 L407.406531,4.93104632 L407.406531,4.93104632 Z" fill="#20B15A" />
      <path
        d="M379.124557,50.5933528 L396.442594,50.5933528 L396.442594,124.599929 C396.442594,155.311412 378.314721,167.957316 356.885207,167.957316 C336.701596,167.957316 324.554051,154.376986 320.00651,143.350753 L335.891759,136.747473 C338.757334,143.537639 345.67209,151.573706 356.885207,151.573706 C370.652424,151.573706 379.124557,143.039278 379.124557,127.091732 L379.124557,121.111404 L378.501606,121.111404 C374.39013,126.095011 366.540947,130.580258 356.573731,130.580258 C335.767169,130.580258 316.704869,112.452385 316.704869,89.0917231 C316.704869,65.6064713 335.767169,47.2917126 356.573731,47.2917126 C366.478652,47.2917126 374.39013,51.7146646 378.501606,56.5736822 L379.124557,56.5736822 L379.124557,50.5933528 L379.124557,50.5933528 Z M380.370459,89.0917231 C380.370459,74.3900801 370.590128,63.6753233 358.131109,63.6753233 C345.547499,63.6753233 334.957333,74.3900801 334.957333,89.0917231 C334.957333,103.606481 345.547499,114.134352 358.131109,114.134352 C370.590128,114.196648 380.370459,103.606481 380.370459,89.0917231 L380.370459,89.0917231 Z"
        fill="#3686F7"
      />
      <path
        d="M218.21632,88.7802476 C218.21632,112.763861 199.527791,130.393373 176.603195,130.393373 C153.678599,130.393373 134.990069,112.701565 134.990069,88.7802476 C134.990069,64.6720448 153.678599,47.1048274 176.603195,47.1048274 C199.527791,47.1048274 218.21632,64.6720448 218.21632,88.7802476 L218.21632,88.7802476 Z M200.026151,88.7802476 C200.026151,73.8294242 189.186804,63.5507331 176.603195,63.5507331 C164.019585,63.5507331 153.180238,73.8294242 153.180238,88.7802476 C153.180238,103.606481 164.019585,114.009763 176.603195,114.009763 C189.186804,114.009763 200.026151,103.606481 200.026151,88.7802476 L200.026151,88.7802476 Z"
        fill="#FF302F"
      />
      <path
        d="M309.104867,88.967133 C309.104867,112.950746 290.416338,130.580258 267.491742,130.580258 C244.567146,130.580258 225.878617,112.950746 225.878617,88.967133 C225.878617,64.8589302 244.567146,47.3540078 267.491742,47.3540078 C290.416338,47.3540078 309.104867,64.796635 309.104867,88.967133 L309.104867,88.967133 Z M290.852404,88.967133 C290.852404,74.0163095 280.013057,63.7376184 267.429447,63.7376184 C254.845837,63.7376184 244.00649,74.0163095 244.00649,88.967133 C244.00649,103.793366 254.845837,114.196648 267.429447,114.196648 C280.075352,114.196648 290.852404,103.731071 290.852404,88.967133 L290.852404,88.967133 Z"
        fill="#FFBA40"
      />
      <path
        d="M66.5900525,112.327794 C40.4884066,112.327794 20.0556146,91.2720515 20.0556146,65.1704056 C20.0556146,39.0687598 40.4884066,18.0130168 66.5900525,18.0130168 C80.6687446,18.0130168 90.9474357,23.5572805 98.5474373,30.6589216 L111.068752,18.137607 C100.478585,7.98350613 86.3375984,0.258913997 66.5900525,0.258913997 C30.8326666,0.258913997 0.744134408,29.4130196 0.744134408,65.1704056 C0.744134408,100.927792 30.8326666,130.081897 66.5900525,130.081897 C85.9015328,130.081897 100.478585,123.727797 111.878588,111.891729 C123.590067,100.180251 127.203183,83.7343447 127.203183,70.4031939 C127.203183,66.2294223 126.704822,61.9310606 126.144166,58.7540106 L66.5900525,58.7540106 L66.5900525,76.0720477 L109.013014,76.0720477 C107.767112,86.9113947 104.340882,94.3245113 99.2949785,99.3704142 C93.1900592,105.537629 83.534319,112.327794 66.5900525,112.327794 L66.5900525,112.327794 L66.5900525,112.327794 Z"
        fill="#3686F7"
      />
    </svg>
  );
}

/** The Tripadvisor owl. The wordmark is set in our own type beside it. */
export function TripAdvisorOwl({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -96 512.2 512.2"
      className={className}
      role="img"
      aria-label="Tripadvisor"
      fill="#08808a"
    >
      <path d="M128.2 127.9C92.7 127.9 64 156.6 64 192c0 35.4 28.7 64.1 64.1 64.1 35.4 0 64.1-28.7 64.1-64.1.1-35.4-28.6-64.1-64-64.1zm0 110c-25.3 0-45.9-20.5-45.9-45.9s20.5-45.9 45.9-45.9S174 166.7 174 192s-20.5 45.9-45.8 45.9z" />
      <circle cx="128.4" cy="191.9" r="31.9" />
      <path d="M384.2 127.9c-35.4 0-64.1 28.7-64.1 64.1 0 35.4 28.7 64.1 64.1 64.1 35.4 0 64.1-28.7 64.1-64.1 0-35.4-28.7-64.1-64.1-64.1zm0 110c-25.3 0-45.9-20.5-45.9-45.9s20.5-45.9 45.9-45.9S430 166.7 430 192s-20.5 45.9-45.8 45.9z" />
      <circle cx="384.4" cy="191.9" r="31.9" />
      <path d="M474.4 101.2l37.7-37.4h-76.4C392.9 29 321.8 0 255.9 0c-66 0-136.5 29-179.3 63.8H0l37.7 37.4C14.4 124.4 0 156.5 0 192c0 70.8 57.4 128.2 128.2 128.2 32.5 0 62.2-12.1 84.8-32.1l43.4 31.9 42.9-31.2-.5-1.2c22.7 20.2 52.5 32.5 85.3 32.5 70.8 0 128.2-57.4 128.2-128.2-.1-35.4-14.6-67.5-37.9-90.7zM368 64.8c-60.7 7.6-108.3 57.6-111.9 119.5-3.7-61.9-51.3-111.9-112-119.5 34.2-14.8 71.7-23 111.9-23s77.8 8.2 112 23zM128.2 279.6c-48.4 0-87.6-39.2-87.6-87.6s39.2-87.6 87.6-87.6 87.6 39.2 87.6 87.6-39.2 87.6-87.6 87.6zm256 0c-48.4 0-87.6-39.2-87.6-87.6s39.2-87.6 87.6-87.6 87.6 39.2 87.6 87.6-39.2 87.6-87.6 87.6z" />
    </svg>
  );
}

/** The owl plus the platform name, the way Tripadvisor badges are read. */
export function TripAdvisorLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <TripAdvisorOwl className="h-4 w-auto" />
      <span className="text-sm font-semibold tracking-tight text-[#08808a]">Tripadvisor</span>
    </span>
  );
}

/**
 * The mark for whichever platform a review came from.
 *
 * `Direct` deliberately renders nothing — a review we collected ourselves
 * must not borrow a third party's credibility mark.
 */
export function SourceMark({
  source,
  className = "h-4 w-auto",
}: {
  source: "Google" | "TripAdvisor" | "Direct";
  className?: string;
}) {
  if (source === "Google") return <GoogleWordmark className={className} />;
  if (source === "TripAdvisor") return <TripAdvisorOwl className={className} />;
  return null;
}

/**
 * A star row.
 *
 * Renders `value` stars out of five with a single accessible label, so a
 * screen reader hears "5 out of 5" once rather than five separate stars.
 * Half stars are filled proportionally with a clip, since an average of 4.9
 * must not round up to a perfect row.
 */
export function Stars({
  value,
  className = "",
  size = 16,
  label,
}: {
  value: number;
  className?: string;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const full = Math.floor(clamped);
  const fraction = clamped - full;

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={label ?? `${clamped} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = i < full ? 1 : i === full ? fraction : 0;
        return <Star key={i} fill={fill} size={size} />;
      })}
    </span>
  );
}

const STAR_PATH =
  "M12 2.6l2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.03l-5.66 2.98 1.08-6.3L2.85 9.25l6.32-.92L12 2.6z";

function Star({ fill, size }: { fill: number; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d={STAR_PATH} fill="var(--color-sand-300)" />
      {fill > 0 ? (
        // A nested <svg> clips to its own viewport, which gives the partial
        // fill without a `clipPath`. Ids in inline SVG are document-scoped,
        // not element-scoped, so two star rows on one page would share — and
        // fight over — a single `<clipPath id>`.
        <svg x="0" y="0" width={24 * fill} height={24} viewBox={`0 0 ${24 * fill} 24`}>
          <path d={STAR_PATH} fill="#f5a623" />
        </svg>
      ) : null}
    </svg>
  );
}
