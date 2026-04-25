package com.sliit.smartcampus.booking.waitlist.exception;

public class WaitlistEntryNotFoundException extends RuntimeException {
    public WaitlistEntryNotFoundException(String message) {
        super(message);
    }
}
