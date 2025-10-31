// 📄 deletedScreen.js：削除履歴画面の初期化処理（静的公開＋API分離対応）

import { API_BASE } from "../app.js"; // ✅ APIサーバーのホスト名とポートを取得

export function initDeletedScreen() {
  document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("deletedTableBody");
    tbody.innerHTML = "";

    try {
      const res = await fetch(`${API_BASE}/api/deleted`);
      const deletedRecords = await res.json();

      if (deletedRecords.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="color:#888;">削除履歴はまだありません</td></tr>`;
        return;
      }

      deletedRecords.forEach((record, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${record.machine || ""}</td>
          <td>${record.kataban || ""}</td>
          <td>${record.kataname || ""}</td>
          <td>${record.drawing || ""}</td>
          <td>${record.comment || ""}</td>
          <td>${record.status || ""}</td>
          <td>
            <button class="button restore" data-index="${index}">🗂️ 復元する</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      // ✅ 復元ボタンのイベント設定
      tbody.querySelectorAll(".button.restore").forEach(btn => {
        btn.addEventListener("click", async () => {
          const index = parseInt(btn.dataset.index, 10);
          const confirmRestore = window.confirm("この記録を復元して一覧に戻します。よろしいですか？");
          if (!confirmRestore) return;

          const res = await fetch(`${API_BASE}/api/deleted`);
          const deletedRecords = await res.json();
          const restored = deletedRecords[index];

          // ✅ 重複チェック（片番）
          const recordsRes = await fetch(`${API_BASE}/api/records`);
          const records = await recordsRes.json();
          const exists = records.some(r => r.kataban === restored.kataban);

          if (exists) {
            const proceed = window.confirm(`⚠️ 同じ片番「${restored.kataban}」の記録が既に存在します。\n重複して復元しますか？`);
            if (!proceed) return;
          }

          // ✅ 復元処理：新規追加
          await fetch(`${API_BASE}/api/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(restored)
          });

          alert("復元しました！");
          location.reload();
        });
      });

      // ✅ 全削除ボタンのイベント設定
      document.querySelector(".button.delete-all")?.addEventListener("click", async () => {
        const confirmDelete = window.confirm("⚠️ 本当に全ての削除履歴を完全に消去しますか？復元できません。");
        if (!confirmDelete) return;

        await fetch(`${API_BASE}/api/deleted`, { method: "DELETE" });
        alert("全ての削除履歴を完全に削除しました。");
        location.reload();
      });

    } catch (err) {
      console.error("削除履歴の取得に失敗しました", err);
      tbody.innerHTML = `<tr><td colspan="7" style="color:red;">削除履歴の取得に失敗しました</td></tr>`;
    }
  });
}
