import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    // updatedDate: 記事の内容を更新したときだけ入れる更新日（任意）。例: updatedDate: 2026-10-01
    //   入れた記事は、記事ページに「更新日」として表示され、検索エンジンにも
    //   （article:modified_time と構造化データの dateModified で）伝わる。誤字修正程度なら入れなくてよい。
    updatedDate: z.date().optional(),
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
