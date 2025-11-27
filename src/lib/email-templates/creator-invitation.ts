/**
 * Email Template for Creator Invitations
 * 
 * This template is used when a super admin invites a new creator to the platform.
 * It includes credentials and instructions for setting a password.
 */

interface CreatorInvitationEmailProps {
    creatorName: string;
    creatorEmail: string;
    tempPassword: string;
    resetToken: string;
    invitedBy: string;
}

export function getCreatorInvitationEmailHTML({
    creatorName,
    creatorEmail,
    tempPassword,
    resetToken,
    invitedBy,
}: CreatorInvitationEmailProps): string {
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/set-password/${resetToken}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to H3 Network</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .credentials {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .credentials-item {
            margin: 10px 0;
        }
        .credentials-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 14px;
        }
        .credentials-value {
            font-family: 'Courier New', monospace;
            background-color: #e5e7eb;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 5px;
            display: inline-block;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #1d4ed8;
        }
        .instructions {
            margin: 20px 0;
            padding: 15px;
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            border-radius: 4px;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">H3 Network</div>
            <p style="color: #6b7280;">Criminal Justice Reform • Recovery • Reentry Support</p>
        </div>

        <h1 class="title">Welcome to H3 Network!</h1>

        <p>Hi ${creatorName},</p>

        <p>Great news! ${invitedBy} has invited you to join H3 Network as a content creator. We're excited to have you on board to share your unique perspective and contribute to our mission of criminal justice reform, addiction recovery, and reentry support.</p>

        <div class="credentials">
            <h3 style="margin-top: 0; color: #1f2937;">Your Login Credentials</h3>
            <div class="credentials-item">
                <div class="credentials-label">Email Address:</div>
                <div class="credentials-value">${creatorEmail}</div>
            </div>
            <div class="credentials-item">
                <div class="credentials-label">Temporary Password:</div>
                <div class="credentials-value">${tempPassword}</div>
            </div>
        </div>

        <div class="warning">
            <strong>⚠️ Important:</strong> For security reasons, you must set your own password before you can start using the platform.
        </div>

        <div style="text-align: center;">
            <a href="${resetLink}" class="cta-button">Set Your Password</a>
        </div>

        <div class="instructions">
            <h3 style="margin-top: 0; color: #1f2937;">Getting Started</h3>
            <ol>
                <li>Click the "Set Your Password" button above</li>
                <li>Create a strong, secure password (at least 8 characters)</li>
                <li>Log in to your creator dashboard</li>
                <li>Complete your profile with bio, social links, and profile picture</li>
                <li>Start creating and scheduling content!</li>
            </ol>
        </div>

        <p><strong>What you can do as a creator:</strong></p>
        <ul>
            <li>Publish and schedule video content (YouTube embeds)</li>
            <li>Write and publish blog posts</li>
            <li>Manage your content calendar</li>
            <li>Track engagement and analytics</li>
            <li>Connect with the H3 Network community</li>
        </ul>

        <p>If you have any questions or need assistance, please don't hesitate to reach out to the H3 Network admin team.</p>

        <div class="footer">
            <p>This invitation link will expire in 24 hours.</p>
            <p>If you did not expect this invitation or have concerns, please contact: <a href="mailto:admin@h3network.org">admin@h3network.org</a></p>
            <p style="margin-top: 20px;">© ${new Date().getFullYear()} H3 Network. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
}

export function getCreatorInvitationEmailText({
    creatorName,
    creatorEmail,
    tempPassword,
    resetToken,
    invitedBy,
}: CreatorInvitationEmailProps): string {
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/set-password/${resetToken}`;

    return `
Welcome to H3 Network!

Hi ${creatorName},

Great news! ${invitedBy} has invited you to join H3 Network as a content creator. We're excited to have you on board to share your unique perspective and contribute to our mission of criminal justice reform, addiction recovery, and reentry support.

YOUR LOGIN CREDENTIALS
-----------------------
Email Address: ${creatorEmail}
Temporary Password: ${tempPassword}

IMPORTANT: For security reasons, you must set your own password before you can start using the platform.

Set Your Password: ${resetLink}

GETTING STARTED
---------------
1. Click the link above to set your password
2. Create a strong, secure password (at least 8 characters)
3. Log in to your creator dashboard
4. Complete your profile with bio, social links, and profile picture
5. Start creating and scheduling content!

What you can do as a creator:
• Publish and schedule video content (YouTube embeds)
• Write and publish blog posts
• Manage your content calendar
• Track engagement and analytics
• Connect with the H3 Network community

If you have any questions or need assistance, please don't hesitate to reach out to the H3 Network admin team.

---
This invitation link will expire in 24 hours.

If you did not expect this invitation or have concerns, please contact: admin@h3network.org

© ${new Date().getFullYear()} H3 Network. All rights reserved.
`;
}
