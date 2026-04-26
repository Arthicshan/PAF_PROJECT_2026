package com.sliit.smartcampus.booking.waitlist.scheduler;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class WaitlistSchedulingConfig {
    // Enables @Scheduled on WaitlistExpiryScheduler without touching the main application class
}
