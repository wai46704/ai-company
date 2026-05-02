import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    category: z.string(),
    description: z.string(),
    emoji: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
