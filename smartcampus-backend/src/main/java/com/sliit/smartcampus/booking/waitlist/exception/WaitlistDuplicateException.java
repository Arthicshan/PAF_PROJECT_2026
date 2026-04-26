package com.sliit.smartcampus.booking.waitlist.exception;

public class WaitlistDuplicateException extends RuntimeException {
    public WaitlistDuplicateException(String message) {
        super(message);
    }
}
