package com.sliit.smartcampus.ticket.repository;

import com.sliit.smartcampus.ticket.entity.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    List<TicketComment> findByTicketIdAndIsInternalFalseOrderByCreatedAtAsc(String ticketId);
}
