package org.recordapi.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Entity
@Table(name = "record")
@Schema(description = "レコード情報を表すモデル")
public class Record {

    @Id
    @GeneratedValue
    @Schema(description = "レコードID", example = "1")
    private Long id;

    @Column(nullable = false)
    @NotBlank
    @Schema(description = "名前（必須）", example = "Test Record")
    private String name;

    @Column(length = 255)
    @Size(max = 255)
    @Schema(description = "説明（最大255文字）", example = "Created via VS Code")
    private String description;

    @Column(name = "created_at")
    @Schema(description = "作成日時", example = "2025-10-06T11:45:00")
    private LocalDateTime createdAt;

    // ✅ UI連携用フィールドを追加
    @Column(length = 100)
    private String machine;

    @Column(length = 100)
    private String kataban;

    @Column(length = 100)
    private String kataname;

    @Column(length = 100)
    private String drawing;

    @Column(length = 255)
    private String comment;

    @Column(length = 50)
    private String status;

    public Record() {
    }

    public Record(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
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

    // ✅ UI連携用セッター・ゲッター
    public String getMachine() {
        return machine;
    }

    public void setMachine(String machine) {
        this.machine = machine;
    }

    public String getKataban() {
        return kataban;
    }

    public void setKataban(String kataban) {
        this.kataban = kataban;
    }

    public String getKataname() {
        return kataname;
    }

    public void setKataname(String kataname) {
        this.kataname = kataname;
    }

    public String getDrawing() {
        return drawing;
    }

    public void setDrawing(String drawing) {
        this.drawing = drawing;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Record{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                ", machine='" + machine + '\'' +
                ", kataban='" + kataban + '\'' +
                ", kataname='" + kataname + '\'' +
                ", drawing='" + drawing + '\'' +
                ", comment='" + comment + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}