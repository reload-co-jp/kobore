import Link from "next/link"
import { FC } from "react"
import { Word } from "@/lib/words"
import { wordUrl } from "@/lib/site"

export const RelatedWords: FC<{ word: Word; related: Word[] }> = ({
  word,
  related,
}) => (
  <div className="related">
    <span className="related-root">{word.term}</span>
    <ul>
      {related.map((r) => (
        <li key={r.id}>
          <Link href={wordUrl(r)}>{r.term}</Link>
          <span className="muted">← {r.origin.term}</span>
        </li>
      ))}
    </ul>
  </div>
)
