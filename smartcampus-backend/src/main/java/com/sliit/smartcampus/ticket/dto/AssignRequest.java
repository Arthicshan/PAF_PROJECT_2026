package com.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignRequest {

    @NotBlank(message = "Technician ID required")
    private String technicianId;
}