package com.sliit.smartcampus.booking.waitlist.scheduler;

import com.sliit.smartcampus.booking.waitlist.model.WaitlistEntry;
import com.sliit.smartcampus.booking.waitlist.model.WaitlistStatus;
import com.sliit.smartcampus.booking.waitlist.repository.WaitlistRepository;
import com.sliit.smartcampus.booking.waitlist.service.WaitlistService;
import com.sliit.smartcampus.notification.NotificationService;
import com.sliit.smartcampus.notification.NotificationType;
import com.sliit.smartcampus.notification.ReferenceType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WaitlistExpiryScheduler {

    private final WaitlistRepository waitlistRepository;
    private final WaitlistService waitlistService;
    private final NotificationService notificationService;

    // Runs every hour — checks for NOTIFIED entries whose 24-hour window has passed
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void expireOverdueNotifications() {
        List<WaitlistEntry> expired = waitlistRepository.findExpiredNotifications(LocalDateTime.now());

        if (expired.isEmpty()) {
            log.debug("Waitlist expiry check: no expired entries found.");
            return;
        }

        log.info("Waitlist expiry check: found {} expired notification(s).", expired.size());

        for (WaitlistEntry entry : expired) {
            entry.setStatus(WaitlistStatus.EXPIRED);
            waitlistRepository.save(entry);

            log.info("Expired waitlist entry {} for user {} — resource '{}' on {}",
                    entry.getId(), entry.getUserEmail(),
                    entry.getResourceName(), entry.getDate());

            // Notify user that their window expired
            notificationService.notify(
                    entry.getUserId(),
                    NotificationType.BOOKING_CANCELLED,
                    "Waitlist Slot Expired",
                    "Your waitlist slot for \"" + entry.getResourceName() + "\" on " +
                            entry.getDate() + " (" + entry.getStartTime() + " – " +
                            entry.getEndTime() + ") has expired because you did not confirm within 24 hours.",
                    entry.getId(),
                    ReferenceType.BOOKING
            );

            // Notify the next person in queue for the same slot
            waitlistService.notifyNextInWaitlist(
                    entry.getResourceId(),
                    entry.getDate(),
                    entry.getStartTime(),
                    entry.getEndTime()
            );
        }
    }
}
