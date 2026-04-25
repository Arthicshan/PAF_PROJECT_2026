package com.sliit.smartcampus.ticket.repository;

import com.sliit.smartcampus.ticket.entity.TicketAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {

    long countByTicketId(String ticketId);

    List<TicketAttachment> findByTicketId(String ticketId);
}
