package com.sliit.smartcampus.booking.waitlist.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Document(collection = "waitlist_entries")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WaitlistEntry {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Indexed
    private UUID resourceId;

    private String resourceName;
    private String resourceLocation;

    @Indexed
    private UUID userId;

    private String userEmail;
    private String userName;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;
    private Integer expectedAttendees;

    @Builder.Default
    private WaitlistStatus status = WaitlistStatus.WAITING;

    private Integer position;

    private LocalDateTime notifiedAt;
    private LocalDateTime expiresAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
