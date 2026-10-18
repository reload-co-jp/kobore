import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb } from "@/components/Breadcrumb"
import { JsonLd } from "@/components/JsonLd"
import { RelatedWords } from "@/components/RelatedWords"
import { SourceList } from "@/components/SourceList"
import { SemanticFlow, WordOrigin } from "@/components/WordOrigin"
import { WordTimeline } from "@/components/WordTimeline"
import { columnUrl, getColumnsFor } from "@/lib/columns"
import {
  categoryUrl,
  SITE_NAME,
  SITE_URL,
  tagUrl,
  wordDescription,
  wordTitle,
  wordUrl,
} from "@/lib/site"
import {
  CLASSIFICATIONS,
  CONFIDENCE,
  USAGE_TYPES,
  getCategories,
  getRelated,
  getSourcesFor,
  getWord,
  getWords,
  originTerms,
} from "@/lib/words"

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () =>
  getWords().map((w) => ({ slug: w.id }))

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const w = getWord((await params).slug)
  if (!w) return {}
  return {
    title: wordTitle(w),
    description: wordDescription(w),
    alternates: { canonical: wordUrl(w) },
    openGraph: {
      type: "article",
      title: wordTitle(w),
      description: wordDescription(w),
      url: wordUrl(w),
      images: `/og/${w.id}.png`,
    },
  }
}

const Page = async ({ params }: Props) => {
  const w = getWord((await params).slug)
  if (!w) notFound()
  const related = getRelated(w)
  const sources = getSourcesFor(w)
  const url = `${SITE_URL}${wordUrl(w)}`
  const categories = getCategories().filter((c) => w.categories.includes(c.id))
  const columns = getColumnsFor([w.id])

  return (
    <article className="word">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: wordTitle(w),
              description: wordDescription(w),
              dateModified: w.updated_at,
              inLanguage: "ja",
              mainEntityOfPage: url,
              publisher: {
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
              },
              about: {
                "@type": "DefinedTerm",
                name: w.term,
                alternateName: originTerms(w),
                description: w.current_meanings
                  .map((m) => m.meaning)
                  .join("、"),
                url,
              },
              citation: sources.map((s) => ({
                "@type": "CreativeWork",
                name: s.title,
                ...(s.url && { url: s.url }),
              })),
            },
          ],
        }}
      />

      <Breadcrumb items={[{ name: w.term, url: wordUrl(w) }]} />

      <header className="word-hero">
        <h1 className="word-term">
          {w.term}
          <span className="word-reading">{w.reading}</span>
        </h1>
        <p className="word-origin">← {originTerms(w).join("／")}</p>
        <p className="word-lead">{w.lead}</p>
      </header>

      <WordOrigin word={w} />

      <dl className="facts">
        <div>
          <dt>元の言葉</dt>
          <dd>{originTerms(w).join("、")}</dd>
        </div>
        <div>
          <dt>こぼれた部分</dt>
          <dd>{w.origin.extracted}</dd>
        </div>
        <div>
          <dt>種類</dt>
          <dd>{w.classification.map((c) => CLASSIFICATIONS[c]).join(" / ")}</dd>
        </div>
        <div>
          <dt>現在の意味</dt>
          <dd>{w.current_meanings.map((m) => m.meaning).join("、")}</dd>
        </div>
        <div>
          <dt>信頼度</dt>
          <dd>
            <span className={`confidence confidence-${w.confidence}`}>
              {CONFIDENCE[w.confidence]}
            </span>
          </dd>
        </div>
      </dl>

      <section className="section">
        <h2 className="section-title">意味の変化</h2>
        <SemanticFlow word={w} />
        <p className="flow-summary">
          {w.semantic_change.from} → {w.semantic_change.to}
        </p>
      </section>

      <section className="section prose">
        {w.article.map((a) => (
          <section key={a.heading}>
            <h2>{a.heading}</h2>
            <p>{a.body}</p>
          </section>
        ))}
      </section>

      <section className="section">
        <h2 className="section-title">元の意味と今の意味</h2>
        <div className="prose">
          <p>{w.origin_meaning.text}</p>
        </div>
        <ul className="meanings">
          {w.current_meanings.map((m) => (
            <li key={m.meaning}>
              <strong>{m.meaning}</strong>
              <span>{m.description}</span>
            </li>
          ))}
        </ul>
      </section>

      {w.timeline.length > 0 && (
        <section className="section">
          <h2 className="section-title">タイムライン</h2>
          <WordTimeline word={w} />
        </section>
      )}

      <section className="section">
        <h2 className="section-title">用例</h2>
        <ul className="examples">
          {w.usage_examples.map((u) => (
            <li key={u.text}>
              <q>{u.text}</q>
              <span className="muted">
                {USAGE_TYPES[u.type]}・{u.meaning}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">関連するこぼれことば</h2>
        {related.length > 0 && <RelatedWords word={w} related={related} />}
        {/* 関連語が少ないときの受け皿。無関係な語は並べず、一覧ページへ案内する */}
        {related.length < 3 && (
          <p className="muted">
            {categories.map((c, i) => (
              <span key={c.id}>
                {i > 0 && "・"}
                <Link href={categoryUrl(c.id)}>{c.name}言葉の一覧</Link>
              </span>
            ))}
            からも探せます。
          </p>
        )}
      </section>

      {columns.length > 0 && (
        <section className="section">
          <h2 className="section-title">「{w.term}」が登場するコラム</h2>
          <ul className="examples">
            {columns.map((c) => (
              <li key={c.slug}>
                <Link href={columnUrl(c.slug)}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">出典</h2>
        <SourceList sources={sources} />
      </section>

      <footer className="word-footer">
        <ul className="inline-list">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={categoryUrl(c.id)} className="chip">
                {c.name}
              </Link>
            </li>
          ))}
          {w.tags.map((t) => (
            <li key={t}>
              <Link href={tagUrl(t)} className="chip">
                {t}
              </Link>
            </li>
          ))}
        </ul>
        <p className="muted">最終更新：{w.updated_at}</p>
      </footer>
    </article>
  )
}

export default Page
