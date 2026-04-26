package com.sliit.smartcampus.user;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotifPrefs {
    @Builder.Default
    private boolean bookingApproved = true;
    @Builder.Default
    private boolean bookingRejected = true;
    @Builder.Default
    private boolean bookingRequest = true;
    @Builder.Default
    private boolean bookingCancelled = true;
    @Builder.Default
    private boolean ticketStatusChanged = true;
    @Builder.Default
    private boolean ticketAssigned = true;
    @Builder.Default
    private boolean ticketCommentAdded = true;
    @Builder.Default
    private boolean resourceOutOfService = true;
}
