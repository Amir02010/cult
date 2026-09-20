import React from 'react';

/* All icons share a 24×24 box and are drawn with strokes so they inherit
   colour and stay crisp at the small sizes the layout uses. */

const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  cart: (
    <>
      <path d="M3.5 5h2l2.2 9.4a1.6 1.6 0 0 0 1.6 1.2h7.3a1.6 1.6 0 0 0 1.6-1.2L20 8H6" />
      <circle cx="10" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </>
  ),
  burger: (
    <>
      <path d="M3.5 7h17" />
      <path d="M3.5 12h17" />
      <path d="M3.5 17h17" />
    </>
  ),
  close: (
    <>
      <path d="M5.5 5.5l13 13" />
      <path d="M18.5 5.5l-13 13" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="M13.5 6.5L19.5 12l-6 5.5" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H5" />
      <path d="M10.5 6.5L4.5 12l6 5.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </>
  ),
  minus: <path d="M5.5 12h13" />,
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5h5v2" />
      <path d="M6.5 7l1 12.5h9l1-12.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2C12 19 5 12 5 5.7a2 2 0 0 1 1.5-2.2z" />
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.5 3.6 5.4 3.6 8.5S14.4 18 12 20.5C9.6 18 8.4 15.1 8.4 12S9.6 6 12 3.5z" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
    </>
  ),
  list: (
    <>
      <path d="M8.5 7h11" />
      <path d="M8.5 12h11" />
      <path d="M8.5 17h11" />
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z" />
      <path d="M9 8.5h6M9 12.5h6" />
    </>
  ),
  tableIcon: (
    <>
      <path d="M3.5 9.5h17" />
      <path d="M5.5 9.5v9M18.5 9.5v9" />
      <path d="M4.5 6.5h15l1 3h-17z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z" />
    </>
  ),
  logout: (
    <>
      <path d="M14 7V5.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V17" />
      <path d="M9.5 12H20" />
      <path d="M16.5 8.5L20 12l-3.5 3.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4.5 17l5-5 4 4 2.5-2.5 3.5 3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.5 6.5A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.8" />
      <path d="M6.2 8.3A17 17 0 0 0 2.5 12S6 18 12 18a9.5 9.5 0 0 0 3.3-.6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16.5v-5M12.5 16.5v-9M17 16.5v-3" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.5-5.8" />
      <path d="M20 4v4.5h-4.5" />
    </>
  ),
  soundOn: (
    <>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="M15.6 9.2a4 4 0 0 1 0 5.6" />
      <path d="M18.2 6.8a7.5 7.5 0 0 1 0 10.4" />
    </>
  ),
  soundOff: (
    <>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      <path d="M16 10l4.5 4.5M20.5 10L16 14.5" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h1M20 14h.01" />
    </>
  ),

  /* ------------------------------------------------- menu category icons */
  sushi: (
    <>
      <rect x="4.6" y="13" width="14.8" height="5.6" rx="2.6" />
      <path d="M4.6 13c1.6-2.9 4.2-4.4 7.4-4.4s5.8 1.5 7.4 4.4" />
      <path d="M8.2 10.4c1.8 1 3.6 1.7 5.4 2" />
      <path d="M12 8.6V5.2" />
    </>
  ),
  steak: (
    <>
      <path d="M3.9 12.9c0-3.4 3.6-6.2 8.1-6.2 3.7 0 6.1 1.8 6.1 4.2 0 3.4-3.7 6.2-8.2 6.2-3.6 0-6-1.8-6-4.2z" />
      <path d="M8.4 12.6c.6-1.3 2-2.1 3.6-2.1" />
      <path d="M10.2 15c.5-1 1.6-1.7 2.9-1.8" />
    </>
  ),
  pizza: (
    <>
      <path d="M12 3.5L20.5 19a1 1 0 0 1-1.1 1.4 26 26 0 0 1-14.8 0A1 1 0 0 1 3.5 19z" />
      <circle cx="10.2" cy="13" r="1.1" />
      <circle cx="14" cy="16.2" r="1.1" />
      <circle cx="12" cy="8.6" r=".9" />
    </>
  ),
  bowl: (
    <>
      <path d="M3.5 11h17c0 4.4-3.8 7.5-8.5 7.5S3.5 15.4 3.5 11z" />
      <path d="M9 8.2c0-1.3.9-2.4 2-2.4M13 8.2c0-1.9 1.2-3.2 2.6-3.2" />
      <path d="M2.5 18.5h19" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c0 9-5 13-9.5 13A4.5 4.5 0 0 1 6 12.5C6 7.5 11.5 4.5 20 4z" />
      <path d="M4 20c2.5-4.5 6-7.5 10-9.5" />
    </>
  ),
  cocktail: (
    <>
      <path d="M4 5.5h16L12 14z" />
      <path d="M12 14v6" />
      <path d="M8.5 20h7" />
      <circle cx="16.5" cy="8" r="1" />
    </>
  ),
  cake: (
    <>
      <path d="M4 20v-5.5c0-1.4 1.2-2.5 2.6-2.5h10.8c1.4 0 2.6 1.1 2.6 2.5V20z" />
      <path d="M3 20h18" />
      <path d="M4 16c1.4 1.2 2.8 1.2 4.2 0s2.8-1.2 4.2 0 2.8 1.2 4.2 0 2-.9 3.4-.3" />
      <path d="M12 12V9M9 12v-2M15 12v-2" />
    </>
  ),
};

export const ICON_NAMES = Object.keys(paths);

export default function Icon({ name, size = 20, strokeWidth = 1.3, className = '', ...rest }) {
  const content = paths[name];
  if (!content) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {content}
    </svg>
  );
}
