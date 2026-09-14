import './globals.css';

export const metadata = {
  title: 'Ocena kandydatów — Handlowiec Go2Ops',
  description: 'Arkusz oceny kandydatów na stanowisko handlowca',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
