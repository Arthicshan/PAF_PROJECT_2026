package com.sliit.smartcampus.ticket.service;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.notification.NotificationService;
import com.sliit.smartcampus.notification.NotificationType;
import com.sliit.smartcampus.notification.ReferenceType;
import com.sliit.smartcampus.ticket.entity.Ticket;
import com.sliit.smartcampus.ticket.entity.TicketAttachment;
import com.sliit.smartcampus.ticket.repository.TicketAttachmentRepository;
import com.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class TicketAttachmentService {

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private NotificationService notificationService;

    private final String uploadDir =
            System.getProperty("user.dir") + File.separator + "uploads" + File.separator;

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            throw new RuntimeException("Unauthorized user");
        }
        return user;
    }

    private String getCurrentUserId() {
        return getCurrentUser().getId().toString();
    }

    public TicketAttachment uploadFile(String ticketId, MultipartFile file) throws IOException {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if ("CLOSED".equals(ticket.getStatus()) || "REJECTED".equals(ticket.getStatus())) {
            throw new RuntimeException("Cannot upload files to closed/rejected ticket");
        }

        UserPrincipal user = getCurrentUser();

        boolean isOwner   = ticket.getReportedBy().equals(getCurrentUserId());
        boolean isAssigned = ticket.getAssignedTo() != null &&
                ticket.getAssignedTo().equals(getCurrentUserId());
        boolean isAdmin   = "ADMIN".equals(user.getRole());

        if (!isOwner && !isAssigned && !isAdmin) {
            throw new RuntimeException("Access denied");
        }

        if (attachmentRepository.countByTicketId(ticketId) >= 3) {
            throw new RuntimeException("Max 3 files allowed");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.equals("image/jpeg") || contentType.equals("image/png"))) {
            throw new RuntimeException("Only JPG/PNG allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Max 5MB allowed");
        }

        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        File savedFile = new File(uploadDir + storedName);
        file.transferTo(savedFile);

        TicketAttachment attachment = new TicketAttachment();
        attachment.setFileName(file.getOriginalFilename());
        attachment.setStoredName(storedName);
        attachment.setMimeType(contentType);
        attachment.setFileSize(file.getSize());
        attachment.setTicketId(ticketId);

        TicketAttachment saved = attachmentRepository.save(attachment);

        try {
            notificationService.notify(
                    UUID.fromString(ticket.getReportedBy()),
                    NotificationType.TICKET_COMMENT_ADDED,
                    "New Attachment Added",
                    "A new attachment has been uploaded.\n\n" +
                            "Ticket: " + ticket.getTitle() +
                            "\nUploaded by: " + user.getRole() +
                            "\nFile: " + file.getOriginalFilename(),
                    UUID.fromString(ticket.getId()),
                    ReferenceType.TICKET
            );
        } catch (Exception ignored) {}

        if (ticket.getAssignedTo() != null) {
            try {
                notificationService.notify(
                        UUID.fromString(ticket.getAssignedTo()),
                        NotificationType.TICKET_COMMENT_ADDED,
                        "Attachment Added to Assigned Ticket",
                        "A new attachment has been added.\n\n" +
                                "Ticket: " + ticket.getTitle(),
                        UUID.fromString(ticket.getId()),
                        ReferenceType.TICKET
                );
            } catch (Exception ignored) {}
        }

        return saved;
    }

    public void deleteAttachment(String attachmentId) {

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Ticket ticket = ticketRepository.findById(attachment.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        UserPrincipal user = getCurrentUser();

        boolean isOwner = ticket.getReportedBy().equals(getCurrentUserId());
        boolean isAdmin  = "ADMIN".equals(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Access denied");
        }

        File file = new File(uploadDir + attachment.getStoredName());
        if (file.exists()) file.delete();

        attachmentRepository.deleteById(attachmentId);
    }

    public List<TicketAttachment> getAttachmentsByTicket(String ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        UserPrincipal user = getCurrentUser();

        boolean isOwner    = ticket.getReportedBy().equals(getCurrentUserId());
        boolean isAssigned = ticket.getAssignedTo() != null &&
                ticket.getAssignedTo().equals(getCurrentUserId());
        boolean isAdmin    = "ADMIN".equals(user.getRole());

        if (!isOwner && !isAssigned && !isAdmin) {
            throw new RuntimeException("Access denied");
        }

        return attachmentRepository.findByTicketId(ticketId);
    }

    public File getFileById(String attachmentId) {

        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Ticket ticket = ticketRepository.findById(attachment.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        UserPrincipal user = getCurrentUser();

        boolean isOwner    = ticket.getReportedBy().equals(getCurrentUserId());
        boolean isAssigned = ticket.getAssignedTo() != null &&
                ticket.getAssignedTo().equals(getCurrentUserId());
        boolean isAdmin    = "ADMIN".equals(user.getRole());

        if (!isOwner && !isAssigned && !isAdmin) {
            throw new RuntimeException("Access denied");
        }

        return new File(uploadDir + attachment.getStoredName());
    }
}
