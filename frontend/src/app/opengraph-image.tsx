import { ImageResponse } from 'next/og';

export const alt = 'Suqly - UAE Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: 80,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800 }}>Suqly</div>
        <div style={{ fontSize: 40, marginTop: 16 }}>
          Buy and sell verified local listings across the UAE
        </div>
      </div>
    ),
    size,
  );
}
