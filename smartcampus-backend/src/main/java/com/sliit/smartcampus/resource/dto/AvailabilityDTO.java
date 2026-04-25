package com.sliit.smartcampus.resource.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {
    private LocalDateTime from;
    private LocalDateTime to;
    private boolean available;
}
