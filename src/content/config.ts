import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    category: z.string(),
    description: z.string(),
    emoji: z.string(),
    // heroImage: 記事の先頭に表示するアイキャッチ画像のパス（任意）。
    // 例: "/images/hero/nisa.png"。未設定の記事はこれまで通り画像なしで表示される。
    heroImage: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
