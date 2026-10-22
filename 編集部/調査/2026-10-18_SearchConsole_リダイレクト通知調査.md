# Search Console「ページにリダイレクトがあります」通知の調査（2026-10-18・リク）

## 結論：正常（対応不要）
意図した転送12件だけ。意図しない転送・連鎖・sitemap混入は見つからず。

## 現在の転送一覧（astro.config.mjs の redirects 12件）
| 転送元（/blog/〜/） | 転送先 |
|---|---|
| risk-tolerance-guide | toshi-mindset-guide |
| jiko-toshi-vs-kinyu-toshi-balance | toshi-mindset-guide |
| tenshoku-vs-fukugyou-strategy | toshi-mindset-guide |
| tametime-kakariji-money-guide | life-money-plan-guide |
| rogo-fuan-zero-3pillars | life-money-plan-guide |
| best-way-to-spend-money | life-money-plan-guide |
| income-protection-risk-guide | kouteki-hoshou-guide |
| kougaku-ryoyouhi-reform-2026 | kouteki-hoshou-guide |
| mvno-sim-switch-guide | fixed-cost-defense-guide-2026 |
| credit-card-beginners-guide | fixed-cost-defense-guide-2026 |
| sbi-vs-rakuten-nisa-2026 | nisa-beginners-guide |
| claude-code-vs-codex | /blog/ |

## 確認結果
- 転送元の記事ファイルは src に無く、内部リンク・public・dist（スタブ以外）に転送元URLの残りなし
- 内部リンクにスラッシュ無し /blog/xxx 形式なし。canonical・JSON-LDにスラッシュ無し・http・wwwなし
- 本番sitemap（34URL）に転送元なし。全34URLが直接200（転送なし）
- 転送先6つはすべて実在ページ（200）で、多段の連鎖なし
- 本番応答：転送元は200＋meta refresh＋noindex＋canonical（GitHub PagesはHTTP 301を出せないためAstroのスタブ方式）。スラッシュ無しは301、http→https・www→apexも301で正常
- astro.config.mjs の最終変更は 2026-08-22（36e3487）。10/12の7d71920（出典第2弾）以降に転送は増えていない。記事のURL変更もなし
- rss.xml は本番で404（RSS未実装。通知とは無関係）

## なぜ「新しい要因」で届いたか（推測）
Googleが転送スタブ（meta refresh）を再クロールして分類したため。データでは断定できない。8月以降に転送が増えていないので、サイト側の変更が原因ではない。

## 社長にお願いしたい確認（Search Console画面）
1. 左メニュー「ページ」→「ページがインデックスに登録されていない理由」の表から「ページにリダイレクトがあります」をクリック
2. 下に出る URL 一覧を確認。上の12件の転送元URL以内なら問題なし
3. 一覧に上の12件以外のURL（特にスラッシュ無し、http://、www.付き）があれば、そのURLを編集長に伝える
4. 「検証を開始」は不要（正常な転送なので）
