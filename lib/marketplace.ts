/**
 * Platforms that already sell our tours.
 *
 * These are distribution marks, not the Trade desk on `/partners`.
 * Artwork is self-hosted — same reason the Discover Crete favicon
 * is not pulled live on every page view.
 */
export type MarketplacePartner = {
  id: "airbnb" | "getyourguide" | "viator" | "tripadvisor" | "tripcom" | "cooldestinations";
  name: string;
  src: string;
  width: number;
  height: number;
  fit: "icon" | "wordmark";
};

export const MARKETPLACE_PARTNERS: MarketplacePartner[] = [
  {
    id: "airbnb",
    name: "Airbnb",
    src: "/brand/partners/airbnb.svg",
    width: 256,
    height: 275,
    fit: "icon",
  },
  {
    id: "getyourguide",
    name: "GetYourGuide",
    src: "/brand/partners/getyourguide.svg",
    width: 256,
    height: 203,
    fit: "wordmark",
  },
  {
    id: "viator",
    name: "Viator",
    src: "/brand/partners/viator.svg",
    width: 369,
    height: 92,
    fit: "wordmark",
  },
  {
    id: "tripadvisor",
    name: "Tripadvisor",
    src: "/brand/trust/tripadvisor.svg",
    width: 512,
    height: 320,
    fit: "icon",
  },
  {
    id: "tripcom",
    name: "Trip.com",
    src: "/brand/partners/trip-com.webp",
    width: 282,
    height: 68,
    fit: "wordmark",
  },
  {
    id: "cooldestinations",
    name: "cool destinations",
    src: "/brand/partners/cool-destinations.png",
    width: 826,
    height: 179,
    fit: "wordmark",
  },
];
