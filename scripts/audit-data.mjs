// data/kobore.json の分類・タグ・カテゴリ・由来・出典の整合性を検査し、要確認項目を一覧で出力する。
// ビルドを止める検証は lib/words.ts の validate、こちらは編集者が判断する警告。
// 使い方: pnpm check:data
import { readFileSync } from "node:fs"

const { words, sources, tags, categories } = JSON.parse(
  readFileSync(new URL("../data/kobore.json", import.meta.url), "utf8")
)

/** [classification, 対応するタグ, 対応するカテゴリ]。同じ概念なので付与が一致するはず */
const MIRRORS = [
  ["part_extraction", "部分抽出", null],
  ["meaning_shift", "意味変化", null],
  ["reanalysis", "再解釈", null],
  ["proper_noun_origin", "固有名詞", "固有名詞"],
  ["semantic_expansion", null, "意味拡張"],
  ["generalization", null, "一般名詞化"],
]
const SPECULATIVE = /と考えられ|とされ|らしい|諸説|一説|かもしれ|推測/

const issues = []
const add = (w, level, msg) =>
  issues.push({ id: w.id, term: w.term, level, msg })

for (const w of words) {
  const has = (list, v) => v !== null && list.includes(v)
  for (const [c, tag, cat] of MIRRORS) {
    const hc = w.classification.includes(c)
    if (tag && hc !== has(w.tags, tag))
      add(w, "error", `classification ${c} とタグ「${tag}」が不一致`)
    if (cat && hc !== has(w.categories, cat))
      add(w, "error", `classification ${c} とカテゴリ「${cat}」が不一致`)
  }
  const cls = w.classification
  if (cls.includes("semantic_expansion") && cls.includes("semantic_narrowing"))
    add(w, "error", "意味拡張と意味縮小が両方付いている")
  if (!cls.includes("part_extraction"))
    add(
      w,
      "info",
      "part_extraction なし（こぼれた経緯が例外的。本文で説明されているか確認）"
    )
  if (
    w.categories.includes("接頭辞") &&
    w.origin.term.startsWith(w.origin.extracted) === false
  )
    add(w, "warn", "カテゴリ「接頭辞」だが元の言葉の先頭がこぼれていない")

  const kobore = w.timeline.find((t) => t.kobore)
  if (w.confidence === "high" && !kobore)
    add(
      w,
      "info",
      "信頼度「確実」だが、こぼれた時期（timeline の kobore）が未確認"
    )
  if (w.confidence === "high" && w.sources.length < 2)
    add(w, "info", `信頼度「確実」だが出典が${w.sources.length}件`)
  if (["low", "uncertain"].includes(w.confidence)) {
    const text = w.article.map((a) => a.body).join("")
    if (!SPECULATIVE.test(text))
      add(
        w,
        "warn",
        `信頼度「${w.confidence}」だが本文に推定・諸説を示す表現がない`
      )
  }
  // 元の言葉が複数ありうるのに origin.term が1つだけ
  const others = w.current_meanings
    .map((m) => m.meaning)
    .filter(
      (m) =>
        m !== w.origin.term &&
        m.includes(w.origin.extracted) &&
        m !== w.origin.extracted &&
        !(w.origin.also ?? []).includes(m)
    )
  if (others.length)
    add(
      w,
      "info",
      `現在の意味に別の元の言葉候補: ${others.join("、")}（origin.also を検討）`
    )
  for (const a of w.origin.also ?? [])
    if (!a.includes(w.origin.extracted))
      add(w, "error", `origin.also「${a}」にこぼれた部分が含まれない`)
}

for (const s of sources) {
  const used = words.some((w) => w.sources.some((r) => r.id === s.id))
  if (!used)
    issues.push({
      id: s.id,
      term: "(source)",
      level: "warn",
      msg: "どの言葉からも参照されていない出典",
    })
  if (!s.url)
    issues.push({
      id: s.id,
      term: "(source)",
      level: "warn",
      msg: "出典に URL がない",
    })
}
for (const t of tags) {
  const n = words.filter((w) => w.tags.includes(t.name)).length
  if (n < 3)
    issues.push({
      id: t.name,
      term: "(tag)",
      level: "info",
      msg: `掲載${n}語（薄い一覧ページ）`,
    })
}
for (const c of categories) {
  const n = words.filter((w) => w.categories.includes(c.id)).length
  if (n === 0)
    issues.push({
      id: c.id,
      term: "(category)",
      level: "error",
      msg: "掲載0語",
    })
}

const order = { error: 0, warn: 1, info: 2 }
issues.sort(
  (a, b) => order[a.level] - order[b.level] || a.id.localeCompare(b.id)
)
for (const i of issues)
  console.log(`[${i.level}] ${i.id}（${i.term}）: ${i.msg}`)
const count = (l) => issues.filter((i) => i.level === l).length
console.log(
  `\n${words.length}語を検査: error ${count("error")} / warn ${count("warn")} / info ${count("info")}`
)
process.exitCode = count("error") ? 1 : 0
