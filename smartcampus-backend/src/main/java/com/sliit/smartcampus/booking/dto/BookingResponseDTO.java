package com.sliit.smartcampus.booking.dto;

import com.sliit.smartcampus.booking.model.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponseDTO {

    private UUID id;
    private UUID resourceId;
    private String resourceName;
    private String resourceLocation;
    private UUID userId;
    private String userEmail;
    private String userName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String rejectionReason;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
