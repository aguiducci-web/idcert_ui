import createMDX from '@next/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeSlug from 'rehype-slug'
import rehypeExtractToc from '@stefanprobst/rehype-extract-toc'
import rehypeExtractTocExport from '@stefanprobst/rehype-extract-toc/mdx'
import rehypePrettyCode from 'rehype-pretty-code'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontmatter' }],
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeExtractToc,
      rehypeExtractTocExport,
      [rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }],
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@idcert/ui'],
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default withMDX(nextConfig)
