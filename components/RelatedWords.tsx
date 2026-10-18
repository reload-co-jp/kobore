import Link from "next/link"
import { FC } from "react"
import { RelatedWord, Word } from "@/lib/words"
import { wordUrl } from "@/lib/site"

/** 関連語のリンク一覧。関連する理由を添える */
export const RelatedWords: FC<{ word: Word; related: RelatedWord[] }> = ({
  word,
  related,
}) => (
  <div className="related">
    <span className="related-root">{word.term}</span>
    <ul>
      {related.map(({ word: r, reasons }) => (
        <li key={r.id}>
          <Link href={wordUrl(r)}>{r.term}</Link>
          <span className="muted">← {r.origin.term}</span>
          {reasons.length > 0 && (
            <span className="related-reason">{reasons.join("・")}</span>
          )}
        </li>
      ))}
    </ul>
  </div>
)
