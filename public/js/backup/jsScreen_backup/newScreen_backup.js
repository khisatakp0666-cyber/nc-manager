// 📄 newScreen.js：新規作成画面の初期化処理

export function initNewScreen() {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("newForm");
    if (!form) return;

    // ✅ 入力補助：全角→半角、大文字化＋通知
    const fields = [
      { id: "machine", label: "機名" },
      { id: "kataban", label: "片番" },
      { id: "drawing", label: "図番" }
    ];

    fields.forEach(({ id, label }) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", () => {
          const original = input.value;
          const converted = original
            .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)) // 全角英数字＋記号
            .replace(/　/g, " ") // 全角スペース
            .replace(/[a-z]/g, ch => ch.toUpperCase()); // 小文字英字 → 大文字

          if (original !== converted) {
            alert(`${label} が全角で入力されたため、半角英数字・記号に変換しました。`);
            input.value = converted;
          }
        });
      }
    });

    // ✅ 保存処理：localStorage に追加 → 一覧へ遷移
    form.addEventListener("submit", e => {
      e.preventDefault();

      const entries = JSON.parse(localStorage.getItem("entries") || "[]");

      entries.push({
        machine: document.getElementById("machine").value,
        kataban: document.getElementById("kataban").value,
        kataname: document.getElementById("kataname").value,
        drawing: document.getElementById("drawing").value,
        comment: document.getElementById("comment").value,
        status: "未使用"
      });

      localStorage.setItem("entries", JSON.stringify(entries));
      localStorage.setItem("lastEditedIndex", entries.length - 1);
      alert("保存しました！");
      window.location.href = "index.html";
    });
  });
}