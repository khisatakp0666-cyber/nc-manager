📘 NCプログラム管理サーバー（Spring Boot + Node.js連携）
Spring Bootベースの記録管理APIと、Node.jsによる一覧表示UIを統合した現場向けサーバー構成です。
CSV登録・履歴保存・削除管理・画面自動表示など、運用に必要な機能を備えています。


🚀 起動方法と画面表示
| サーバー | コマンド | ポートURL |
|------|------------|-----------|----------------|
| Spring Boot API | ./gradlew bootRun|  http://localhost:3000/swagger-ui/index.html |
| Node.js UI | cd nc-manager && node server.js | http://localhost:5500/index.html | 


起動後、両画面は自動でブラウザ表示されます。URL手入力は不要です。


📡 API仕様
POST /api/records
- レコード登録API
- リクエスト項目：name（必須、255文字以内）
POST /api/import/csv
- CSV登録API
- 除外条件：空行・重複・バリデーションエラー



📦 CSV登録の流れ
- import.html でCSVファイル選択
- プレビューで除外行を確認
- 登録ボタンで /api/import/csv に送信
- 登録件数・スキップ件数を表示
- 登録後は index.html に自動遷移

🧪 初期データ投入（data.sql）
INSERT INTO records (...) VALUES (...);  -- 初期登録データ


本番環境では data.sql は除外されます


🛠 運用ルール
- ログ保存期間：30日（maxHistory=30）
- Swagger UI：社内IPのみアクセス許可
- CSV登録：最大1000件／1ファイル
- data.sql：本番環境では除外


📁 ディレクトリ構成（抜粋）
record-api/
├── controller/
│   ├── RecordController.java
│   └── SystemBridgeController.java
├── service/
│   └── NcManagerService.java
├── data/
│   ├── records.json
│   ├── deleted.json
│   └── history_by_id.json
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js


🧩 Maven継承仕様（補足）
親POMから不要な <license> や <developers> が継承されるため、pom.xml に空のオーバーライドを記述して回避しています。
<license></license>
<developers></developers>

✅ 現場的納得感ポイント
- 一目瞭然：起動方法・構成・連携が明快
- 保守性：責務分離されたController設計
- 安心感：CSV登録から一覧表示まで一連の流れが整備済み

この構成なら、READMEが設計思想と構成を明快に伝え、HELP.mdが操作手順とトラブル対応を補完する理想的な分担になります。
