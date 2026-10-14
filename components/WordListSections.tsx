import Link from "next/link"
import { FC } from "react"
import { WordGrid } from "@/components/WordCard"
import { decadeUrl, wordUrl } from "@/lib/site"
import { formatPeriod, getKoboreTimeline, toDecade, Word } from "@/lib/words"

/** 「こぼれた時期が分かるN語のうち、最も古いのは…」。2語未満なら何も出さない */
export const PeriodRange: FC<{ words: Word[] }> = ({ words }) => {
  const timeline = getKoboreTimeline(words)
  if (timeline.length < 2) return null
  const first = timeline[0]
  const last = timeline.at(-1)!
  return (
    <>
      こぼれた時期が分かる{timeline.length}語のうち、最も古いのは「
      {first.word.term}」（{formatPeriod(first.period)}
      ）、最も新しいのは「{last.word.term}」（{formatPeriod(last.period)}
      ）です。
    </>
  )
}

/** 一覧ページ共通の「言葉一覧」「どこからこぼれた？」「こぼれた年代」 */
export const WordListSections: FC<{ label: string; words: Word[] }> = ({
  label,
  words,
}) => {
  const timeline = getKoboreTimeline(words)
  return (
    <>
      <section className="section">
        <h2 className="section-title">{label}一覧</h2>
        <WordGrid words={words} />
      </section>

      <section className="section">
        <h2 className="section-title">どこからこぼれた？</h2>
        <ul>
          {words.map((w) => (
            <li key={w.id}>
              <Link href={wordUrl(w)}>{w.term}</Link>
              <span className="muted">（← {w.origin.term}）</span>：{w.summary}
            </li>
          ))}
        </ul>
      </section>

      {timeline.length > 1 && (
        <section className="section">
          <h2 className="section-title">{label}のこぼれた年代</h2>
          <ul className="inline-list large">
            {timeline.map(({ word: w, period }) => (
              <li key={w.id}>
                <Link href={wordUrl(w)}>{w.term}</Link>
                <span className="muted">
                  <Link href={decadeUrl(toDecade(period))}>
                    {formatPeriod(period)}
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
