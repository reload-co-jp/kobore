import type { Metadata } from "next"

export type Column = {
  slug: string
  title: string
  description: string
  published: string
}

/** コラム一覧。新しい順 */
export const COLUMNS: Column[] = [
  {
    slug: "proper-nouns",
    title: "「マガジンで連載中」はどの雑誌？普通名詞で呼ばれる固有名詞たち",
    description:
      "ジャンプ、マガジン、サンデー、ミセス、ミスター、サンタ、なでしこ、ホルモン、マジック、無印。固有名詞の一部がこぼれ、ありふれた言葉の姿のまま特定のひとつを指すようになった例を味わいます。",
    published: "2026-10-15",
  },
  {
    slug: "meaning-shift",
    title: "「ギガが減る」はなぜ通じる？こぼれたあとに意味が変わった言葉と時代",
    description:
      "コマーシャル、スーパー、高速、レジ、携帯、メール、ネット、ギガ、マイル。言葉の一部がこぼれて独立したあと、意味が変わったり広がったりした例を、テレビ・流通・道路・通信など当時の暮らしの変化とともに読みます。",
    published: "2026-10-15",
  },
]

export const columnUrl = (slug: string) => `/columns/${slug}/`

export const getColumn = (slug: string) => COLUMNS.find((c) => c.slug === slug)!

export const columnMetadata = (slug: string): Metadata => {
  const c = getColumn(slug)
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: columnUrl(slug) },
    openGraph: {
      type: "article",
      title: c.title,
      description: c.description,
      url: columnUrl(slug),
    },
  }
}
