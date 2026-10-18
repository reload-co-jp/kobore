import type { Metadata } from "next"

export type Column = {
  slug: string
  title: string
  description: string
  published: string
  /** 本文で取り上げる言葉の id。個別記事・一覧ページからコラムへの導線に使う */
  words: string[]
}

/** コラム一覧。新しい順 */
export const COLUMNS: Column[] = [
  {
    slug: "how-to-research",
    title: "「バイト」はいつから？言葉の由来と成立時期の調べ方",
    description:
      "辞書で由来を確かめる、初出の実例を見る、確認できないことは書かない、こぼれた順序を疑う。バイト、お冷、クラシック、キロ、ジュニア、マイルを例に、言葉の由来と成立時期の調べ方と、つまずきやすい点を紹介します。",
    published: "2026-10-18",
    words: ["baito", "ohiya", "classic", "kilo", "giga", "junior", "mile"],
  },
  {
    slug: "proper-nouns",
    title: "「マガジンで連載中」はどの雑誌？普通名詞で呼ばれる固有名詞たち",
    description:
      "ジャンプ、マガジン、サンデー、ミセス、ミスター、サンタ、なでしこ、ホルモン、マジック、無印。固有名詞の一部がこぼれ、ありふれた言葉の姿のまま特定のひとつを指すようになった例を味わいます。",
    published: "2026-10-15",
    words: [
      "jump",
      "magazine",
      "sunday",
      "mister",
      "mrs",
      "santa",
      "nadeshiko",
      "hormone",
      "magic",
      "muji",
      "koshien",
    ],
  },
  {
    slug: "meaning-shift",
    title: "「ギガが減る」はなぜ通じる？こぼれたあとに意味が変わった言葉と時代",
    description:
      "コマーシャル、スーパー、高速、レジ、携帯、メール、ネット、ギガ、マイル。言葉の一部がこぼれて独立したあと、意味が変わったり広がったりした例を、テレビ・流通・道路・通信など当時の暮らしの変化とともに読みます。",
    published: "2026-10-15",
    words: [
      "commercial",
      "super",
      "kosoku",
      "reji",
      "keitai",
      "mail",
      "net",
      "giga",
      "mile",
    ],
  },
]

export const columnUrl = (slug: string) => `/columns/${slug}/`

export const getColumn = (slug: string) => COLUMNS.find((c) => c.slug === slug)!

/** ids の言葉を min 語以上取り上げているコラム。取り上げる語が多い順 */
export const getColumnsFor = (ids: string[], min = 1) =>
  COLUMNS.map((c) => ({ c, n: c.words.filter((w) => ids.includes(w)).length }))
    .filter(({ n }) => n >= min)
    .sort((a, b) => b.n - a.n)
    .map(({ c }) => c)

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
