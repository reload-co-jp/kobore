import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import { JsonLd } from "@/components/JsonLd"
import { SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site"
import "./globals.css"

const GA_ID = "G-0YMPKPWBBD"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${TAGLINE}言葉の一部分がこぼれ、ひとり歩きを始めた言葉の由来と意味の変化を読むWebメディア。`,
  openGraph: { siteName: SITE_NAME, locale: "ja_JP", type: "website" },
  twitter: { card: "summary_large_image" },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="ja">
    <body>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description: TAGLINE,
          inLanguage: "ja",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/search/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <header className="site-header">
        <Link href="/" className="logo">
          こぼれ<span className="logo-drop">ことば</span>
        </Link>
        <nav>
          <Link href="/search/">検索</Link>
          <Link href="/concept/">こぼれことばとは</Link>
          <Link href="/about/">このサイトについて</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <p>
          {SITE_NAME} — {TAGLINE}
        </p>
        <p>&copy; Reload Inc.</p>
      </footer>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${GA_ID}");`}
      </Script>
    </body>
  </html>
)
export default RootLayout
