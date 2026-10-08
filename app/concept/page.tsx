import type { Metadata } from "next"
import Link from "next/link"
import { SemanticFlow, WordOrigin } from "@/components/WordOrigin"
import { wordUrl } from "@/lib/site"
import { CLASSIFICATIONS, CONFIDENCE, getWord } from "@/lib/words"

export const metadata: Metadata = {
  title: "こぼれことばとは",
  description:
    "元の言葉の一部分が切り出され、独立した言葉として使われるようになった「こぼれことば」とは何か。略語との違いや、こぼれ方の型を解説します。",
}

const TYPES = [
  { id: "net", title: "単語の一部分が独立" },
  { id: "giga", title: "接頭辞・接尾辞などが独立" },
  { id: "mrs", title: "固有名詞の一部分が独立" },
  { id: "keitai", title: "独立後に意味が変化・拡張" },
]

const CLASSIFICATION_NOTES: Record<keyof typeof CLASSIFICATIONS, string> = {
  part_extraction: "元の語の一部分が切り出された",
  independent_usage: "切り出された部分が単独で使われる",
  meaning_shift: "意味が変化した",
  semantic_expansion: "意味が広がった",
  semantic_narrowing: "意味が狭くなった",
  proper_noun_origin: "固有名詞由来",
  generalization: "特定対象から一般的な対象へ広がった",
  reanalysis: "使用者による再解釈が起きた",
}

const Page = () => {
  const giga = getWord("giga")!
  return (
    <>
      <header className="page-header">
        <h1>こぼれことばとは</h1>
      </header>
      <section className="about">
        <p>
          「こぼれことば」とは、元の言葉や名前の
          <strong>
            一部分だけが切り出され、その部分が独立した言葉として使われるようになったもの
          </strong>
          を、このサイトで呼ぶための名前です。
        </p>
        <p>
          「キログラム」が「キロ」に、「携帯電話」が「携帯」になったように、言葉の一部分が元の場所からこぼれ落ち、ひとり歩きを始める。さらに、こぼれた言葉はしばしば元とは違う意味や対象を持つようになります。
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">略語との違い</h2>
        <div className="about">
          <p>
            「パソコン」「リモコン」「コンビニ」のように、複数の部分をつなぎ合わせて短くした言葉は、一般的な略語です。頭文字をとった言葉（頭字語）も同様です。
          </p>
          <p>
            こぼれことばが注目するのは、<strong>ひとつの部分</strong>
            がこぼれて独立したかどうか。単に「何の略？」に答えるのではなく、どこからこぼれ、どう独立し、今はどんな意味で使われているのかを追います。
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">こぼれ方の型</h2>
        {TYPES.map(({ id, title }) => {
          const w = getWord(id)!
          return (
            <div key={id}>
              <h3>{title}</h3>
              <Link href={wordUrl(w)}>
                <WordOrigin word={w} />
              </Link>
            </div>
          )
        })}
      </section>

      <section className="section">
        <h2 className="section-title">こぼれたあと、意味が変わる</h2>
        <div className="about">
          <p>
            こぼれことばの面白さは、独立したあとに起こる変化にあります。たとえば「
            <Link href={wordUrl(giga)}>{giga.term}</Link>
            」は、次のような道筋をたどりました。
          </p>
        </div>
        <SemanticFlow word={giga} />
        <div className="about">
          <p>
            このサイトでは、短くなっただけの言葉よりも、独立したことで意味や指す対象が変わった言葉を特に大切に扱います。
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">分類</h2>
        <dl className="facts">
          {Object.entries(CLASSIFICATIONS).map(([k, label]) => (
            <div key={k}>
              <dt>{label}</dt>
              <dd>{CLASSIFICATION_NOTES[k as keyof typeof CLASSIFICATIONS]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <h2 className="section-title">掲載の基準</h2>
        <div className="about">
          <p>次の流れが説明できる言葉を掲載しています。</p>
          <p>
            元の言葉 → 一部分がこぼれる → 独立して使われる →
            意味・対象が変化する
          </p>
          <p>
            語源や初出は断定せず、出典をもとに「現時点で確認できる範囲」で記述します。各記事には確かさの目安として、
            {Object.values(CONFIDENCE)
              .map((c) => `「${c}」`)
              .join("")}
            の信頼度を表示しています。
          </p>
        </div>
      </section>
    </>
  )
}

export default Page
