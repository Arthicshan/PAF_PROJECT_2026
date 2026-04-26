// com/sliit/smartcampus/config/AsyncConfig.java
package com.sliit.smartcampus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableAsync
@EnableScheduling  // needed later for daily digest
public class AsyncConfig {}