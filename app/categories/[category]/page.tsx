import type { Metadata } from "next"
import Link from "next/link"
import { PeriodRange, WordListSections } from "@/components/WordListSections"
import { categoryUrl, listSummary, tagUrl } from "@/lib/site"
import { countBy, getCategories, getWordsByCategory } from "@/lib/words"

type Props = { params: Promise<{ category: string }> }

export const dynamicParams = false
export const generateStaticParams = () =>
  getCategories().map((c) => ({ category: c.id }))

// 静的書き出しでは params がエンコードされたまま渡ることがある
const find = async (params: Props["params"]) => {
  const id = decodeURIComponent((await params).category)
  return getCategories().find((c) => c.id === id)!
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const c = await find(params)
  const words = getWordsByCategory(c.id)
  return {
    title: `${c.name}言葉の一覧（${words.length}語）`,
    description: `${c.description}${listSummary(words)}`,
    alternates: { canonical: categoryUrl(c.id) },
  }
}

const Page = async ({ params }: Props) => {
  const c = await find(params)
  const words = getWordsByCategory(c.id)
  const tags = countBy(words, (w) => w.tags)
  const co = countBy(words, (w) => w.categories, c.id)
  const name = (id: string) => getCategories().find((x) => x.id === id)!.name
  const others = getCategories().filter(
    (x) => x.id !== c.id && !co.some(([id]) => id === x.id)
  )
  return (
    <>
      <header className="page-header">
        <p className="muted">カテゴリ</p>
        <h1>{c.name}</h1>
        <p>{c.description}</p>
        <p>
          {c.name}言葉は{words.length}語。
          <PeriodRange words={words} />
        </p>
      </header>

      <WordListSections label={`${c.name}言葉`} words={words} />

      {tags.length > 0 && (
        <section className="section">
          <h2 className="section-title">{c.name}言葉のタグ</h2>
          <ul className="inline-list">
            {tags.map(([t, n]) => (
              <li key={t}>
                <Link href={tagUrl(t)} className="chip">
                  #{t}（{n}語）
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {co.length > 0 && (
        <section className="section">
          <h2 className="section-title">あわせて当てはまるカテゴリ</h2>
          <ul className="inline-list">
            {co.map(([id, n]) => (
              <li key={id}>
                <Link href={categoryUrl(id)} className="chip">
                  {name(id)}（{n}語）
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section className="section">
          <h2 className="section-title">ほかのカテゴリ</h2>
          <ul className="inline-list">
            {others.map((x) => (
              <li key={x.id}>
                <Link href={categoryUrl(x.id)} className="chip">
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

export default Page
