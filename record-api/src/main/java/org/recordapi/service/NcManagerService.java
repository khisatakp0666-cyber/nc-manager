package org.recordapi.service;

import org.springframework.stereotype.Service;
import java.io.*;

@Service
public class NcManagerService {

    public String runNcManager() {
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

            return "nc-manager 起動完了\n" + output.toString();
        } catch (IOException e) {
            return "起動失敗: " + e.getMessage();
        }
    }
}