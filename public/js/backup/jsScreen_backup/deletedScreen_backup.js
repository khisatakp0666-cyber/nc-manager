// 📄 deletedScreen.js：削除履歴画面の初期化処理

export function initDeletedScreen() {
  document.addEventListener("DOMContentLoaded", () => {
    const deletedLogs = JSON.parse(localStorage.getItem("deleted_logs") || "[]");
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const tbody = document.getElementById("deletedTableBody");

    // ✅ 削除履歴が空の場合
    if (deletedLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:#888;">削除履歴はまだありません</td></tr>`;
      return;
    }

    // ✅ 削除履歴をテーブルに表示
    deletedLogs.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.machine || ""}</td>
        <td>${entry.kataban || ""}</td>
        <td>${entry.kataname || ""}</td>
        <td>${entry.drawing || ""}</td>
        <td>${entry.comment || ""}</td>
        <td>${entry.status || ""}</td>
        <td>
          <button class="button restore" title="このデータを復元" data-index="${index}">🗂️ 復元する</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // ✅ 復元ボタンのイベント設定
    tbody.querySelectorAll(".button.restore").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        restoreEntry(index);
      });
    });

    // ✅ 全削除ボタンのイベント設定
    const deleteAllBtn = document.querySelector(".button.delete-all");
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener("click", deleteAll);
    }
  });

  /**
   * ✅ 削除履歴を復元する処理
   */
  function restoreEntry(index) {
    const confirmRestore = window.confirm("このデータを復元して一覧に戻します。よろしいですか？");
    if (!confirmRestore) return;

    const deletedLogs = JSON.parse(localStorage.getItem("deleted_logs") || "[]");
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const restored = deletedLogs[index];

    const exists = entries.some(e => e.kataban === restored.kataban);
    if (exists) {
      const proceed = window.confirm(
        `⚠️ 同じ片番「${restored.kataban}」のデータが既に存在します。\n重複して復元しますか？`
      );
      if (!proceed) return;
    }

    entries.push(restored);
    deletedLogs.splice(index, 1);

    localStorage.setItem("entries", JSON.stringify(entries));
    localStorage.setItem("deleted_logs", JSON.stringify(deletedLogs));

    alert("復元しました！");
    location.reload();
  }

  /**
   * ✅ 削除履歴をすべて完全に削除する処理
   */
  function deleteAll() {
    const confirmDelete = window.confirm("⚠️ 本当に全ての削除履歴を完全に消去しますか？復元できません。");
    if (!confirmDelete) return;

    localStorage.removeItem("deleted_logs");
    alert("全ての削除履歴を完全に削除しました。");
    location.reload();
  }
}