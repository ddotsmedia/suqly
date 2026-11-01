export const dynamic = 'force-static';

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#2563eb"/><text x="256" y="350" font-family="Arial, sans-serif" font-size="300" font-weight="700" text-anchor="middle" fill="#ffffff">S</text></svg>';

export function GET() {
  return new Response(SVG, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}
