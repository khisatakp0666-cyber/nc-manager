// 📄 historyScreen.js：履歴詳細画面の初期化処理（静的公開＋API分離対応）

import { API_BASE } from "../app.js"; // ✅ APIサーバーのホスト名とポートを取得

export function initHistoryScreen() {
  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("historyForm");
    const params = new URLSearchParams(location.search);
    const recordId = params.get("id");

    if (!form || !recordId) return;

    try {
      const res = await fetch(`${API_BASE}/api/history/${recordId}`);
      const history = await res.json();

      form.programName.value = history.programName || "";
      form.debugDate.value = history.debugDate || "";
      form.debugUser.value = history.debugUser || "";
      form.vericutDate.value = history.vericutDate || "";
      form.vericutUser.value = history.vericutUser || "";
      form.comment.value = history.comment || "";
      form.person.value = history.person || "admin";
      form.lastUpdated.value = history.lastUpdated || "";

      form.addEventListener("submit", async e => {
        e.preventDefault();

        const updatedHistory = {
          programName: form.programName.value,
          debugDate: form.debugDate.value,
          debugUser: form.debugUser.value,
          vericutDate: form.vericutDate.value,
          vericutUser: form.vericutUser.value,
          comment: form.comment.value,
          person: "admin"
        };

        await fetch(`${API_BASE}/api/history/${recordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedHistory)
        });

        const today = new Date().toISOString().slice(0, 10);
        form.lastUpdated.value = today;
        alert("履歴を保存しました！");
      });

    } catch (err) {
      console.error("履歴の取得に失敗しました", err);
      alert("履歴の読み込みに失敗しました。");
    }
  });
}