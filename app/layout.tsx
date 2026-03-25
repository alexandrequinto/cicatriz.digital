// Minimal root layout required by Next.js.
// Full layout (html, body, fonts, metadata, Analytics) lives in app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}
