import type { Metadata } from "next"
import { Suspense } from "react"
import { buildDoc } from "@/lib/search"
import { formatPeriod, getCategories, getWords, toDecade } from "@/lib/words"
import { SearchResults } from "./SearchResults"

// 検索結果はクエリ毎の独立コンテンツではないため索引させない（クロールは許可）
export const metadata: Metadata = {
  title: "検索",
  robots: { index: false, follow: true },
}

const Page = () => {
  const categories = getCategories()
  const docs = getWords().map((w) =>
    buildDoc(w, [
      // 年代で引けるのはこぼれた時期（kobore）だけ。年代ページと揃える
      ...w.timeline.flatMap((t) =>
        t.kobore && t.period ? [formatPeriod(t.period), toDecade(t.period)] : []
      ),
      ...w.categories.map((id) => categories.find((c) => c.id === id)!.name),
    ])
  )
  return (
    <>
      <header className="page-header">
        <h1>言葉を探す</h1>
      </header>
      <Suspense>
        <SearchResults docs={docs} />
      </Suspense>
    </>
  )
}

export default Page
