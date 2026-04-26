package com.sliit.smartcampus.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByRecipientIdAndReadFalse(UUID userId);

    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(UUID userId);
}
