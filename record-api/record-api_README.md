# record-api

## 📦 プロジェクト概要
- レコード登録API（公開）
- ログ閲覧API（管理者限定）
- Spring Boot + REST構成

## 🚀 起動手順
1. `./gradlew bootRun` で起動
2. Swagger UI: `http://localhost:8085/swagger-ui/index.html`

## 🔗 API一覧

### POST /api/records
- レコードの新規登録
- リクエストボディ（JSON）:
```json
{
  "name": "必須",
  "description": "255文字以内"
}

## 🖱 ワンクリック起動（使用者向け）

| 環境 | ファイル名 | 実行方法 | 表示される画面 |
|------|------------|-----------|----------------|
| Windows | `start.bat` | ダブルクリック | Node.js UI + Swagger UI |
| Mac/Linux | `start.sh` | `chmod +x start.sh` → `./start.sh` | Node.js UI + Swagger UI |

## ⚙️ 設定ファイル
- `application.properties`: ポート番号など
- `logback-spring.xml`: ログ出力設定

## ⚙️ 構成ファイル一覧

- `application.properties` … ポート番号・DB接続設定
- `logback-spring.xml` … ログ出力形式・保存先・maxHistory設定
- `data.sql` … 初期データ投入（本番では除外）

## 📄 ライセンス・注意事項
- 本APIは社内利用を前提としています
- ログ保存期間は未設定ですが、運用状況に応じて `maxHistory` を追加可能です

> ✅ 使用者向け
- JavaやGradleの知識は不要
- 起動済みの状態で提供される

> ✅ 開発者向け
- `gradlew` を使ってビルド・保守
- Gradle本体のインストールは不要

## ✅ 設計思想との一致

| 観点         | 実現内容 |
|--------------|----------|
| 一目瞭然     | ✅ 構成・仕様・使い方が明快に整理されている  
| 保守性       | ✅ READMEだけで引き継ぎ・レビューが可能  
| 修正しやすさ | ✅ API仕様やログ仕様は表形式で明示  
| 納得感       | ✅ 「なぜこの構成なのか」が構造で説明できる

---

##パッケージ構成

record-api/src/main/java/org/recordapi/
├── entity/                             // DBエンティティ定義（JPA用）
│   ├── Record.java              // レコード本体の永続化モデル
│   └── RecordHistoryEntity.java       // レコード履歴の永続化モデル
├── controller/                         // APIの入り口（HTTPリクエスト処理）
│   ├── RecordController.java          // 一般公開API（登録・取得・削除）
│   ├── AdminController.java           // 管理者向けAPI（ログ閲覧など）
│   └── SystemBridgeController.java    // Node.js起動API（server.js連携）
├── dto/                                // リクエスト/レスポンス構造定義
│   └── RecordRequest.java             // レコード登録用の受け取り構造
├── util/                               // 汎用処理・共通ロジック
│   └── LogReader.java                 // ログファイル読み取りユーティリティ
├── config/                             // セキュリティ・API設定
│   ├── SecurityConfig.java            // 認証・認可の設定（Spring Security）
│   └── OpenApiConfig.java             // Swagger/OpenAPIの設定
├── exception/                          // 例外ハンドリング
│   └── GlobalExceptionHandler.java    // 共通エラーレスポンスの定義
├── resources/                          // 設定ファイル・テンプレート
│   ├── application.properties         // ポート番号・DB設定など
│   └── logback-spring.xml             // ログ出力のフォーマット・保存先設定
├── model/                              // 内部モデル・レスポンス構造
│   ├── Record.java                    // レコードの内部表現
│   └── ValidationErrorResponse.java   // バリデーションエラーのレスポンス構造
├── repository/                         // DBアクセス層（Spring Data JPA）
│   ├── RecordHistoryRepository.java   // 履歴テーブルへのアクセス
│   └── RecordRepository.java          // レコードテーブルへのアクセス
├── service/                            // ビジネスロジック層
│   ├── CsvImportService.java          // CSV登録処理のロジック
│   └── NcManagerService.java          // Node.js起動処理のロジック
└── RecordApiApplication.java          // Spring Bootのエントリーポイント

record-api/src/main/resources/
├── static/                    // 静的ファイル（HTML, CSS, JSなど）を配置するフォルダ
├── templates/                 // Thymeleafなどテンプレートエンジン用のHTMLを配置（未使用なら空でもOK）
├── application.conf           // Typesafe Config形式の設定ファイル（使用していれば補足必要）
├── application.properties     // Spring Bootの基本設定（ポート番号、DB接続、ログレベルなど）
└── data.sql                   // アプリ起動時に初期データを投入するSQLスクリプト
README.md


## アプリ起動方法

### ビルド済み `.jar` を使う場合

```bash
java -jar target/record-api-0.0.1-SNAPSHOT.jar

'''Mavenから直接
mvn spring-boot:run

疎通確認
curl http://localhost:8085/api/records/health

csv出力
curl -OJ http://localhost:8085/api/records/export

---


## ✅ 設計思想に照らして

| 観点 | 評価 |
|------|------|
| 現場で迷わない | ✅ 起動・疎通・出力の流れが一目瞭然  
| 納得感がある | ✅ コマンドと結果が明快  
| 保守性が高い | ✅ `README.md` に明記すれば再現性あり  
| 一目瞭然 | ✅ どこをどう操作すればいいかが即座に分かる

---

`data.sql` の投入手順

🔹① ファイル作
保存場所
src/main/resources/data.sql

内容
INSERT INTO records (id, name, description, created_at) VALUES
(1, 'Test Record', 'This is a test record', CURRENT_TIMESTAMP),
(2, 'Sample Entry', 'Another sample', CURRENT_TIMESTAMP);

→ UTF-8で保存
→ 改行・セミコロン忘れずに

🔹② application.properties に設定追
spring.sql.init.mode=always
spring.sql.init.encoding=utf-8

🔹③ アプリ再起動
java -jar target/record-api-0.0.1-SNAPSHOT.jar
mvn spring-boot:run


🔹④ CSV出力で確認
curl -OJ http://localhost:8085/api/records/export
Get-Content .\records.csv