// 📄 indexScreen.js：NCプログラム一覧画面の初期化処理

export function initIndexScreen() {
  document.addEventListener("DOMContentLoaded", () => {
    loadEntries(); // 初期表示
  });

  // ✅ 状態切り替え：未使用 ↔ 使用済み
  window.toggleState = function (btn, index) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const current = entries[index].status;
    const newState = current === "未使用" ? "使用済み" : "未使用";
    entries[index].status = newState;
    localStorage.setItem("entries", JSON.stringify(entries));
    loadEntries();
  };

  // ✅ コメント保存
  window.saveComment = function (textarea, index) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    entries[index].comment = textarea.value;
    localStorage.setItem("entries", JSON.stringify(entries));
  };

  // ✅ 検索フィルタ
  window.filterTable = function () {
    const machine = document.getElementById("searchMachine").value.toLowerCase();
    const kataban = document.getElementById("searchKataban").value.toLowerCase();
    const drawing = document.getElementById("searchDrawing").value.toLowerCase();
    const comment = document.getElementById("searchComment").value.toLowerCase();

    document.querySelectorAll("#ncTable tbody tr").forEach(row => {
      const machineValue = row.cells[0].textContent.toLowerCase();
      const katabanValue = row.cells[1].textContent.toLowerCase();
      const drawingValue = row.cells[3].textContent.toLowerCase();
      const commentValue = row.querySelector("textarea")?.value.toLowerCase() || "";

      const match =
        machineValue.includes(machine) &&
        katabanValue.includes(kataban) &&
        drawingValue.includes(drawing) &&
        commentValue.includes(comment);

      row.style.display = match ? "" : "none";
    });

    updateEntryCount();
  };

  // ✅ 状態フィルタ
  window.filterByState = function (state) {
    document.querySelectorAll("#ncTable tbody tr").forEach(row => {
      const st = row.querySelector(".state-button")?.textContent.trim();
      row.style.display = (st === state) ? "" : "none";
    });
    updateEntryCount();
  };

  // ✅ 全表示
  window.showAll = function () {
    document.querySelectorAll("#ncTable tbody tr").forEach(row => {
      row.style.display = "";
    });
    updateEntryCount();
  };

  // ✅ 件数表示
  function updateEntryCount() {
    const count = Array.from(document.querySelectorAll("#ncTable tbody tr"))
      .filter(row => row.style.display !== "none").length;
    document.getElementById("entryCount").textContent = `件数：${count}件`;
  }

  // ✅ 削除ボタンの設定
  function setupDeleteButtons() {
    const tbody = document.querySelector("#ncTable tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const deletedLogs = JSON.parse(localStorage.getItem("deleted_logs") || "[]");

    rows.forEach((row, index) => {
      const deleteBtn = row.querySelector(".button.delete");
      deleteBtn.addEventListener("click", () => {
        const confirmDelete = window.confirm("この行を完全に削除します（復元できません）。よろしいですか？");
        if (!confirmDelete) return;

        const deletedEntry = entries[index];
        deletedEntry.deletedAt = new Date().toISOString();
        deletedLogs.push(deletedEntry);
        localStorage.setItem("deleted_logs", JSON.stringify(deletedLogs));

        entries.splice(index, 1);
        localStorage.setItem("entries", JSON.stringify(entries));

        loadEntries();
      });
    });
  }

  // ✅ ソート状態保持
  let currentSort = {
    key: null,
    ascending: true
  };

  // ✅ ソート処理
  window.sortTableBy = function (key) {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");

    if (currentSort.key === key) {
      currentSort.ascending = !currentSort.ascending;
    } else {
      currentSort.key = key;
      currentSort.ascending = true;
    }

    entries.sort((a, b) => {
      const valA = (a[key] || "").toLowerCase();
      const valB = (b[key] || "").toLowerCase();
      if (valA < valB) return currentSort.ascending ? -1 : 1;
      if (valA > valB) return currentSort.ascending ? 1 : -1;
      return 0;
    });

    localStorage.setItem("entries", JSON.stringify(entries));
    loadEntries();
  };

  // ✅ 一覧表示の初期化
  function loadEntries() {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const histories = JSON.parse(localStorage.getItem("history_by_id") || "{}");
    const tbody = document.querySelector("#ncTable tbody");
    tbody.innerHTML = "";

    const lastEditedIndex = parseInt(localStorage.getItem("lastEditedIndex"), 10);

    entries.forEach((entry, index) => {
      const stateClass = entry.status === "未使用" ? "state-unused" : "state-used";
      const highlightClass = index === lastEditedIndex ? "highlight-row" : "";
      const hasHistory = histories[index] !== undefined;

      const row = document.createElement("tr");
      row.className = highlightClass;
      row.innerHTML = `
        <td>${entry.machine || ""}</td>
        <td>${entry.kataban || ""}</td>
        <td>${entry.kataname || ""}</td>
        <td>${entry.drawing || ""}</td>
        <td>
          <textarea class="comment-input" rows="2"
            onblur="saveComment(this, ${index})">${entry.comment || ""}</textarea>
        </td>
        <td>
          <button class="state-button ${stateClass}"
            onclick="toggleState(this, ${index})">${entry.status}</button>
        </td>
        <td>
          <a href="edit.html?id=${index}" class="button">編集</a>
          <a href="history.html?id=${index}" class="button">履歴詳細</a>
          <button class="button delete">🗑️</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    setupDeleteButtons();
    updateEntryCount();
    localStorage.removeItem("lastEditedIndex");
  }
}