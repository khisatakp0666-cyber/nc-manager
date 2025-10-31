//📄 editLock.js：編集ロックの補助処理（戻る・非表示時の解除）

import { API_BASE } from "../app.js";

export function setupLockHandlers({ recordId }) {
    document.getElementById("backButton")?.addEventListener("click", async () => {
        await fetch(`${API_BASE}/api/lock/${recordId}`, { method: "DELETE" });
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && recordId) {
            fetch(`${API_BASE}/api/lock/${recordId}`, { method: "DELETE" });
        }
    });
}