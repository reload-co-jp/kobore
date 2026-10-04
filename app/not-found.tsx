import Link from "next/link"
import { SearchBox } from "@/components/SearchBox"

const NotFound = () => (
  <section className="page-header not-found">
    <p className="spill-result" aria-hidden="true">
      ？
    </p>
    <h1>その言葉はまだ「こぼれことば」にありません。</h1>
    <SearchBox />
    <p>
      <Link href="/search/">言葉を検索する</Link> /{" "}
      <Link href="/">トップへ</Link>
    </p>
  </section>
)

export default NotFound
