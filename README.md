# Naipym2

FastAPI バックエンドと Angular フロントエンドで構築されたウェブアプリケーション。

## プロジェクト構成

```
Naipym2/
├── .resources/            # SQLiteDBファイルや管理画像等を格納する共通リソースディレクトリ
├── api/                   # FastAPIバックエンド
│ ├── res/                 # API専用リソースディレクトリ
│ │ └── api_config.ini     # NaipyMAPIの設定ファイル
│ ├── src/
│ │ └── …
│ ├── main.py              # FastAPIアプリケーションのエントリーポイント
│ └── requirements.txt     # Pythonの依存関係
└── web/                   # Angularフロントエンド
  ├── src/                 # Angularソースファイル
  │ ├── app
  │ │ ├── …
  │ │ ├── app.component.html
  │ │ ├── app.component.ts
  │ │ └── app.routes.ts
  │ ├── main.py            # Angularアプリケーションのエントリーポイント
  │ ├── index.html
  │ ├── styles.css
  │ └── favicon.ico
  ├── angular.json         # Angularコンフィギュレーション
  ├── postcss.config.json  # PostCSS 依存ファイル
  ├── tailwind.config.js   # Tailwind CSS 設定
  ├── tsconfig.json        # TypeScriptコンフィギュレーション
  ├── tsconfig.app.json
  └── tsconfig.spec.json
```

## 開発セットアップ

### バックエンド（FastAPI）

1. api ディレクトリに移動する。
```bash
 cd src/api
``` 

2. 仮想環境を作成する。
```bash
 python -m venv venv
 source venv/bin/activate # Windowsの場合: venvScripts ``activate
```

3. 依存関係をインストールします。
```bash
pip install -r requirements.txt
```

4. 開発サーバーを起動する。
```bash
python main.py
```

API は `http://localhost:8080` から利用。

### フロントエンド (Angular)

1. ウェブディレクトリに移動する
```bash
cd src/web
``` 

2. 依存関係をインストールする
```bash
npm install
```

3. 開発用サーバーを起動する
```bash
 npm start
```

ウェブアプリケーションは `http://localhost:8000` から利用。

## 使用される技術

ウェブアプリケーションは `http://localhost:8000` で利用できる。

## 使用される技術

### バックエンド
- FastAPI： API を構築するためのモダンで高速な Web フレームワーク
- Uvicorn： FastAPI アプリケーションを実行するための ASGI サーバー
- Pydantic: データ検証とシリアライズ： データ検証とシリアライズ

### フロントエンド
- Angular 19： モダンなウェブアプリケーションフレームワーク
- Tailwind CSS： ユーティリティ優先のCSSフレームワーク
- TypeScript： JavaScriptの型付きスーパーセット

## 開発ノート

- フロントエンドとバックエンド間の通信を許可するためにCORSが設定されている。
- どちらのアプリケーションも開発中のホットリロードをサポートする。