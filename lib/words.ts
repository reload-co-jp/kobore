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
    /** 同じ部分がこぼれたほかの元の言葉（キロ ← キロメートル など） */
    also?: string[]
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
  timeline: {
    period?: string
    /** こぼれた形がこぼれた意味で単独使用された初出・初確認の出来事 */
    kobore?: true
    event: string
    source_ids: string[]
  }[]
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
    w.origin.also
      ?.filter((a) => !a.includes(w.origin.extracted))
      .forEach((a) => err(`origin.also に切り出し部分が含まれていません: ${a}`))
    const kobore = w.timeline.filter((t) => t.kobore)
    if (kobore.length > 1) err(`timeline の kobore は1つまで`)
    if (kobore.some((t) => !t.period)) err(`kobore の出来事には period が必要`)
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
export type RelatedWord = { word: Word; reasons: string[]; score: number }

/** 関連語の特徴。半数超の言葉が持つ特徴（部分抽出・意味変化など）は区別に役立たないので使わない */
const features = (w: Word) => {
  const period = w.timeline.find((t) => t.kobore)?.period
  return [
    `x:${w.origin.extracted}`,
    ...w.classification.map((c) => `c:${c}`),
    ...w.tags.map((t) => `t:${t}`),
    ...w.categories.map((c) => `k:${c}`),
    ...(period ? [`d:${toDecade(period)}`] : []),
  ]
}
const featureLabel = (f: string) => {
  const [kind, v] = [f[0], f.slice(2)]
  if (kind === "x") return `同じ「${v}」がこぼれた言葉`
  if (kind === "c") return `同じ${CLASSIFICATIONS[v as Classification]}の言葉`
  if (kind === "t") return `#${v}`
  if (kind === "k") return data.categories.find((c) => c.id === v)!.name
  return `同じ${v}にこぼれた`
}

/**
 * 使う特徴と、その珍しさ（idf）。半数超の言葉が持つ特徴は除く。
 * 分類・タグ・カテゴリで同じ言葉の集合を表すもの（固有名詞由来と #固有名詞 など）は1つにまとめ、二重に数えない。
 * 年代だけの一致は関連が弱いので重みを半分にする。
 */
const featureWeights = () => {
  const members = new Map<string, string[]>()
  for (const w of data.words)
    for (const f of new Set(features(w)))
      members.set(f, [...(members.get(f) ?? []), w.id])
  const seen = new Set<string>()
  const weights = new Map<string, number>()
  for (const [f, ids] of members) {
    const key = ids.join(",")
    if (ids.length > data.words.length / 2 || seen.has(key)) continue
    seen.add(key)
    const idf = Math.log(data.words.length / ids.length)
    weights.set(f, f.startsWith("d:") ? idf / 2 : idf)
  }
  return weights
}

/**
 * 関連語を関連度の高い順に返す。
 * 同じ部分がこぼれた語 > 編集部が選んだ related > 珍しい特徴（分類・タグ・カテゴリ・年代）を多く共有する語。
 * 関連度が min 未満の語は、無関係とみなして出さない。
 */
export const getRelated = (
  w: Word,
  { limit = 6, min = 2 } = {}
): RelatedWord[] => {
  const weights = featureWeights()
  const mine = new Set(features(w))
  return data.words
    .filter((o) => o.id !== w.id)
    .map((o) => {
      const shared = [...new Set(features(o))]
        .filter((f) => mine.has(f) && weights.has(f))
        .sort((a, b) => weights.get(b)! - weights.get(a)!)
      const curated = w.related.includes(o.id) || o.related.includes(w.id)
      const sameExtract = shared.some((f) => f.startsWith("x:"))
      const score =
        shared.reduce((n, f) => n + weights.get(f)!, 0) +
        (sameExtract ? 10 : 0) +
        (curated ? 5 : 0)
      const reasons = shared.slice(0, 2).map(featureLabel)
      if (!reasons.length) reasons.push("編集部が選んだ関連語")
      return { word: o, reasons, score }
    })
    .filter((r) => r.score >= min)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.word.priority - a.word.priority ||
        a.word.id.localeCompare(b.word.id)
    )
    .slice(0, limit)
}
export const getWordsByTag = (tag: string) =>
  data.words.filter((w) => w.tags.includes(tag))
export const getWordsByCategory = (id: string) =>
  data.words.filter((w) => w.categories.includes(id))

/**
 * 一覧ページを検索エンジンに載せるか。全体の8割を超える語が並ぶ一覧（#部分抽出 など）は
 * トップページとほぼ同じ内容になるので noindex にし、サイトマップからも外す
 */
export const isIndexableList = (words: Word[]) =>
  words.length > 0 && words.length <= data.words.length * 0.8

/** 各言葉の値を数え、多い順に [値, 数] で返す。exclude は数えない */
export const countBy = (
  words: Word[],
  key: (w: Word) => string[],
  exclude?: string
) => {
  const count = new Map<string, number>()
  for (const v of words.flatMap(key))
    if (v !== exclude) count.set(v, (count.get(v) ?? 0) + 1)
  return [...count].sort((a, b) => b[1] - a[1])
}

/** こぼれた時期（timeline の kobore）が分かる言葉を古い順に */
export const getKoboreTimeline = (words: Word[]) =>
  words
    .flatMap((word) => {
      const period = word.timeline.find((t) => t.kobore)?.period
      return period ? [{ word, period }] : []
    })
    .sort((a, b) => parseInt(a.period, 10) - parseInt(b.period, 10))

/** "1990s" → "1990年代"、"2019" → "2019年" */
export const formatPeriod = (p: string) =>
  p.replace(/^(\d+)s$/, "$1年代").replace(/^(\d+)$/, "$1年")

/** "728" → "720年代"、"1994" → "1990年代" */
export const toDecade = (p: string) =>
  `${Math.floor(parseInt(p, 10) / 10) * 10}年代`

/** こぼれた時期（timeline の kobore）を年代ごとにまとめる。古い順 */
export const getKoboreDecades = () => {
  const map = new Map<string, { word: Word; period: string }[]>()
  for (const word of data.words) {
    const period = word.timeline.find((t) => t.kobore)?.period
    if (!period) continue
    const d = toDecade(period)
    map.set(d, [...(map.get(d) ?? []), { word, period }])
  }
  return [...map]
    .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
    .map(([decade, words]) => ({
      decade,
      words: words.sort(
        (a, b) => parseInt(a.period, 10) - parseInt(b.period, 10)
      ),
    }))
}

/** 元の言葉すべて（origin.term と origin.also） */
export const originTerms = (w: Word) => [
  w.origin.term,
  ...(w.origin.also ?? []),
]

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
