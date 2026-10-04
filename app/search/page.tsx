import type { Metadata } from "next"
import { Suspense } from "react"
import { buildDoc } from "@/lib/search"
import { formatPeriod, getCategories, getWords } from "@/lib/words"
import { SearchResults } from "./SearchResults"

export const metadata: Metadata = { title: "検索" }

const Page = () => {
  const categories = getCategories()
  const docs = getWords().map((w) =>
    buildDoc(w, [
      ...w.timeline.flatMap((t) =>
        t.period ? [formatPeriod(t.period), `${t.period.slice(0, 3)}0年代`] : []
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
