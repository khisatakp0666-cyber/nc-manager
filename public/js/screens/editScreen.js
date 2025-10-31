// 📄 editScreen.js：編集画面の初期化処理（静的公開＋API分離対応）

import { toUpperHalf } from "../shared/formatUtils.js";
import { API_BASE } from "../app.js"; // ✅ APIサーバーのホスト名とポートを取得

export function initEditScreen() {
  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("editForm");
    const params = new URLSearchParams(location.search);
    const recordId = params.get("id");

    // ✅ 無効なID（null, 空, "0"）なら処理を止める
    if (!form || !recordId || recordId === "0") {
      console.warn("無効なIDが指定されています:", recordId);
      return;
    }


    // ✅ 編集ロック確認
    const lockRes = await fetch(`${API_BASE}/api/lock/${recordId}`);
    const lockData = await lockRes.json();

    if (lockData.locked) {
      const editor = lockData.lockedBy || "他のユーザー";
      alert(`⚠️ ${editor} が編集中のため、現在は閲覧のみ可能です。`);
      form.querySelectorAll("input, textarea, button[type='submit']").forEach(el => el.disabled = true);
      return;
    }

    // ✅ 編集ロックを取得
    await fetch(`${API_BASE}/api/lock/${recordId}`, { method: "PUT" });

    try {
      const res = await fetch(`${API_BASE}/api/records/${recordId}`);
      if (!res.ok) {
        console.error("編集データの取得に失敗しました", res.status);
        alert("記録が存在しないか、取得に失敗しました。");
        return;
      }

      const record = await res.json();

      form.machine.value = record.machine || "";
      form.kataban.value = record.kataban || "";
      form.kataname.value = record.kataname || "";
      form.drawing.value = record.drawing || "";
      form.comment.value = record.comment || "";

      ["machine", "kataban", "drawing"].forEach(id => {
        const input = document.getElementById(id);
        input?.addEventListener("blur", () => {
          console.log("blur発火:", id, input.value);
          input.value = toUpperHalf(input.value, id);
        });
      });

    } catch (err) {
      console.error("編集データの取得に失敗しました", err);
      alert("記録の読み込み中にエラーが発生しました。");
    }

    // ✅ 保存処理（保存後にロック解除）
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const updated = {
        machine: form.machine.value,
        kataban: form.kataban.value,
        kataname: form.kataname.value,
        drawing: form.drawing.value,
        comment: form.comment.value,
        status: record.status || "未使用"
      };

      try {
        await fetch(`${API_BASE}/api/records/${recordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });

        await fetch(`${API_BASE}/api/lock/${recordId}`, { method: "DELETE" });
        alert("保存しました！");
        window.location.href = "index.html";

      } catch (err) {
        console.error("保存処理に失敗しました", err);
        alert("保存に失敗しました。");
      }
    });

    // ✅ 戻るボタンにもロック解除を追加
    document.getElementById("backButton")?.addEventListener("click", async () => {
      await fetch(`${API_BASE}/api/lock/${recordId}`, { method: "DELETE" });
    });

    // ✅ ページ非表示時にもロック解除（補助的）
    document.addEventListener("visibilitychange", () => {
      const params = new URLSearchParams(location.search);
      const recordId = params.get("id");
      if (document.visibilityState === "hidden" && recordId) {
        fetch(`${API_BASE}/api/lock/${recordId}`, { method: "DELETE" });
      }

    });
  })
}