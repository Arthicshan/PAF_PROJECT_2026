package com.sliit.smartcampus.ticket.controller;

import com.sliit.smartcampus.ticket.entity.TicketComment;
import com.sliit.smartcampus.ticket.service.TicketCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketCommentController {

    @Autowired
    private TicketCommentService commentService;

    // ADD COMMENT
    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable String ticketId,
            @RequestBody TicketComment comment) {

        return ResponseEntity.status(201)
                .body(commentService.addComment(ticketId, comment));
    }

    // GET COMMENTS
    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    // UPDATE COMMENT
    @PutMapping("/comments/{id}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable String id,
            @RequestBody TicketComment request) {

        return ResponseEntity.ok(
                commentService.updateComment(id, request.getContent())
        );
    }

    // DELETE COMMENT
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {

        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}