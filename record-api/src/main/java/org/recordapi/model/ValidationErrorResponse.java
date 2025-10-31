package org.recordapi.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "バリデーションエラーのレスポンス構造")
public class ValidationErrorResponse {

    @Schema(description = "フィールド名", example = "name")
    private String field;

    @Schema(description = "エラーメッセージ", example = "must not be blank")
    private String message;

    public ValidationErrorResponse() {}

    public ValidationErrorResponse(String field, String message) {
        this.field = field;
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}