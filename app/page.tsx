import Link from "next/link"
import { SearchBox } from "@/components/SearchBox"
import { WordGrid } from "@/components/WordCard"
import { categoryUrl, searchUrl, tagUrl, TAGLINE, wordUrl } from "@/lib/site"
import { getDecades, getTags, getWords } from "@/lib/words"

// ponytail: ビルド日で日替わり。毎日更新したければ日次ビルドを cron で回す
const buildDay = Math.floor(Date.now() / 86_400_000)

const Page = () => {
  const words = getWords()
  const today = words[buildDay % words.length]
  const recent = [...words]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 6)
  const shifted = words.filter((w) =>
    w.classification.includes("meaning_shift")
  )
  const named = words.filter((w) =>
    w.classification.includes("proper_noun_origin")
  )

  return (
    <>
      <section className="hero">
        <h1 className="hero-tagline">
          {TAGLINE.split("、").map((s, i, a) => (
            <span key={i}>
              {s}
              {i < a.length - 1 && "、"}
            </span>
          ))}
        </h1>
        <SearchBox />
      </section>

      <section className="section">
        <h2 className="section-title">今日のこぼれ</h2>
        <Link href={wordUrl(today)} className="today">
          <span className="today-term">{today.term}</span>
          <span className="today-origin">
            「{today.origin.term}」からこぼれた言葉
          </span>
          <span className="today-lead">{today.lead}</span>
        </Link>
      </section>

      <section className="section">
        <h2 className="section-title">最近のこぼれ</h2>
        <WordGrid words={recent} />
      </section>

      <section className="section">
        <h2 className="section-title">
          <Link href={categoryUrl("意味変化")}>意味が変わった言葉</Link>
        </h2>
        <WordGrid words={shifted} />
      </section>

      <section className="section">
        <h2 className="section-title">
          <Link href={categoryUrl("固有名詞")}>名前からこぼれた言葉</Link>
        </h2>
        <ul className="inline-list large">
          {named.map((w) => (
            <li key={w.id}>
              <Link href={wordUrl(w)}>{w.term}</Link>
              <span className="muted">← {w.origin.term}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">年代から探す</h2>
        <ul className="inline-list">
          {getDecades().map((d) => (
            <li key={d}>
              <Link href={searchUrl(d)}>{d}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">タグから探す</h2>
        <ul className="inline-list">
          {getTags().map((t) => (
            <li key={t.name}>
              <Link href={tagUrl(t.name)} className="chip">
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Page
