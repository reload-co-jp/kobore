import type { Metadata } from "next"
import Link from "next/link"
import { SearchBox } from "@/components/SearchBox"
import { WordGrid } from "@/components/WordCard"
import {
  categoryUrl,
  SITE_NAME,
  searchUrl,
  tagUrl,
  TAGLINE,
  wordUrl,
} from "@/lib/site"
import { getDecades, getTags, getWords } from "@/lib/words"

const TITLE = `略された言葉の由来と意味の変化を解説｜${SITE_NAME}`
const DESCRIPTION =
  "「携帯」はなぜ電話を指すようになった？「ギガ」は何から生まれた？言葉の一部が独立し、意味が変わる過程を出典とともに解説します。"

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

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
        <p className="hero-tagline">
          {TAGLINE.split("、").map((s, i, a) => (
            <span key={i}>
              {s}
              {i < a.length - 1 && "、"}
            </span>
          ))}
        </p>
        <h1 className="hero-title">
          言葉の一部が独立する由来と、意味の変化をたどる
        </h1>
        <p className="hero-lead muted">{DESCRIPTION}</p>
        <SearchBox />
      </section>

      <section className="section">
        <h2 className="section-title">
          <Link href="/concept/">こぼれことばとは</Link>
        </h2>
        <div className="about">
          <p>
            「キログラム」が「キロ」に、「携帯電話」が「携帯」になったように、元の言葉の一部分だけが切り出され、独立した言葉として使われるようになったもの。このサイトではそれを「こぼれことば」と呼んでいます。
          </p>
          <p>
            <Link href="/concept/">略語との違いや、こぼれ方の型を見る →</Link>
          </p>
        </div>
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
