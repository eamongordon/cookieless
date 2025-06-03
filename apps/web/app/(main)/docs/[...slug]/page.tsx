export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  // Dynamically import the MDX component for rendering
  const Post = await import(`@/markdown/${slug[slug.length - 1]}.mdx`)
  // Access frontmatter exported from MDX file
  const metadata = Post.frontmatter || {}
  return <>
    <p>{JSON.stringify(metadata.title)}</p>
    <Post.default />
  </>
}