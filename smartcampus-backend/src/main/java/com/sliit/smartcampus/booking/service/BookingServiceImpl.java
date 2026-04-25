package com.sliit.smartcampus.booking.service;

import com.sliit.smartcampus.auth.UserPrincipal;
import com.sliit.smartcampus.booking.dto.BookingRequestDTO;
import com.sliit.smartcampus.booking.dto.BookingResponseDTO;
import com.sliit.smartcampus.booking.exception.BookingConflictException;
import com.sliit.smartcampus.booking.exception.BookingNotFoundException;
import com.sliit.smartcampus.booking.exception.UnauthorizedBookingActionException;
import com.sliit.smartcampus.booking.mapper.BookingMapper;
import com.sliit.smartcampus.booking.model.Booking;
import com.sliit.smartcampus.booking.model.BookingStatus;
import com.sliit.smartcampus.booking.repository.BookingRepository;
import com.sliit.smartcampus.booking.waitlist.service.WaitlistService;
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
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final BookingMapper bookingMapper;
    private final WaitlistService waitlistService;
    private final MongoTemplate mongoTemplate;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO dto, UserPrincipal currentUser) {
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time.");
        }

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + dto.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Resource is not available for booking. Current status: " + resource.getStatus());
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getResourceId(), dto.getDate(), dto.getStartTime(), dto.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "The selected time slot conflicts with an existing booking for this resource.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database."));

        Booking booking = Booking.builder()
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
                .status(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        notificationService.notifyAllAdmins(
                NotificationType.BOOKING_REQUEST,
                "New Booking Request",
                user.getName() + " has requested \"" + resource.getName() + "\" on " +
                        dto.getDate() + " from " + dto.getStartTime() + " to " + dto.getEndTime() + ".",
                booking.getId(),
                ReferenceType.BOOKING
        );

        return bookingMapper.toDTO(booking);
    }

    @Override
    public BookingResponseDTO getBookingById(UUID id, UserPrincipal currentUser) {
        Booking booking = findBookingOrThrow(id);

        if (!isAdmin(currentUser) && !booking.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedBookingActionException(
                    "You are not authorized to view this booking.");
        }

        return bookingMapper.toDTO(booking);
    }

    @Override
    public List<BookingResponseDTO> getMyBookings(UserPrincipal currentUser) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(bookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getAllBookings(BookingStatus status, UUID resourceId,
                                                   LocalDate date, UUID userId) {
        List<Criteria> conditions = new ArrayList<>();
        if (status != null)     conditions.add(Criteria.where("status").is(status));
        if (resourceId != null) conditions.add(Criteria.where("resourceId").is(resourceId));
        if (date != null)       conditions.add(Criteria.where("date").is(date));
        if (userId != null)     conditions.add(Criteria.where("userId").is(userId));

        Query query = new Query();
        if (!conditions.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(conditions.toArray(new Criteria[0])));
        }
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        return mongoTemplate.find(query, Booking.class)
                .stream()
                .map(bookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO approveBooking(UUID id, UserPrincipal currentUser) {
        Booking booking = findBookingOrThrow(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking = bookingRepository.save(booking);

        notificationService.notify(
                booking.getUserId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for \"" + booking.getResourceName() + "\" on " +
                        booking.getDate() + " (" + booking.getStartTime() + " – " +
                        booking.getEndTime() + ") has been approved.",
                booking.getId(),
                ReferenceType.BOOKING
        );

        return bookingMapper.toDTO(booking);
    }

    @Override
    public BookingResponseDTO rejectBooking(UUID id, String reason, UserPrincipal currentUser) {
        Booking booking = findBookingOrThrow(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking = bookingRepository.save(booking);

        String reasonText = (reason != null && !reason.isBlank()) ? " Reason: " + reason : "";
        notificationService.notify(
                booking.getUserId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for \"" + booking.getResourceName() + "\" on " +
                        booking.getDate() + " has been rejected." + reasonText,
                booking.getId(),
                ReferenceType.BOOKING
        );

        return bookingMapper.toDTO(booking);
    }

    @Override
    public BookingResponseDTO cancelBooking(UUID id, String reason, UserPrincipal currentUser) {
        Booking booking = findBookingOrThrow(id);

        if (!booking.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedBookingActionException("You can only cancel your own bookings.");
        }

        if (booking.getStatus() == BookingStatus.REJECTED ||
                booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Cannot cancel a booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking = bookingRepository.save(booking);

        notificationService.notifyAllAdmins(
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                booking.getUserName() + " cancelled their booking for \"" +
                        booking.getResourceName() + "\" on " + booking.getDate() + ".",
                booking.getId(),
                ReferenceType.BOOKING
        );

        waitlistService.notifyNextInWaitlist(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        return bookingMapper.toDTO(booking);
    }

    @Override
    public void deleteBooking(UUID id, UserPrincipal currentUser) {
        Booking booking = findBookingOrThrow(id);

        if (!isAdmin(currentUser) && !booking.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedBookingActionException(
                    "You are not authorized to delete this booking.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be deleted.");
        }

        bookingRepository.delete(booking);
    }

    private Booking findBookingOrThrow(UUID id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(
                        "Booking not found with id: " + id));
    }

    private boolean isAdmin(UserPrincipal user) {
        return "ADMIN".equals(user.getRole());
    }
}
