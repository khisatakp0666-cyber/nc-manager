package org.recordapi.util;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.commons.io.input.ReversedLinesFileReader;

public class LogReader {

    public static String readLastLines(String logFilePath, int maxLines) {
        File file = new File(logFilePath);
        if (!file.exists()) {
            return "ログファイルが存在しません: " + logFilePath;
        }

        try (ReversedLinesFileReader reader = new ReversedLinesFileReader(file, Charset.defaultCharset())) {
            List<String> lines = new ArrayList<>();
            for (int i = 0; i < maxLines; i++) {
                String line = reader.readLine();
                if (line == null) break;
                lines.add(line);
            }
            Collections.reverse(lines); // 時系列順に並べ直す
            return String.join("\n", lines);

        } catch (IOException e) {
            return "ログ読み取りエラー: " + e.getMessage();
        }
    }
}