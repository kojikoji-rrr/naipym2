# CLAUDE.md

このファイルは、クロード・コード (claude.ai/code) がこのリポジトリにあるコードを扱う際の手引きを提供します。
ユーザーへの返答、ソースへのコメントなどは、必ず日本語で行ってください。

## プロジェクト概要
Naipymは以下の要求に沿って開発されるシステムです。

- 以下サイトからスクレイピングした情報（絵師データ、post画像、タグ等）の管理
  - Gelbooru（gelbooru.com）
  - Danbooru（danbooru.donmai.us）
- 及び、NovelAIで生成した画像の情報（生成画像、プロンプト、アルファチャンネル及びiTxtメタデータ等）の管理

Angular19フロントエンドとFastAPIバックエンドを持つフルスタックのWebアプリケーションで、
非同期バッチ処理、リアルタイム監視機能、包括的な管理ツールを提供し運用サポートを行います。

## 開発コマンド

### バックエンド (FastAPI)
```bash
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

### フロントエンド (Angular)
```bash
cd web
npm start                # 開発サーバー起動
npm run build           # プロダクションビルド
npm run test            # テスト実行
npm run watch           # 開発モードでの監視ビルド
```
## アーキテクチャの概要

### バックエンドの構造 (FastAPI)
- **エントリーポイント**: `api/main.py`
- **CORS設定**: すべてのオリジンを許可（開発環境用）
- **ルーター構造**: 
  - `artists/` - 絵師データ関連API
  - `tools/` - ツール関連API
  - `common/` - 共通API
- **データベース**: SQLAlchemy ORM使用
  - モデル定義: `api/src/common/models/sqlalchemy/`
  - 主要テーブル: artist_data, post_data, tag_data, generate_data等
- **外部サービス**: Gelbooru, Danbooru, NovelAI連携

### フロントエンドの構造 (Angular 19)
- **開発サーバー**: `http://localhost:8000`
- **API接続**: 自動検出 (localhost:8080 または 192.168.10.200:8080)
- **スタンドアロンコンポーネント**: Angular 19の最新アーキテクチャ
- **CSS**: TailwindCSS + PostCSS
- **主要ルート**: `/artists`, `/tags`, `/tools`, `/sandbox`
- **共有コンポーネント** (`common/components/`):
  - `flexible-table/` - 動的テーブル（デスクトップ・モバイル対応）
  - `flexible-modal/` - モーダルダイアログ
  - `notification/` - 通知システム
  - `spinner/` - ローディング表示
- **サービス** (`common/services/`):
  - `api.service.ts` - API通信
  - `flexible-table.service.ts` - テーブル機能
  - `side-menu.service.ts` - サイドメニュー管理

### 主な特徴
- **レスポンシブデザイン**: TailwindCSSによるモバイル対応
- **動的UI**: コンテキスト対応サイドメニュー
- **柔軟なテーブル**: デスクトップ・モバイル両対応の動的テーブル
- **Prism.js**: シンタックスハイライト機能

## データベース設計
- **SQLite**: 開発環境用軽量DB
- **主要テーブル**:
  - `artist_data`: 絵師情報 (artist_id, artist_name, post_count等)
  - `post_data`: 投稿データ
  - `tag_data`: タグ情報
  - `generate_data`: NovelAI生成データ
  - `favorite`: お気に入り管理

## 環境・開発メモ
- **WSL環境**: Windows + WSL2での開発
- **パス変換**: C:\Users\～ → /mnt/c/～ に読み替える
- **開発方針**: 簡潔・必要最小限の実装を心がける
- **計画立案**: 技術的課題についてはWeb検索で最新情報を確認してから着手
