package com.sliit.smartcampus.booking.controller;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.booking.dto.BookingRequestDTO;
import com.sliit.smartcampus.booking.dto.BookingResponseDTO;
import com.sliit.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.sliit.smartcampus.booking.model.BookingStatus;
import com.sliit.smartcampus.booking.service.BookingService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ── POST /api/v1/bookings ─────────────────────────────────────────────────
    // Create a new booking request (any authenticated user)
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BookingResponseDTO created = bookingService.createBooking(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<BookingResponseDTO>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Booking request submitted successfully.")
                        .data(created)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    // ── GET /api/v1/bookings/my ───────────────────────────────────────────────
    // Get the current user's own bookings
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                "Your bookings fetched successfully.",
                bookingService.getMyBookings(currentUser)));
    }

    // ── GET /api/v1/bookings/{id} ─────────────────────────────────────────────
    // Get a single booking by ID (owner or admin)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getBookingById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                "Booking fetched successfully.",
                bookingService.getBookingById(id, currentUser)));
    }

    // ── GET /api/v1/bookings ──────────────────────────────────────────────────
    // Admin: list all bookings with optional filters
    // e.g. ?status=PENDING&resourceId=...&date=2026-04-20&userId=...
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID userId) {

        return ResponseEntity.ok(ApiResponse.success(
                "All bookings fetched successfully.",
                bookingService.getAllBookings(status, resourceId, date, userId)));
    }

    // ── PUT /api/v1/bookings/{id}/approve ────────────────────────────────────
    // Admin: approve a PENDING booking
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> approveBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                "Booking approved successfully.",
                bookingService.approveBooking(id, currentUser)));
    }

    // ── PUT /api/v1/bookings/{id}/reject ─────────────────────────────────────
    // Admin: reject a PENDING booking with an optional reason
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> rejectBooking(
            @PathVariable UUID id,
            @RequestBody BookingStatusUpdateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                "Booking rejected successfully.",
                bookingService.rejectBooking(id, dto.getReason(), currentUser)));
    }

    // ── PUT /api/v1/bookings/{id}/cancel ─────────────────────────────────────
    // User: cancel their own PENDING or APPROVED booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @PathVariable UUID id,
            @RequestBody(required = false) BookingStatusUpdateDTO dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String reason = (dto != null) ? dto.getReason() : null;
        return ResponseEntity.ok(ApiResponse.success(
                "Booking cancelled successfully.",
                bookingService.cancelBooking(id, reason, currentUser)));
    }

    // ── DELETE /api/v1/bookings/{id} ─────────────────────────────────────────
    // User/Admin: permanently delete a PENDING booking
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        bookingService.deleteBooking(id, currentUser);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.<Void>builder()
                        .status(HttpStatus.NO_CONTENT.value())
                        .message("Booking deleted successfully.")
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }
}
