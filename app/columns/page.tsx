import type { Metadata } from "next"
import Link from "next/link"
import { COLUMNS, columnUrl } from "@/lib/columns"

export const metadata: Metadata = {
  title: "コラム｜こぼれた言葉をテーマで読む",
  description:
    "意味が変わった言葉、普通名詞で呼ばれる固有名詞など、こぼれことばをテーマごとにまとめて読むコラムの一覧です。",
  alternates: { canonical: "/columns/" },
}

const Page = () => (
  <>
    <header className="page-header">
      <h1>コラム</h1>
      <p>こぼれことばを、テーマごとにまとめて読む記事です。</p>
    </header>
    <ul className="examples">
      {COLUMNS.map((c) => (
        <li key={c.slug}>
          <Link href={columnUrl(c.slug)}>{c.title}</Link>
          <span className="muted">{c.description}</span>
        </li>
      ))}
    </ul>
  </>
)

export default Page
