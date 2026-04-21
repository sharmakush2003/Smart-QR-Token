import { Inter } from "next/font/google";
import "./globals.css";

// Ultra premium sans-serif typography for SaaS
const inter = Inter({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export const metadata = {
  title: "Smart Menu Engine",
  description: "Enterprise Grade QR Ordering Ecosystem",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
