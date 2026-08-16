# ブログ アイキャッチ画像 生成ルール（Hermes用）

これは Naoki Blog のアイキャッチ画像を作るときの共通ルールです。一度読み込んでおけば、以後は記事ごとに「内容」と「主役にしたいモチーフ」だけ伝えれば、この形式で画像を作れます。

## 1. 画風（毎回共通）
```
Hand-drawn watercolor illustration, warm and cozy style, soft orange and amber accent colors, clean white background, light sketchy linework, friendly and gentle, no text, no letters, no words, no numbers, no logos, wide horizontal banner composition
```
サイズ目安：横長 16:9（1200×630px）

## 2. 絶対にやらないこと
- 文字・数字・ロゴを一切入れない
- 実在の人物・企業名・ブランドロゴ・著作物を描かせない
- 浮遊物を作らない。すべての物は机や地面に接地させる（`no floating objects, all objects resting naturally`）

## 3. 文字が湧く事故を防ぐ2つのコツ（最重要）
1. **文字が湧きやすい物自体を、構図から外す。** 本・ノート・書類・カード・レシート・看板・貼り紙・カレンダー・画面のUIなどは、「文字を入れるな」と指定しても中に文字が湧きます。ネガティブ指定だけに頼らず、そもそも机に置かない判断をしてください。
2. **背景の空白は、こちらから「空である」と書く。** 「主役の物を手前に置く」→「机の奥や壁が余る」→「AIがそこに勝手に本やノートを置いて埋めようとする」という失敗が実際に起きました。防ぐために、次の一文を毎回入れてください。
```
Behind the desk there is only a plain sunlit wall softly washed in watercolor with nothing hanging on it, and the far side of the desk is clear and empty with nothing standing or stacked behind the laptop.
```

## 4. ノートPCの扱い（2026-08-16改定）
- 基本は**閉じた状態**が最も安全（画面という「文字の湧き場所」自体が消えるため）
- **開いた状態にしたい場合は、画面の中身を完全な無地の光にすること。** アイコン・グラフ・矢印・お店のマーク・キャラクター・文字・UI要素は一切描かせません。「画面が柔らかい暖色の光で光っているだけ」にとどめます
- 画面に何か具体的な絵（グラフ・アイコンなど）を描かせるのは、文字が無くても危険です。理由は次の項目

## 5. 画面や小物の「意味」が、記事の結論と矛盾していないか確認する（2026-08-16の学び）
「調べた結果やめることにした」という記事に対して、画面に**右肩上がりのグラフとお店のアイコン**を描いた案が実際に出ました。文字は無くても、**絵が伝えるメッセージが記事の結論と逆**になっていました。
モチーフを決めるときは、「文字は大丈夫か」だけでなく「**この絵は、記事の結論と同じ方向を向いているか**」を必ず確認してください。

## 6. シリーズ（連載）の画像は、土台を揃えて主役だけ変える
「AI編集部の成長記録」のような連載は、次の要素を毎回揃えます。
- 木の机・コーヒー・観葉植物・左からの朝の光・カメラの高さ（机とほぼ同じ目線）
- 前回までに使った主役モチーフ（例：虫眼鏡と小石）は繰り返さない。今回の話の芯に合った、新しい主役を1つだけ置く

## 7. 新しいキャラクター（人・ロボットなど）を勝手に増やさない
これまでのシリーズに出ていない人物・ロボットなどを新しく登場させないでください。統一感が崩れます。

## 8. 完成後、必ず目視で確認すること
- 文字・数字・ロゴが1文字でも読めないか
- 机の奥・壁に、余計な物が描き込まれていないか
- 絵の意味が記事の結論と合っているか
- （連載の場合）前回までの画像と並べて、同じシリーズに見えるか

**この検品は、今までどおり編集長が担当します。** Hermesで生成した後も、記事に組み込む前に必ず目視チェックが入ります。

---

## 使用例：連載第3回「調べるほど『やらない』に傾いた話」オープンPC版（2026-08-16）

Hermesの元案（B案）は、画面が「右肩上がりのグラフ＋お店のアイコン」で記事の結論（やめることにした）と絵の意味が逆でした。また、これまでのシリーズに出ていないロボット2体が新しく登場していました。

以下は、**開いたPCという社長のご希望を活かしつつ**、この2点を直した版です。画面は完全な無地の光にし、キャラクターは置いていません。土台（机・コーヒー・観葉植物・光の向き）は第2回と揃え、主役は紙飛行機（丁寧に折られているが飛ばされていない＝2日調べてやらないと決めた、を表す）にしています。

```
Hand-drawn watercolor illustration, warm and cozy style, soft orange and amber accent colors, clean white background, light sketchy linework, friendly and gentle, no text, no letters, no words, no numbers, no logos, wide horizontal banner composition. A cozy wooden desk at home in soft morning light coming from the left, seen from about the height of the desk itself, with a generic laptop open at a comfortable angle on the desk, its lid, frame and keyboard completely plain and unmarked, no brand logo, no apple logo, no manufacturer marks, no emblem, no design anywhere on the laptop, and its screen glowing softly with a warm, blank amber-white light, the screen completely empty with absolutely no icons, no text, no words, no numbers, no images, no photographs, no charts, no graphs, no arrows, no shop icons, no store icons, no app windows, no browser windows, no interface elements, no wallpaper pattern, no cursor, just a smooth glowing blank screen, a well-loved plain ceramic mug of steaming coffee, and a healthy leafy potted plant near the left edge of the desk catching the sunlight. In the open space in front of the laptop, resting flat and completely still on the wooden desk, is one small paper aeroplane, neatly and carefully folded from a single completely blank plain white sheet, the paper entirely bare with no writing, no printing, no ruled lines, no patterns, no drawings and no markings of any kind anywhere on it. The paper aeroplane has been finished and quietly set down, its nose pointing gently toward the open part of the desk, both of its wings touching the wooden surface, firmly resting on the desk, not flying, not gliding, not in mid-air, not held by anyone and with no hand anywhere near it. Ahead of the little aeroplane the warm morning sunlight spreads across a wide, clear, completely empty stretch of bare wooden desk, calm and open and softly glowing amber, an inviting empty space that was never flown into. Every object rests naturally and firmly on the wooden desk surface. Behind the desk there is only a plain sunlit wall softly washed in watercolor with nothing hanging on it, and the far side of the desk is clear and empty with nothing standing or stacked behind the laptop. The mood is calm, settled and quietly content, the peaceful feeling of someone who has thought something all the way through and is genuinely at ease with deciding not to go ahead, warm and unhurried, not regretful, not disappointed, not defeated, not gloomy and not tense. Soft warm morning sunlight from the left, gentle watercolor washes. No floating objects, all objects resting naturally on the desk, nothing hovering in mid-air. No text, no letters, no words, no numbers, no digits, no globes, no world maps, no maps, no atlases, no country names, no flags, no compasses, no compass roses, no dials, no gauges, no clocks, no calendars, no price tags, no labels, no stickers, no shopping carts, no shopping baskets, no shop signs, no storefronts, no market stalls, no parcels, no shipping boxes, no envelopes, no stamps, no postcards, no coloring pages, no printed illustrations, no drawings on paper, no sketches, no crayons, no colored pencils, no paint tubes, no art supplies, no cameras, no magnifying glasses, no stones, no pebbles, no charts, no graphs, no bar charts, no arrows, no scales, no balance scales, no medals, no badges, no engraved seals, no trophies, no coins, no golden discs, no metallic discs, no banknotes, no documents, no papers, no paper stacks, no notepads, no notebooks, no books, no bookshelves, no pencils, no pens, no forms, no tables, no spreadsheets, no certificates, no cards, no receipts, no checklists, no robots, no toy robots, no robot characters, no mascots, no cartoon characters, no figurines, no dolls, no posters, no sticky notes, no papers on the wall, no signs, no signboards, no whiteboard, no brand logos, no laptop logos, no apple logo, no manufacturer emblems on any object, no people, no hands, nothing gloomy, nothing sad, nothing tense.
```

**推奨ファイル名**：`ai-editorial-team-story-03.png`（既存ファイルを上書き）

**検品で特に見てほしい点**
1. 画面が完全な無地の光になっているか（アイコン・グラフ・お店マークが出ていたら即やり直し）
2. ロボットや人物が描き込まれていないか
3. 紙飛行機が机に接地しているか（飛んでいたら記事と逆の意味になる）
4. 机の奥・壁に余計な物が湧いていないか
