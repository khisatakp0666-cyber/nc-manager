// 📄 historyScreen.js：履歴詳細画面の初期化処理

export function initHistoryScreen() {
  document.addEventListener("DOMContentLoaded", () => {
    const entryId = parseInt(new URLSearchParams(location.search).get("id"), 10);
    const form = document.getElementById("historyForm");
    if (!form || isNaN(entryId)) return;

    // ✅ 履歴データの読み込み
    const histories = JSON.parse(localStorage.getItem("history_by_id") || "{}");
    const data = histories[entryId];

    if (data) {
      form.programName.value = data.programName || "";
      form.debugDate.value = data.debugDate || "";
      form.debugUser.value = data.debugUser || "";
      form.vericutDate.value = data.vericutDate || "";
      form.vericutUser.value = data.vericutUser || "";
      form.comment.value = data.comment || "";
      form.person.value = data.person || "";
      form.lastUpdated.value = data.lastUpdated || "";
    }

    // ✅ 保存処理（最終更新日を記録）
    form.addEventListener("submit", e => {
      e.preventDefault();

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const updated = {
        programName: form.programName.value,
        debugDate: form.debugDate.value,
        debugUser: form.debugUser.value,
        vericutDate: form.vericutDate.value,
        vericutUser: form.vericutUser.value,
        comment: form.comment.value,
        person: form.person.value,
        lastUpdated: today
      };

      histories[entryId] = updated;
      localStorage.setItem("history_by_id", JSON.stringify(histories));
      form.lastUpdated.value = today;
      alert("履歴を保存しました！");
    });
  });
}