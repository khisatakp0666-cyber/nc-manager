// 📄 domUtils.js：DOM操作の共通ユーティリティ

/**
 * テーブル描画：2次元配列またはCSV文字列を tbody に描画
 * @param {string[][] | string} data - 配列またはCSV文字列
 * @param {string} selector - tbody のセレクタ
 */
export function renderTable(data, selector) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;

  const rows = Array.isArray(data)
    ? data
    : data.trim().split("\n").map(line => line.split(","));

  tbody.innerHTML = rows.map(row =>
    `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`
  ).join("");
}

/**
 * 表示されている行数をカウントして件数表示を更新
 * @param {string} selector - 件数表示用の要素ID（例：#entryCount）
 * @param {string} tableSelector - テーブルのtbodyセレクタ
 */
export function updateEntryCount(selector = "#entryCount", tableSelector = "#ncTable tbody") {
  const count = Array.from(document.querySelectorAll(`${tableSelector} tr`))
    .filter(row => row.style.display !== "none").length;
  const label = document.querySelector(selector);
  if (label) label.textContent = `件数：${count}件`;
}

/**
 * 検索イベントのバインド（機名・片番・図番・コメント）
 * @param {object} config - 検索対象のIDと列インデックスの対応
 */
export function bindSearchEvents(config = {
  machine: 0,
  kataban: 1,
  drawing: 3,
  comment: "textarea"
}) {
  const searchBtn = document.querySelector("button[onclick*='filterTable']");
  const showAllBtn = document.querySelector("button[onclick*='showAll']");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      document.querySelectorAll("#ncTable tbody tr").forEach(row => {
        const match = Object.entries(config).every(([key, index]) => {
          const input = document.getElementById(`search${capitalize(key)}`);
          const value = input?.value.toLowerCase() || "";
          const cellValue = (index === "textarea")
            ? row.querySelector("textarea")?.value.toLowerCase() || ""
            : row.cells[index]?.textContent.toLowerCase() || "";
          return cellValue.includes(value);
        });
        row.style.display = match ? "" : "none";
      });
      updateEntryCount();
    });
  }

  if (showAllBtn) {
    showAllBtn.addEventListener("click", showAllRows);
  }
}

/**
 * 状態フィルタ（未使用／使用済み）
 * @param {string} state - 表示する状態
 */
export function filterByState(state) {
  document.querySelectorAll("#ncTable tbody tr").forEach(row => {
    const st = row.querySelector(".state-button")?.textContent.trim();
    row.style.display = (st === state) ? "" : "none";
  });
  updateEntryCount();
}

/**
 * 全表示（フィルタ解除）
 */
export function showAllRows() {
  document.querySelectorAll("#ncTable tbody tr").forEach(row => {
    row.style.display = "";
  });
  updateEntryCount();
}

/**
 * 先頭大文字化（内部用）
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}