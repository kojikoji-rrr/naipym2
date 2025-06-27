# CLAUDE.md
このファイルは、クロード・コード (claude.ai/code) がこのリポジトリにあるコードを扱う際の手引きを提供します。
ユーザーへの返答、ソースへのコメントなどは、必ず日本語で行ってください。

## プロジェクト概要
Naipymは以下の要求に沿って開発されるシステムです。

- 以下サイトからスクレイピングした情報（絵師データ、post画像、タグ等）の管理
-- Gelbooru（gelbooru.com）
-- Danbooru（danbooru.donmai.us）
- 及び、NovelAIで生成した画像の情報（生成画像、プロンプト、アルファチャンネル及びiTxtメタデータ等）の管理

Angular19フロントエンドとFastAPIバックエンドを持つフルスタックのWebアプリケーションで、
非同期バッチ処理、リアルタイム監視機能、包括的な管理ツールを提供し運用サポートを行います。

## 開発コマンド

### バックエンド (FastAPI)
```bash
cd fast_api
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### フロントエンド (Angular)
```bash
cd angular_web
ng serve
```
## アーキテクチャの概要

### バックエンドの構造
- CORS： localhost:8000と192.168.10.200:8000に設定。

### フロントエンドの構造
- TailwindCSS による Angular 19 スタンドアロン・コンポーネント
- Prism.jsによるシンタックスハイライトと構造化ログ表示
- ルーティング： 主なルートは `/artists`, `/tags`, `/batch`, `/tools`, `/sandbox` です。
- コンポーネントアーキテクチャ
  - 共有コンポーネントは `common/` (遅延画像、モーダル、ソート可能なテーブル、サイドメニュー、リアルタイムログ)
  - 機能コンポーネントは専用ディレクトリに配置 (`artists/`、`tags/`、`batch/`、`tools/`、`sandbox/`)

### 主な特徴
- ダイナミックサイドメニュー： 現在のルートに基づいて変化するコンテキスト対応メニュー
- レスポンシブデザイン： TailwindCSS と一貫した UI コンポーネントでモバイルに最適化

## 環境メモ
- ユーザーはWindows CommandPromptで、WSLを経由しClaudeCodeを実行しています。
- C:\Users\～等のパス（画像など）が与えられた場合は、/mnt/c/～に読み替えてReadしてください。
