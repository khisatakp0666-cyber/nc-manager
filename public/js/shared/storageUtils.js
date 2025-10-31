// 📄 storageUtils.js：localStorage操作ユーティリティ

/**
 * entries（一覧データ）を取得
 * @returns {object[]} - エントリ配列
 */
export function loadEntries() {
  return JSON.parse(localStorage.getItem("entries") || "[]");
}

/**
 * entries を保存
 * @param {object[]} entries - 保存するエントリ配列
 */
export function saveEntries(entries) {
  localStorage.setItem("entries", JSON.stringify(entries));
}

/**
 * 削除履歴（deleted_logs）を取得
 * @returns {object[]} - 削除済みエントリ配列
 */
export function loadDeletedLogs() {
  return JSON.parse(localStorage.getItem("deleted_logs") || "[]");
}

/**
 * 削除履歴を保存
 * @param {object[]} logs - 保存する削除履歴
 */
export function saveDeletedLogs(logs) {
  localStorage.setItem("deleted_logs", JSON.stringify(logs));
}

/**
 * 履歴データ（history_by_id）を取得
 * @returns {object} - IDごとの履歴オブジェクト
 */
export function loadHistories() {
  return JSON.parse(localStorage.getItem("history_by_id") || "{}");
}

/**
 * 履歴データを保存
 * @param {object} histories - 保存する履歴オブジェクト
 */
export function saveHistories(histories) {
  localStorage.setItem("history_by_id", JSON.stringify(histories));
}

/**
 * 最後に編集したインデックスを記録
 * @param {number} index - 編集対象のインデックス
 */
export function setLastEditedIndex(index) {
  localStorage.setItem("lastEditedIndex", index);
}

/**
 * 最後に編集したインデックスを取得
 * @returns {number} - インデックス（未設定なら NaN）
 */
export function getLastEditedIndex() {
  return parseInt(localStorage.getItem("lastEditedIndex"), 10);
}