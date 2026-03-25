import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Cicatriz — Marked by the cosmos';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          fontFamily: 'monospace',
        }}
      >
        {/* Symbols — top left, uniform size */}
        <div style={{
          position: 'absolute', top: 72, left: 80,
          display: 'flex', gap: 28, color: 'rgba(255,255,255,0.12)', fontSize: 56,
          letterSpacing: '0.1em',
        }}>
          <span>♄</span><span>☽</span><span>♃</span><span>☿</span><span>♀</span><span>♂</span>
        </div>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 80, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px', display: 'flex' }}>
            Cicatriz
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.35)', fontWeight: 400, display: 'flex', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Marked by the cosmos
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.18)', fontWeight: 400, display: 'flex', letterSpacing: '0.15em' }}>
            Planetary transits · Lunar phases · Retrograde stations
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
