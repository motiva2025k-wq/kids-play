// Ícones SVG inline — originais, leves (sem arquivos externos) e coloridos.
// Todos: role="img" implícito decorativo (aria-hidden) pois o rótulo textual
// sempre aparece ao lado (acessibilidade).

export function IconeEstrela({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17l-6 3.3 1.3-6.7-5-4.6 6.8-.8z"
        fill="#f5b301"
        stroke="#7a5600"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 6l1.4 3 3.2.4-2.4 2.2.6 3.2L12 13.4 9.2 14.8l.6-3.2L7.4 9.4l3.2-.4z" fill="#ffe38a" />
    </svg>
  )
}

export function IconeMoeda({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.2" fill="#f5b301" stroke="#7a5600" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="6.4" fill="none" stroke="#c98a00" strokeWidth="1.2" />
      <path d="M12 7l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#fff3cd" stroke="#7a5600" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
}

export function IconeChama({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2c.8 3.6 4.8 5 4.8 9.2A4.9 4.9 0 0 1 12 22a4.9 4.9 0 0 1-4.8-4.9c0-2.4 1.4-3.7 2.4-5.1.2 1.8 1 2.7 1.8 2.7-1.2-3.4-.6-8.6.6-12.7z"
        fill="#f97316"
        stroke="#c2410c"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5c.9 1.4 1.9 2.2 1.9 3.6A1.95 1.95 0 0 1 12 18a1.95 1.95 0 0 1-1.9-1.9c0-1.4 1-2.2 1.9-3.6z"
        fill="#ffd75e"
      />
    </svg>
  )
}

export function IconeTrofeu({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 3h10v5a5 5 0 0 1-10 0z"
        fill="#f5b301"
        stroke="#7a5600"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7 4H4.5A2.5 2.5 0 0 0 7 8.5M17 4h2.5A2.5 2.5 0 0 1 17 8.5" fill="none" stroke="#7a5600" strokeWidth="1.6" />
      <rect x="10.6" y="13" width="2.8" height="4" fill="#c98a00" />
      <rect x="7.5" y="17" width="9" height="2.6" rx="1" fill="#f5b301" stroke="#7a5600" strokeWidth="1.4" />
      <path d="M12 5.2l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#fff3cd" />
    </svg>
  )
}

export function IconeCoroa({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 8l4 3 5-6 5 6 4-3-2 11H5z"
        fill="#f5b301"
        stroke="#7a5600"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="5" y="19" width="14" height="2.4" rx="1" fill="#c98a00" />
      <circle cx="8" cy="14" r="1.1" fill="#38bdf8" />
      <circle cx="16" cy="14" r="1.1" fill="#ec4899" />
      <circle cx="12" cy="12.5" r="1.1" fill="#4caf50" />
    </svg>
  )
}

export function IconePergaminho({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5A1.5 1.5 0 0 1 6 4z"
        fill="#fff3cd"
        stroke="#7a5600"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" stroke="#7a5600" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 4a1.6 1.6 0 0 0 0 3h1.4V4z" fill="#f5b301" stroke="#7a5600" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

export function IconeBau({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="9" width="18" height="11" rx="1.5" fill="#b98a56" stroke="#7d5a2a" strokeWidth="1.6" />
      <path d="M3 9a9 6 0 0 1 18 0z" fill="#c99a66" stroke="#7d5a2a" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="3" y="12" width="18" height="2.6" fill="#f5b301" stroke="#7a5600" strokeWidth="1.2" />
      <rect x="10.4" y="12.4" width="3.2" height="4.2" rx="1" fill="#f5b301" stroke="#7a5600" strokeWidth="1.2" />
    </svg>
  )
}

export function IconeAvatar({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8.5" r="4" fill="#ede9fe" stroke="#4c1d95" strokeWidth="1.6" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0z" fill="#ede9fe" stroke="#4c1d95" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
