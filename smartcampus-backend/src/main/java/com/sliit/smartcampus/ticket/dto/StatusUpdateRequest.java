package com.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotBlank
    @Pattern(
            regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED|REJECTED",
            message = "Invalid status"
    )
    private String status;

    private String resolutionNote;
}