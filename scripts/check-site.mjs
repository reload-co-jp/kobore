// ビルド済みの out/ を検査する: title・description の重複、canonical、H1、
// 内部リンク切れ、孤立ページ、サイトマップと noindex の整合。
// 使い方: pnpm build && pnpm check:site
import { readdirSync, readFileSync, existsSync } from "node:fs"
import { join, relative } from "node:path"

const OUT = new URL("../out/", import.meta.url).pathname
const SITE = "https://kobore.reload.co.jp"

const htmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? htmlFiles(join(dir, e.name))
      : e.name === "index.html"
        ? [join(dir, e.name)]
        : []
  )
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
const pick = (html, re) => decode(html.match(re)?.[1] ?? "")

const pages = htmlFiles(OUT)
  .map((file) => {
    const path = "/" + relative(OUT, file).replace(/index\.html$/, "")
    const html = readFileSync(file, "utf8")
    const head = html.slice(0, html.indexOf("</head>"))
    return {
      path: decodeURI(path),
      title: pick(head, /<title>([^<]*)<\/title>/),
      description: pick(head, /<meta name="description" content="([^"]*)"/),
      canonical: pick(head, /<link rel="canonical" href="([^"]*)"/),
      noindex: /<meta name="robots" content="[^"]*noindex/.test(head),
      h1: (html.match(/<h1[\s>]/g) ?? []).length,
      links: [...html.matchAll(/<a [^>]*href="(\/[^"]*)"/g)].map((m) =>
        decodeURI(decode(m[1]).replace(/[?#].*$/, ""))
      ),
    }
  })
  .filter((p) => p.path !== "/404/" && p.path !== "/_not-found/")

const problems = []
const bad = (p, msg) => problems.push(`${p}: ${msg}`)
const byPath = new Map(pages.map((p) => [p.path, p]))

for (const key of ["title", "description"]) {
  const seen = new Map()
  for (const p of pages) {
    if (!p[key]) bad(p.path, `${key} がない`)
    else if (seen.has(p[key]))
      bad(p.path, `${key} が ${seen.get(p[key])} と重複`)
    else seen.set(p[key], p.path)
  }
}
for (const p of pages) {
  if (p.path !== "/search/" && p.canonical !== `${SITE}${encodeURI(p.path)}`)
    bad(p.path, `canonical が自身を指していない: ${p.canonical || "(なし)"}`)
  if (p.h1 !== 1) bad(p.path, `h1 が ${p.h1} 個`)
  for (const l of new Set(p.links)) {
    const exists = byPath.has(l) || existsSync(join(OUT, l)) || l === "/"
    if (!exists) bad(p.path, `リンク切れ: ${l}`)
  }
}
const linked = new Set(
  pages.flatMap((p) => p.links.filter((l) => l !== p.path))
)
for (const p of pages)
  if (p.path !== "/" && !p.noindex && !linked.has(p.path))
    bad(p.path, "どのページからもリンクされていない（孤立ページ）")

const sitemap = readFileSync(join(OUT, "sitemap.xml"), "utf8")
const inSitemap = new Set(
  [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) =>
    decodeURI(m[1].replace(SITE, ""))
  )
)
for (const u of inSitemap) {
  const p = byPath.get(u)
  if (!p) bad(u, "サイトマップの URL にページがない")
  else if (p.noindex) bad(u, "noindex なのにサイトマップにある")
}
for (const p of pages)
  if (!p.noindex && !inSitemap.has(p.path) && p.path !== "/search/")
    bad(p.path, "インデックス対象なのにサイトマップにない")

problems.forEach((m) => console.log(`- ${m}`))
const noindex = pages.filter((p) => p.noindex).map((p) => p.path)
console.log(
  `\n${pages.length}ページを検査: 問題 ${problems.length}件 / サイトマップ ${inSitemap.size}件 / noindex ${noindex.length}件 ${noindex.join(" ")}`
)
process.exitCode = problems.length ? 1 : 0
