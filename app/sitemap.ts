import type { MetadataRoute } from "next"
import { COLUMNS, columnUrl } from "@/lib/columns"
import { categoryUrl, SITE_URL, tagUrl, wordUrl } from "@/lib/site"
import {
  getCategories,
  getTags,
  getWords,
  getWordsByCategory,
  getWordsByTag,
  isIndexableList,
} from "@/lib/words"

export const dynamic = "force-static"

const sitemap = (): MetadataRoute.Sitemap => [
  { url: `${SITE_URL}/` },
  { url: `${SITE_URL}/concept/` },
  { url: `${SITE_URL}/about/` },
  { url: `${SITE_URL}/decades/` },
  { url: `${SITE_URL}/columns/` },
  ...COLUMNS.map((c) => ({
    url: `${SITE_URL}${columnUrl(c.slug)}`,
    lastModified: c.published,
  })),
  ...getWords().map((w) => ({
    url: `${SITE_URL}${wordUrl(w)}`,
    lastModified: w.updated_at,
  })),
  ...getTags()
    .filter((t) => isIndexableList(getWordsByTag(t.name)))
    .map((t) => ({ url: `${SITE_URL}${tagUrl(t.name)}` })),
  ...getCategories()
    .filter((c) => isIndexableList(getWordsByCategory(c.id)))
    .map((c) => ({ url: `${SITE_URL}${categoryUrl(c.id)}` })),
]

export default sitemap
