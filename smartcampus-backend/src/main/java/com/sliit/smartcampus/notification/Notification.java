package com.sliit.smartcampus.notification;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    private String id;

    @Indexed
    private UUID recipientId;

    private NotificationType type;
    private String title;
    private String message;
    private UUID referenceId;
    private ReferenceType referenceType;

    @Builder.Default
    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
