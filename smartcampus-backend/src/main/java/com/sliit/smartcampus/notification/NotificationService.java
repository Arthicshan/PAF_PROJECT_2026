package com.sliit.smartcampus.notification;

import com.sliit.smartcampus.notification.dto.NotificationDTO;
import com.sliit.smartcampus.user.User;
import com.sliit.smartcampus.user.UserRepository;
import com.sliit.smartcampus.user.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public void notify(UUID userId, NotificationType type,
                       String title, String message,
                       UUID referenceId, ReferenceType referenceType) {

        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Notification notification = Notification.builder()
                .recipientId(userId)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    toDTO(saved)
            );
        } catch (Exception e) {
            log.warn("WebSocket push failed for user {}: {}", userId, e.getMessage());
        }

        emailService.sendEmail(recipient.getEmail(), title, message);
    }

    public void notifyAllAdmins(NotificationType type, String title,
                                String message, UUID referenceId,
                                ReferenceType referenceType) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notify(admin.getId(), type, title, message, referenceId, referenceType);
        }
    }

    public Page<NotificationDTO> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDTO);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    public NotificationDTO markAsRead(String notificationId, UUID userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!n.getRecipientId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }

        n.setRead(true);
        return toDTO(notificationRepository.save(n));
    }

    public void markAllRead(UUID userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(String notificationId, UUID userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!n.getRecipientId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }

        notificationRepository.delete(n);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
