// 📄 routes/records.js：CSV出力機能（条件対応・列選択・履歴対応・Shift_JIS・ZIP）

import express from "express";
import fs from "fs";
import path from "path";
import iconv from "iconv-lite";       // 🈁 Shift_JIS変換用
import archiver from "archiver";      // 📦 ZIP出力用
import multer from "multer";
import { parse } from "csv-parse/sync"; //ルート実装


const router = express.Router();
const RECORDS_PATH = path.resolve("data", "records.json");
const HISTORY_PATH = path.resolve("data", "history_by_id.json");
const upload = multer(); // メモリ上に保持（ファイル保存しない）


// 🔧 JSON読み込みユーティリティ
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// 📅 日付形式を YYYY/MM/DD に整形
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// 📤 CSV文字列を生成（共通関数）
function generateCsv(records, selectedCols) {
  const headers = selectedCols;
  const rows = records.map(r =>
    selectedCols.map(col => {
      const val = r[col];
      if (col.includes("At")) return val ? formatDate(val) : ""; // 📅 日付整形
      return val || "";
    })
  );

  const csv = [headers.join(",")].concat(
    rows.map(row =>
      row.map(val => `"${val.replace(/"/g, '""')}"`).join(",")
    )
  ).join("\n");

  return csv;
}

//CSV登録のバリデーション追加
function isValidRecord(r) {
  return r.machine && r.kataban && r.status;
}

router.post("/import/csv", upload.single("csvfile"), (req, res) => {
  try {
    const csvBuffer = req.file?.buffer;
    if (!csvBuffer) return res.status(400).send("CSVファイルがありません");

    const text = csvBuffer.toString("utf8");
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true
    });

    const validRecords = records.filter(isValidRecord);
    const now = new Date().toISOString();
    const newRecords = validRecords.map(r => ({
      ...r,
      createdBy: "admin",
      createdAt: now,
      updatedAt: now
    }));

    const existing = loadJson(RECORDS_PATH);
    const merged = existing.concat(newRecords);
    saveJson(RECORDS_PATH, merged);

    res.json({ added: newRecords.length, skipped: records.length - newRecords.length });
  } catch (err) {
    console.error("CSV登録エラー:", err);
    res.status(500).send("CSV登録に失敗しました");
  }
});

//csv受信ルート
router.post("/import/csv", upload.single("csvfile"), (req, res) => {
  try {
    const csvBuffer = req.file?.buffer;
    if (!csvBuffer) return res.status(400).send("CSVファイルがありません");

    const text = csvBuffer.toString("utf8");
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true
    });

    const existing = loadJson(RECORDS_PATH);
    const now = new Date().toISOString();

    const newRecords = records.map(r => ({
      ...r,
      createdBy: "admin",
      createdAt: now,
      updatedAt: now
    }));

    const merged = existing.concat(newRecords);
    saveJson(RECORDS_PATH, merged);

    res.json({ added: newRecords.length });
  } catch (err) {
    console.error("CSV登録エラー:", err);
    res.status(500).send("CSV登録に失敗しました");
  }
});


// ✅ CSV出力（条件付き・列選択・履歴対応・Shift_JIS）
router.get("/export/csv", (req, res) => {
  const { filename, status, machine, from, to, columns } = req.query;

  const records = loadJson(RECORDS_PATH);
  const historyMap = loadJson(HISTORY_PATH);

  // 🔍 出力列の選択（未指定なら全項目）
  const selectedCols = columns && columns.trim()
    ? columns.split(",").filter(Boolean)
    : Object.keys(records[0]);

  // 🔍 条件で絞り込み
  const filtered = records.filter(r => {
    if (status && r.status !== status) return false;
    if (machine && r.machine !== machine) return false;
    if (from && new Date(r.updatedAt) < new Date(from)) return false;
    if (to && new Date(r.updatedAt) > new Date(to)) return false;
    return true;
  });

  // 🧠 履歴情報をマージ（必要な場合のみ）
  const enriched = filtered.map(record => {
    const enrichedRecord = { ...record };

    if (selectedCols.includes("history")) {
      const logs = historyMap[record.kataban] || []; // 🔗 履歴は kataban をキーにして紐付ける（history_by_id.json の構造に準拠）
      enrichedRecord.history = logs.map(log =>
        `${formatDate(log.updatedAt)}: ${log.before} → ${log.after}`
      ).join(" / ");
    }

    return enrichedRecord;
  });

  // 📊 CSV生成
  const csvText = generateCsv(enriched, selectedCols);
  const encodedCsv = iconv.encode(csvText, "Shift_JIS");

  // 📛 ファイル名の決定
  const finalFilename = filename
    ? `${filename}.csv`
    : (() => {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const parts = [];
      if (machine) parts.push(machine);
      if (status) parts.push(status);
      parts.push(dateStr);
      return `${parts.join("_")}.csv`;
    })();

  // 📤 レスポンス送信
  res.setHeader("Content-Type", "text/csv; charset=Shift_JIS");
  res.setHeader("Content-Disposition", `attachment; filename="${finalFilename}"`);
  res.send(encodedCsv);
});

// ✅ CSVインポート（仮の受信処理）
router.post("/import/csv", (req, res) => {
  // ここにCSV解析・登録処理を追加予定
  res.json({ added: 123 }); // 仮のレスポンス
});



// 📦 ZIP出力（複数条件で一括CSV生成）
router.get("/export/zip", (req, res) => {
  const records = loadJson(RECORDS_PATH);
  const archive = archiver("zip");
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=nc_exports.zip");
  archive.pipe(res);

  // 🔁 条件セット（例：状態別）
  const conditions = [
    { label: "未使用", filter: r => r.status === "未使用" },
    { label: "使用済み", filter: r => r.status === "使用済み" }
  ];

  const selectedCols = ["machine", "kataban", "kataname", "drawing", "comment", "status", "updatedAt"];

  conditions.forEach(({ label, filter }) => {
    const subset = records.filter(filter);
    const csv = generateCsv(subset, selectedCols);
    const encoded = iconv.encode(csv, "Shift_JIS");
    archive.append(encoded, { name: `nc_${label}.csv` });
  });

  archive.finalize();
});

export default router;
