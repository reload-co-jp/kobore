import raw from "@/data/kobore.json"

export const CLASSIFICATIONS = {
  part_extraction: "部分抽出",
  independent_usage: "単独使用",
  meaning_shift: "意味変化",
  semantic_expansion: "意味拡張",
  semantic_narrowing: "意味縮小",
  proper_noun_origin: "固有名詞由来",
  generalization: "一般化",
  reanalysis: "再解釈",
} as const

export const CONFIDENCE = {
  high: "確実",
  medium: "有力",
  low: "要検証",
  uncertain: "諸説あり",
} as const

export const USAGE_TYPES = {
  historical: "歴史的用例",
  newspaper: "新聞",
  magazine: "雑誌",
  book: "書籍",
  web: "Web",
  official: "公式",
  sns: "SNS",
  conversation: "会話",
  advertisement: "広告",
  constructed: "作例",
} as const

const SCORE_MAX = {
  part_extraction: 3,
  independent_usage: 3,
  meaning_shift: 3,
  semantic_expansion: 2,
  historical_interest: 2,
  usage_frequency: 2,
  source_availability: 2,
} as const

export type Classification = keyof typeof CLASSIFICATIONS
export type Confidence = keyof typeof CONFIDENCE
export type UsageType = keyof typeof USAGE_TYPES

export type Word = {
  id: string
  term: string
  reading: string
  origin: {
    term: string
    extracted: string
    remaining: string
    /** 元の言葉の中での表記（"Mrs." など）。省略時は extracted */
    source_part?: string
  }
  classification: Classification[]
  summary: string
  lead: string
  origin_meaning: { text: string }
  current_meanings: {
    meaning: string
    description: string
    status: string
  }[]
  semantic_change: {
    from: string
    to: string
    mechanism: string
    steps: string[]
  }
  timeline: { period?: string; event: string; source_ids: string[] }[]
  usage_examples: {
    text: string
    type: UsageType
    meaning: string
    source_id?: string
  }[]
  article: { heading: string; body: string }[]
  tags: string[]
  categories: string[]
  related: string[]
  sources: { id: string; role: string }[]
  confidence: Confidence
  priority: number
  kobore_score: Record<keyof typeof SCORE_MAX, number>
  updated_at: string
}

export type Source = {
  id: string
  type: string
  title: string
  author: string | null
  publisher: string | null
  published_at: string | null
  url: string | null
  accessed_at: string
}

export type Tag = { name: string; description: string }
export type Category = { id: string; name: string; description: string }

export type Data = {
  words: Word[]
  sources: Source[]
  tags: Tag[]
  categories: Category[]
}

const REQUIRED: (keyof Word)[] = [
  "id",
  "term",
  "reading",
  "origin",
  "classification",
  "summary",
  "lead",
  "origin_meaning",
  "current_meanings",
  "semantic_change",
  "timeline",
  "usage_examples",
  "article",
  "tags",
  "categories",
  "related",
  "sources",
  "confidence",
  "priority",
  "kobore_score",
  "updated_at",
]

/** データ全体を検証し、問題点の一覧を返す（空なら正常） */
export const validate = ({
  words,
  sources,
  tags,
  categories,
}: Data): string[] => {
  const errors: string[] = []
  const sourceIds = new Set(sources.map((s) => s.id))
  const tagNames = new Set(tags.map((t) => t.name))
  const categoryIds = new Set(categories.map((c) => c.id))
  const wordIds = new Set<string>()
  const dup = (ids: string[], label: string) =>
    ids
      .filter((id, i) => ids.indexOf(id) !== i)
      .forEach((id) => errors.push(`${label} の重複: ${id}`))

  dup(
    sources.map((s) => s.id),
    "source id"
  )
  dup(
    words.map((w) => w.id),
    "word id"
  )
  words.forEach((w) => wordIds.add(w.id))

  for (const [i, w] of words.entries()) {
    const err = (msg: string) => errors.push(`words[${i}] ${w.id}: ${msg}`)
    const missing = REQUIRED.filter((k) => w[k] === undefined || w[k] === "")
    if (missing.length) {
      err(`必須フィールドがありません: ${missing.join(", ")}`)
      continue
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(w.id))
      err(`id は英小文字・数字・ハイフンのみ: ${w.id}`)
    if (!w.origin.term.includes(w.origin.source_part ?? w.origin.extracted))
      err(`origin.term に切り出し部分が含まれていません`)
    if (w.semantic_change.steps?.length < 2)
      err(`semantic_change.steps は2つ以上必要です`)
    w.classification
      .filter((c) => !(c in CLASSIFICATIONS))
      .forEach((c) => err(`不正な classification: ${c}`))
    if (!(w.confidence in CONFIDENCE)) err(`不正な confidence: ${w.confidence}`)
    w.tags
      .filter((t) => !tagNames.has(t))
      .forEach((t) => err(`tags にないタグ: ${t}`))
    w.categories
      .filter((c) => !categoryIds.has(c))
      .forEach((c) => err(`categories にないカテゴリ: ${c}`))
    w.related
      .filter((r) => !wordIds.has(r) || r === w.id)
      .forEach((r) => err(`不正な related: ${r}`))
    const usedSourceIds = [
      ...w.sources.map((s) => s.id),
      ...w.timeline.flatMap((t) => t.source_ids),
      ...w.usage_examples.flatMap((u) => (u.source_id ? [u.source_id] : [])),
    ]
    usedSourceIds
      .filter((id) => !sourceIds.has(id))
      .forEach((id) => err(`存在しない source id: ${id}`))
    if (w.sources.length === 0) err(`出典がありません`)
    for (const u of w.usage_examples) {
      if (!(u.type in USAGE_TYPES)) err(`不正な用例 type: ${u.type}`)
      if (u.type !== "constructed" && !u.source_id)
        err(`実在の用例には source_id が必要です: ${u.text}`)
    }
    for (const [k, max] of Object.entries(SCORE_MAX)) {
      const v = w.kobore_score[k as keyof typeof SCORE_MAX]
      if (!Number.isInteger(v) || v < 0 || v > max)
        err(`kobore_score.${k} は 0–${max} の整数`)
    }
  }
  return errors
}

const load = (): Data => {
  const data = raw as unknown as Data
  const errors = validate(data)
  if (errors.length)
    throw new Error(
      `データ検証エラー:\n${errors.map((e) => `- ${e}`).join("\n")}`
    )
  return {
    ...data,
    words: [...data.words].sort((a, b) => b.priority - a.priority),
  }
}

// ビルド時に一度だけ読み込み・検証する。不正なデータがあればビルドが失敗する
const data = load()

export const getWords = () => data.words
export const getWord = (id: string) => data.words.find((w) => w.id === id)
export const getTags = () => data.tags
export const getSources = () => data.sources
export const getCategories = () => data.categories
export const getSourcesFor = (w: Word) =>
  w.sources.map((ref) => ({
    ...data.sources.find((s) => s.id === ref.id)!,
    role: ref.role,
  }))
export const getRelated = (w: Word) => w.related.map((id) => getWord(id)!)
export const getWordsByTag = (tag: string) =>
  data.words.filter((w) => w.tags.includes(tag))
export const getWordsByCategory = (id: string) =>
  data.words.filter((w) => w.categories.includes(id))

/** "1990s" → "1990年代"、"2019" → "2019年" */
export const formatPeriod = (p: string) =>
  p.replace(/^(\d{4})s$/, "$1年代").replace(/^(\d{4})$/, "$1年")

/** タイムラインに現れる年代（"1990年代" など）の一覧 */
export const getDecades = () =>
  [
    ...new Set(
      data.words.flatMap((w) =>
        w.timeline.flatMap((t) =>
          t.period?.match(/^\d{3}/) ? [`${t.period.slice(0, 3)}0年代`] : []
        )
      )
    ),
  ].sort()

/** 元の言葉を「前・こぼれた部分・後」に分ける */
export const splitOrigin = (w: Word) => {
  const part = w.origin.source_part ?? w.origin.extracted
  const i = w.origin.term.indexOf(part)
  return {
    before: w.origin.term.slice(0, i),
    part,
    after: w.origin.term.slice(i + part.length),
  }
}
