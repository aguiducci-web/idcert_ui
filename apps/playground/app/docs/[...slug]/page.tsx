import { notFound } from 'next/navigation'
import { listDocSlugs, parseDocFile, CONTENT_DIR } from '@/lib/docs'
import { DocsLayout } from '@/components/docs/DocsLayout'
import path from 'node:path'

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await listDocSlugs(CONTENT_DIR)
  return slugs.map((slug) => ({ slug: slug ? slug.split('/') : [] }))
}

export default async function DocsPage({
  params,
}: {
  params: { slug?: string[] }
}) {
  const slug = (params.slug ?? []).join('/')
  if (!slug) notFound()

  let mod: any
  try {
    mod = await import(`@/content/docs/${slug}.mdx`)
  } catch {
    notFound()
  }
  
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  const { frontmatter } = await parseDocFile(filePath)

  const MDXContent = mod.default
  const toc = mod.tableOfContents ?? []

  return (
    <DocsLayout frontmatter={frontmatter} toc={toc}>
      <MDXContent />
    </DocsLayout>
  )
}
