// 📄 server.js：NCプログラム記録の管理サーバー

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isLocked, lock, unlock } from "./lockManager.js";
import recordsRouter from "./routes/records.js";
import os from "os";
import cors from "cors";
import { spawn } from 'child_process';
import { execSync } from 'child_process';


// ✅ ESモジュール環境で __dirname を定義
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resourceRoot = __dirname;

app.use(express.json());       // ✅ ここに追加
app.use(express.urlencoded({ extended: true })); // ✅ ここに追加
const PORT = 3000;

try {
  const resolvedJavaPath = execSync('where java').toString().split('\n')[0].trim();
  console.log('[DEBUG] resolvedJavaPath:', resolvedJavaPath);

} catch (err) {
  console.error('[ERROR] java.exe が見つかりません（where java 失敗）');
  process.exit(1);
}


try {
  app.use("/records", recordsRouter);

  app.listen(PORT, () => {
    console.log(`[INFO] NCManager サーバー起動完了: http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("[ERROR] server.js 内部例外:", err);
}


// データ保存先
const DATA_DIR = path.resolve("data");
const RECORDS_PATH = path.join(DATA_DIR, "records.json");
const DELETED_PATH = path.join(DATA_DIR, "deleted.json");
const HISTORY_PATH = path.join(DATA_DIR, "history_by_id.json");
const LOCK_PATH = path.join(DATA_DIR, "lock.json");

// ✅ Java 実行ファイルの自動検出（環境依存を排除）
let javaPath;
try {
  javaPath = execSync("where java").toString().split("\n")[0].trim();
  console.log("[DEBUG] resolvedJavaPath:", javaPath);
} catch (err) {
  console.error("[ERROR] java.exe が見つかりません（where java 失敗）");
  process.exit(1);
}

// ✅ JARファイルのパス構築（resourceRoot は事前定義済みとする）
const jarPath = path.join(resourceRoot, "record-api/build/libs/record-api-0.0.1-SNAPSHOT.jar");

console.log("[DEBUG] Java 起動開始");
console.log("[DEBUG] resourceRoot:", resourceRoot);
console.log("[DEBUG] javaPath:", javaPath);
console.log("[DEBUG] jarPath:", jarPath);

// ✅ JARファイル存在チェック
if (!fs.existsSync(jarPath)) {
  console.error("[ERROR] JAR ファイルが見つかりません:", jarPath);
  process.exit(1);
}

// ✅ Javaプロセス起動（ログ監視付き）
const javaProcess = spawn(javaPath, ['-jar', jarPath], {
  cwd: path.dirname(jarPath),
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, JAVA_TOOL_OPTIONS: "-Dfile.encoding=UTF8" }
});

javaProcess.on('error', (err) => {
  console.error('[ERROR] Java プロセス起動失敗:', err.message);
});
javaProcess.stdout.on('data', (data) => {
  console.log('[JAVA STDOUT]', data.toString());
});
javaProcess.stderr.on('data', (data) => {
  console.error('[JAVA STDERR]', data.toString());
});
javaProcess.on('exit', (code) => {
  console.log(`[JAVA EXIT] プロセス終了: ${code}`);
});

// ルーティング登録
app.use("/api/records", recordsRouter);

// 静的ファイル公開
app.use(express.static(path.join(resourceRoot, 'public')));


// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS許可
app.use(cors());

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "connect-src 'self' http://localhost:3000 http://c20:3000 http://localhost:8085; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline';"
  );
  next();
});

// 初期アクセスで loading.html を表示
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "loading.html"));
});

// ユーティリティ関数
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return filePath.includes(".json") ? {} : []; // ← ファイルがなければ空データ
  return JSON.parse(fs.readFileSync(filePath, "utf8")); // ← JSON読み込み
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // ← JSON保存（整形付き）
}

// ✅ 一覧取得
app.get("/api/records", (req, res) => {
  const records = loadJson(RECORDS_PATH); // ← 一覧データ読み込み
  res.json(records); // ← JSON返却
});

// ✅ 単一記録取得
// ✅ 単一記録取得（IDをキーとして扱う構造）
app.get("/api/records/:id", (req, res) => {
  const records = loadJson(RECORDS_PATH); // ← 一覧データ読み込み（オブジェクト前提）
  const id = req.params.id;
  const record = records[id]; // ← IDをキーとして取得

  if (!record) return res.status(404).send("Record not found"); // ← 存在しない場合
  res.json(record); // ← JSON返却
});

// ✅ 新規作成
app.post("/api/records", (req, res) => {
  const records = loadJson(RECORDS_PATH); // ← 一覧データ読み込み
  const now = new Date().toISOString(); // ← 現在時刻
  const newRecord = {
    ...req.body,
    createdBy: "admin", // ← 作成者固定
    createdAt: now,
    updatedAt: now
  };
  records.push(newRecord); // ← 追加
  saveJson(RECORDS_PATH, records); // ← 保存
  res.status(201).send("Record created"); // ← 成功レスポンス
});

// ✅ 記録の更新
app.put("/api/records/:id", (req, res) => {
  const records = loadJson(RECORDS_PATH); // ← 一覧データ読み込み
  const index = req.params.id;
  const incoming = req.body;
  const existing = records[index]; // ← 既存データ取得

  if (!existing) return res.status(404).send("Record not found"); // ← 存在確認
  if (existing.createdBy !== "admin") {
    return res.status(403).send("編集権限がありません"); // ← 権限チェック
  }

  records[index] = {
    ...incoming,
    createdBy: "admin",
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };

  saveJson(RECORDS_PATH, records); // ← 保存
  res.status(200).send("Record updated"); // ← 成功レスポンス
});

// ✅ 削除（履歴に移動）
app.delete("/api/records/:id", (req, res) => {
  const records = loadJson(RECORDS_PATH); // ← 一覧データ読み込み
  const deleted = loadJson(DELETED_PATH); // ← 削除履歴読み込み
  const index = req.params.id;
  const record = records[index];

  if (!record) return res.status(404).send("Record not found"); // ← 存在確認

  deleted.push({
    ...record,
    deletedAt: new Date().toISOString() // ← 削除日時追加
  });

  records.splice(index, 1); // ← 一覧から削除
  saveJson(RECORDS_PATH, records); // ← 保存
  saveJson(DELETED_PATH, deleted); // ← 履歴保存
  res.status(200).send("Record deleted"); // ← 成功レスポンス
});

// ✅ 削除履歴取得
app.get("/api/deleted", (req, res) => {
  const deleted = loadJson(DELETED_PATH); // ← 履歴読み込み
  res.json(deleted); // ← JSON返却
});

// ✅ 履歴取得
app.get("/api/history/:id", (req, res) => {
  const histories = loadJson(HISTORY_PATH); // ← 履歴読み込み
  res.json(histories[req.params.id] || {}); // ← 指定IDの履歴返却
});

// ✅ 履歴保存
app.put("/api/history/:id", (req, res) => {
  const histories = loadJson(HISTORY_PATH); // ← 履歴読み込み
  histories[req.params.id] = {
    ...req.body,
    person: "admin", // ← 操作者固定
    lastUpdated: new Date().toISOString().slice(0, 10) // ← 日付のみ
  };
  saveJson(HISTORY_PATH, histories); // ← 保存
  res.status(200).send("History saved"); // ← 成功レスポンス
});

// 📌 編集ロック取得
app.put("/api/lock/:id", (req, res) => {
  const id = req.params.id;
  console.log("ロック取得:", id); // ← ログ出力
  lock(id, "admin"); // ← ロック処理
  res.status(200).send("Locked"); // ← 成功レスポンス
});

// 📌 編集ロック確認
app.get("/api/lock/:id", (req, res) => {
  const id = req.params.id;
  const locked = isLocked(id); // ← ロック状態確認
  const locks = loadJson(LOCK_PATH); // ← ロック情報読み込み
  const info = locks[id] || {};

  res.json({
    locked,
    lockedBy: info.lockedBy || null,
    lockedAt: info.lockedAt || null
  }); // ← ロック情報返却
});

// 📌 編集ロック解除
app.delete("/api/lock/:id", (req, res) => {
  const id = req.params.id;
  unlock(id); // ← ロック解除
  res.status(200).send("Unlocked"); // ← 成功レスポンス
});

// ✅ サーバー起動
app.listen(PORT, "0.0.0.0", () => {
  console.log(`📡 Server running at http://localhost:${PORT} or http://${os.hostname()}:${PORT}`);
});
