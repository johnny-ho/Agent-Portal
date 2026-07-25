# raw/ — 新素材收件匣

把要 ingest 的新素材放這裡（會議記錄、訪談逐字稿、決議截圖、外部文章…），然後跟 AI 說「ingest」。

規則（見 [WIKI.md](../WIKI.md)）：

- 本資料夾內容為 **raw source，永不修改**——AI 只讀取，摘要寫到 `../sources/`
- 檔名建議：`YYYY-MM-DD-主題.md`（例：`2026-07-15-sprint-review.md`）
- 已 ingest 的檔案會留在原地作為可追溯的原文，不會被移動或刪除
