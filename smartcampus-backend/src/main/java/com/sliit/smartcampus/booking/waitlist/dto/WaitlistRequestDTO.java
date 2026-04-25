package com.sliit.smartcampus.booking.waitlist.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class WaitlistRequestDTO {

    @NotNull(message = "Resource ID is required")
    private UUID resourceId;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Booking date must not be in the past")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(min = 5, max = 255, message = "Purpose must be between 5 and 255 characters")
    private String purpose;

    @Positive(message = "Expected attendees must be a positive number")
    private Integer expectedAttendees;
}
