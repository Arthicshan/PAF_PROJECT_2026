package com.sliit.smartcampus.booking.waitlist.exception;

import com.sliit.smartcampus.resource.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class WaitlistExceptionHandler {

    @ExceptionHandler(WaitlistEntryNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(WaitlistEntryNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message(ex.getMessage())
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @ExceptionHandler(WaitlistDuplicateException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicate(WaitlistDuplicateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.CONFLICT.value())
                        .message(ex.getMessage())
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @ExceptionHandler(WaitlistExpiredException.class)
    public ResponseEntity<ApiResponse<Void>> handleExpired(WaitlistExpiredException ex) {
        return ResponseEntity.status(HttpStatus.GONE)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.GONE.value())
                        .message(ex.getMessage())
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }
}
