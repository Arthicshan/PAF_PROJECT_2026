package com.sliit.smartcampus.notification.dto;

import com.sliit.smartcampus.notification.NotificationType;
import com.sliit.smartcampus.notification.ReferenceType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDTO {
    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private UUID referenceId;
    private ReferenceType referenceType;
    private boolean read;
    private LocalDateTime createdAt;
}
