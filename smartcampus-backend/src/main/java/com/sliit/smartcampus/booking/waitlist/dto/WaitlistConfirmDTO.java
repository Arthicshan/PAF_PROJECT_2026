package com.sliit.smartcampus.booking.waitlist.dto;

import lombok.Data;

/**
 * Optional body for the confirm endpoint.
 * Currently no fields are required — the action itself is the confirmation.
 */
@Data
public class WaitlistConfirmDTO {
    private String note;
}
