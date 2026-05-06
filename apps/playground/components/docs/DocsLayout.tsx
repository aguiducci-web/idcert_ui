import { Sidebar } from './Sidebar'
import { TableOfContents, type TocEntry } from './TableOfContents'
import { DocsHeader } from './DocsHeader'
import { WhenToUseCallout } from './WhenToUseCallout'
import { StatusBadge } from './StatusBadge'
import type { DocFrontmatter } from '@/lib/docs'

export function DocsLayout({
  frontmatter,
  toc,
  children,
}: {
  frontmatter: DocFrontmatter
  toc: TocEntry[]
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <DocsHeader />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <header className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
              <StatusBadge status={frontmatter.status} />
            </div>
            <p className="text-lg text-muted-foreground">{frontmatter.description}</p>
            {frontmatter.whenToUse && (
              <WhenToUseCallout>{frontmatter.whenToUse}</WhenToUseCallout>
            )}
          </header>
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </article>
        </main>
        <TableOfContents toc={toc} />
      </div>
    </div>
  )
}
