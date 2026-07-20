import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://naoki-blog.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // 統廃合で非公開にした旧記事のURLを、関連する現行記事へ転送する設定。
  // （統合版の新記事を公開したら、転送先をその新URLに差し替える予定）
  redirects: {
    '/blog/risk-tolerance-guide/':              '/blog/nisa-beginners-guide/',
    '/blog/jiko-toshi-vs-kinyu-toshi-balance/': '/blog/nisa-beginners-guide/',
    '/blog/tenshoku-vs-fukugyou-strategy/':     '/blog/nisa-beginners-guide/',
    '/blog/tametime-kakariji-money-guide/':     '/blog/seikatsu-bouei-shikin-guide/',
    '/blog/rogo-fuan-zero-3pillars/':           '/blog/nisa-exit-strategy-2026/',
    '/blog/best-way-to-spend-money/':           '/blog/seikatsu-bouei-shikin-guide/',
    '/blog/income-protection-risk-guide/':      '/blog/seikatsu-bouei-shikin-guide/',
    '/blog/kougaku-ryoyouhi-reform-2026/':      '/blog/seikatsu-bouei-shikin-guide/',
    '/blog/mvno-sim-switch-guide/':             '/blog/fixed-cost-defense-guide-2026/',
    '/blog/claude-code-vs-codex/':              '/blog/',
  },
});
