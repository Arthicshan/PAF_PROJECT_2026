package com.sliit.smartcampus.ticket.entity;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "ticket_comments")
@Data
public class TicketComment {

    @Id
    private String id = UUID.randomUUID().toString();

    private String content;
    private String authorId;
    private String authorName;
    private String authorRole;
    private boolean isInternal = false;

    @Indexed
    private String ticketId;

    @CreatedDate
    private LocalDateTime createdAt;
}
