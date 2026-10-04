import { FC } from "react"
import { splitOrigin, Word } from "@/lib/words"

/** どの部分が切り出されたかを示す「こぼれ方」 */
export const WordOrigin: FC<{ word: Word }> = ({ word: w }) => {
  const { before, part, after } = splitOrigin(w)
  return (
    <figure
      className="spill"
      aria-label={`${w.origin.term}から${w.origin.extracted}がこぼれる`}
    >
      <div className="spill-source">
        {before && <span className="spill-rest">{before}</span>}
        <span className="spill-part">{part}</span>
        {after && <span className="spill-rest">{after}</span>}
      </div>
      <div className="spill-arrow" aria-hidden="true">
        ↓
      </div>
      <div className="spill-result">{w.origin.extracted}</div>
    </figure>
  )
}

/** 意味変化のフロー */
export const SemanticFlow: FC<{ word: Word }> = ({ word: w }) => (
  <ol className="flow">
    {w.semantic_change.steps.map((s, i) => (
      <li key={i} style={{ animationDelay: `${i * 0.12}s` }}>
        {s}
      </li>
    ))}
  </ol>
)
