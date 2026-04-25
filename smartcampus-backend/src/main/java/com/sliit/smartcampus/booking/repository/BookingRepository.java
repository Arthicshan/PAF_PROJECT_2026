package com.sliit.smartcampus.booking.repository;

import com.sliit.smartcampus.booking.model.Booking;
import com.sliit.smartcampus.booking.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends MongoRepository<Booking, UUID> {

    @Query("{ 'resourceId': ?0, 'date': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(UUID resourceId, LocalDate date, LocalTime startTime, LocalTime endTime);

    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
