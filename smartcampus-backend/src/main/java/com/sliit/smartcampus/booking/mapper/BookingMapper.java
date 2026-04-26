package com.sliit.smartcampus.booking.mapper;

import com.sliit.smartcampus.booking.dto.BookingResponseDTO;
import com.sliit.smartcampus.booking.model.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponseDTO toDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .resourceLocation(booking.getResourceLocation())
                .userId(booking.getUserId())
                .userEmail(booking.getUserEmail())
                .userName(booking.getUserName())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
