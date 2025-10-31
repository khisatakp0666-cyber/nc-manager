// 📄 newScreen.js：新規作成画面の初期化処理（静的公開＋API分離対応）

import { toUpperHalf } from "../shared/formatUtils.js";
import { API_BASE } from "../app.js"; // ✅ APIサーバーのホスト名とポートを取得

export function initNewScreen() {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("newForm");
    if (!form) return;

    // ✅ 入力補助：半角大文字変換
    ["machine", "kataban", "drawing"].forEach(id => {
      const input = document.getElementById(id);
      input?.addEventListener("blur", () => {
        input.value = toUpperHalf(input.value, id);
      });
    });

    // ✅ 新規登録処理（APIサーバーへ送信）
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const newRecord = {
        name: form.kataname.value, // ✅ Record.name に対応（必須）
        machine: form.machine.value,
        kataban: form.kataban.value,
        kataname: form.kataname.value,
        drawing: form.drawing.value,
        comment: form.comment.value,
        status: "未使用"
      };

      try {
        await fetch(`${API_BASE}/api/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord)
        });

        alert("保存しました！");
        window.location.href = "index.html";
      } catch (err) {
        console.error("保存に失敗しました", err);
        alert("保存に失敗しました。");
      }
    });
  });
}
