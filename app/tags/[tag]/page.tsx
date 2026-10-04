import type { Metadata } from "next"
import { WordGrid } from "@/components/WordCard"
import { getTags, getWordsByTag } from "@/lib/words"

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
  return { title: `#${tag.name}`, description: tag.description }
}

const Page = async ({ params }: Props) => {
  const tag = await find(params)
  return (
    <>
      <header className="page-header">
        <p className="muted">タグ</p>
        <h1>#{tag.name}</h1>
        <p>{tag.description}</p>
      </header>
      <WordGrid words={getWordsByTag(tag.name)} />
    </>
  )
}

export default Page
