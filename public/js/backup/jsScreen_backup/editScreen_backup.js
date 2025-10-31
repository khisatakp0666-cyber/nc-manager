// 📄 editScreen.js：編集画面の初期化処理

export function initEditScreen() {
  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(location.search);
    const entryId = parseInt(params.get("id"), 10);
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    const entry = entries[entryId];
    const form = document.getElementById("editForm");

    if (!form || !entry || isNaN(entryId)) return;

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
            .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
            .replace(/　/g, " ")
            .replace(/[a-z]/g, ch => ch.toUpperCase());

          if (original !== converted) {
            alert(`${label} が全角で入力されたため、半角英数字・記号に変換しました。`);
            input.value = converted;
          }
        });
      }
    });

    // ✅ 初期表示：既存データをフォームへ反映
    form.machine.value = entry.machine || "";
    form.kataban.value = entry.kataban || "";
    form.kataname.value = entry.kataname || "";
    form.drawing.value = entry.drawing || "";
    form.comment.value = entry.comment || "";

    // ✅ 保存処理：編集内容を localStorage に上書き保存
    form.addEventListener("submit", e => {
      e.preventDefault();

      entries[entryId] = {
        machine: form.machine.value,
        kataban: form.kataban.value,
        kataname: form.kataname.value,
        drawing: form.drawing.value,
        comment: form.comment.value,
        status: entry.status || "未使用"
      };

      localStorage.setItem("entries", JSON.stringify(entries));
      localStorage.setItem("lastEditedIndex", entryId);
      alert("保存しました！");
      window.location.href = "index.html";
    });
  });
}