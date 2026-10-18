import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { COLUMNS } from "./columns"
import { buildDoc, search } from "./search"
import { wordTitle } from "./site"
import {
  getCategories,
  getRelated,
  getWord,
  getWordsByTag,
  isIndexableList,
  getSources,
  toDecade,
  getTags,
  getWords,
  splitOrigin,
  validate,
  Word,
} from "./words"

const words = () => structuredClone(getWords())
const run = (w = words()) =>
  validate({
    words: w,
    sources: getSources(),
    tags: getTags(),
    categories: getCategories(),
  })

describe("validate", () => {
  it("accepts the bundled data", () => {
    expect(run()).toEqual([])
  })

  it("rejects broken references and values", () => {
    const ws = words()
    const w = ws[0] as Word
    w.classification.push("acronym" as never)
    w.confidence = "sure" as never
    w.related.push("nope")
    w.sources.push({ id: "missing", role: "x" })
    w.tags.push("未登録")
    w.usage_examples.push({ text: "実例", type: "newspaper", meaning: "x" })
    w.timeline.push(
      { kobore: true, event: "x", source_ids: [] },
      { kobore: true, period: "2000", event: "y", source_ids: [] }
    )
    ws.push({ ...w })
    const errors = run(ws).join("\n")
    for (const s of [
      "classification",
      "confidence",
      "related",
      "missing",
      "未登録",
      "source_id",
      "word id の重複",
      "kobore は1つまで",
      "period が必要",
    ])
      expect(errors).toContain(s)
  })
})

describe("splitOrigin", () => {
  it("splits around the extracted part", () => {
    const byId = Object.fromEntries(getWords().map((w) => [w.id, w]))
    expect(splitOrigin(byId.giga)).toEqual({
      before: "",
      part: "ギガ",
      after: "バイト",
    })
    expect(splitOrigin(byId.net)).toEqual({
      before: "インター",
      part: "ネット",
      after: "",
    })
    expect(splitOrigin(byId.mrs)).toEqual({
      before: "",
      part: "Mrs.",
      after: " GREEN APPLE",
    })
  })
})

describe("search", () => {
  const docs = getWords().map((w) => buildDoc(w))
  it("matches term, origin, tags and kana-insensitive reading", () => {
    expect(search(docs, "ギガ")[0].id).toBe("giga")
    expect(search(docs, "携帯電話")[0].id).toBe("keitai")
    expect(
      search(docs, "固有名詞")
        .map((d) => d.id)
        .sort()
    ).toEqual([
      "athon",
      "burger",
      "gate",
      "hormone",
      "jump",
      "junior",
      "koshien",
      "magazine",
      "magic",
      "mister",
      "mrs",
      "muji",
      "nadeshiko",
      "santa",
      "sunday",
    ])
    expect(search(docs, "キロ").map((d) => d.id)).toContain("kilo")
    expect(search(docs, "")).toEqual([])
  })
})

describe("toDecade", () => {
  it("3桁・4桁の年を年代にする", () => {
    expect(toDecade("728")).toBe("720年代")
    expect(toDecade("1994")).toBe("1990年代")
    expect(toDecade("1990s")).toBe("1990年代")
  })
})

describe("getRelated", () => {
  it("自身・重複を含まず、関連度順に並ぶ", () => {
    for (const w of getWords()) {
      const r = getRelated(w)
      const ids = r.map((x) => x.word.id)
      expect(ids).not.toContain(w.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(r.length).toBeLessThanOrEqual(6)
      expect(r.every((x) => x.reasons.length > 0)).toBe(true)
      expect(r.map((x) => x.score)).toEqual(
        [...r.map((x) => x.score)].sort((a, b) => b - a)
      )
    }
  })

  it("同じ部分がこぼれた語を最優先する", () => {
    const [top] = getRelated(getWord("shortstop")!)
    expect(top.word.id).toBe("short-circuit")
    expect(top.reasons[0]).toBe("同じ「ショート」がこぼれた言葉")
  })

  it("共通点の薄い語は出さない", () => {
    expect(getRelated(getWord("all")!)).toEqual([])
  })
})

describe("origin.also", () => {
  it("複数の元の言葉をタイトルに含める", () => {
    expect(wordTitle(getWord("kilo")!)).toBe(
      "「キロ」は何の略？「キログラム」「キロメートル」からこぼれた言葉の意味と由来"
    )
  })
})

describe("isIndexableList", () => {
  it("ほぼ全語が並ぶタグは noindex", () => {
    expect(isIndexableList(getWordsByTag("部分抽出"))).toBe(false)
    expect(isIndexableList(getWordsByTag("音楽"))).toBe(true)
  })
})

describe("COLUMNS", () => {
  it("words が本文の <W id> と一致する", () => {
    for (const c of COLUMNS) {
      const src = readFileSync(`app/columns/${c.slug}/page.tsx`, "utf8")
      const ids = [...src.matchAll(/<W id="([^"]+)"/g)].map((m) => m[1])
      expect([...new Set(ids)].sort()).toEqual([...c.words].sort())
    }
  })
})
