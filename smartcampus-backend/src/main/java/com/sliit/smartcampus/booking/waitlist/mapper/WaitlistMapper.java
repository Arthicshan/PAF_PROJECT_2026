package com.sliit.smartcampus.booking.waitlist.mapper;

import com.sliit.smartcampus.booking.waitlist.dto.WaitlistResponseDTO;
import com.sliit.smartcampus.booking.waitlist.model.WaitlistEntry;
import org.springframework.stereotype.Component;

@Component
public class WaitlistMapper {

    public WaitlistResponseDTO toDTO(WaitlistEntry entry) {
        return WaitlistResponseDTO.builder()
                .id(entry.getId())
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
                .status(entry.getStatus())
                .position(entry.getPosition())
                .notifiedAt(entry.getNotifiedAt())
                .expiresAt(entry.getExpiresAt())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
