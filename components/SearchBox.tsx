import { FC } from "react"

// JS なしでも動く素の GET フォーム
export const SearchBox: FC<{ defaultValue?: string }> = ({ defaultValue }) => (
  <form action="/search/" role="search" className="searchbox">
    <input
      type="search"
      name="q"
      defaultValue={defaultValue}
      placeholder="言葉を探す（例：ギガ、携帯、固有名詞）"
      aria-label="言葉を検索"
    />
    <button type="submit">検索</button>
  </form>
)
