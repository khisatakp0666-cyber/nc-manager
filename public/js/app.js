// 📄 js/app.js：画面ごとの初期化を統合管理するエントリーポイント

// ✅ 各画面の初期化関数をインポート（実装済み前提）
import { initIndexScreen } from "./screens/indexScreen.js";
import { initDeletedScreen } from "./screens/deletedScreen.js";
import { initEditScreen } from "./screens/editScreen.js";
import { initHistoryScreen } from "./screens/historyScreen.js";
import { initNewScreen } from "./screens/newScreen.js";
import { initImportScreen } from "./screens/importScreen.js"; // ✅ import.html 対応を追加

// ✅ 画面名と初期化関数の対応表
const screenMap = {
  "index.html": initIndexScreen,
  "deleted.html": initDeletedScreen,
  "edit.html": initEditScreen,
  "history.html": initHistoryScreen,
  "new.html": initNewScreen,
  "import.html": initImportScreen,
};

/**
 * ✅ 現在のURLパスを正規化
 * - "/" の場合は "index.html" に変換
 * - その他はファイル名のみ抽出
 */
function normalizePath(pathname) {
  if (pathname === "/" || pathname.endsWith("/")) return "index.html";
  return pathname.split("/").pop();
}

// ✅ エラー表示関数（UIとログを統一）
function showError(message) {
  console.warn(`⚠️ ${message}`);
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `<p style='color:red;'>${message}</p>`;
  }
}

// ✅ 初期化処理の実行
const currentScreen = normalizePath(location.pathname);
const initFunction = screenMap[currentScreen];

if (initFunction) {
  initFunction(); // ✅ 対応する初期化関数を実行
} else {
  showError(`未対応の画面です: ${currentScreen}`); // ✅ 画面名が未登録なら警告表示
}

// ✅ APIサーバーのベースURL（環境に応じて切り替え）
export const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:8085"
    : "http://C20:8085"; // ← Spring Boot のポートに合わせて修正

// ✅ レコード一覧の取得関数（UIエラー表示付き）
export async function loadRecords() {
  try {
    const response = await fetch(`${API_BASE}/api/records`);
    if (!response.ok) throw new Error("HTTPエラー");
    const records = await response.json();
    return records;
  } catch (err) {
    console.error("レコード取得に失敗しました", err);
    showError("レコードの取得に失敗しました。サーバーが起動しているか確認してください。");
    return [];
  }
}

// ✅ ロック状態の取得（GET /api/lock/:id）
export async function fetchLockStatus(id) {
  try {
    const response = await fetch(`${API_BASE}/api/lock/${id}`);
    if (!response.ok) throw new Error("ロック状態の取得に失敗");
    return await response.json(); // { id, locked: true/false }
  } catch (err) {
    console.error(`ロック状態の取得に失敗しました (id=${id})`, err);
    return { id, locked: false }; // ← 安全側に倒す
  }
}

// ✅ ロックの取得（POST /api/lock/:id）
export async function lockRecord(id, user = "admin") {
  try {
    const response = await fetch(`${API_BASE}/api/lock/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user })
    });
    if (!response.ok) throw new Error("ロックに失敗");
    return await response.json(); // { id, locked: true }
  } catch (err) {
    console.error(`ロックに失敗しました (id=${id})`, err);
    return { id, locked: false };
  }
}

// ✅ ロック解除（DELETE /api/lock/:id）
export async function unlockRecord(id) {
  try {
    const response = await fetch(`${API_BASE}/api/lock/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("ロック解除に失敗");
    return await response.json(); // { id, locked: false }
  } catch (err) {
    console.error(`ロック解除に失敗しました (id=${id})`, err);
    return { id, locked: true };
  }
}