package com.sliit.smartcampus.booking.waitlist.controller;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.booking.dto.BookingResponseDTO;
import com.sliit.smartcampus.booking.waitlist.dto.WaitlistConfirmDTO;
import com.sliit.smartcampus.booking.waitlist.dto.WaitlistRequestDTO;
import com.sliit.smartcampus.booking.waitlist.dto.WaitlistResponseDTO;
import com.sliit.smartcampus.booking.waitlist.model.WaitlistStatus;
import com.sliit.smartcampus.booking.waitlist.service.WaitlistService;
import com.sliit.smartcampus.resource.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    // ── POST /api/v1/waitlist ─────────────────────────────────────────────────
    // Join the waitlist for a specific resource/time slot
    @PostMapping
    public ResponseEntity<ApiResponse<WaitlistResponseDTO>> joinWaitlist(
            @Valid @RequestBody WaitlistRequestDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        WaitlistResponseDTO created = waitlistService.joinWaitlist(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<WaitlistResponseDTO>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Successfully joined the waitlist. Your position: #" + created.getPosition())
                        .data(created)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    // ── GET /api/v1/waitlist/my ───────────────────────────────────────────────
    // Get current user's waitlist entries
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<WaitlistResponseDTO>>> getMyWaitlist(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                "Your waitlist entries fetched successfully.",
                waitlistService.getMyWaitlist(currentUser)));
    }

    // ── GET /api/v1/waitlist/my/count ─────────────────────────────────────────
    // Get count of active waitlist entries for badge display
    @GetMapping("/my/count")
    public ResponseEntity<Map<String, Long>> getActiveCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        long count = waitlistService.getActiveCountForUser(currentUser.getId());
        return ResponseEntity.ok(Map.of("activeCount", count));
    }

    // ── GET /api/v1/waitlist/{id} ─────────────────────────────────────────────
    // Get single waitlist entry (owner or admin)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WaitlistResponseDTO>> getWaitlistById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                "Waitlist entry fetched successfully.",
                waitlistService.getWaitlistById(id, currentUser)));
    }

    // ── GET /api/v1/waitlist ──────────────────────────────────────────────────
    // Admin: list all waitlist entries with optional filters
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WaitlistResponseDTO>>> getAllWaitlist(
            @RequestParam(required = false) WaitlistStatus status,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(ApiResponse.success(
                "All waitlist entries fetched successfully.",
                waitlistService.getAllWaitlist(status, resourceId, date)));
    }

    // ── DELETE /api/v1/waitlist/{id} ─────────────────────────────────────────
    // User removes themselves from the waitlist
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeFromWaitlist(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        waitlistService.removeFromWaitlist(id, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.NO_CONTENT.value())
                        .message("Removed from waitlist successfully.")
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    // ── PUT /api/v1/waitlist/{id}/confirm ────────────────────────────────────
    // User confirms they want the slot (only when status = NOTIFIED)
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> confirmWaitlistSlot(
            @PathVariable UUID id,
            @RequestBody(required = false) WaitlistConfirmDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BookingResponseDTO booking = waitlistService.confirmWaitlistSlot(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(
                "Waitlist slot confirmed! Your booking is now PENDING admin approval.",
                booking));
    }
}
