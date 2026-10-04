import { describe, expect, it } from "vitest"
import { buildDoc, search } from "./search"
import {
  getCategories,
  getSources,
  getTags,
  getWords,
  splitOrigin,
  validate,
  Word,
} from "./words"

const entries = () =>
  getWords().map((w) => ({ file: `${w.id}.json`, word: structuredClone(w) }))
const run = (e = entries()) =>
  validate(e, getSources(), getTags(), getCategories())

describe("validate", () => {
  it("accepts the bundled data", () => {
    expect(run()).toEqual([])
  })

  it("rejects broken references and values", () => {
    const e = entries()
    const w = e[0].word as Word
    w.classification.push("acronym" as never)
    w.confidence = "sure" as never
    w.related.push("nope")
    w.sources.push({ id: "missing", role: "x" })
    w.tags.push("未登録")
    w.usage_examples.push({ text: "実例", type: "newspaper", meaning: "x" })
    e.push({ file: "dup.json", word: { ...w } })
    const errors = run(e).join("\n")
    for (const s of [
      "classification",
      "confidence",
      "related",
      "missing",
      "未登録",
      "source_id",
      "word id の重複",
      "ファイル名",
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
    ).toEqual(["junior", "mrs"])
    expect(search(docs, "キロ").map((d) => d.id)).toContain("kilo")
    expect(search(docs, "")).toEqual([])
  })
})
