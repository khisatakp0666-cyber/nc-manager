# 初回のみ
npm install

# サーバー起動
npm start

# ブラウザでアクセス
http://localhost:3000/index.html

# ブラウザキャッシュを強制クリア
Ctrl + Shift + R

Ctrl+C
java -jar record-api-0.0.1-SNAPSHOT.jar

# 該当プロセスを特定
netstat -ano | findstr :8085

# プロセス名を確認
tasklist /FI "PID eq 12345"

#　プロセスを強制終了
taskkill /PID 9988 /F

　⇒APIの再起動
java -jar record-api-0.0.1-SNAPSHOT.jar

# 変更後の再起動
taskkill /IM java.exe /F
cd C:\Users\C20\Desktop\project-shared\record-api\build\libs
java -jar record-api-0.0.1-SNAPSHOT.jar

http://localhost:8085/swagger-ui.html

## 起動方法
1. `start-server.bat` をダブルクリックしてください。
2. ブラウザで `http://localhost:3000` にアクセスします。

## 構成概要
- `/public`：HTMLとJS（画面）
- `/routes`：APIルーティング
- `/controllers`：CSV処理ロジック
- `/data`：CSV保存場所（共有フォルダと連携可能）

## 注意事項
- CSVはサーバー経由で読み書きしてください。直接編集は非推奨。
- ポート衝突時は `.bat` が自動でプロセスを解放します。

📁 推奨フォルダ構成
project-root/
├── start-server.bat              # ダブルクリックで起動（ポート解放付き）
├── README.md                     # 起動手順・構成説明
├── HELP.md                       # 初心者向け操作ガイド
├── package.json                  # npm依存・起動スクリプト
├── server.js                     # Expressサーバー本体
├── /routes/                      # APIルーティング（CSV入出力など）
│   └── csv.js                    # /read-csv, /write-csv の処理
├── /controllers/                 # 処理ロジック（責務分離）
│   └── csvController.js          # CSVの読み書きロジック
├── /public/                      # 静的ファイル（HTML, CSS, JS）
│   ├── index.html                # トップページ
│   ├── page1.html                # 他ページ
│   ├── page2.html                # 他ページ
│   ├── /js/
│   │   └── main.js               # フロントのJS（fetchでAPI呼び出し）
│   └── /css/
│       └── style.css             # スタイル
├── /data/                        # CSV保存場所（共有フォルダと連携可能）
│   └── data.csv                  # 実データ
└── /logs/                        # 操作ログ（任意）
    └── access.log                # 誰がいつ何をしたか