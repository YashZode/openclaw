interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 160, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Couch body */}
      <path
        d="M30 130 L30 100 Q30 90 40 90 L160 90 Q170 90 170 100 L170 130"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Couch seat cushion */}
      <path d="M30 130 L170 130" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Couch left arm */}
      <path
        d="M30 90 L22 90 Q18 90 18 94 L18 135 Q18 140 23 140 L30 140"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Couch right arm */}
      <path
        d="M170 90 L178 90 Q182 90 182 94 L182 135 Q182 140 177 140 L170 140"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Couch base */}
      <path d="M23 140 L177 140" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Couch legs */}
      <line
        x1="35"
        y1="140"
        x2="33"
        y2="150"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="165"
        y1="140"
        x2="167"
        y2="150"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Astronaut body - lounging */}
      <path
        d="M65 88 L65 75 Q65 70 70 68 L85 65"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Astronaut torso reclined */}
      <path
        d="M85 65 L110 72 Q115 74 118 80 L125 95"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Astronaut legs stretched */}
      <path
        d="M125 95 L145 100 Q150 102 155 108 L160 120"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Astronaut boot */}
      <path
        d="M160 120 L165 122 L163 128"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Helmet */}
      <circle cx="78" cy="52" r="16" stroke="currentColor" strokeWidth="2.5" />
      {/* Helmet visor */}
      <path
        d="M70 48 Q78 42 86 48 Q86 56 78 58 Q70 56 70 48Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Right arm waving */}
      <path
        d="M108 74 L120 58 L128 42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Waving hand */}
      <path
        d="M128 42 L132 36 M128 42 L134 40 M128 42 L133 45"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Left arm holding coffee */}
      <path
        d="M85 72 L55 82 L50 90"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Coffee mug */}
      <rect
        x="44"
        y="88"
        width="14"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Mug handle */}
      <path
        d="M58 91 Q63 91 63 96 Q63 100 58 100"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Steam */}
      <path
        d="M48 86 Q46 82 49 79"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M53 85 Q55 81 52 78"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Side table */}
      <rect
        x="138"
        y="68"
        width="30"
        height="2"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Table legs */}
      <line
        x1="142"
        y1="70"
        x2="140"
        y2="88"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="164"
        y1="70"
        x2="166"
        y2="88"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Laptop on table */}
      <path
        d="M143 67 L143 56 Q143 54 145 54 L161 54 Q163 54 163 56 L163 67"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Laptop screen glow dot */}
      <circle cx="153" cy="60" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
