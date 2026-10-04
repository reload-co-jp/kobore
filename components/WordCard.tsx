import Link from "next/link"
import { FC } from "react"
import { CLASSIFICATIONS, Word } from "@/lib/words"
import { wordUrl } from "@/lib/site"

export const WordCard: FC<{ word: Word }> = ({ word: w }) => (
  <Link href={wordUrl(w)} className="card">
    <span className="card-term">{w.term}</span>
    <span className="card-flow">
      <span className="card-origin">{w.origin.term}</span>
      <span aria-hidden="true" className="card-arrow">
        ↓
      </span>
      <span className="card-extracted">{w.origin.extracted}</span>
    </span>
    <span className="card-meaning">
      {w.current_meanings[0].meaning}を意味するようになった
    </span>
    <span className="chips">
      {w.classification.slice(0, 3).map((c) => (
        <span key={c} className="chip">
          {CLASSIFICATIONS[c]}
        </span>
      ))}
    </span>
  </Link>
)

export const WordGrid: FC<{ words: Word[] }> = ({ words }) =>
  words.length ? (
    <div className="grid">
      {words.map((w) => (
        <WordCard key={w.id} word={w} />
      ))}
    </div>
  ) : (
    <p className="muted">まだこぼれた言葉はありません。</p>
  )
