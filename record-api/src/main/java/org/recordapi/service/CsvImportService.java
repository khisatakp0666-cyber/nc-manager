package org.recordapi.service;

import org.recordapi.model.Record;
import org.recordapi.repository.RecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@Service
public class CsvImportService {

    private static final Logger logger = LoggerFactory.getLogger(CsvImportService.class);
    private final RecordRepository repository;

    public CsvImportService(RecordRepository repository) {
        this.repository = repository;
    }

    public boolean importCsv(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                String[] parts = line.split(",", -1);
                if (parts.length < 4 || parts[1].isBlank() || parts[3].isBlank()) {
                    logger.warn("不正な行をスキップ: {}", line);
                    continue;
                }

                LocalDateTime createdAt;
                try {
                    createdAt = LocalDateTime.parse(parts[3].trim());
                } catch (DateTimeParseException e) {
                    logger.warn("日付形式エラー: {}", parts[3]);
                    continue;
                }

                if (repository.existsByName(parts[1].trim())) {
                    logger.info("重複レコードをスキップ: {}", parts[1]);
                    continue;
                }

                Record entity = new Record();
                entity.setMachine(parts[0].trim());
                entity.setKataban(parts[1].trim());
                entity.setKataname(parts[2].trim());
                entity.setDrawing(parts[3].trim());
                entity.setComment(parts[4].trim());
                entity.setStatus(parts[5].trim());
                entity.setCreatedAt(createdAt);

                repository.save(entity);
            }

            return true;

        } catch (IOException e) {
            logger.error("CSV読み込み失敗", e);
            return false;
        }
    }
}