package org.recordapi.exception;

import org.recordapi.model.ValidationErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<ValidationErrorResponse>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<ValidationErrorResponse> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> new ValidationErrorResponse(error.getField(), error.getDefaultMessage()))
            .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}