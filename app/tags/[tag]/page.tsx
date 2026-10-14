import type { Metadata } from "next"
import Link from "next/link"
import { PeriodRange, WordListSections } from "@/components/WordListSections"
import { listSummary, tagUrl } from "@/lib/site"
import { countBy, getTags, getWordsByTag } from "@/lib/words"

type Props = { params: Promise<{ tag: string }> }

export const dynamicParams = false
export const generateStaticParams = () =>
  getTags().map((t) => ({ tag: t.name }))

// 静的書き出しでは params がエンコードされたまま渡ることがある
const find = async (params: Props["params"]) => {
  const name = decodeURIComponent((await params).tag)
  return getTags().find((t) => t.name === name)!
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const tag = await find(params)
  const words = getWordsByTag(tag.name)
  return {
    title: `#${tag.name}のこぼれことば一覧（${words.length}語）`,
    description: `${tag.description}${listSummary(words)}`,
    alternates: { canonical: tagUrl(tag.name) },
  }
}

const Page = async ({ params }: Props) => {
  const tag = await find(params)
  const words = getWordsByTag(tag.name)
  const co = countBy(words, (w) => w.tags, tag.name)
  const others = getTags().filter(
    (t) => t.name !== tag.name && !co.some(([n]) => n === t.name)
  )
  return (
    <>
      <header className="page-header">
        <p className="muted">タグ</p>
        <h1>#{tag.name}</h1>
        <p>{tag.description}</p>
        <p>
          #{tag.name}のついたこぼれことばは{words.length}語。
          <PeriodRange words={words} />
        </p>
      </header>

      <WordListSections label={`#${tag.name}の言葉`} words={words} />

      {co.length > 0 && (
        <section className="section">
          <h2 className="section-title">一緒についているタグ</h2>
          <ul className="inline-list">
            {co.map(([name, n]) => (
              <li key={name}>
                <Link href={tagUrl(name)} className="chip">
                  #{name}（{n}語）
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">ほかのタグ</h2>
        <ul className="inline-list">
          {others.map((t) => (
            <li key={t.name}>
              <Link href={tagUrl(t.name)} className="chip">
                #{t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Page
