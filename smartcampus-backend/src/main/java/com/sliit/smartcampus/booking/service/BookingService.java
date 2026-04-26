package com.sliit.smartcampus.booking.service;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.booking.dto.BookingRequestDTO;
import com.sliit.smartcampus.booking.dto.BookingResponseDTO;
import com.sliit.smartcampus.booking.model.BookingStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingService {

    /** Create a new PENDING booking request for the logged-in user. */
    BookingResponseDTO createBooking(BookingRequestDTO dto, UserPrincipal currentUser);

    /** Retrieve a single booking – user can only see their own; admin sees all. */
    BookingResponseDTO getBookingById(UUID id, UserPrincipal currentUser);

    /** Get all bookings belonging to the current user. */
    List<BookingResponseDTO> getMyBookings(UserPrincipal currentUser);

    /** Admin: get all bookings with optional filters (null = no filter). */
    List<BookingResponseDTO> getAllBookings(BookingStatus status, UUID resourceId, LocalDate date, UUID userId);

    /** Admin: approve a PENDING booking. */
    BookingResponseDTO approveBooking(UUID id, UserPrincipal currentUser);

    /** Admin: reject a PENDING booking with an optional reason. */
    BookingResponseDTO rejectBooking(UUID id, String reason, UserPrincipal currentUser);

    /** User: cancel their own PENDING or APPROVED booking with an optional reason. */
    BookingResponseDTO cancelBooking(UUID id, String reason, UserPrincipal currentUser);

    /** User/Admin: permanently delete a PENDING booking. */
    void deleteBooking(UUID id, UserPrincipal currentUser);
}
