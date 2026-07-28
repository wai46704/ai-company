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
    // series: 連載名（任意）。例 "AI編集部の成長記録"。
    //         これが設定された記事だけ、連載ラベルと全話リストが表示される。
    series: z.string().optional(),
    // episode: 連載の何話目か（任意）。例 1, 2, 3。全話リストはこの番号の昇順で並ぶ。
    episode: z.number().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
