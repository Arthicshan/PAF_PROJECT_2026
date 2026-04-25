package com.sliit.smartcampus.booking.waitlist.model;

public enum WaitlistStatus {
    WAITING,    // in queue, not yet notified
    NOTIFIED,   // slot opened, user has been notified, waiting for confirmation
    CONFIRMED,  // user confirmed, booking created automatically
    EXPIRED,    // user did not confirm within 24 hours
    REMOVED     // user removed themselves from the waitlist
}
