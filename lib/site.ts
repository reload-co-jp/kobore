import type { Word } from "./words"

export const SITE_URL = "https://kobore.reload.co.jp"
export const SITE_NAME = "こぼれことば"
export const TAGLINE = "言葉からこぼれた、もうひとつの意味。"

export const wordTitle = (w: Word) =>
  `「${w.term}」は何の略？「${w.origin.term}」からこぼれた言葉の意味と由来`

export const wordDescription = (w: Word) =>
  `「${w.term}」は「${w.origin.term}」から「${w.origin.extracted}」がこぼれた言葉。` +
  `元は${w.semantic_change.from}だったが、今は${w.current_meanings[0].meaning}を指す。${w.summary}`

/** 一覧ページの description 用。「「A」「B」「C」など N語の由来と意味の変化。」 */
export const listSummary = (words: Word[]) =>
  `${words
    .slice(0, 3)
    .map((w) => `「${w.term}」`)
    .join("")}など${words.length}語の由来と意味の変化。`

/** "1950年代" → "/decades/#1950" */
export const decadeUrl = (decade: string) => `/decades/#${parseInt(decade, 10)}`

export const wordUrl = (w: Word) => `/words/${w.id}/`
export const tagUrl = (tag: string) => `/tags/${encodeURIComponent(tag)}/`
export const categoryUrl = (id: string) =>
  `/categories/${encodeURIComponent(id)}/`
export const searchUrl = (q: string) => `/search/?q=${encodeURIComponent(q)}`
