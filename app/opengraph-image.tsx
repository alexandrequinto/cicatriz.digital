import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'cicatriz.digital — Your natal chart in your calendar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0c0c0b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          fontFamily: 'serif',
        }}
      >
        {/* Decorative symbols top-right */}
        <div style={{ position: 'absolute', top: 60, right: 80, display: 'flex', gap: 32, color: '#3a3830', fontSize: 96 }}>
          <span>♄</span><span>☉</span><span>☽</span><span>♈</span>
        </div>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 700, color: '#ddd8cc', letterSpacing: '-1px', display: 'flex' }}>
            cicatriz.<span style={{ color: '#f59e0b' }}>digital</span>
          </div>
          <div style={{ fontSize: 28, color: '#6b6660', fontWeight: 400, display: 'flex' }}>
            Your natal chart in your calendar
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
