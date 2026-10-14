import type { Metadata } from "next"
import Link from "next/link"
import { wordUrl } from "@/lib/site"
import { formatPeriod, getKoboreDecades, getWords } from "@/lib/words"

const decades = getKoboreDecades()
const count = decades.reduce((n, d) => n + d.words.length, 0)

export const metadata: Metadata = {
  title: "こぼれた年代から探す｜言葉が独立した時期の一覧",
  description: `「${decades[0].words[0].word.term}」から「${decades.at(-1)!.words.at(-1)!.word.term}」まで、言葉の一部がこぼれて単独で使われた最も古い記録を年代順に並べた一覧。辞書・資料で確認できた${count}語を掲載。`,
  alternates: { canonical: "/decades/" },
}

const Page = () => (
  <>
    <header className="page-header">
      <h1>こぼれた年代から探す</h1>
      <p>
        言葉の一部がこぼれ、こぼれた意味で単独で使われた最も古い記録の年代です。辞書や資料で初出・初確認の用例を確かめられた
        {count}語（全{getWords().length}
        語中）だけを載せています。実際にはこれより前から使われていた可能性があります。
      </p>
    </header>
    {decades.map(({ decade, words }) => (
      <section
        key={decade}
        id={String(parseInt(decade, 10))}
        className="section"
      >
        <h2 className="section-title">{decade}</h2>
        <ul className="inline-list large">
          {words.map(({ word: w, period }) => (
            <li key={w.id}>
              <Link href={wordUrl(w)}>{w.term}</Link>
              <span className="muted">
                ← {w.origin.term}（{formatPeriod(period)}）
              </span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </>
)

export default Page
