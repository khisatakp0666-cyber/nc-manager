package org.recordapi.controller;

import org.recordapi.util.LogReader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final String ADMIN_KEY = "your-secret-key"; // ← 任意のパスキーに変更可能
    private static final String LOG_FILE_PATH = "logs/app.log"; // ← 実際のログファイルパスに合わせて調整

    @GetMapping("/logs")
    public ResponseEntity<String> getLogs(@RequestHeader("X-Admin-Key") String key) {
        if (!ADMIN_KEY.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("アクセス拒否：パスキーが不正です");
        }

        String logs = LogReader.readLastLines(LOG_FILE_PATH, 100);
        return ResponseEntity.ok(logs);
    }
}