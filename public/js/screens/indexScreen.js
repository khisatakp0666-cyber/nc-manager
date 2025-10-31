// 📄 indexScreen.js（一覧画面の初期化処理

import {
  updateEntryCount,
  bindSearchEvents,
} from "../shared/domUtils.js";

export async function initIndexScreen() {
  document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.querySelector("#ncTable tbody");
    tbody.innerHTML = "";

    try {
      // ✅ Spring Boot API から記録一覧を取得（CSP対応済み）
      const response = await fetch("http://localhost:8085/api/records");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const records = await response.json();

      records.forEach((record, index) => {
        const stateClass = record.status === "未使用" ? "state-unused" : "state-used";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${record.machine || ""}</td>
          <td>${record.kataban || ""}</td>
          <td>${record.kataname || ""}</td>
          <td>${record.drawing || ""}</td>
          <td>
            <textarea rows="2" data-index="${index}">${record.comment || ""}</textarea>
          </td>
          <td>
            <button class="state-button ${stateClass}" data-index="${index}">${record.status}</button>
          </td>
          <td>
            <a href="edit.html?id=${record.id}" class="button">編集</a>
            <a href="history.html?id=${record.id}" class="button">履歴詳細</a>
            <button class="button delete" data-index="${index}">🗑️</button>
          </td>
        `;
        tbody.appendChild(row);

        // ✅ 状態切り替えイベントを追加
        row.querySelector(".state-button").addEventListener("click", (e) => {
          const btn = e.target;
          const current = btn.textContent;

          const next = current === "未使用" ? "使用済み" : "未使用";
          btn.textContent = next;
          btn.classList.toggle("state-unused");
          btn.classList.toggle("state-used");

          // 必要なら API に状態更新を送信
          // fetch(`/api/updateStatus?id=${record.id}`, {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ status: next })
          // });
        });
      });

      updateEntryCount();
      bindSearchEvents();

    } catch (err) {
      console.error("データ取得に失敗しました", err);
      tbody.innerHTML = `<tr><td colspan="7" style="color:red;">記録の取得に失敗しました</td></tr>`;
    }
  });
}