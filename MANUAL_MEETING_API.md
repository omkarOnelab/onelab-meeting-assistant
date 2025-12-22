# Manual Meeting Scheduling API

## Overview
This API allows frontend users to manually schedule meetings that may or may not be on their calendar. It provides full CRUD (Create, Read, Update, Delete) operations for manual meeting records.

## Model: ManualMeeting

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `was_scheduled_on_calendar` | Boolean | ✅ Yes | Radio button: Whether the meeting was scheduled on the calendar |
| `meet_link` | URL | ✅ Yes | Google Meet link for the meeting |
| `meeting_schedule_date` | Date | ✅ Yes | Date when the meeting is scheduled (YYYY-MM-DD) |
| `meeting_start_time` | DateTime | ✅ Yes | Date and time when the meeting starts (ISO 8601 format) |
| `comments` | JSON | ❌ No | Additional comments or metadata as JSON object |
| `meeting_title` | String | ❌ No | Optional meeting title |
| `calendar_meeting_id` | Integer | ❌ No | Link to CalendarMeeting if scheduled on calendar |
| `status` | String | ❌ No | Meeting status (pending/scheduled/in_progress/completed/cancelled) |
| `created_by` | Integer | ✅ Yes | User ID who created this meeting |

### Computed Properties
- `is_past_meeting`: Boolean indicating if the meeting time has passed
- `days_until_meeting`: Number of days until the meeting (0 if past)

## API Endpoints

### 1. Create Manual Meeting
**POST** `/api/manual-meetings/`

Create a new manual meeting record.

**Request Body:**
```json
{
  "was_scheduled_on_calendar": true,
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "meeting_schedule_date": "2025-12-25",
  "meeting_start_time": "2025-12-25T10:00:00Z",
  "meeting_title": "Team Standup",
  "comments": {
    "note": "Weekly standup meeting",
    "recurring": true
  },
  "user_id": 1,
  "status": "scheduled"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "id": 1,
  "was_scheduled_on_calendar": true,
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "meeting_schedule_date": "2025-12-25",
  "meeting_start_time": "2025-12-25T10:00:00+00:00",
  "meeting_title": "Team Standup",
  "comments": {
    "note": "Weekly standup meeting",
    "recurring": true
  },
  "status": "scheduled",
  "created_by": 1,
  "calendar_meeting_id": null,
  "created_at": "2025-12-22T12:00:00+00:00",
  "message": "Manual meeting created successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: was_scheduled_on_calendar, meet_link"
}
```

---

### 2. Get Single Manual Meeting
**GET** `/api/manual-meetings/{id}/`

Retrieve a specific manual meeting by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "was_scheduled_on_calendar": true,
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "meeting_schedule_date": "2025-12-25",
  "meeting_start_time": "2025-12-25T10:00:00+00:00",
  "meeting_title": "Team Standup",
  "comments": {
    "note": "Weekly standup meeting",
    "recurring": true
  },
  "status": "scheduled",
  "created_by": 1,
  "calendar_meeting_id": null,
  "created_at": "2025-12-22T12:00:00+00:00",
  "updated_at": "2025-12-22T12:00:00+00:00",
  "is_past_meeting": false,
  "days_until_meeting": 3
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Manual meeting not found"
}
```

---

### 3. List All Manual Meetings
**GET** `/api/manual-meetings/`

List all manual meetings with pagination.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `page_size` (optional, default: 20): Number of items per page
- `user_id` (optional): Filter by user ID

**Example Request:**
```
GET /api/manual-meetings/?page=1&page_size=10&user_id=1
```

**Response (200 OK):**
```json
{
  "count": 25,
  "page": 1,
  "page_size": 10,
  "results": [
    {
      "id": 1,
      "was_scheduled_on_calendar": true,
      "meet_link": "https://meet.google.com/abc-defg-hij",
      "meeting_schedule_date": "2025-12-25",
      "meeting_start_time": "2025-12-25T10:00:00+00:00",
      "meeting_title": "Team Standup",
      "comments": {"note": "Weekly standup"},
      "status": "scheduled",
      "created_by": 1,
      "calendar_meeting_id": null,
      "created_at": "2025-12-22T12:00:00+00:00",
      "updated_at": "2025-12-22T12:00:00+00:00",
      "is_past_meeting": false,
      "days_until_meeting": 3
    },
    // ... more meetings
  ]
}
```

---

### 4. Update Manual Meeting
**PUT** `/api/manual-meetings/{id}/`

Update an existing manual meeting. Only include fields you want to update.

**Request Body:**
```json
{
  "status": "in_progress",
  "meeting_title": "Updated Team Standup",
  "comments": {
    "note": "Meeting rescheduled",
    "reason": "Organizer unavailable"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "id": 1,
  "was_scheduled_on_calendar": true,
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "meeting_schedule_date": "2025-12-25",
  "meeting_start_time": "2025-12-25T10:00:00+00:00",
  "meeting_title": "Updated Team Standup",
  "comments": {
    "note": "Meeting rescheduled",
    "reason": "Organizer unavailable"
  },
  "status": "in_progress",
  "created_by": 1,
  "calendar_meeting_id": null,
  "updated_at": "2025-12-22T14:30:00+00:00",
  "message": "Manual meeting updated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Manual meeting not found"
}
```

---

### 5. Delete Manual Meeting
**DELETE** `/api/manual-meetings/{id}/`

Delete a manual meeting record.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Manual meeting 1 deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Manual meeting not found"
}
```

---

## Frontend Integration Guide

### Example: Create Meeting Form

```javascript
// Example frontend form submission
async function submitManualMeeting(formData) {
  const payload = {
    was_scheduled_on_calendar: formData.wasOnCalendar, // Radio button value (true/false)
    meet_link: formData.meetLink,                      // Input field
    meeting_schedule_date: formData.scheduleDate,      // Date field (YYYY-MM-DD)
    meeting_start_time: formData.startTime,            // DateTime field (ISO 8601)
    meeting_title: formData.title,                     // Optional input
    comments: {                                         // JSON field
      note: formData.note,
      custom_field: formData.customValue
    },
    user_id: currentUser.id,                           // Current user ID
    status: "scheduled"
  };

  try {
    const response = await fetch('/api/manual-meetings/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Meeting created:', data);
      // Handle success (redirect, show message, etc.)
    } else {
      console.error('Error:', data.error);
      // Handle error
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### Example: List Meetings

```javascript
// Fetch user's manual meetings
async function fetchUserMeetings(userId, page = 1) {
  try {
    const response = await fetch(
      `/api/manual-meetings/?user_id=${userId}&page=${page}&page_size=10`
    );
    const data = await response.json();
    
    console.log(`Total meetings: ${data.count}`);
    console.log(`Current page: ${data.page}`);
    console.log('Meetings:', data.results);
    
    return data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
  }
}
```

### Example: Update Meeting Status

```javascript
// Update meeting status when it starts
async function startMeeting(meetingId) {
  try {
    const response = await fetch(`/api/manual-meetings/${meetingId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'in_progress'
      })
    });

    const data = await response.json();
    console.log('Meeting updated:', data);
  } catch (error) {
    console.error('Error updating meeting:', error);
  }
}
```

---

## Django Admin Interface

The `ManualMeeting` model is registered in Django admin at `/admin/myApp/manualmeeting/`.

**Admin Features:**
- List view with filtering by status, calendar flag, and dates
- Search by meeting title, meet link, and creator email
- Date hierarchy by meeting start time
- Organized fieldsets for easy editing
- Read-only computed fields (is_past_meeting, days_until_meeting)

---

## Database Migration

After implementing this feature, run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

This will create the `myapp_manualmeeting` table in the database.

---

## Status Values

| Status | Description |
|--------|-------------|
| `pending` | Meeting created but not confirmed |
| `scheduled` | Meeting confirmed and scheduled |
| `in_progress` | Meeting is currently happening |
| `completed` | Meeting has finished |
| `cancelled` | Meeting was cancelled |

---

## Notes

1. **Authentication**: The API currently requires `user_id` in the request. Implement proper JWT/session authentication for production.

2. **CSRF Protection**: The API is currently exempt from CSRF for testing. Add proper CSRF protection for production use.

3. **Validation**: The API validates date/time formats. Frontend should use:
   - Date: `YYYY-MM-DD` format
   - DateTime: ISO 8601 format (e.g., `2025-12-25T10:00:00Z`)

4. **Comments Field**: The `comments` field accepts any valid JSON object, allowing flexible metadata storage.

5. **Calendar Integration**: If `was_scheduled_on_calendar` is `true`, optionally link to an existing `CalendarMeeting` via `calendar_meeting_id`.

---

## Testing

### Using cURL

**Create a meeting:**
```bash
curl -X POST http://localhost:8000/api/manual-meetings/ \
  -H "Content-Type: application/json" \
  -d '{
    "was_scheduled_on_calendar": false,
    "meet_link": "https://meet.google.com/test-meet-link",
    "meeting_schedule_date": "2025-12-30",
    "meeting_start_time": "2025-12-30T15:00:00Z",
    "meeting_title": "Test Meeting",
    "comments": {"test": true},
    "user_id": 1
  }'
```

**List meetings:**
```bash
curl http://localhost:8000/api/manual-meetings/?page=1&page_size=10
```

**Get single meeting:**
```bash
curl http://localhost:8000/api/manual-meetings/1/
```

**Update meeting:**
```bash
curl -X PUT http://localhost:8000/api/manual-meetings/1/ \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Delete meeting:**
```bash
curl -X DELETE http://localhost:8000/api/manual-meetings/1/
```

---

## Troubleshooting

### Common Errors

**Error: "Missing required fields"**
- Ensure all required fields are included in POST request
- Check field names match exactly (case-sensitive)

**Error: "Invalid meeting_schedule_date format"**
- Use `YYYY-MM-DD` format (e.g., `2025-12-25`)

**Error: "Invalid meeting_start_time format"**
- Use ISO 8601 format (e.g., `2025-12-25T10:00:00Z`)

**Error: "User with ID X not found"**
- Ensure the user exists in the database
- Check the user_id is correct

---

## Future Enhancements

1. **Bot Integration**: Automatically trigger meeting bot for manual meetings
2. **Reminders**: Send email/notification reminders before meetings
3. **Recurring Meetings**: Support for recurring meeting patterns
4. **Conflict Detection**: Check for scheduling conflicts
5. **Calendar Sync**: Automatically create calendar events for manual meetings

