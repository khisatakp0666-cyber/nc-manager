// 📄 LockController.java

package org.recordapi.controller;

import org.recordapi.model.LockInfo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/lock")
public class LockController {

    // ✅ メモリ上でロック状態を保持（保守性重視）
    private final Map<Long, LockInfo> lockMap = new ConcurrentHashMap<>();

    // ✅ ロック状態を取得
    @GetMapping("/{id}")
    public ResponseEntity<LockInfo> getLock(@PathVariable Long id) {
        LockInfo info = lockMap.get(id);
        if (info == null) {
            return ResponseEntity.ok(new LockInfo(false, null)); // ロックなし
        }
        return ResponseEntity.ok(info);
    }

    // ✅ ロックを設定
    @PutMapping("/{id}")
    public ResponseEntity<?> lock(@PathVariable Long id) {
        LockInfo info = lockMap.get(id);
        if (info != null && info.isLocked()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("既にロックされています");
        }
        lockMap.put(id, new LockInfo(true, "admin")); // 固定ユーザー名（必要ならセッション対応可）
        return ResponseEntity.ok().build();
    }

    // ✅ ロックを解除
    @DeleteMapping("/{id}")
    public ResponseEntity<?> unlock(@PathVariable Long id) {
        lockMap.remove(id);
        return ResponseEntity.ok().build();
    }
}