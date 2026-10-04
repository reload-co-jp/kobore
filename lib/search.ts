// クライアントでも使うため lib/words.ts（fs 依存）は import しない
export type SearchDoc = {
  id: string
  term: string
  originTerm: string
  summary: string
  meaning: string
  tags: string[]
  text: string
}

const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    // カタカナ → ひらがな
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))

export const buildDoc = (
  w: {
    id: string
    term: string
    reading: string
    origin: { term: string; extracted: string }
    summary: string
    current_meanings: { meaning: string; description: string }[]
    tags: string[]
    related: string[]
    timeline: { period?: string }[]
  },
  extra: string[] = []
): SearchDoc => ({
  id: w.id,
  term: w.term,
  originTerm: w.origin.term,
  summary: w.summary,
  meaning: w.current_meanings[0]?.meaning ?? "",
  tags: w.tags,
  text: normalize(
    [
      w.term,
      w.reading,
      w.origin.term,
      w.origin.extracted,
      w.summary,
      ...w.current_meanings.flatMap((m) => [m.meaning, m.description]),
      ...w.tags,
      ...w.related,
      ...extra,
    ].join("\n")
  ),
})

// ponytail: 全件の部分一致スキャン。数千語を超えたら Pagefind 等へ
export const search = (docs: SearchDoc[], query: string) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const score = (d: SearchDoc) => {
    const term = normalize(d.term)
    return terms.some((t) => term === t)
      ? 2
      : terms.some((t) => term.includes(t))
        ? 1
        : 0
  }
  return docs
    .filter((d) => terms.every((t) => d.text.includes(t)))
    .sort((a, b) => score(b) - score(a))
}
