---
name: add-word
description: 「こぼれことば」に新しい言葉を追加する。掲載基準の判定、出典の調査・検証、data/kobore.json への追記、検証ビルドまでを既存の言葉と同じルールで行う。「〇〇を追加して」「新しい言葉を登録」「/add-word 〇〇」で起動。
argument-hint: <追加したい言葉>（複数可・スペース区切り）
---

# add-word：こぼれことばの追加

対象：`$ARGUMENTS`

正本は `data/kobore.json`（`words` / `sources` / `tags` / `categories`）。スキーマと方針は `README.md` に従う。とくに以下の章：

- 2・8・39章：掲載基準（略語辞典にしない）
- 6.2章：単語JSONの形式と補足フィールド
- 9〜13章：出典・歴史情報・用例・信頼度
- 18章：記事本文の6見出し
- 31章：こぼれ度

書き方に迷ったら、既存の `words`（とくに `giga` と `keitai`）の文体・粒度に合わせる。

## 手順

### 1. 掲載判定（書く前に）

次の流れを説明できるか確かめる。

```text
元の言葉 → 一部分がこぼれる → 単独で使われる → 意味・対象が変わる
```

- **除外・低優先度**：リモコン、パソコンのように複数箇所を組み合わせた略語。頭字語（`compound_abbreviation` / `initialism` / `acronym` / `multiple_part_extraction`）も同様
- **向きを確認する**：本当に「元の言葉 → 部分」の順か。愛称が先にあり、あとから正式名に取り込まれた例もある（`junior`：愛称「ジュニア」→ 2005年に芸名「千原ジュニア」）。逆向きなら `part_extraction` を付けず、信頼度を `low` にしてユーザーに報告する
- 既存の `words[].id` / `term` と重複していないか確認する

基準を満たさなければ、追加せずに理由を報告して止める。

### 2. 出典調査

WebSearch で探し、本文は `ctx_fetch_and_index` で取得して `ctx_search` で該当箇所だけを読む（WebFetch はフックで止められる）。独立した出典を複数そろえる。

優先順（README 10章）：一次資料 → 公的機関 → 学術論文 → 辞書・コーパス → 専門書 → 新聞・雑誌 → 専門メディア → 一般Web → SNS。

定番の出典：

- **辞書**：コトバンク（`https://kotobank.jp/word/...`）。デジタル大辞泉と精選版日本国語大辞典で、「〇〇の略」という記述と **[初出の実例]** を確認する
- **公的機関**：総務省、e-Gov法令検索、BIPM、自治体のページ
- **企業・団体**：公式サイトや報道発表資料（日付入りのURL）
- **人物・グループ**：所属事務所の公式プロフィール。経緯の説明だけ Wikipedia を補助的に使ってよい（`type: "web"`）

ルール：

- **ページを実際に読んで確認したことだけを書く**。検索結果の要約だけを根拠にしない
- 確認できなかった事実は書かない。出典ごと削除する
- 「最初に使われた」と断定しない。辞書が挙げる初出は「辞書が初出の実例として挙げる」と書く。単独用法の初出が見つからなければ「現時点で確認できていません」と書く
- 語源、略語としての成立、独立語としての成立、意味変化を混同しない

### 3. sources に追記

既存の出典を再利用できるか先に確認する（`soumu-whitepaper`、`bipm-si-brochure` など）。新規なら以下の形で追加する。

```json
{
  "id": "kotobank-<slug>",
  "type": "dictionary",
  "title": "「〇〇」（デジタル大辞泉・精選版 日本国語大辞典）",
  "author": null,
  "publisher": "コトバンク（小学館）",
  "published_at": null,
  "url": "https://kotobank.jp/word/...",
  "accessed_at": "<今日の日付 YYYY-MM-DD>"
}
```

- `id`：`<媒体>-<内容>` の kebab-case（例：`docomo-2019-plan`、`yoshimoto-profile-junior`）
- `type`：`official` / `dictionary` / `academic` / `book` / `newspaper` / `magazine` / `media` / `web` / `sns`
- URL がない資料だけ `url: null` にする。URL は推測で作らず、実際に開けたものだけを書く

### 4. words に追記

6.2章の全フィールドを埋める。既存の単語と揃えるため、以下を守る。

- `id`：英小文字・数字・ハイフン（URL になる）
- `origin`：`term` / `extracted` / `remaining`。表記が変わる場合は `source_part` を使う（`"Mrs."` → `"ミセス"`）
- `classification`：README 7章の8値だけを使う
- `summary`：1文。「〜が単独で使われ、〜を指すようになった例。」
- `lead`：1文。「〜だった『X』は、こぼれて〜になった。」の調子
- `semantic_change.steps`：3〜5段。途中に「『X』が独立」を入れる
- `timeline`：各項目に `source_ids` を付ける。`period` は `"1990s"` か `"2019"`。不明なら省略する。年代を無理に決めない
- `usage_examples`：作例は `type: "constructed"`。実在の用例は `source_id` が必須
- `article`：18章の6見出しを、この順で書く
  `何からこぼれた？` / `元々どういう意味だった？` / `いつ独立した？` / `意味は変わった？` / `今はどう使われる？` / `なぜ定着した？`
  - 文末は「です・ます」
  - 出典に基づく記述は出典名を本文に出す（「精選版 日本国語大辞典は〜を挙げています」）
  - 推測は「〜と考えられます」と明示する
- `tags` / `categories`：既存の値から選ぶ。新しく必要なら `tags` / `categories` 配列にも説明付きで追加する（乱造しない）
- `related`：本当に関連のある既存 `id` だけを入れる。相手側の `related` にも追加するか検討する
- `sources`：本文・タイムラインで使った出典すべてに `role` を付ける（`origin` / `definition` / `background` / `usage`）
- `confidence`：
  - `high`：複数の信頼できる出典で裏付けがある
  - `medium`：主要な点は裏付けがあるが、一部推測を含む
  - `low`：根拠が弱い、または掲載基準に疑問がある
  - `uncertain`：諸説ある
- `priority`：既存と比べて決める（大きいほど上に表示される）
- `kobore_score`：31章の範囲で付ける
- `updated_at`：今日の日付

### 5. 検証

```bash
pnpm prettier --write data/kobore.json
pnpm test
pnpm build
```

ビルドの `データ検証エラー` はすべて直す。確認したら、生成された `out/words/<id>/index.html` と `out/og/<id>.png` を Read で目視する。

### 6. 報告

ユーザーに以下を簡潔に伝える。

- 追加した `id` と、掲載判定の根拠
- 使った出典（Markdown リンク）
- 確認できなかった点、`confidence` が `high` でない理由
- 掲載基準に疑問がある場合は、その指摘

コミットはユーザーに頼まれたときだけ行う。
