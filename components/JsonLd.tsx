import { FC } from "react"

export const JsonLd: FC<{ data: object }> = ({ data }) => (
  <script
    type="application/ld+json"
    // "<" をエスケープして </script> による脱出を防ぐ
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
)
