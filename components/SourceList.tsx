import { FC } from "react"
import { Source } from "@/lib/words"

export const SourceList: FC<{ sources: (Source & { role: string })[] }> = ({
  sources,
}) => (
  <ol className="sources">
    {sources.map((s) => (
      <li key={s.id}>
        {s.url ? (
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.title}
          </a>
        ) : (
          s.title
        )}
        <span className="muted">
          {[s.author, s.publisher, s.published_at].filter(Boolean).join("、")}
          {s.url && `（${s.accessed_at} 閲覧）`}
        </span>
      </li>
    ))}
  </ol>
)
