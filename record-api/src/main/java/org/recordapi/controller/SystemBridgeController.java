package org.recordapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

@RestController
@RequestMapping("/api/nc")
public class SystemBridgeController {

    @PostMapping("/run")
    public ResponseEntity<String> runNcManager() {
        try {
            String scriptPath = "N:\\666 久田和恵\\shared-server\\nc-manager\\server.js";
            ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", "node", scriptPath);
            pb.directory(new File("N:\\666 久田和恵\\shared-server\\nc-manager"));
            pb.redirectErrorStream(true);

            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            return ResponseEntity.ok("NCプログラム一覧表サーバー起動成功\n" + output.toString());
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("起動失敗: " + e.getMessage());
        }
    }
}