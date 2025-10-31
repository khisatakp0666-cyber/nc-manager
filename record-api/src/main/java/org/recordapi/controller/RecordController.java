package org.recordapi.controller;

import org.recordapi.dto.RecordRequest;
import org.recordapi.model.Record;
import org.recordapi.entity.RecordHistoryEntity;
import org.recordapi.repository.RecordHistoryRepository;
import org.recordapi.repository.RecordRepository;

import org.recordapi.service.CsvImportService;
import org.springframework.beans.BeanUtils;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/records")
public class RecordController {

    private static final Logger logger = LoggerFactory.getLogger(RecordController.class);

    private final RecordRepository repository;
    private final CsvImportService csvImportService;
    private final RecordHistoryRepository historyRepository;

    public RecordController(
            RecordRepository repository,
            CsvImportService csvImportService,
            RecordHistoryRepository historyRepository) {
        this.repository = repository;
        this.csvImportService = csvImportService;
        this.historyRepository = historyRepository;
    }

    @Operation(summary = "全レコード取得", description = "保存されているすべてのレコードを一覧で取得します。")
    @ApiResponse(responseCode = "200", description = "取得成功", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Record.class))))
    @GetMapping
    public List<Record> getAllRecords() {
        logger.info("全レコード取得");
        return repository.findAll(); // ← これが List<Record> を返す
    }

    @Operation(summary = "レコード登録", description = "新しいレコードを登録します。name は必須です。")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "登録成功"),
            @ApiResponse(responseCode = "400", description = "バリデーションエラー")
    })
    @PostMapping
    public ResponseEntity<Record> createRecord(@Valid @RequestBody RecordRequest request) {
        logger.info("新規レコード登録: name={}, description={}", request.getName(), request.getDescription());
        Record entity = new Record();
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setCreatedAt(LocalDateTime.now());

        Record saved = repository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "個別レコード取得", description = "指定された ID のレコードを取得します。存在しない場合は 404 を返します。")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "取得成功", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Record.class))),
            @ApiResponse(responseCode = "404", description = "指定されたIDのレコードが存在しない")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Record> getRecordById(@PathVariable Long id) {
        logger.info("レコード取得: id={}", id);
        Optional<Record> record = repository.findById(id);
        return record.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "レコード更新", description = "指定された ID のレコードを更新します。name は必須です。存在しない場合は 404 を返します。")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "更新成功", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Record.class))),
            @ApiResponse(responseCode = "400", description = "バリデーションエラー"),
            @ApiResponse(responseCode = "404", description = "指定されたIDのレコードが存在しない")
    })
    public ResponseEntity<Record> updateRecord(@PathVariable Long id, @Valid @RequestBody RecordRequest updated) {
        logger.info("レコード更新: id={}, name={}, description={}", id, updated.getName(), updated.getDescription());

        return repository.findById(id)
                .map(record -> {
                    // 履歴保存用にコピー
                    Record before = new Record();
                    BeanUtils.copyProperties(record, before);

                    // 更新処理
                    record.setName(updated.getName());
                    record.setDescription(updated.getDescription());
                    Record saved = repository.save(record);

                    // 履歴保存
                    RecordHistoryEntity history = new RecordHistoryEntity();
                    history.setOriginalId(before.getId());
                    history.setName(before.getName());
                    history.setDescription(before.getDescription());
                    history.setCreatedAt(before.getCreatedAt());
                    history.setModifiedAt(LocalDateTime.now());
                    history.setAction("UPDATED");
                    historyRepository.save(history);

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "レコード削除", description = "指定された ID のレコードを削除します。存在しない場合は 404 を返します。")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        logger.info("レコード削除: id={}", id);

        Record record = repository.findById(id).orElse(null);
        if (record != null) {
            // 履歴保存
            RecordHistoryEntity history = new RecordHistoryEntity();
            history.setOriginalId(record.getId());
            history.setName(record.getName());
            history.setDescription(record.getDescription());
            history.setCreatedAt(record.getCreatedAt());
            history.setModifiedAt(LocalDateTime.now());
            history.setAction("DELETED");
            historyRepository.save(history);

            // 削除処理
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "CSV出力", description = "全レコードをCSV形式でダウンロードします。")
    @ApiResponse(responseCode = "200", description = "CSV出力成功", content = @Content(mediaType = "text/csv"))
    @GetMapping("/export")
    public ResponseEntity<Resource> exportCsv() {
        logger.info("CSV出力開始");

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                BufferedWriter writer = new BufferedWriter(
                        new OutputStreamWriter(outputStream, StandardCharsets.UTF_8))) {

            writer.write("ID,Name,Description,CreatedAt");
            writer.newLine();

            for (Record record : repository.findAll()) {
                writer.write(String.format("%d,%s,%s,%s",
                        record.getId(),
                        record.getName(),
                        record.getDescription(),
                        record.getCreatedAt()));
                writer.newLine();
            }

            writer.flush();
            ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=records.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(resource);

        } catch (IOException e) {
            logger.error("CSV出力失敗", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "CSVインポート", description = "CSVファイルをアップロードしてレコードを一括登録します。")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "インポート成功"),
            @ApiResponse(responseCode = "400", description = "ファイル形式エラー")
    })
    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<Void> importCsv(@RequestParam("file") MultipartFile file) {
        String filename = file.getOriginalFilename();
        logger.info("CSVインポート開始: {}", filename);

        // ✅ nullチェックと拡張子チェックを明示
        if (file.isEmpty() || filename == null || !filename.endsWith(".csv")) {
            logger.warn("CSVファイルが無効です");
            return ResponseEntity.badRequest().build();
        }

        boolean success = csvImportService.importCsv(file);
        return success
                ? ResponseEntity.status(HttpStatus.CREATED).build()
                : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @Operation(summary = "履歴一覧取得", description = "レコードの更新・削除履歴を取得します。")
    @ApiResponse(responseCode = "200", description = "取得成功", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = RecordHistoryEntity.class))))
    @GetMapping("/history")
    public List<RecordHistoryEntity> getHistory() {
        logger.info("履歴一覧取得");
        return historyRepository.findAll();
    }

    @Operation(summary = "NCマネージャー起動", description = "Node.js の nc-manager を起動します")
    @PostMapping("/nc/run")
    public ResponseEntity<String> runNcManager() {
        try {
            ProcessBuilder builder = new ProcessBuilder(
                    "node", "server.js");
            builder.directory(new File("N:/666 久田和恵/shared-server/nc-manager")); // ← Node.jsの実行ディレクトリ
            builder.redirectErrorStream(true);

            Process process = builder.start();

            // ログ出力（任意）
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            return ResponseEntity.ok("nc-manager 起動完了\n" + output.toString());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("起動失敗: " + e.getMessage());
        }
    }

}