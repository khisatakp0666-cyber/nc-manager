//📄 editScreen.js：編集画面の初期化エントリ（責務分離構成

import { initEditCore } from "./editCore.js";
import { setupLockHandlers } from "./editLock.js";

export function initEditScreen() {
  document.addEventListener("DOMContentLoaded", async () => {
    const context = await initEditCore(); // ← recordId, form, record を取得・表示・保存処理まで含む
    if (!context) return;

    setupLockHandlers(context); // ← visibilitychange や戻るボタンのロック解除
  });
}