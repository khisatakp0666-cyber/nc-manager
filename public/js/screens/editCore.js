// 📄 editCore.js：編集画面の主要処理（レコード取得・保存・フォーム反映）

import { API_BASE } from "../app.js";
import { toUpperHalf } from "../shared/formatUtils.js";

export async function initEditCore() {
    const form = document.getElementById("editForm");
    const params = new URLSearchParams(location.search);
    const recordId = params.get("id");

    if (!form || !recordId || recordId === "0") {
        console.warn("無効なIDが指定されています:", recordId);
        return null;
    }

    // ✅ ロック確認
    const lockRes = await fetch(`${API_BASE}/api/lock/${recordId}`);
    const lockData = await lockRes.json();
    if (lockData.locked) {
        alert(`⚠️ ${lockData.lockedBy || "他のユーザー"} が編集中です`);
        form.querySelectorAll("input, textarea, button[type='submit']").forEach(el => el.disabled = true);
        return null;
    }

    // ✅ ロック取得（← 推奨：空でも JSON ボディを送る）
    await fetch(`${API_BASE}/api/lock/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: "admin" }) // ← ここが重要
    });

    // ✅ レコード取得
    const res = await fetch(`${API_BASE}/api/records/${recordId}`);
    if (!res.ok) {
        alert("記録の取得に失敗しました");
        return null;
    }
    const record = await res.json();

    // ✅ フォーム反映
    form.machine.value = record.machine || "";
    form.kataban.value = record.kataban || "";
    form.kataname.value = record.kataname || "";
    form.drawing.value = record.drawing || "";
    form.comment.value = record.comment || "";

    ["machine", "kataban", "drawing"].forEach(id => {
        const input = document.getElementById(id);
        input?.addEventListener("blur", () => {
            input.value = toUpperHalf(input.value, id);
        });
    });

    // ✅ 保存処理
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
        await fetch(`${API_BASE}/api/records/${recordId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });
        await fetch(`${API_BASE}/api/lock/${recordId}`, { method: "DELETE" });
        alert("保存しました！");
        location.href = "index.html";
    });

    return { form, recordId };
}