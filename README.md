# NEXT WAVE — 次来るセクター分析

AI × リアルタイム株価で次のビッグウェーブを最速で見つける市場分析ツール。

## 機能

- **20セクター**のリアルタイム株価・出来高分析
- **出来高急増 / 累積買い**シグナル検出
- **Gemini 2.5 Flash Lite** × Google Web検索によるAI分析
- 分析結果を **localStorage** に保存（最終スキャン日時付き）
- モメンタムスコアによるセクターランキング

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173/next-wave/ を開いてAPIキーを入力。

## 必要なAPIキー

| API | 取得先 | 料金 |
|-----|--------|------|
| Gemini API | [Google AI Studio](https://aistudio.google.com/apikey) | 無料枠あり |
| Alpha Vantage | [alphavantage.co](https://www.alphavantage.co/support/#api-key) | 無料（25req/日） |

## GitHub Pages へのデプロイ

### 1. リポジトリ名に合わせて `vite.config.js` を編集

```js
base: '/your-repo-name/',
```

### 2. GitHubにプッシュ

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

### 3. GitHub Pages を有効化

リポジトリの **Settings → Pages → Source** で **GitHub Actions** を選択。

プッシュ後、自動でビルド＆デプロイされます。

## ⚠️ 注意事項

- APIキーはブラウザの localStorage にのみ保存されます（サーバーには送信されません）
- 本ツールは情報提供のみを目的とし、投資助言ではありません
