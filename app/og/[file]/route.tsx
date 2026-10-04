import { ImageResponse } from "next/og"
import { SITE_NAME, TAGLINE } from "@/lib/site"
import { getWord, getWords } from "@/lib/words"

// 拡張子付きで書き出すため route handler で生成（/og/giga.png）
export const dynamic = "force-static"
export const generateStaticParams = () =>
  getWords().map((w) => ({ file: `${w.id}.png` }))

// 標準フォントは日本語非対応のため、必要な文字だけ Google Fonts から取得（ビルド時）
const loadFont = async (text: string) => {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&text=${encodeURIComponent(text)}`
    )
  ).text()
  const url = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/
  )?.[1]
  if (!url) throw new Error("OGPフォントの取得に失敗しました")
  return (await fetch(url)).arrayBuffer()
}

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) => {
  const w = getWord((await params).file.replace(/\.png$/, ""))!
  const text = `${SITE_NAME}${w.term}← ${w.origin.term}${TAGLINE}`
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#fbfaf7",
        color: "#1a1a1a",
        fontFamily: "Noto Serif JP",
      }}
    >
      <div style={{ fontSize: 32, color: "#8a8378" }}>{SITE_NAME}</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 160, lineHeight: 1.1 }}>{w.term}</div>
        <div style={{ fontSize: 48, color: "#b4552d", marginTop: 16 }}>
          {`← ${w.origin.term}`}
        </div>
      </div>
      <div style={{ fontSize: 32, color: "#8a8378" }}>{TAGLINE}</div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Noto Serif JP", data: await loadFont(text), weight: 700 },
      ],
    }
  )
}
