import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  
  // Avoid duplicate introduction page
  if (slug && slug.length > 0 && slug[slug.length - 1] === 'introduction') {
    notFound()
  };

  // Determine which file to import: introduction for root, or the last slug segment
  const fileName = (!slug || slug.length === 0) ? 'introduction' : slug[slug.length - 1]
  
  // Check if the MDX file exists
  const filePath = path.join(process.cwd(), 'markdown', `${fileName}.mdx`)
  if (!fs.existsSync(filePath)) {
    notFound()
  }
  
  // Dynamically import the MDX component for rendering
  const Post = await import(`@/markdown/${fileName}.mdx`)
  // Access frontmatter exported from MDX file
  const metadata = Post.frontmatter || {}
  
  return (
    <div className="prose dark:prose-invert mx-auto max-w-[calc(100%-2rem)] md:max-w-[calc(100%-3rem)]">
      {/* Only show title for non-introduction pages */}
      {fileName !== 'introduction' && <h1>{metadata.title}</h1>}
      <Post.default />
    </div>
  )
}