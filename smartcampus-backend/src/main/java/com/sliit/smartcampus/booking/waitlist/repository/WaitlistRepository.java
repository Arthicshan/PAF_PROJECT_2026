package com.sliit.smartcampus.booking.waitlist.repository;

import com.sliit.smartcampus.booking.waitlist.model.WaitlistEntry;
import com.sliit.smartcampus.booking.waitlist.model.WaitlistStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WaitlistRepository extends MongoRepository<WaitlistEntry, UUID> {

    @Query(value = "{ 'resourceId': ?0, 'date': ?1, 'startTime': ?2, 'endTime': ?3, 'status': 'WAITING' }", sort = "{ 'position': 1 }")
    Optional<WaitlistEntry> findFirstWaiting(UUID resourceId, LocalDate date, LocalTime startTime, LocalTime endTime);

    boolean existsByUserIdAndResourceIdAndDateAndStartTimeAndEndTimeAndStatusIn(
            UUID userId, UUID resourceId, LocalDate date, LocalTime startTime, LocalTime endTime,
            Collection<WaitlistStatus> statuses);

    Optional<WaitlistEntry> findFirstByResourceIdAndDateAndStartTimeAndEndTimeAndStatusInOrderByPositionDesc(
            UUID resourceId, LocalDate date, LocalTime startTime, LocalTime endTime,
            Collection<WaitlistStatus> statuses);

    @Query("{ 'resourceId': ?0, 'date': ?1, 'startTime': ?2, 'endTime': ?3, 'status': 'WAITING', 'position': { $gt: ?4 } }")
    List<WaitlistEntry> findWaitingEntriesAfterPosition(UUID resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, Integer position);

    @Query("{ 'status': 'NOTIFIED', 'expiresAt': { $lt: ?0 } }")
    List<WaitlistEntry> findExpiredNotifications(LocalDateTime now);

    List<WaitlistEntry> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query(value = "{ 'userId': ?0, 'status': { $in: ['WAITING', 'NOTIFIED'] } }", count = true)
    long countActiveForUser(UUID userId);
}
