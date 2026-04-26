package com.sliit.smartcampus.ticket.entity;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "ticket_attachments")
@Data
public class TicketAttachment {

    @Id
    private String id = UUID.randomUUID().toString();

    private String fileName;
    private String storedName;
    private String mimeType;
    private long fileSize;

    @Indexed
    private String ticketId;

    @CreatedDate
    private LocalDateTime createdAt;
}
