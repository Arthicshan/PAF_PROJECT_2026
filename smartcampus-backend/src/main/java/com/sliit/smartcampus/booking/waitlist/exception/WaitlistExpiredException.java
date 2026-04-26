package com.sliit.smartcampus.booking.waitlist.exception;

public class WaitlistExpiredException extends RuntimeException {
    public WaitlistExpiredException(String message) {
        super(message);
    }
}
