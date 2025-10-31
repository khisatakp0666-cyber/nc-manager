# 📘 Record API仕様書

このAPIは、レコード情報（名前・説明）を管理するためのRESTfulサービスです。Spring Boot + H2 データベースで構成されており、CRUD操作とバリデーションをサポートしています。

---

## 🔹 ベース情報

| 項目         | 内容                              |
|--------------|-----------------------------------|
| ベースURL    | `http://localhost:8085/api/records` |
| データ形式   | `application/json`                |
| 認証         | なし（SecurityConfigで `/api/**` を許可） |
| バリデーション | `@Valid` による入力チェック（`name` 必須、`description` 最大255文字） |

---

## 🔹 エンドポイント一覧

| メソッド | パス                  | 説明                     | ステータスコード         |
|----------|-----------------------|--------------------------|---------------------------|
| `GET`    | `/api/records`        | 全レコード取得           | `200 OK`                  |
| `GET`    | `/api/records/{id}`   | 指定IDのレコード取得     | `200 OK` / `404 Not Found` |
| `POST`   | `/api/records`        | レコード新規登録         | `201 Created` / `400 Bad Request` |
| `PUT`    | `/api/records/{id}`   | レコード更新             | `200 OK` / `404 Not Found` / `400 Bad Request` |
| `DELETE` | `/api/records/{id}`   | レコード削除             | `204 No Content` / `404 Not Found` |

---

## 🔹 リクエスト例

### ✅ POST 新規登録

```http
POST /api/records
Content-Type: application/json

{
  "name": "Test Record",
  "description": "Created via VS Code"
}
