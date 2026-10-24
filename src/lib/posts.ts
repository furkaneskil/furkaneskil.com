import { getCollection } from "astro:content";

// Drafts are visible in `npm run dev` so you can preview them, and left out of the built site.
export async function getPosts() {
  const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
