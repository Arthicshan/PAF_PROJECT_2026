# 🏫 Smart Campus Operations Hub

> **IT3030 — Programming Applications and Frameworks | SLIIT | 2026**  
> A full-stack Smart Campus management system built with Spring Boot REST API + React, featuring AI integrations across all modules.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Team Structure & Module Ownership](#team-structure--module-ownership)
- [Architecture Overview](#architecture-overview)
- [Module A — Facilities & Assets Catalogue](#module-a--facilities--assets-catalogue)
- [Module B — Booking Management](#module-b--booking-management)
- [Module C — Maintenance & Incident Ticketing](#module-c--maintenance--incident-ticketing)
- [Module D & E — Notifications & Authentication](#module-d--e--notifications--authentication)
- [AI Integrations Summary](#ai-integrations-summary)
- [Data Models](#data-models)
- [API Endpoints Reference](#api-endpoints-reference)
- [Authentication & Role System](#authentication--role-system)
- [Environment Configuration](#environment-configuration)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## Project Overview

The Smart Campus Operations Hub is a comprehensive campus management platform that allows students, staff, and administrators to:

- **Browse and search** campus facilities and equipment (rooms, labs, projectors, etc.)
- **Book resources** with conflict detection and AI-powered slot suggestions
- **Report and track** maintenance tickets with file attachments and SLA monitoring
- **Receive real-time notifications** via WebSocket and email for all campus events
- **Authenticate** securely via Google OAuth 2.0 with JWT-based session management
- **Interact** with an AI chatbot for natural language campus queries

All four modules integrate with the Claude API (`claude-sonnet-4-20250514`) or OpenAI (`gpt-4o-mini`) for AI-powered features.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot, Spring Data JPA, Spring Security |
| Frontend | React, React Router, Axios |
| Database | PostgreSQL / MySQL (via JPA) |
| Authentication | OAuth 2.0 (Google), JWT (jjwt 0.11.5) |
| Real-time | WebSocket (STOMP over SockJS) |
| Email | JavaMailSender (Gmail SMTP) |
| AI | Anthropic Claude API / OpenAI |
| Object Mapping | MapStruct |
| File Validation | Apache Tika |
| Charts | Recharts / Chart.js |
| QR Codes | qrcode.js / react-qr-code |
| Testing | JUnit 5, Mockito |
| API Testing | Postman |

---

## Team Structure & Module Ownership

| Member | Module | Focus Area |
|---|---|---|
| Member 1 | Module A — Facilities & Assets | Resource catalogue, QR codes, AI descriptions |
| Member 2 | Module B — Booking Management | Conflict detection, approval workflow, AI slot suggestion |
| Member 3 | Module C — Maintenance Ticketing | File uploads, SLA tracking, AI auto-categorisation |
| Member 4 | Module D & E — Notifications & Auth | OAuth 2.0, JWT, WebSocket, AI chatbot |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  (Catalogue · Calendar · Tickets · Chat · Admin)     │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / WebSocket (STOMP)
┌────────────────────▼────────────────────────────────┐
│             Spring Boot REST API  (/api/v1/...)      │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │Module A  │ │Module B  │ │Module C  │ │Mod D/E │  │
│  │Resources │ │Bookings  │ │Tickets   │ │Auth /  │  │
│  │          │ │          │ │          │ │Notifs  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘  │
│       │             │            │            │       │
│  ┌────▼─────────────▼────────────▼────────────▼────┐ │
│  │        NotificationService (shared)              │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │             Spring Data JPA + PostgreSQL          │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │         AIService → Claude / OpenAI API          │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Key architectural rules:**
- Strict layered architecture: Controller → Service → Repository. Never call Repository from Controller.
- DTOs for all input/output. Never expose JPA entities directly. MapStruct for mapping.
- `@Valid` on all input DTOs. Global `@RestControllerAdvice` for consistent error responses.
- Soft-delete via `archived` boolean + `@Where(clause="archived=false")` on entities.
- All AI calls are `@Async` — they never block HTTP responses.
- Pagination on all list endpoints using Spring Data `Pageable`.

---

## Module A — Facilities & Assets Catalogue

**Owner: Member 1 | Endpoints: 11**

Module A manages the complete inventory of campus resources — rooms, labs, meeting spaces, and equipment. It is the foundation that all other modules reference.

### Resource Entity

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `name` | String | e.g. "Lab A201" — unique per location |
| `type` | Enum | `LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT` |
| `capacity` | Integer | Nullable for equipment |
| `location` | String | Building + floor + room code |
| `status` | Enum | `ACTIVE`, `OUT_OF_SERVICE`, `UNDER_MAINTENANCE` |
| `availabilityWindows` | JSON | `{dayOfWeek, startTime, endTime}` list |
| `amenities` | List\<String\> | `projector`, `AC`, `whiteboard`, `smart_board` |
| `imageUrl` | String | Photo URL |
| `qrCode` | String | Unique QR token — supports check-in |
| `tags` | List\<String\> | Feeds into AI natural language search |
| `aiSummary` | Text | AI-generated description (async on creation) |
| `archived` | Boolean | Soft-delete flag |

### Status Lifecycle

```
ACTIVE → UNDER_MAINTENANCE → ACTIVE
                           → OUT_OF_SERVICE
```

> ⚠️ When a resource moves to `OUT_OF_SERVICE`, all `PENDING` and `APPROVED` bookings are automatically cancelled and affected users are notified.

### Module A Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/resources` | List all resources — paginated, filterable |
| `GET` | `/api/v1/resources/{id}` | Single resource with AI summary |
| `GET` | `/api/v1/resources/search` | Natural language search (`?q=...`) |
| `GET` | `/api/v1/resources/{id}/availability` | Available slots for a date range |
| `GET` | `/api/v1/resources/{id}/analytics` | Usage stats + AI insights (ADMIN) |
| `POST` | `/api/v1/resources` | Create resource — triggers QR + AI description |
| `POST` | `/api/v1/resources/{id}/reviews` | Submit rating and review |
| `POST` | `/api/v1/resources/ai/recommend` | AI recommendation when unavailable |
| `PUT` | `/api/v1/resources/{id}` | Full update (ADMIN only) |
| `PATCH` | `/api/v1/resources/{id}/status` | Status update — triggers cascade |
| `DELETE` | `/api/v1/resources/{id}` | Soft-delete (ADMIN only) |

### Module A AI Features

1. **Natural Language Search** — User types "quiet room for 10 people with projector near Block A" → AI ranks matching resources with plain-English reasons.
2. **Smart Booking Recommendations** — When a resource is unavailable, AI suggests top 3 alternatives based on user history and preferences.
3. **AI-Generated Resource Descriptions** — On creation, an `@Async` job calls Claude to generate a 2–3 sentence user-friendly description stored in `aiSummary`.
4. **Predictive Utilisation Analytics** — AI analyses historical booking data and returns peak periods, underutilised slots, and next-week demand predictions.
5. **Campus Chatbot Assistant** — Floating widget for natural language queries across all modules (shared with Module D&E).

---

## Module B — Booking Management

**Owner: Member 2 | Endpoints: 11**

Module B is the booking engine. It is the most algorithmically complex module — the conflict detection logic, state machine enforcement, and cross-module integrations are heavily tested in the viva.

### Booking Entity

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `resourceId` | UUID (FK) | References Resource |
| `userId` | UUID (FK) | Set from JWT — users cannot book for others |
| `date` | LocalDate | Must not be in the past |
| `startTime` | LocalTime | 24h format |
| `endTime` | LocalTime | Must be strictly after `startTime` |
| `purpose` | String | Reason for booking |
| `expectedAttendees` | Integer | Must not exceed `resource.capacity` |
| `status` | Enum | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `adminNote` | String | Mandatory on REJECT |
| `checkedInAt` | Timestamp | Set on QR check-in; null = no-show |
| `aiSuggestedSlot` | Boolean | True if user accepted AI recommendation |
| `recurrenceRule` | String | iCal RRULE format for recurring bookings |

### Booking Status Lifecycle

```
PENDING → APPROVED → CANCELLED (by user)
PENDING → REJECTED  (ADMIN only — requires adminNote)
```

> ⚠️ `APPROVED` bookings can only be `CANCELLED`. They cannot be `REJECTED`. Only `PENDING` bookings can be `REJECTED`.

### Conflict Detection Algorithm

The core algorithm uses interval overlap logic. Two intervals `[A_start, A_end)` and `[B_start, B_end)` overlap if and only if:

```
A_start < B_end AND A_end > B_start
```

Implemented as a JPQL query:

```java
@Query("SELECT b FROM Booking b WHERE
    b.resourceId = :rid AND b.date = :date
    AND b.status IN ('PENDING', 'APPROVED')
    AND NOT (b.endTime <= :start OR b.startTime >= :end)")
List<Booking> findConflicting(...);
```

The conflict check runs **twice** — on booking creation and again at admin approval — to prevent race conditions.

### Edge Cases Handled

| Case | Response |
|---|---|
| End time not after start time | `400 Bad Request` |
| Booking outside availability windows | `409 Outside available hours` |
| Resource is `OUT_OF_SERVICE` | `409 Resource not available` |
| Booking date in the past | `400 Cannot book a past date` |
| Attendees exceed capacity | `400 Exceeds room capacity` |
| Race condition on approval | Conflict re-check at approval time |

### Module B Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/bookings` | Own bookings (USER) / all (ADMIN) |
| `GET` | `/api/v1/bookings/{id}` | Single booking — role-scoped |
| `GET` | `/api/v1/bookings/calendar` | Approved bookings for calendar view |
| `GET` | `/api/v1/bookings/analytics` | Peak hours, approval rate + AI insight |
| `POST` | `/api/v1/bookings` | Create booking — full validation |
| `POST` | `/api/v1/bookings/ai/suggestslot` | AI best-time recommendation |
| `POST` | `/api/v1/bookings/{id}/checkin` | QR code check-in |
| `PATCH` | `/api/v1/bookings/{id}/approve` | Admin approve (re-runs conflict check) |
| `PATCH` | `/api/v1/bookings/{id}/reject` | Admin reject with mandatory reason |
| `PATCH` | `/api/v1/bookings/{id}/cancel` | User cancels own booking |
| `DELETE` | `/api/v1/bookings/{id}` | Hard delete for cleanup (ADMIN only) |

### Module B AI Features

1. **AI Smart Slot Suggestion** — "Suggest best time" button returns the optimal free slot with reasoning based on a preference hint (e.g. "morning preferred").
2. **Smart Alternative Suggestion on Conflict** — When a `409` conflict is detected, the response body includes 3 AI-ranked alternative resources with explanations. React shows them as clickable cards.
3. **AI Booking Analytics Insights** — Peak hours heatmap, approval rates, and a 3–4 sentence AI insight paragraph for admin dashboards.
4. **No-Show Prediction** — AI estimates `LOW`/`MEDIUM`/`HIGH` no-show risk per booking, shown as a badge in the admin approval queue.

---

## Module C — Maintenance & Incident Ticketing

**Owner: Member 3 | Endpoints: 12**

Module C is the maintenance ticketing system. It is the most feature-dense module — secure file uploads, multi-role state machine, comment ownership rules, SLA tracking, and the richest AI integrations.

### Ticket Entity

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `resourceId` | UUID (nullable) | Optional link to a resource |
| `reportedBy` | UUID (FK) | Set from JWT — immutable |
| `assignedTo` | UUID (nullable) | Set by admin — triggers notification |
| `category` | Enum | `ELECTRICAL`, `PLUMBING`, `HVAC`, `EQUIPMENT_FAULT`, `IT_INFRASTRUCTURE`, `STRUCTURAL`, `CLEANING`, `SECURITY`, `OTHER` |
| `priority` | Enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `title` | String | Max 200 chars |
| `description` | Text | Feeds AI categorisation |
| `status` | Enum | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED` |
| `resolutionNote` | Text | Required on `RESOLVED`/`CLOSED` |
| `firstResponseAt` | Timestamp | Auto-set on `IN_PROGRESS` — SLA tracking |
| `resolvedAt` | Timestamp | Auto-set on `RESOLVED` — SLA tracking |
| `aiCategory` | String | AI-suggested category (async) |
| `aiPriority` | Enum | AI-suggested priority (async) |

### Ticket Status Lifecycle

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
OPEN → REJECTED (ADMIN only)
```

| Transition | Who Can Trigger |
|---|---|
| `OPEN → IN_PROGRESS` | TECHNICIAN (assigned) or ADMIN |
| `IN_PROGRESS → RESOLVED` | Assigned TECHNICIAN or ADMIN — requires `resolutionNote` |
| `RESOLVED → CLOSED` | ADMIN only |
| `OPEN → REJECTED` | ADMIN only |

### Secure File Handling

Files are accepted as `multipart/form-data`. Security rules strictly enforced:

- **Max 3 attachments per ticket**, max 5MB each, image types only (`image/jpeg`, `image/png`, `image/webp`)
- **UUID-based filenames** for disk storage — prevents path traversal attacks
- **MIME type validated from file bytes** using Apache Tika — prevents disguised executables
- **Files served through authenticated controller** — never from a public static folder
- **IDOR prevention** — attachment ownership verified against ticket before serving

```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=20MB
app.upload.dir=${user.home}/campus-uploads
app.upload.max-files-per-ticket=3
app.upload.allowed-types=image/jpeg,image/png,image/webp
```

### Module C Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/tickets` | Role-scoped list — paginated + filterable |
| `GET` | `/api/v1/tickets/{id}` | Full detail with comments (role-filtered) |
| `GET` | `/api/v1/tickets/{id}/attachments/{aid}` | Secure authenticated file streaming |
| `GET` | `/api/v1/tickets/analytics` | SLA stats, category breakdown + AI insight |
| `POST` | `/api/v1/tickets` | Create ticket with up to 3 attachments |
| `POST` | `/api/v1/tickets/{id}/comments` | Add comment (with `isInternal` flag) |
| `POST` | `/api/v1/tickets/{id}/attachments` | Add attachments post-creation |
| `PATCH` | `/api/v1/tickets/{id}/status` | Status update with SLA timestamp logic |
| `PATCH` | `/api/v1/tickets/{id}/assign` | Admin assigns technician |
| `PUT` | `/api/v1/tickets/{id}/comments/{cid}` | Edit own comment |
| `DELETE` | `/api/v1/tickets/{id}/comments/{cid}` | Delete comment — ownership enforced |

### Comment Ownership Rules

| Role | Can Edit | Can Delete |
|---|---|---|
| USER | Own comments only | Own comments only |
| TECHNICIAN | Own comments | Any comment on assigned tickets |
| ADMIN | Any comment | Any comment |

Internal comments (`isInternal=true`) are filtered out at the service layer for USER role responses.

### Module C AI Features

1. **Auto-Categorisation & Priority Suggestion** — On creation, an `@Async` job sends title and description to Claude. Returns a suggested `category` and `priority` with confidence score, stored as `aiCategory`/`aiPriority`.
2. **AI Resolution Suggestion** — When a technician opens a ticket, the AI analyses similar resolved tickets and suggests likely causes and resolution steps in a collapsible panel.
3. **Duplicate Ticket Detection** — Before saving, open tickets for the same resource/location are passed to AI. If a likely duplicate is found (confidence > 0.8), the user is warned but not blocked.
4. **SLA Analytics & Insight** — Time-to-first-response, time-to-resolution, breach rate, and technician performance sent to AI for actionable insight paragraph.

---

## Module D & E — Notifications & Authentication

**Owner: Member 4 | Endpoints: 12 + WebSocket config**

Module D & E is the glue holding the entire system together. Authentication secures every other module. Notifications connect every event across modules A, B, and C. The AI chatbot is the most visible innovation in the project.

### User Entity

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `email` | String, unique | From Google profile |
| `name` | String | Updated on each login |
| `pictureUrl` | String | Google avatar |
| `role` | Enum | `USER`, `TECHNICIAN`, `MANAGER`, `ADMIN` |
| `provider` | Enum | `GOOGLE` (extendable) |
| `notifPrefs` | JSON | Per-event email opt-in flags |

### Role Permissions Matrix

| Permission | USER | TECHNICIAN | MANAGER | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Create bookings | ✅ | ✅ | ✅ | ✅ |
| Approve bookings | ❌ | ❌ | ❌ | ✅ |
| Raise tickets | ✅ | ✅ | ✅ | ✅ |
| Update ticket status | ❌ | Assigned only | ❌ | ✅ |
| View analytics | ❌ | ❌ | ✅ | ✅ |
| Manage resources | ❌ | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ❌ | ✅ |

### Notification Entity

| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `userId` | UUID (FK) | Recipient |
| `type` | Enum | See event types below |
| `title` | String | Short summary |
| `message` | Text | Full body |
| `referenceId` | UUID | Related booking or ticket ID |
| `referenceType` | Enum | `BOOKING` or `TICKET` |
| `isRead` | Boolean | Drives bell badge count |

### Notification Event Types

| Event | Triggered By | Recipients |
|---|---|---|
| `BOOKING_APPROVED` | `BookingService.approve()` | Booking owner |
| `BOOKING_REJECTED` | `BookingService.reject()` | Booking owner |
| `BOOKING_REQUEST` | `BookingService.create()` | All ADMINs |
| `BOOKING_CANCELLED` | `BookingService.cancel()` | All ADMINs |
| `TICKET_STATUS_CHANGED` | `TicketService.updateStatus()` | Reporter + technician |
| `TICKET_ASSIGNED` | `TicketService.assign()` | Assigned technician |
| `TICKET_COMMENT_ADDED` | `TicketService.addComment()` | Reporter + technician |
| `RESOURCE_OUT_OF_SERVICE` | `ResourceService.updateStatus()` | All affected booking owners |

### Module D & E Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/notifications` | Own notifications — paginated |
| `GET` | `/api/v1/notifications/unreadcount` | Unread count — drives bell badge |
| `PATCH` | `/api/v1/notifications/{id}/read` | Mark single as read |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/v1/notifications/{id}` | Delete own notification |
| `GET` | `/api/v1/users/me` | Own profile |
| `PATCH` | `/api/v1/users/me/preferences` | Update notification preferences |
| `GET` | `/api/v1/users` | All users with stats (ADMIN) |
| `PATCH` | `/api/v1/users/{id}/role` | Change user role (ADMIN) |
| `GET` | `/oauth2/authorization/google` | Initiate Google OAuth |
| `POST` | `/api/v1/auth/refresh` | Refresh expired JWT |
| `POST` | `/api/v1/ai/chat` | Campus AI chatbot |

### Google OAuth 2.0 Flow

```
1. React → window.location.href = '/oauth2/authorization/google'
2. Spring Security → redirects to Google consent screen
3. Google → returns authorisation code to /login/oauth2/code/google
4. Spring → exchanges code for access token (automatic)
5. CustomOAuth2UserService.loadUser() → upsert User in DB
6. OAuth2AuthenticationSuccessHandler → generates JWT
7. React → /oauth2/callback?token={jwt}
8. React → stores token, sets Axios header, redirects to /dashboard
9. Every request → JwtAuthenticationFilter validates token
```

### WebSocket Real-Time Notifications

```
1. React connects on login: new SockJS('/ws') → Stomp.over()
2. React subscribes: client.subscribe('/user/queue/notifications', ...)
3. Any module fires: NotificationService.notify(userId, type, ...)
4. NotificationService: saves to DB → pushes via SimpMessagingTemplate
5. React receives push: increments badge, prepends to panel, shows toast
```

> ⚠️ Always persist notifications to DB **before** pushing via WebSocket. WebSocket is best-effort — users who are offline will see the notification on next login via the REST endpoint.

### Module D & E AI Features

1. **Campus AI Chatbot** (flagship) — Floating widget on every page. Maintains full conversation history per session. System prompt describes the entire Smart Campus context. Users ask: "What labs are free tomorrow?", "How do I report a fault?", "Show my upcoming bookings."
2. **AI Daily Digest Email** — `@Scheduled` job at 8am generates a personalised 3–4 sentence summary email per opted-in user instead of a flood of individual notifications.
3. **Smart Role Assignment Suggestion** — On the user management page, AI evaluates each user's activity patterns (bookings, tickets, response times) and suggests role promotions. Shown as a subtle badge — admin makes the final decision.

---

## AI Integrations Summary

| Module | Feature | Trigger | API Call Pattern |
|---|---|---|---|
| A | Natural language search | `GET /resources/search?q=...` | Synchronous — blocks response |
| A | Smart booking recommendations | Unavailable resource view | Synchronous |
| A | AI resource description | After `POST /resources` | `@Async` — non-blocking |
| A | Predictive utilisation analytics | `GET /resources/{id}/analytics` | Synchronous |
| A | Campus chatbot | `POST /ai/chat` | Synchronous / streaming |
| B | Smart slot suggestion | `POST /bookings/ai/suggest-slot` | Synchronous |
| B | Alternatives on conflict | Conflict detected in booking | Synchronous — enriches 409 |
| B | Booking analytics insight | `GET /bookings/analytics` | Synchronous |
| B | No-show prediction | `GET /bookings/{id}/noshow-risk` | Synchronous |
| C | Auto-categorisation | After `POST /tickets` | `@Async` — non-blocking |
| C | Resolution suggestion | `GET /tickets/{id}` (TECHNICIAN) | Synchronous or `@Async` |
| C | Duplicate detection | Before `POST /tickets` save | Synchronous |
| C | SLA analytics insight | `GET /tickets/analytics` | Synchronous |
| D/E | Campus chatbot | `POST /ai/chat` | Synchronous / streaming |
| D/E | Daily digest email | `@Scheduled` 8am daily | `@Async` |
| D/E | Role suggestion | `GET /users` (ADMIN) | Synchronous |

### AI Integration Pattern (Spring Boot)

```java
// application.properties
anthropic.api.key=${ANTHROPIC_API_KEY}
anthropic.model=claude-sonnet-4-20250514

@Service
public class AIService {
    @Value("${anthropic.api.key}")
    private String apiKey;

    public String callClaude(String prompt) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders h = new HttpHeaders();
        h.set("x-api-key", apiKey);
        h.set("anthropic-version", "2023-06-01");
        h.setContentType(MediaType.APPLICATION_JSON);
        // Build body, call API, parse response
    }
}
```

> ⚠️ **Never commit API keys to GitHub.** Store all secrets as environment variables and add `.env` to `.gitignore`.

---

## Data Models

### Entity Relationship Overview

```
User ──────────────────────────────────┐
  │                                    │
  ├─── Booking ──── Resource ──── ResourceReview
  │       │
  ├─── Ticket ──── TicketComment
  │       └──────── TicketAttachment
  │
  └─── Notification
```

### Key Enums

| Enum | Values |
|---|---|
| ResourceType | `LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT` |
| ResourceStatus | `ACTIVE`, `UNDER_MAINTENANCE`, `OUT_OF_SERVICE` |
| BookingStatus | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| TicketStatus | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED` |
| TicketCategory | `ELECTRICAL`, `PLUMBING`, `HVAC`, `EQUIPMENT_FAULT`, `IT_INFRASTRUCTURE`, `STRUCTURAL`, `CLEANING`, `SECURITY`, `OTHER` |
| TicketPriority | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| UserRole | `USER`, `TECHNICIAN`, `MANAGER`, `ADMIN` |
| NotifType | `BOOKING_APPROVED`, `BOOKING_REJECTED`, `BOOKING_REQUEST`, `BOOKING_CANCELLED`, `TICKET_STATUS_CHANGED`, `TICKET_ASSIGNED`, `TICKET_COMMENT_ADDED`, `RESOURCE_OUT_OF_SERVICE` |

---

## API Endpoints Reference

All endpoints are prefixed with `/api/v1/`. Total: **46 endpoints across all modules.**

### Naming Conventions

- Lowercase, hyphen-separated: `/api/v1/resources` not `/api/v1/Resources`
- Version prefix: `/api/v1/`
- Plural resource nouns: `/resources` not `/resource`
- Sub-resources nested: `/resources/{id}/reviews`
- Non-CRUD actions: `/resources/ai/recommend`

### HTTP Status Codes

| Status | When Used |
|---|---|
| `200 OK` | Successful GET, PUT, PATCH |
| `201 Created` | Successful POST |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Validation failure |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Insufficient role |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Status conflict, booking conflict, duplicate |

### Error Response Shape

All errors return the same JSON shape:

```json
{
  "timestamp": "2026-04-15T14:30:00Z",
  "status": 400,
  "error": "Validation failed",
  "path": "/api/v1/bookings"
}
```

---

## Authentication & Role System

### Spring Security Configuration

```java
// Required dependencies
spring-boot-starter-oauth2-client
jjwt-api (0.11.5)
spring-boot-starter-mail
spring-boot-starter-websocket
```

### JWT Structure

- **Subject:** `userId`
- **Claims:** `email`, `role`
- **Expiry:** 24 hours (86400000ms)
- **Filter position:** Before `UsernamePasswordAuthenticationFilter`

### CORS Configuration

```java
allowedOrigins("http://localhost:3000")
allowedMethods("*")
allowCredentials(true)
```

### WebSocket Security

A `ChannelInterceptor` validates the JWT from the STOMP `CONNECT` frame. Unauthenticated connections are rejected — without this, any user could subscribe to any other user's notification queue.

---

## Environment Configuration

Create a `.env` file in the project root (add to `.gitignore`):

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret_min_256_bits

# Email (Gmail SMTP)
GMAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DB_URL=jdbc:postgresql://localhost:5432/campus_hub
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

`application.properties` references these via `${VARIABLE_NAME}` — never hardcode values.

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-org/smart-campus-hub.git
cd smart-campus-hub/backend

# Copy environment template and fill in values
cp .env.example .env

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd smart-campus-hub/frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on `http://localhost:3000`

### Running Tests

```bash
# Backend unit tests
mvn test

# Backend with coverage report
mvn test jacoco:report
```

---

## Project Structure

```
smart-campus-hub/
├── backend/
│   ├── src/main/java/com/sliit/campus/
│   │   ├── config/          # SecurityConfig, WebSocketConfig, AsyncConfig, CorsConfig
│   │   ├── auth/            # OAuth2UserService, JwtFilter, SuccessHandler
│   │   ├── module_a/        # Resource, ResourceReview — controllers, services, repos, DTOs
│   │   ├── module_b/        # Booking, BookingSlot — controllers, services, repos, DTOs
│   │   ├── module_c/        # Ticket, TicketComment, TicketAttachment
│   │   ├── module_de/       # User, Notification, NotificationService, EmailService
│   │   ├── ai/              # AIService, AISearchService, AIDescriptionService, ChatService
│   │   └── shared/          # GlobalExceptionHandler, BaseResponseDTO, enums
│   ├── src/test/            # JUnit 5 + Mockito tests per module
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/      # Shared UI components, ChatWidget, NotificationBell
│   │   ├── pages/           # Catalogue, BookingCalendar, Tickets, Admin, Dashboard
│   │   ├── context/         # AuthContext, WebSocketContext, NotificationContext
│   │   ├── hooks/           # useNotifications, useAuth, useBookings
│   │   ├── api/             # Axios instance with interceptors, per-module API files
│   │   └── routes/          # ProtectedRoute, role-aware routing
│   └── package.json
├── postman/
│   └── SmartCampusHub.postman_collection.json
└── README.md
```

---


*Smart Campus Operations Hub — IT3030 PAF Assignment 2026 | SLIIT*
