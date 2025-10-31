// 📄 formatUtils.js：入力補助ユーティリティ

/**
 * 入力補助関数：
 * - 全角英数字＋記号 → 半角
 * - 全角スペース → 半角スペース
 * - 英字 → 大文字
 * - 変換された場合はアラート通知
 * @param {string} val - 入力値
 * @param {string} label - 項目名（通知用）
 * @returns {string} - 変換後の文字列
 */
export function toUpperHalf(val, label = "") {
  const original = val;
  const converted = val
    .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)) // 全角英数字＋記号
    .replace(/　/g, " ") // 全角スペース
    .replace(/[a-z]/g, ch => ch.toUpperCase()); // 小文字英字 → 大文字

  if (original !== converted && label) {
    // alert(`${label} が全角で入力されたため、半角英数字・記号に変換しました。`);
    console.log(`${label} を変換しました`);
  }

  return converted;
}