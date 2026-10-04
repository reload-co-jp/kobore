import { FC } from "react"
import { formatPeriod, Word } from "@/lib/words"

export const WordTimeline: FC<{ word: Word }> = ({ word: w }) => (
  <ol className="timeline">
    {w.timeline.map((t, i) => (
      <li key={i}>
        {t.period && (
          <span className="timeline-period">{formatPeriod(t.period)}</span>
        )}
        <span>{t.event}</span>
      </li>
    ))}
  </ol>
)
