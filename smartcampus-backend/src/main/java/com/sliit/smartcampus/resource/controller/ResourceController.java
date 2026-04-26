package com.sliit.smartcampus.resource.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sliit.smartcampus.resource.dto.*;
import com.sliit.smartcampus.resource.entity.ResourceStatus;
import com.sliit.smartcampus.resource.entity.ResourceType;
import com.sliit.smartcampus.resource.service.ResourceService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponseDTO>>> getAllResources() {
        return ResponseEntity.ok(ApiResponse.success("Resources fetched successfully", resourceService.getAllResources()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> getResourceById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Resource fetched successfully", resourceService.getResourceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> createResource(@Valid @RequestBody ResourceRequestDTO resource) {
        ResourceResponseDTO createdResource = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ResourceResponseDTO>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Resource created successfully")
                        .data(createdResource)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> updateResource(@PathVariable UUID id, @Valid @RequestBody ResourceRequestDTO resource) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", resourceService.updateResource(id, resource)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable UUID id) {
        resourceService.deleteResource(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.NO_CONTENT.value())
                        .message("Resource deleted successfully")
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<ResourceResponseDTO>>> getResourcesByType(@PathVariable ResourceType type) {
        return ResponseEntity.ok(ApiResponse.success("Resources filtered by type successfully", resourceService.getResourcesByType(type)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ResourceResponseDTO>>> getResourcesByStatus(@PathVariable ResourceStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Resources filtered by status successfully", resourceService.getResourcesByStatus(status)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ResourceResponseDTO>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location) {
        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("Search results fetched successfully", resourceService.searchResources(q)));
        } else if (location != null && !location.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("Resources searched by location successfully", resourceService.searchByLocation(location)));
        }
        return ResponseEntity.ok(ApiResponse.success("No search parameters provided", List.of()));
    }

    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<Page<ResourceResponseDTO>>> getAllResourcesPaged(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Paged resources fetched successfully", resourceService.getAllResourcesPaged(pageable)));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<ResourceResponseDTO>>> filterResources(
            @RequestParam ResourceType type,
            @RequestParam ResourceStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Filtered resources fetched successfully", resourceService.filterResources(type, status, pageable)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateStatusDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Resource status updated successfully", resourceService.updateStatus(id, dto)));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<AvailabilityDTO>> checkAvailability(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.success("Resource availability checked successfully", resourceService.checkAvailability(id, from, to)));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getResourceAnalytics(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Resource analytics fetched successfully", resourceService.getResourceAnalytics(id)));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> addReview(@PathVariable UUID id, @Valid @RequestBody ReviewRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ReviewResponseDTO>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Review added successfully")
                        .data(resourceService.addReview(id, dto))
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

}
