// 📄 exportScreen.js：CSV出力画面の初期化処理（静的公開＋API分離対応）

import { API_BASE } from "../app.js"; // ✅ APIサーバーのホスト名とポートを取得

document.addEventListener("DOMContentLoaded", () => {
  // ✅ DOM要素の取得
  const form = document.getElementById("csvForm");               // 出力条件フォーム
  const zipButton = document.getElementById("exportZipButton");  // ZIP出力ボタン
  const historyButton = document.getElementById("exportHistoryButton"); // 履歴CSV出力（任意）
  const importForm = document.getElementById("csvImportForm");   // CSV入力フォーム（分離推奨）

  // ✅ 全部選択ボタン
  document.getElementById("selectAllColumns")?.addEventListener("click", () => {
    document.querySelectorAll("input[name='columns']").forEach(cb => cb.checked = true);
  });

  // ✅ 全部解除ボタン
  document.getElementById("clearAllColumns")?.addEventListener("click", () => {
    document.querySelectorAll("input[name='columns']").forEach(cb => cb.checked = false);
  });

  // 📜 編集履歴CSV出力（GETで直接ダウンロード）
  historyButton?.addEventListener("click", () => {
    window.location.href = `${API_BASE}/api/export/history`;
  });

  // 📤 CSV出力処理（submit時に条件をURLに変換してGET）
  form?.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);
    const params = new URLSearchParams();

    // 🔍 絞り込み条件（空欄は除外）
    ["status", "machine", "from", "to"].forEach(key => {
      const val = formData.get(key);
      if (val) params.append(key, val);
    });

    // 📋 出力項目（チェックされた項目のみ）
    const selectedCols = [...form.querySelectorAll("input[name='columns']:checked")]
      .map(el => el.value);
    if (selectedCols.length > 0) {
      params.append("columns", selectedCols.join(","));
    }

    // 📛 ファイル名の指定（未入力時は確認ダイアログ）
    const rawName = formData.get("filename")?.trim();
    if (!rawName) {
      const proceed = confirm("ファイル名が未入力です。\n自動命名で出力します。よろしいですか？");
      if (!proceed) return;
    } else {
      const sanitized = rawName
        .replace(/[\\/:*?"<>|]/g, "") // 禁止文字除去
        .replace(/\s+/g, "_")         // 空白をアンダースコアに
        .replace(/\.csv$/i, "");      // 拡張子除去
      if (sanitized) {
        params.append("filename", sanitized);
      }
    }

    // 📤 ダウンロード実行（GETでCSV取得）
    window.location.href = `${API_BASE}/api/export/csv?${params.toString()}`;
  });

  // 📦 ZIP一括出力（GETでZIP取得）
  zipButton?.addEventListener("click", () => {
    window.location.href = `${API_BASE}/api/export/zip`;
  });

  // 📥 CSV入力処理（import.html に分離推奨）

});
