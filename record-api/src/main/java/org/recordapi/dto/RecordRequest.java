package org.recordapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RecordRequest {

    @NotBlank(message = "名前は必須です")
    private String name;

    @Size(max = 255, message = "説明は255文字以内で入力してください")
    private String description;

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
