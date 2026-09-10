window.OFFICE_STATUS = {
  updated: "2026-09-11 09:00",
  message: "👑 本日の業務完了！お疲れさまでした",
  members: {
    minato:  { state: "done", task: "本日は提案なし(条件を満たす新規案が見つからず)" },
    haru:    { state: "done", task: "本日は執筆対象なし（新規承認案なし・既存3本は社長回答待ちで保留）" },
    aoi:     { state: "done", task: "新規校閲対象なし。既存4本は変化なし・情報陳腐化リスク候補4本を発見" },
    tsumugi: { state: "done", task: "告知0本・単発ネタ2本・Notes3本を作成" },
    riku:    { state: "done", task: "重大な問題微増(24→26)の原因仮説を発見。新規リスクなし" },
    /* カエデ: 執務室ビューに未実装のためstate管理なし。本日done: 新規プロンプトなし、標準報酬月額は8/30版が正と再訂正 */
    yume:    { state: "idle", task: "本日は業務なし（週1運用・前回9/6作成から5日のため待機）" }
  }
};
