import type { MDXComponents } from 'mdx/types'
import { Hero } from '@/components/docs/Hero'
import { Example } from '@/components/docs/Example'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { PropsTable } from '@/components/docs/PropsTable'
import { TokenList } from '@/components/docs/TokenList'
import { TokenGrid } from '@/components/docs/TokenGrid'
import { PrimitiveColorRamp } from '@/components/docs/PrimitiveColorRamp'
import { Note } from '@/components/docs/Note'
import { Warning } from '@/components/docs/Warning'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Hero,
    Example,
    CodeBlock,
    PropsTable,
    TokenList,
    TokenGrid,
    PrimitiveColorRamp,
    Note,
    Warning,
    ...components,
  }
}
