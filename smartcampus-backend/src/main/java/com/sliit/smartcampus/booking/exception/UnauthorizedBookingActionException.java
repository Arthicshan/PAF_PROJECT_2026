package com.sliit.smartcampus.booking.exception;

public class UnauthorizedBookingActionException extends RuntimeException {
    public UnauthorizedBookingActionException(String message) {
        super(message);
    }
}
