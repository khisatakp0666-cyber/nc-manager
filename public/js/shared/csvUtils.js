// 📄 csvUtils.js：CSVデータの読み書き・エクスポート処理

/**
 * CSV文字列をダウンロード（Excelで開ける形式）
 * @param {string} csv - CSV形式の文字列
 * @param {string} filename - 保存ファイル名（例：NC一覧.csv）
 */
export function exportToCsv(csv, filename = "export.csv") {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  link.click();
}

/**
 * 単一エントリをCSV形式で保存（仮処理）
 * @param {string[]} entry - 1行分のデータ
 * @param {string} filename - 保存ファイル名
 */
export function saveSingleEntryAsCsv(entry, filename = "entry.csv") {
  const csvLine = entry.join(",") + "\n";
  exportToCsv(csvLine, filename);
}

/**
 * CSVファイルを読み込んで2次元配列として返す
 * @param {string} path - CSVファイルのパス
 * @returns {Promise<string[][]>}
 */
export async function loadCsvData(path) {
  const text = await fetch(path).then(res => res.text());
  return text.trim().split("\n").map(line => line.split(","));
}

/**
 * 指定IDの行を更新してCSVとして保存（仮処理）
 * @param {string[][]} csv - 全CSVデータ
 * @param {string} id - 更新対象のID
 * @param {string[]} updated - 更新後の1行データ
 * @param {string} filename - 保存ファイル名
 */
export function updateCsvEntry(csv, id, updated, filename = "updated.csv") {
  const updatedCsv = csv.map(row => (row[0] === id ? updated : row));
  const csvText = updatedCsv.map(row => row.join(",")).join("\n");
  exportToCsv(csvText, filename);
}

// CSVをExcel形式に変換してダウンロードする関数
function exportCsvToExcel(csvText, filename = "一覧表.xlsx") {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}