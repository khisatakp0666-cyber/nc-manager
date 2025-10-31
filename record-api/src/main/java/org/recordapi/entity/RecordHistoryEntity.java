package org.recordapi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Entity
@Table(name = "record_history")
@Schema(description = "レコード履歴情報")
public class RecordHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @Schema(description = "履歴ID（自動採番）", example = "1001")
    private Long id;

    @Column(name = "original_id", nullable = false)
    @Schema(description = "元レコードのID", example = "1")
    private Long originalId;

    @Column(name = "name", nullable = false)
    @Schema(description = "レコードの名前（変更前）", example = "テストA")
    private String name;

    @Column(name = "description", length = 255)
    @Schema(description = "レコードの説明（変更前）", example = "説明A")
    private String description;

    @Column(name = "created_at")
    @Schema(description = "元レコードの作成日時", example = "2025-09-21T10:00:00")
    private LocalDateTime createdAt;

    @Column(name = "modified_at")
    @Schema(description = "履歴登録日時（変更が行われた時刻）", example = "2025-09-22T11:00:00")
    private LocalDateTime modifiedAt;

    @Column(name = "action", nullable = false)
    @Schema(description = "操作種別（UPDATED or DELETED）", example = "UPDATED")
    private String action;

    // Getter / Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOriginalId() {
        return originalId;
    }

    public void setOriginalId(Long originalId) {
        this.originalId = originalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getModifiedAt() {
        return modifiedAt;
    }

    public void setModifiedAt(LocalDateTime modifiedAt) {
        this.modifiedAt = modifiedAt;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}