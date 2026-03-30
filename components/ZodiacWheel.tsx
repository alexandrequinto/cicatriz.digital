'use client';

import { useState } from 'react';
import { SIGN_SYMBOLS, type PlanetPosition } from '@/lib/skySnapshot';

const CX = 140;
const CY = 140;
const R_OUTER = 126;
const R_SIGN_INNER = 108;
const R_SIGN_GLYPH = 117;
const R_PLANET = 82;
const R_CENTER_DOT = 4;

function lonToXY(lon: number, r: number): { x: number; y: number } {
  const rad = ((lon - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export interface WheelPosition extends PlanetPosition {
  localizedName: string;
  localizedSign: string;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export default function ZodiacWheel({
  positions,
  localizedSigns,
}: {
  positions: WheelPosition[];
  localizedSigns: string[];
}) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const signLines = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    return { outer: lonToXY(angle, R_OUTER), inner: lonToXY(angle, R_SIGN_INNER) };
  });

  const signGlyphs = SIGN_SYMBOLS.map((sym, i) => {
    const angle = i * 30 + 15;
    const { x, y } = lonToXY(angle, R_SIGN_GLYPH);
    return { sym, x, y, name: localizedSigns[i] };
  });

  // Clamp tooltip x so it doesn't overflow the 280px container
  function tooltipStyle(x: number, y: number) {
    const halfW = 80; // approx half of max tooltip width
    const clampedX = Math.min(Math.max(x, halfW), 280 - halfW);
    return { left: clampedX, top: y - 18 };
  }

  return (
    <div className="relative mx-auto select-none" style={{ width: 280, height: 280 }}>
      <svg
        viewBox="0 0 280 280"
        width="280"
        height="280"
        aria-hidden="true"
      >
        {/* Rings */}
        <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R_SIGN_INNER} fill="none" stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.75" />
        <circle cx={CX} cy={CY} r={48} fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.75" />

        {/* Sign dividers */}
        {signLines.map(({ outer, inner }, i) => (
          <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.75" />
        ))}

        {/* Sign glyphs */}
        {signGlyphs.map(({ sym, x, y, name }, i) => (
          <g
            key={i}
            onMouseEnter={() => setTooltip({ text: name, x, y })}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor: 'default' }}
          >
            <circle cx={x} cy={y} r={10} fill="transparent" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fontSize="9" fill="currentColor" fillOpacity="0.25" pointerEvents="none">
              {sym}
            </text>
          </g>
        ))}

        {/* Planet glyphs */}
        {positions.map(({ planet, symbol, longitude, isRetrograde, localizedName, localizedSign, degree, minute }) => {
          const { x, y } = lonToXY(longitude, R_PLANET);
          const label = `${localizedName}${isRetrograde ? ' ℞' : ''} · ${localizedSign} ${degree}°${minute.toString().padStart(2, '0')}′`;
          return (
            <g
              key={planet}
              onMouseEnter={() => setTooltip({ text: label, x, y })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'default' }}
            >
              <circle cx={x} cy={y} r={12} fill="transparent" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fill="currentColor" fillOpacity={isRetrograde ? 0.4 : 0.75}
                pointerEvents="none">
                {symbol}
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={R_CENTER_DOT} fill="currentColor" fillOpacity="0.08" />
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-full
            text-[10px] text-foreground/70 bg-background border border-foreground/10
            rounded px-2 py-0.5 whitespace-nowrap z-10"
          style={tooltipStyle(tooltip.x, tooltip.y)}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
