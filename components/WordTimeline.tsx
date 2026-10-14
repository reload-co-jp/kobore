import Link from "next/link"
import { FC } from "react"
import { decadeUrl } from "@/lib/site"
import { formatPeriod, toDecade, Word } from "@/lib/words"

export const WordTimeline: FC<{ word: Word }> = ({ word: w }) => (
  <ol className="timeline">
    {w.timeline.map((t, i) => (
      <li key={i}>
        {t.period && (
          <span className="timeline-period">{formatPeriod(t.period)}</span>
        )}
        <span>{t.event}</span>
        {t.kobore && t.period && (
          <Link href={decadeUrl(toDecade(t.period))} className="chip">
            こぼれた時期
          </Link>
        )}
      </li>
    ))}
  </ol>
)
