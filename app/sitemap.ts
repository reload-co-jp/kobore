import type { MetadataRoute } from "next"
import { categoryUrl, SITE_URL, tagUrl, wordUrl } from "@/lib/site"
import { getCategories, getTags, getWords } from "@/lib/words"

export const dynamic = "force-static"

const sitemap = (): MetadataRoute.Sitemap => [
  { url: `${SITE_URL}/` },
  ...getWords().map((w) => ({
    url: `${SITE_URL}${wordUrl(w)}`,
    lastModified: w.updated_at,
  })),
  ...getTags().map((t) => ({ url: `${SITE_URL}${tagUrl(t.name)}` })),
  ...getCategories().map((c) => ({ url: `${SITE_URL}${categoryUrl(c.id)}` })),
]

export default sitemap
