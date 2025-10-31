// 📄 importScreen.js：CSV入力画面の初期化処理（静的公開＋API分離対応）
//
// このスクリプトは import.html に対応し、CSVファイルのプレビュー表示と登録処理を担当する。
// 静的HTMLから読み込まれ、APIサーバー（API_BASE）と分離された構成で動作する。
// 主な機能：
// - CSVファイル選択時に内容を表形式でプレビュー表示（Shift_JIS対応）
// - 必須項目の空欄チェックによるエラー行の強調表示
// - 行ごとの除外チェックと件数再計算
// - 登録ボタンで /api/import/csv にPOST送信し、件数を通知

import { API_BASE } from "../app.js";

// 📄 importScreen.js：CSV入力画面の初期化処理（静的公開＋API分離対応）
export function initImportScreen() {
    const fileInput = document.getElementById("csvfile");
    const previewArea = document.getElementById("previewArea");
    const importForm = document.getElementById("csvImportForm");
    const recordCount = document.getElementById("recordCount");
    const downloadTemplateButton = document.getElementById("downloadTemplate");

    // 📄 テンプレートダウンロード処理
    downloadTemplateButton.addEventListener("click", () => {
        const headers = ["機名", "片番", "片名", "図番", "コメント", "状態"];
        const csvContent = headers.join(",") + "\n";
        const blob = new Blob([csvContent], { type: "text/csv;charset=Shift_JIS" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "csv_template.csv";
        a.click();

        URL.revokeObjectURL(url);
    });

    //フィルタ処理
    document.getElementById("filterExcluded").addEventListener("change", e => {
        const showOnlyExcluded = e.target.checked;
        const rows = document.querySelectorAll(".preview-table tr");

        rows.forEach((tr, i) => {
            if (i === 0) {
                tr.style.display = ""; // ヘッダーは常に表示
                return;
            }

            const checkbox = tr.querySelector(".exclude-row");
            const isExcluded = checkbox?.checked;

            tr.style.display = showOnlyExcluded
                ? (isExcluded ? "" : "none")
                : "";
        });

        //編集イベントで再判定＆再描写
        function handleCellEdit() {
            const table = document.querySelector(".preview-table");
            const rows = Array.from(table.querySelectorAll("tr")).slice(1); // データ行のみ
            const headers = Array.from(table.querySelectorAll("tr")[0].children).slice(1).map(th => th.textContent);

            rows.forEach((tr, i) => {
                const inputs = tr.querySelectorAll("input");
                const rowData = Array.from(inputs).map(input => input.value.trim());

                if (isErrorRow(rowData, headers)) {
                    tr.classList.add("error-row");
                } else {
                    tr.classList.remove("error-row");
                }
            });

            updateCount(); // 件数再計算
        }

    });

    // 👀 プレビュー表示
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const rawText = reader.result;
            const lines = rawText
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => line.split(",").map(cell => cell.trim()));

            if (lines.length === 0) {
                previewArea.innerHTML = "⚠️ 空のCSVファイルです";
                return;
            }

            const headers = lines[0];
            const dataRows = lines.slice(1);
            const table = document.createElement("table");
            table.classList.add("preview-table");

            lines.forEach((row, i) => {
                const tr = document.createElement("tr");

                if (i === 0) {
                    const th = document.createElement("th");
                    th.textContent = "除外";
                    tr.appendChild(th);
                } else {
                    const td = document.createElement("td");
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.classList.add("exclude-row");
                    checkbox.checked = false;
                    checkbox.addEventListener("change", updateCount);
                    td.appendChild(checkbox);
                    tr.appendChild(td);
                }

                row.forEach((cell, colIndex) => {
                    const td = document.createElement(i === 0 ? "th" : "td");

                    if (i > 0 && isErrorRow(row, headers)) {
                        const input = document.createElement("input");
                        input.type = "text";
                        input.value = cell;
                        input.dataset.row = i;
                        input.dataset.col = colIndex;
                        input.addEventListener("input", handleCellEdit);
                        td.appendChild(input);
                    } else {
                        td.textContent = cell;
                    }

                    tr.appendChild(td);
                });

                if (i > 0 && isErrorRow(row, headers)) {
                    tr.classList.add("error-row");
                }

                table.appendChild(tr);
            });

            previewArea.innerHTML = "";
            previewArea.appendChild(table);

            updateCount();
        };

        reader.readAsText(file, "Shift_JIS");
    });

    // 📥 登録処理
    importForm.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(importForm);

        try {
            const res = await fetch(`${API_BASE}/api/import/csv`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("アップロードに失敗しました");

            const result = await res.json();
            alert(`✅ ${result.added} 件のデータを追加しました（スキップ: ${result.skipped} 件）`);
            window.location.href = "/"; // ← 一覧画面へ戻す
        } catch (err) {
            alert(`❌ エラー: ${err.message}`);
        }
    });

    // 🔁 件数再計算
    function updateCount() {
        const excludeChecks = document.querySelectorAll(".exclude-row");
        const excludedCount = Array.from(excludeChecks).filter(cb => cb.checked).length;

        const totalRows = excludeChecks.length;
        const errorRows = Array.from(document.querySelectorAll(".error-row")).length;
        const validRows = totalRows - errorRows;

        recordCount.textContent =
            `登録予定件数: ${validRows - excludedCount} 件（エラー行: ${errorRows} 件、除外: ${excludedCount} 件）`;
    }
}

// 🔍 エラー判定ロジック
function isErrorRow(row, headers) {
    const requiredKeys = ["machine", "kataban", "status"];
    const indexMap = Object.fromEntries(headers.map((h, i) => [h, i]));

    return requiredKeys.some(key => {
        const idx = indexMap[key];
        return idx === undefined || !row[idx] || row[idx].trim() === "";
    });
}
