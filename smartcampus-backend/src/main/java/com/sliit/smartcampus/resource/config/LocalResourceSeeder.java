package com.sliit.smartcampus.resource.config;

import com.sliit.smartcampus.resource.entity.Resource;
import com.sliit.smartcampus.resource.entity.ResourceStatus;
import com.sliit.smartcampus.resource.entity.ResourceType;
import com.sliit.smartcampus.resource.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

@Configuration
@Profile("local")
public class LocalResourceSeeder {

    @Bean
    CommandLineRunner seedResources(ResourceRepository resourceRepository) {
        return args -> {
            if (!resourceRepository.findByStatusAndArchivedFalse(ResourceStatus.ACTIVE).isEmpty()) {
                return;
            }

            List<Resource> seedResources = List.of(
                    Resource.builder()
                            .name("Innovation Lab A")
                            .type(ResourceType.LAB)
                            .capacity(40)
                            .location("Engineering Building - Floor 2")
                            .status(ResourceStatus.ACTIVE)
                            .amenities(List.of("Projector", "Whiteboard", "Air Conditioning", "Smart Display"))
                            .tags(List.of("lab", "innovation", "group-work"))
                            .availabilityWindows("Mon-Fri 08:00-18:00")
                            .build(),
                    Resource.builder()
                            .name("Seminar Hall 01")
                            .type(ResourceType.LECTURE_HALL)
                            .capacity(120)
                            .location("Main Block - Ground Floor")
                            .status(ResourceStatus.ACTIVE)
                            .amenities(List.of("PA System", "Projector", "Stage Lighting"))
                            .tags(List.of("seminar", "events", "lecture"))
                            .availabilityWindows("Mon-Sat 08:00-20:00")
                            .build(),
                    Resource.builder()
                            .name("Meeting Room C")
                            .type(ResourceType.MEETING_ROOM)
                            .capacity(12)
                            .location("Admin Wing - Floor 1")
                            .status(ResourceStatus.ACTIVE)
                            .amenities(List.of("TV Screen", "Video Conferencing", "Whiteboard"))
                            .tags(List.of("meeting", "discussion", "staff"))
                            .availabilityWindows("Mon-Fri 09:00-17:00")
                            .build()
            );

            resourceRepository.saveAll(seedResources);
        };
    }
}
