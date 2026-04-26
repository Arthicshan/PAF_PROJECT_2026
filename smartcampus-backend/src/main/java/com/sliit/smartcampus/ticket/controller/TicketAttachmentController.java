package com.sliit.smartcampus.ticket.controller;

import com.sliit.smartcampus.ticket.entity.TicketAttachment;
import com.sliit.smartcampus.ticket.service.TicketAttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketAttachmentController {

    @Autowired
    private TicketAttachmentService attachmentService;

    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<TicketAttachment> uploadAttachment(
            @PathVariable String ticketId,
            @RequestParam("file") MultipartFile file) throws Exception {

        return ResponseEntity.status(201)
                .body(attachmentService.uploadFile(ticketId, file));
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable String attachmentId) throws Exception {

        File file = attachmentService.getFileById(attachmentId);

        Resource resource = new UrlResource(file.toURI());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName().split("_", 2)[1] + "\"")
                .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable String attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ticketId}/attachments")
    public ResponseEntity<List<TicketAttachment>> getAttachments(@PathVariable String ticketId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByTicket(ticketId));
    }
}