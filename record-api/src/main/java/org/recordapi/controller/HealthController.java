package org.recordapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

/**
 * アプリケーション起動確認用のヘルスチェックエンドポイント。
 * /health にアクセスすることで、Spring Boot が正常に起動しているか確認できる。
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }
}