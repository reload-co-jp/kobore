import Link from "next/link"
import { FC, Fragment } from "react"
import { JsonLd } from "@/components/JsonLd"
import { SITE_NAME, SITE_URL } from "@/lib/site"

/** パンくずと、同じ内容の BreadcrumbList。items は トップの次から現在のページまで */
export const Breadcrumb: FC<{ items: { name: string; url: string }[] }> = ({
  items,
}) => {
  const all = [{ name: SITE_NAME, url: "/" }, ...items]
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((x, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: x.name,
            item: `${SITE_URL}${x.url}`,
          })),
        }}
      />
      <nav className="breadcrumb" aria-label="パンくず">
        {all.map((x, i) => (
          <Fragment key={x.url}>
            {i > 0 && " / "}
            {i < all.length - 1 ? (
              <Link href={x.url}>{x.name}</Link>
            ) : (
              <span aria-current="page">{x.name}</span>
            )}
          </Fragment>
        ))}
      </nav>
    </>
  )
}
