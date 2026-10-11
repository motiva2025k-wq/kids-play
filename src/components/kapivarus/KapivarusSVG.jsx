// Kapivarus em SVG pixel (32x32) — usado como fallback quando a imagem
// .webp não carrega e como referência visual original do personagem.
// shape-rendering="crispEdges" pra manter nitidez.
// Animações desativadas automaticamente via prefers-reduced-motion.

const POSES = [
  "neutro",
  "feliz",
  "comemorando",
  "pensando",
  "incentivando",
  "explicando",
  "lendo",
  "dormindo",
  "trono",
]

export default function KapivarusSVG({ pose = "neutro", size = 96, className = "", ariaLabel }) {
  const poseVal = POSES.includes(pose) ? pose : "neutro"
  const label = ariaLabel || `Kapivarus — ${poseVal}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={label}
      className={className}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Animações simples. Desativadas via CSS quando prefers-reduced-motion */}
        <style>
          {`
            .piscar {
              animation: kp-piscar 4s ease-in-out infinite;
            }
            .balanco-leve {
              animation: kp-balanco 6s ease-in-out infinite;
            }
            .pulo-comemorando {
              animation: kp-pulo 1.2s ease-in-out infinite;
            }
            @keyframes kp-piscar {
              0%, 92%, 100% { opacity: 1; }
              95% { opacity: 0; }
            }
            @keyframes kp-balanco {
              0%, 100% { transform: rotate(0deg); transform-origin: 16px 20px; }
              50% { transform: rotate(0.8deg); }
            }
            @keyframes kp-pulo {
              0%, 100% { transform: translateY(0); }
              30% { transform: translateY(-2px); }
              60% { transform: translateY(0); }
            }
            @media (prefers-reduced-motion: reduce) {
              .piscar, .balanco-leve, .pulo-comemorando {
                animation: none !important;
              }
            }
          `}
        </style>
      </defs>

      {/* Grupo com animações conforme pose */}
      <g className={poseVal === "comemorando" ? "pulo-comemorando" : poseVal === "feliz" ? "balanco-leve" : undefined}>
        {/* Capa de rei (vermelha) — reaproveitada */}
        <g>
          {/* Ombro/capa */}
          <rect x="6" y="14" width="20" height="10" fill="#d64545" />
          <rect x="7" y="15" width="18" height="8" fill="#ef4444" />
          {/* Barra dourada da capa */}
          <rect x="6" y="16" width="20" height="2" fill="#f5b301" />
          {/* Broche dourado */}
          <rect x="15" y="16" width="2" height="2" fill="#f59e0b" />
        </g>

        {/* Corpo capivara */}
        <g>
          {/* Tronco marrom-dourada */}
          <rect x="9" y="12" width="14" height="10" fill="#b98a56" />
          <rect x="10" y="13" width="12" height="8" fill="#c99a66" />
          {/* Barriga clara */}
          <rect x="11" y="16" width="10" height="5" fill="#e7c9a9" />
        </g>

        {/* Patas */}
        <g>
          <rect x="10" y="22" width="2" height="2" fill="#7d5a2a" />
          <rect x="12" y="22" width="2" height="2" fill="#b98a56" />
          <rect x="18" y="22" width="2" height="2" fill="#7d5a2a" />
          <rect x="20" y="22" width="2" height="2" fill="#b98a56" />
        </g>

        {/* Cabeça */}
        <g>
          {/* Crânio */}
          <rect x="8" y="8" width="16" height="10" fill="#b98a56" />
          <rect x="9" y="9" width="14" height="8" fill="#c99a66" />
          {/* Focinho largo */}
          <rect x="11" y="13" width="10" height="4" fill="#d7b08a" />
          <rect x="12" y="14" width="8" height="2" fill="#e7c9a9" />
          {/* Bochechas macias */}
          <rect x="9" y="12" width="2" height="2" fill="#d7b08a" />
          <rect x="21" y="12" width="2" height="2" fill="#d7b08a" />
        </g>

        {/* Orelhas */}
        <g>
          <rect x="10" y="7" width="3" height="3" fill="#b98a56" />
          <rect x="19" y="7" width="3" height="3" fill="#b98a56" />
          <rect x="11" y="8" width="1" height="1" fill="#e7c9a9" />
          <rect x="20" y="8" width="1" height="1" fill="#e7c9a9" />
        </g>

        {/* Coroa dourada pequena com gema azul */}
        <g>
          <rect x="12" y="5" width="8" height="2" fill="#f5b301" />
          <rect x="11" y="6" width="2" height="2" fill="#f5b301" />
          <rect x="19" y="6" width="2" height="2" fill="#f5b301" />
          <rect x="13" y="4" width="2" height="2" fill="#f5b301" />
          <rect x="17" y="4" width="2" height="2" fill="#f5b301" />
          <rect x="15" y="4" width="2" height="2" fill="#38bdf8" /> {/* gema azul */}
        </g>

        {/* Óculos redondos finos */}
        <g>
          <rect x="10" y="10" width="4" height="3" fill="none" stroke="#1e293b" strokeWidth="1" />
          <rect x="11" y="11" width="2" height="1" fill="#e0f2fe" opacity="0.8" />
          <rect x="18" y="10" width="4" height="3" fill="none" stroke="#1e293b" strokeWidth="1" />
          <rect x="19" y="11" width="2" height="1" fill="#e0f2fe" opacity="0.8" />
          <rect x="14" y="11" width="4" height="1" fill="#1e293b" />
        </g>

        {/* Olhos conforme pose */}
        {renderOlhos(poseVal)}

        {/* Boca conforme pose */}
        {renderBoca(poseVal)}

        {/* Acessórios/elementos específicos da pose */}
        {renderExtras(poseVal)}
      </g>
    </svg>
  )
}

function renderOlhos(pose) {
  // Olhos padrão: pretos com brilho
  if (pose === "dormindo") {
    return (
      <g>
        <rect x="11" y="11" width="3" height="1" fill="#1e293b" />
        <rect x="18" y="11" width="3" height="1" fill="#1e293b" />
      </g>
    )
  }
  if (pose === "pensando") {
    // Olhos virados levemente pra cima/reflexivos
    return (
      <g>
        <rect x="11" y="10" width="2" height="2" fill="#1e293b" />
        <rect x="12" y="11" width="1" height="1" fill="#fff" />
        <rect x="19" y="10" width="2" height="2" fill="#1e293b" />
        <rect x="20" y="11" width="1" height="1" fill="#fff" />
      </g>
    )
  }
  // Padrão (neutro/feliz/comemorando/incentivando/explicando/lendo/trono)
  return (
    <g className={pose === "feliz" || pose === "comemorando" || pose === "incentivando" ? undefined : "piscar"}>
      <rect x="11" y="11" width="2" height="2" fill="#1e293b" />
      <rect x="12" y="11" width="1" height="1" fill="#fff" />
      <rect x="19" y="11" width="2" height="2" fill="#1e293b" />
      <rect x="20" y="11" width="1" height="1" fill="#fff" />
    </g>
  )
}

function renderBoca(pose) {
  if (pose === "feliz" || pose === "comemorando" || pose === "incentivando") {
    // Sorriso
    return (
      <g>
        <rect x="12" y="15" width="8" height="1" fill="#7f1d1d" />
        <rect x="11" y="14" width="2" height="1" fill="#7f1d1d" />
        <rect x="19" y="14" width="2" height="1" fill="#7f1d1d" />
      </g>
    )
  }
  if (pose === "dormindo") {
    // Boca relaxada
    return (
      <g>
        <rect x="13" y="16" width="6" height="1" fill="#7f1d1d" />
      </g>
    )
  }
  if (pose === "pensando") {
    // Boca pensativa (pequena)
    return (
      <g>
        <rect x="14" y="16" width="4" height="1" fill="#7f1d1d" />
      </g>
    )
  }
  if (pose === "explicando") {
    // Boca aberta levemente
    return (
      <g>
        <rect x="12" y="15" width="8" height="2" fill="#7f1d1d" />
        <rect x="13" y="16" width="6" height="1" fill="#fecaca" />
      </g>
    )
  }
  if (pose === "lendo") {
    // Concentrado
    return (
      <g>
        <rect x="13" y="16" width="6" height="1" fill="#7f1d1d" />
      </g>
    )
  }
  // neutro/trono
  return (
    <g>
      <rect x="13" y="16" width="6" height="1" fill="#7f1d1d" />
    </g>
  )
}

function renderExtras(pose) {
  if (pose === "comemorando") {
    // Confete
    return (
      <g>
        <rect x="6" y="6" width="2" height="2" fill="#f59e0b" />
        <rect x="8" y="5" width="1" height="1" fill="#fbbf24" />
        <rect x="24" y="6" width="2" height="2" fill="#38bdf8" />
        <rect x="23" y="5" width="1" height="1" fill="#7dd3fc" />
        <rect x="5" y="12" width="1" height="2" fill="#4caf50" />
        <rect x="26" y="12" width="1" height="2" fill="#f87171" />
        {/* Braços pra cima */}
        <rect x="7" y="13" width="2" height="4" fill="#c99a66" />
        <rect x="23" y="13" width="2" height="4" fill="#c99a66" />
        <rect x="7" y="11" width="2" height="2" fill="#d7b08a" />
        <rect x="23" y="11" width="2" height="2" fill="#d7b08a" />
      </g>
    )
  }
  if (pose === "pensando") {
    // Balão de interrogação
    return (
      <g>
        <rect x="5" y="6" width="4" height="4" fill="#fff" stroke="#1e293b" strokeWidth="1" />
        <rect x="6" y="7" width="2" height="2" fill="#1e293b" />
        <rect x="7" y="9" width="1" height="1" fill="#1e293b" />
        {/* Mão no queixo */}
        <rect x="8" y="15" width="2" height="2" fill="#d7b08a" />
      </g>
    )
  }
  if (pose === "incentivando") {
    // Polegar pra cima
    return (
      <g>
        <rect x="23" y="13" width="2" height="5" fill="#c99a66" />
        <rect x="24" y="12" width="2" height="3" fill="#c99a66" />
        <rect x="25" y="11" width="1" height="2" fill="#c99a66" />
        <rect x="24" y="11" width="1" height="1" fill="#d7b08a" />
      </g>
    )
  }
  if (pose === "explicando") {
    // Ondas de voz (apontando)
    return (
      <g>
        <rect x="24" y="10" width="1" height="1" fill="#1e293b" />
        <rect x="25" y="9" width="1" height="1" fill="#1e293b" />
        <rect x="26" y="8" width="1" height="1" fill="#1e293b" />
        {/* Braço apontando */}
        <rect x="22" y="14" width="4" height="2" fill="#c99a66" />
        <rect x="25" y="13" width="1" height="1" fill="#d7b08a" />
      </g>
    )
  }
  if (pose === "lendo") {
    // Livro aberto
    return (
      <g>
        <rect x="4" y="14" width="5" height="6" fill="#fff" stroke="#1e293b" strokeWidth="1" />
        <rect x="5" y="15" width="1" height="1" fill="#38bdf8" />
        <rect x="7" y="15" width="1" height="1" fill="#f5b301" />
        <rect x="5" y="17" width="3" height="1" fill="#1e293b" />
        <rect x="5" y="19" width="2" height="1" fill="#1e293b" />
        {/* Mãos segurando livro */}
        <rect x="8" y="16" width="2" height="2" fill="#d7b08a" />
        <rect x="9" y="17" width="1" height="1" fill="#c99a66" />
      </g>
    )
  }
  if (pose === "dormindo") {
    // Zzz
    return (
      <g>
        <rect x="22" y="6" width="1" height="1" fill="#1e293b" />
        <rect x="23" y="5" width="1" height="1" fill="#1e293b" />
        <rect x="24" y="6" width="1" height="1" fill="#1e293b" />
      </g>
    )
  }
  if (pose === "trono") {
    // Trono simples (dourado)
    return (
      <g>
        <rect x="5" y="22" width="22" height="2" fill="#f5b301" />
        <rect x="6" y="20" width="3" height="2" fill="#f59e0b" />
        <rect x="23" y="20" width="3" height="2" fill="#f59e0b" />
        <rect x="9" y="21" width="14" height="1" fill="#f59e0b" />
      </g>
    )
  }
  return null
}
