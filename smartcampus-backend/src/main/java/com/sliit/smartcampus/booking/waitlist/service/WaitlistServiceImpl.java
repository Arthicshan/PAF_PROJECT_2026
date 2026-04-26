package com.sliit.smartcampus.booking.waitlist.service;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.booking.dto.BookingResponseDTO;
import com.sliit.smartcampus.booking.mapper.BookingMapper;
import com.sliit.smartcampus.booking.model.Booking;
import com.sliit.smartcampus.booking.model.BookingStatus;
import com.sliit.smartcampus.booking.repository.BookingRepository;
import com.sliit.smartcampus.booking.waitlist.dto.WaitlistRequestDTO;
import com.sliit.smartcampus.booking.waitlist.dto.WaitlistResponseDTO;
import com.sliit.smartcampus.booking.waitlist.exception.WaitlistDuplicateException;
import com.sliit.smartcampus.booking.waitlist.exception.WaitlistEntryNotFoundException;
import com.sliit.smartcampus.booking.waitlist.exception.WaitlistExpiredException;
import com.sliit.smartcampus.booking.waitlist.mapper.WaitlistMapper;
import com.sliit.smartcampus.booking.waitlist.model.WaitlistEntry;
import com.sliit.smartcampus.booking.waitlist.model.WaitlistStatus;
import com.sliit.smartcampus.booking.waitlist.repository.WaitlistRepository;
import com.sliit.smartcampus.notification.NotificationService;
import com.sliit.smartcampus.notification.NotificationType;
import com.sliit.smartcampus.notification.ReferenceType;
import com.sliit.smartcampus.resource.entity.Resource;
import com.sliit.smartcampus.resource.entity.ResourceStatus;
import com.sliit.smartcampus.resource.exception.ResourceNotFoundException;
import com.sliit.smartcampus.resource.repository.ResourceRepository;
import com.sliit.smartcampus.user.User;
import com.sliit.smartcampus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WaitlistServiceImpl implements WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final WaitlistMapper waitlistMapper;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    @Override
    public WaitlistResponseDTO joinWaitlist(WaitlistRequestDTO dto, UserPrincipal currentUser) {
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time.");
        }

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + dto.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Cannot join waitlist for an inactive resource. Status: " + resource.getStatus());
        }

        List<Booking> existingBookings =
                bookingRepository.findConflictingBookings(
                        dto.getResourceId(), dto.getDate(), dto.getStartTime(), dto.getEndTime());
        boolean userAlreadyBooked = existingBookings.stream()
                .anyMatch(b -> b.getUserId().equals(currentUser.getId()));
        if (userAlreadyBooked) {
            throw new WaitlistDuplicateException(
                    "You already have a PENDING or APPROVED booking for this time slot.");
        }

        boolean alreadyWaiting = waitlistRepository.existsByUserIdAndResourceIdAndDateAndStartTimeAndEndTimeAndStatusIn(
                currentUser.getId(), dto.getResourceId(),
                dto.getDate(), dto.getStartTime(), dto.getEndTime(),
                List.of(WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED));
        if (alreadyWaiting) {
            throw new WaitlistDuplicateException(
                    "You are already on the waitlist for this resource and time slot.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database."));

        WaitlistEntry maxEntry = waitlistRepository
                .findFirstByResourceIdAndDateAndStartTimeAndEndTimeAndStatusInOrderByPositionDesc(
                        dto.getResourceId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(),
                        List.of(WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED))
                .orElse(null);
        int nextPosition = (maxEntry == null ? 0 : maxEntry.getPosition()) + 1;

        WaitlistEntry entry = WaitlistEntry.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .resourceLocation(resource.getLocation())
                .userId(user.getId())
                .userEmail(currentUser.getEmail())
                .userName(user.getName())
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(WaitlistStatus.WAITING)
                .position(nextPosition)
                .build();

        entry = waitlistRepository.save(entry);

        notificationService.notify(
                user.getId(),
                NotificationType.BOOKING_REQUEST,
                "Joined Waitlist",
                "You have joined the waitlist for \"" + resource.getName() + "\" on " +
                        dto.getDate() + " (" + dto.getStartTime() + " – " + dto.getEndTime() +
                        "). Your position: #" + nextPosition + ".",
                entry.getId(),
                ReferenceType.BOOKING
        );

        log.info("User {} joined waitlist for resource {} on {} at position {}",
                user.getEmail(), resource.getName(), dto.getDate(), nextPosition);

        return waitlistMapper.toDTO(entry);
    }

    @Override
    public List<WaitlistResponseDTO> getMyWaitlist(UserPrincipal currentUser) {
        return waitlistRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(waitlistMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WaitlistResponseDTO getWaitlistById(UUID id, UserPrincipal currentUser) {
        WaitlistEntry entry = findEntryOrThrow(id);

        if (!isAdmin(currentUser) && !entry.getUserId().equals(currentUser.getId())) {
            throw new com.sliit.smartcampus.booking.exception.UnauthorizedBookingActionException(
                    "You are not authorized to view this waitlist entry.");
        }

        return waitlistMapper.toDTO(entry);
    }

    @Override
    public List<WaitlistResponseDTO> getAllWaitlist(WaitlistStatus status, UUID resourceId, LocalDate date) {
        List<Criteria> conditions = new ArrayList<>();
        if (status != null)     conditions.add(Criteria.where("status").is(status));
        if (resourceId != null) conditions.add(Criteria.where("resourceId").is(resourceId));
        if (date != null)       conditions.add(Criteria.where("date").is(date));

        Query query = new Query();
        if (!conditions.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(conditions.toArray(new Criteria[0])));
        }
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        return mongoTemplate.find(query, WaitlistEntry.class)
                .stream()
                .map(waitlistMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void removeFromWaitlist(UUID id, UserPrincipal currentUser) {
        WaitlistEntry entry = findEntryOrThrow(id);

        if (!entry.getUserId().equals(currentUser.getId())) {
            throw new com.sliit.smartcampus.booking.exception.UnauthorizedBookingActionException(
                    "You can only remove yourself from the waitlist.");
        }

        if (entry.getStatus() != WaitlistStatus.WAITING && entry.getStatus() != WaitlistStatus.NOTIFIED) {
            throw new IllegalArgumentException(
                    "Cannot remove a waitlist entry with status: " + entry.getStatus());
        }

        int removedPosition = entry.getPosition();
        UUID resourceId = entry.getResourceId();
        LocalDate date = entry.getDate();
        LocalTime startTime = entry.getStartTime();
        LocalTime endTime = entry.getEndTime();

        entry.setStatus(WaitlistStatus.REMOVED);
        waitlistRepository.save(entry);

        List<WaitlistEntry> toShift = waitlistRepository.findWaitingEntriesAfterPosition(
                resourceId, date, startTime, endTime, removedPosition);
        toShift.forEach(e -> e.setPosition(e.getPosition() - 1));
        waitlistRepository.saveAll(toShift);

        log.info("User {} removed from waitlist entry {}", currentUser.getEmail(), id);
    }

    @Override
    public BookingResponseDTO confirmWaitlistSlot(UUID id, UserPrincipal currentUser) {
        WaitlistEntry entry = findEntryOrThrow(id);

        if (!entry.getUserId().equals(currentUser.getId())) {
            throw new com.sliit.smartcampus.booking.exception.UnauthorizedBookingActionException(
                    "You can only confirm your own waitlist entry.");
        }

        if (entry.getStatus() == WaitlistStatus.EXPIRED) {
            throw new WaitlistExpiredException(
                    "This waitlist slot has expired. You did not confirm within 24 hours.");
        }

        if (entry.getStatus() == WaitlistStatus.CONFIRMED) {
            throw new WaitlistExpiredException(
                    "This waitlist slot has already been confirmed.");
        }

        if (entry.getStatus() != WaitlistStatus.NOTIFIED) {
            throw new IllegalArgumentException(
                    "Only NOTIFIED waitlist entries can be confirmed. Current status: " + entry.getStatus());
        }

        if (entry.getExpiresAt() != null && LocalDateTime.now().isAfter(entry.getExpiresAt())) {
            entry.setStatus(WaitlistStatus.EXPIRED);
            waitlistRepository.save(entry);
            notifyNextInWaitlist(entry.getResourceId(), entry.getDate(),
                    entry.getStartTime(), entry.getEndTime());
            throw new WaitlistExpiredException(
                    "Your waitlist slot has expired. The next person in queue has been notified.");
        }

        Booking booking = Booking.builder()
                .resourceId(entry.getResourceId())
                .resourceName(entry.getResourceName())
                .resourceLocation(entry.getResourceLocation())
                .userId(entry.getUserId())
                .userEmail(entry.getUserEmail())
                .userName(entry.getUserName())
                .date(entry.getDate())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .purpose(entry.getPurpose())
                .expectedAttendees(entry.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        entry.setStatus(WaitlistStatus.CONFIRMED);
        waitlistRepository.save(entry);

        notificationService.notify(
                entry.getUserId(),
                NotificationType.BOOKING_REQUEST,
                "Booking Created from Waitlist",
                "Your waitlist confirmation for \"" + entry.getResourceName() + "\" on " +
                        entry.getDate() + " has created a booking request. It is now PENDING admin approval.",
                booking.getId(),
                ReferenceType.BOOKING
        );

        notificationService.notifyAllAdmins(
                NotificationType.BOOKING_REQUEST,
                "New Booking Request (from Waitlist)",
                entry.getUserName() + " confirmed their waitlist slot and created a booking for \"" +
                        entry.getResourceName() + "\" on " + entry.getDate() + " (" +
                        entry.getStartTime() + " – " + entry.getEndTime() + ").",
                booking.getId(),
                ReferenceType.BOOKING
        );

        log.info("User {} confirmed waitlist slot {}; booking {} created",
                entry.getUserEmail(), id, booking.getId());

        return bookingMapper.toDTO(booking);
    }

    @Override
    public void notifyNextInWaitlist(UUID resourceId, LocalDate date,
                                     LocalTime startTime, LocalTime endTime) {
        waitlistRepository.findFirstWaiting(resourceId, date, startTime, endTime)
                .ifPresent(entry -> {
                    entry.setStatus(WaitlistStatus.NOTIFIED);
                    entry.setNotifiedAt(LocalDateTime.now());
                    entry.setExpiresAt(LocalDateTime.now().plusHours(24));
                    waitlistRepository.save(entry);

                    notificationService.notify(
                            entry.getUserId(),
                            NotificationType.BOOKING_APPROVED,
                            "Waitlist Slot Available!",
                            "A slot opened up for \"" + entry.getResourceName() + "\" on " + date +
                                    " at " + startTime + " – " + endTime +
                                    "! You have 24 hours to confirm your booking.",
                            entry.getId(),
                            ReferenceType.BOOKING
                    );

                    log.info("Notified waitlist user {} for resource {} on {}",
                            entry.getUserEmail(), entry.getResourceName(), date);
                });
    }

    @Override
    public void autoCreateBookingForNextWaitlist(UUID resourceId, LocalDate date,
                                                 LocalTime startTime, LocalTime endTime) {
        waitlistRepository.findFirstWaiting(resourceId, date, startTime, endTime)
                .ifPresent(entry -> {
                    List<Booking> conflicts = bookingRepository.findConflictingBookings(
                            resourceId, date, startTime, endTime);

                    if (!conflicts.isEmpty()) {
                        log.warn("Skipped waitlist auto-promotion for entry {} due to {} conflict(s)",
                                entry.getId(), conflicts.size());
                        return;
                    }

                    Booking booking = Booking.builder()
                            .resourceId(entry.getResourceId())
                            .resourceName(entry.getResourceName())
                            .resourceLocation(entry.getResourceLocation())
                            .userId(entry.getUserId())
                            .userEmail(entry.getUserEmail())
                            .userName(entry.getUserName())
                            .date(entry.getDate())
                            .startTime(entry.getStartTime())
                            .endTime(entry.getEndTime())
                            .purpose(entry.getPurpose())
                            .expectedAttendees(entry.getExpectedAttendees())
                            .status(BookingStatus.PENDING)
                            .build();

                    booking = bookingRepository.save(booking);

                    entry.setStatus(WaitlistStatus.CONFIRMED);
                    entry.setNotifiedAt(LocalDateTime.now());
                    entry.setExpiresAt(null);
                    waitlistRepository.save(entry);

                    notificationService.notify(
                            entry.getUserId(),
                            NotificationType.BOOKING_REQUEST,
                            "Waitlist Moved to Booking Queue",
                            "A slot became available for \"" + entry.getResourceName() +
                                    "\" on " + entry.getDate() + " (" +
                                    entry.getStartTime() + " - " + entry.getEndTime() +
                                    "). Your request has been moved automatically and is now PENDING admin approval.",
                            booking.getId(),
                            ReferenceType.BOOKING
                    );

                    notificationService.notifyAllAdmins(
                            NotificationType.BOOKING_REQUEST,
                            "New Booking Request (Auto from Waitlist)",
                            entry.getUserName() + " was auto-promoted from waitlist for \"" +
                                    entry.getResourceName() + "\" on " + entry.getDate() +
                                    " (" + entry.getStartTime() + " - " + entry.getEndTime() + ").",
                            booking.getId(),
                            ReferenceType.BOOKING
                    );

                    log.info("Auto-promoted waitlist entry {} to booking {} for user {}",
                            entry.getId(), booking.getId(), entry.getUserEmail());
                });
    }

    @Override
    public long getActiveCountForUser(UUID userId) {
        return waitlistRepository.countActiveForUser(userId);
    }

    private WaitlistEntry findEntryOrThrow(UUID id) {
        return waitlistRepository.findById(id)
                .orElseThrow(() -> new WaitlistEntryNotFoundException(
                        "Waitlist entry not found with id: " + id));
    }

    private boolean isAdmin(UserPrincipal user) {
        return "ADMIN".equals(user.getRole());
    }
}
