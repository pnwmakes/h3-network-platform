# H3 Network Auto-Publish System

The automated publishing system allows H3 Network creators to schedule content weeks in advance and have it automatically published at the specified time.

## How It Works

1. **Creators schedule content** using the calendar interface
2. **Content remains in DRAFT status** until the scheduled publish time
3. **Auto-publish system runs periodically** checking for content ready to publish
4. **Content is automatically published** and status updated to PUBLISHED
5. **Creators get real-time feedback** via the Auto-Publish Monitor

## Components

### 1. Auto-Publish API (`/api/auto-publish`)

-   **POST**: Triggers publishing of scheduled content
-   **GET**: Returns system status and upcoming/recent publications
-   Handles both videos and blogs
-   Updates database status and timestamps
-   Comprehensive error handling and logging

### 2. Auto-Publish Monitor Component

-   Real-time system status display
-   Shows upcoming publications with countdown timers
-   Lists recently published content (last 24 hours)
-   Manual trigger button for testing
-   Auto-refreshes every 30 seconds

### 3. Auto-Publish Script (`scripts/auto-publish.js`)

-   Command-line script for triggering auto-publish
-   Can be run manually or via cron job
-   Comprehensive logging and error reporting
-   Environment-aware (works with localhost and production)

## Setup Instructions

### Local Development

1. **Test the system manually:**

    ```bash
    # Run the auto-publish script
    node scripts/auto-publish.js

    # Or call the API directly
    curl -X POST http://localhost:3001/api/auto-publish
    ```

2. **Monitor via Dashboard:**
    - Go to Creator Dashboard > Schedule tab
    - Auto-Publish Monitor shows in right sidebar
    - Click "Run Now" to trigger manual publish
    - Watch real-time status updates

### Production Deployment

1. **Set up cron job** (recommended: every 15 minutes):

    ```bash
    # Edit crontab
    crontab -e

    # Add this line (adjust path as needed):
    */15 * * * * cd /path/to/h3-network-platform && node scripts/auto-publish.js >> /var/log/h3-auto-publish.log 2>&1
    ```

2. **Alternative: CI/CD Pipeline**

    ```yaml
    # GitHub Actions example
    - name: Auto-Publish Scheduled Content
      run: |
          curl -X POST https://your-domain.com/api/auto-publish
      cron: '*/15 * * * *'
    ```

3. **Alternative: Vercel Cron (if using Vercel)**
    ```json
    // vercel.json
    {
        "crons": [
            {
                "path": "/api/auto-publish",
                "schedule": "*/15 * * * *"
            }
        ]
    }
    ```

## Usage for H3 Network Creators

### Scheduling Content

1. Go to Creator Dashboard > Schedule tab
2. Click on a future date in the calendar
3. Select content to schedule
4. Set desired publish time
5. Content will automatically publish at that time

### Monitoring Auto-Publish

1. Check the Auto-Publish Monitor (right sidebar)
2. See upcoming publications with countdown timers
3. View recently published content
4. Check system operational status
5. Manually trigger publish if needed

### Perfect for H3 Network Use Cases

-   **Weekly video series**: Schedule entire week's content on Monday
-   **Daily blog posts**: Schedule week's worth of recovery content
-   **Consistent posting**: Maintain regular schedule even when busy
-   **Multi-creator coordination**: Avoid publishing conflicts
-   **Time zone optimization**: Publish at peak audience times

## Content Status Flow

```
DRAFT → SCHEDULED (pending) → PUBLISHED
                ↓
              FAILED (if error)
```

-   **DRAFT**: Content created but not scheduled
-   **PENDING**: Scheduled for future publication
-   **PUBLISHED**: Successfully auto-published
-   **FAILED**: Auto-publish encountered an error

## Error Handling

The system includes comprehensive error handling:

-   Failed publications are marked with FAILED status
-   Error messages stored in database for debugging
-   Logs all activity for monitoring
-   Manual retry capability via dashboard
-   Email notifications (planned future feature)

## Benefits for H3 Network

1. **Consistency**: Never miss a scheduled publication
2. **Efficiency**: Schedule content in batches during free time
3. **Reliability**: Automated system reduces human error
4. **Scale**: Support multiple creators and shows simultaneously
5. **Insights**: Track publishing performance and timing
6. **Professional**: Maintain consistent content schedule for audience

## Future Enhancements

-   Email notifications for successful/failed publications
-   Bulk scheduling across multiple dates
-   Smart scheduling suggestions based on audience analytics
-   Integration with social media auto-posting
-   Advanced retry logic with exponential backoff

---

The auto-publish system is now ready for H3 Network's December launch! 🚀
