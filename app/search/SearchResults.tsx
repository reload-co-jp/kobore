"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { FC } from "react"
import { SearchBox } from "@/components/SearchBox"
import { search, SearchDoc } from "@/lib/search"

export const SearchResults: FC<{ docs: SearchDoc[] }> = ({ docs }) => {
  const q = useSearchParams().get("q") ?? ""
  const results = search(docs, q)
  return (
    <>
      <SearchBox key={q} defaultValue={q} />
      {q && (
        <div className="search-results">
          <p className="search-query">
            「{q}」<span aria-hidden="true">↓</span>
            <span className="muted">{results.length}件のこぼれことば</span>
          </p>
          {results.length ? (
            <ul className="result-list">
              {results.map((d) => (
                <li key={d.id}>
                  <Link href={`/words/${d.id}/`}>
                    <span className="result-term">{d.term}</span>
                    <span className="muted">← {d.originTerm}</span>
                    <span className="result-summary">{d.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              その言葉はまだ「こぼれことば」にありません。
            </p>
          )}
        </div>
      )}
    </>
  )
}
