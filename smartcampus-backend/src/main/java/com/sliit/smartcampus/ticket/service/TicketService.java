package com.sliit.smartcampus.ticket.service;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.notification.NotificationService;
import com.sliit.smartcampus.notification.NotificationType;
import com.sliit.smartcampus.notification.ReferenceType;
import com.sliit.smartcampus.ticket.entity.Ticket;
import com.sliit.smartcampus.ticket.repository.TicketRepository;
import com.sliit.smartcampus.user.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private NotificationService notificationService;

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

    // ================= CREATE =================
    public Ticket createTicket(Ticket ticket) {

        ticket.setReportedBy(getCurrentUserId());
        ticket.setStatus("OPEN");

        Ticket saved = ticketRepository.save(ticket);

        UUID ticketId = UUID.fromString(saved.getId());
        UUID userId = UUID.fromString(saved.getReportedBy());

        // Notify ADMINS
        notificationService.notifyAllAdmins(
                NotificationType.TICKET_STATUS_CHANGED,
                "New Ticket Created",
                "A new ticket has been created.\n\n" +
                        "Title: " + saved.getTitle() +
                        "\nLocation: " + saved.getLocation() +
                        "\nPriority: " + saved.getPriority(),
                ticketId,
                ReferenceType.TICKET
        );

        // Notify USER
        notificationService.notify(
                userId,
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Created Successfully",
                "Your ticket has been successfully created.\n\n" +
                        "Title: " + saved.getTitle() +
                        "\nStatus: OPEN" +
                        "\nLocation: " + saved.getLocation(),
                ticketId,
                ReferenceType.TICKET
        );

        return saved;
    }

    // ================= GET =================
    public List<Ticket> getMyTickets() {
        return ticketRepository.findByReportedBy(
                getCurrentUserId(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    public List<Ticket> getAllTickets() {

        UserPrincipal user = getCurrentUser();

        // ADMIN → see ALL
        if (user.getRole().equals("ADMIN")) {
            return ticketRepository.findAll(
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        // TECHNICIAN → ONLY assigned tickets
        if (user.getRole().equals("TECHNICIAN")) {
            return ticketRepository.findByAssignedTo(
                    user.getId().toString(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        throw new RuntimeException("Access denied");
    }

    public Ticket getTicketById(String id) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        UserPrincipal user = getCurrentUser();

        String userId = user.getId().toString();
        String role = user.getRole();

        boolean isOwner = userId.equals(ticket.getReportedBy());

        boolean isAssigned = ticket.getAssignedTo() != null &&
                ticket.getAssignedTo().equals(userId);

        boolean isAdmin = "ADMIN".equals(role);


        System.out.println("===== ACCESS DEBUG =====");
        System.out.println("User ID: " + userId);
        System.out.println("Ticket Owner: " + ticket.getReportedBy());
        System.out.println("Assigned To: " + ticket.getAssignedTo());
        System.out.println("Role: " + role);
        System.out.println("isOwner: " + isOwner);
        System.out.println("isAssigned: " + isAssigned);
        System.out.println("isAdmin: " + isAdmin);

        if (!isOwner && !isAssigned && !isAdmin) {
            throw new RuntimeException("Access denied");
        }

        return ticket;
    }

    // ================= DELETE =================
    public void deleteTicket(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getReportedBy().equals(getCurrentUserId())) {
            throw new RuntimeException("You can only delete your own tickets");
        }

        ticketRepository.deleteById(id);
    }

    // ================= STATUS UPDATE =================
    public Ticket updateStatus(String ticketId, String newStatus, String resolutionNote) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        UserPrincipal user = getCurrentUser();

        boolean isOwner = ticket.getReportedBy().equals(user.getId().toString());
        boolean isAssigned = user.getId().toString().equals(ticket.getAssignedTo());
        boolean isAdmin = user.getRole().equals("ADMIN");

        if (!isOwner && !isAssigned && !isAdmin) {
            throw new RuntimeException("Access denied");
        }

        ticket.setStatus(newStatus);

        if (resolutionNote != null) {
            ticket.setResolutionNote(resolutionNote);
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.notify(
                UUID.fromString(saved.getReportedBy()),
                NotificationType.TICKET_STATUS_CHANGED,
                "Ticket Status Updated",
                "Your ticket has been updated.\n\n" +
                        "Title: " + saved.getTitle() +
                        "\nNew Status: " + newStatus +
                        "\nUpdated by: " + user.getRole(),
                UUID.fromString(saved.getId()),
                ReferenceType.TICKET
        );

        return saved;
    }

    // ================= ASSIGN =================
    public Ticket assignTechnician(String ticketId, String technicianId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        UserPrincipal user = getCurrentUser();

        boolean isOwner = ticket.getReportedBy().equals(user.getId().toString());
        boolean isAdmin = user.getRole().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Only owner/admin can assign technician");
        }

        ticket.setAssignedTo(technicianId);

        Ticket saved = ticketRepository.save(ticket);

        notificationService.notify(
                UUID.fromString(technicianId),
                NotificationType.TICKET_ASSIGNED,
                "New Ticket Assigned",
                "You have been assigned a ticket.\n\n" +
                        "Title: " + saved.getTitle() +
                        "\nLocation: " + saved.getLocation() +
                        "\nPriority: " + saved.getPriority(),
                UUID.fromString(saved.getId()),
                ReferenceType.TICKET
        );

        return saved;
    }
}