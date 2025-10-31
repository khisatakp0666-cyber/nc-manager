// 📄 LockController.java：編集ロック管理API（ファイルベース）

package org.recordapi.controller;

import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/lock")
public class LockController {

    private static final Path LOCK_FILE = Paths.get("data", "lock.json");

    // ✅ 初期化確認ログ（Spring Bootがこのクラスを認識しているか確認）
    @PostConstruct
    public void init() {
        System.out.println(">>> LockController initialized");
    }

    // ✅ ロック情報の読み込み
    @SuppressWarnings("unchecked")
    private Map<String, Map<String, Object>> loadLocks() {
        if (!Files.exists(LOCK_FILE)) {
            return new HashMap<>();
        }
        try (Reader reader = Files.newBufferedReader(LOCK_FILE)) {
            return new ObjectMapper().readValue(reader, Map.class);
        } catch (IOException e) {
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    // ✅ ロック情報の保存
    private void saveLocks(Map<String, Map<String, Object>> locks) {
        try {
            Files.createDirectories(LOCK_FILE.getParent());
            try (Writer writer = Files.newBufferedWriter(LOCK_FILE)) {
                new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(writer, locks);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // ✅ ロック状態の取得（GET /api/lock/{id}）
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getLockStatus(@PathVariable String id) {
        Map<String, Map<String, Object>> locks = loadLocks();
        boolean locked = locks.containsKey(id) && Boolean.TRUE.equals(locks.get(id).get("locked"));

        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("locked", locked);
        return ResponseEntity.ok(result);
    }

    // ✅ ロックの取得（PUT /api/lock/{id}）
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> lock(@PathVariable String id, @RequestBody Map<String, String> body) {
        String user = body.getOrDefault("user", "admin");

        Map<String, Map<String, Object>> locks = loadLocks();
        Map<String, Object> lockInfo = new HashMap<>();
        lockInfo.put("locked", true);
        lockInfo.put("lockedBy", user);
        lockInfo.put("lockedAt", Instant.now().toString());
        locks.put(id, lockInfo);
        saveLocks(locks);

        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("locked", true);
        return ResponseEntity.ok(result);
    }

    // ✅ ロック解除（DELETE /api/lock/{id}）
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> unlock(@PathVariable String id) {
        Map<String, Map<String, Object>> locks = loadLocks();
        locks.remove(id);
        saveLocks(locks);

        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("locked", false);
        return ResponseEntity.ok(result);
    }
}