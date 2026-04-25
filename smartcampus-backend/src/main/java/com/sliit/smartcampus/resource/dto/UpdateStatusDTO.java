package com.sliit.smartcampus.resource.dto;

import com.sliit.smartcampus.resource.entity.ResourceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusDTO {
    @NotNull(message = "Status is required")
    private ResourceStatus status;
}
