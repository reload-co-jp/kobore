import type { Metadata } from "next"
import { WordGrid } from "@/components/WordCard"
import { getCategories, getWordsByCategory } from "@/lib/words"

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
  return { title: c.name, description: c.description }
}

const Page = async ({ params }: Props) => {
  const c = await find(params)
  return (
    <>
      <header className="page-header">
        <p className="muted">カテゴリ</p>
        <h1>{c.name}</h1>
        <p>{c.description}</p>
      </header>
      <WordGrid words={getWordsByCategory(c.id)} />
    </>
  )
}

export default Page
