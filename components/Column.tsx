import Link from "next/link"
import { FC, ReactNode } from "react"
import { JsonLd } from "@/components/JsonLd"
import { SemanticFlow } from "@/components/WordOrigin"
import { columnUrl, getColumn } from "@/lib/columns"
import { SITE_NAME, SITE_URL, wordUrl } from "@/lib/site"
import { getWord } from "@/lib/words"

/** コラム本文の外枠。構造化データ・パンくず・見出しを付ける */
export const Column: FC<{ slug: string; children: ReactNode }> = ({
  slug,
  children,
}) => {
  const c = getColumn(slug)
  return (
    <article className="word">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: c.title,
          description: c.description,
          datePublished: c.published,
          dateModified: c.published,
          inLanguage: "ja",
          mainEntityOfPage: `${SITE_URL}${columnUrl(slug)}`,
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
        }}
      />
      <nav className="breadcrumb" aria-label="パンくず">
        <Link href="/">{SITE_NAME}</Link> / <Link href="/columns/">コラム</Link>
      </nav>
      <header className="page-header">
        <h1>{c.title}</h1>
        <p className="muted">{c.published}</p>
      </header>
      {children}
    </article>
  )
}

/** 掲載語へのリンク。存在しない id ならビルドで落ちる */
export const W: FC<{ id: string }> = ({ id }) => {
  const w = getWord(id)!
  return <Link href={wordUrl(w)}>{w.term}</Link>
}

export const Flow: FC<{ id: string }> = ({ id }) => (
  <SemanticFlow word={getWord(id)!} />
)
