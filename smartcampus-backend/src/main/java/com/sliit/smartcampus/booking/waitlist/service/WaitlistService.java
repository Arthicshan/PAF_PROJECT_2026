package com.sliit.smartcampus.booking.waitlist.service;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.booking.dto.BookingResponseDTO;
import com.sliit.smartcampus.booking.waitlist.dto.WaitlistRequestDTO;
import com.sliit.smartcampus.booking.waitlist.dto.WaitlistResponseDTO;
import com.sliit.smartcampus.booking.waitlist.model.WaitlistStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface WaitlistService {

    /** Join the waitlist for a specific resource/time slot. */
    WaitlistResponseDTO joinWaitlist(WaitlistRequestDTO dto, UserPrincipal currentUser);

    /** Get the current user's waitlist entries. */
    List<WaitlistResponseDTO> getMyWaitlist(UserPrincipal currentUser);

    /** Get a single waitlist entry by ID (owner or admin). */
    WaitlistResponseDTO getWaitlistById(UUID id, UserPrincipal currentUser);

    /** Admin: get all waitlist entries with optional filters. */
    List<WaitlistResponseDTO> getAllWaitlist(WaitlistStatus status, UUID resourceId, LocalDate date);

    /** User removes themselves from the waitlist; positions of later entries are shifted down. */
    void removeFromWaitlist(UUID id, UserPrincipal currentUser);

    /**
     * User confirms they want the booking after being notified.
     * Creates a real PENDING Booking and marks this entry CONFIRMED.
     */
    BookingResponseDTO confirmWaitlistSlot(UUID id, UserPrincipal currentUser);

    /**
     * Called by BookingServiceImpl after a booking is cancelled.
     * Finds the first WAITING entry for that slot and notifies them.
     */
    void notifyNextInWaitlist(UUID resourceId, LocalDate date, LocalTime startTime, LocalTime endTime);

    /** Get count of active (WAITING + NOTIFIED) entries for a user (for badge display). */
    long getActiveCountForUser(UUID userId);
}
