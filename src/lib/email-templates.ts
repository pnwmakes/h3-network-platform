import { Newsletter } from '@prisma/client';

export interface EmailTemplateData {
    newsletter: Newsletter;
    subscriberName?: string;
    unsubscribeUrl: string;
    viewInBrowserUrl: string;
}

export function generateNewsletterHTML(data: EmailTemplateData): string {
    const { newsletter } = data;

    // Get template based on newsletter type
    switch (newsletter.type) {
        case 'SPECIAL_EVENT':
            return generateSpecialEventTemplate(data);
        case 'MAJOR_UPDATE':
            return generateMajorUpdateTemplate(data);
        case 'MONTHLY_SUMMARY':
            return generateMonthlySummaryTemplate(data);
        case 'NEW_CONTENT':
            return generateNewContentTemplate(data);
        default:
            return generateDefaultTemplate(data);
    }
}

function generateSpecialEventTemplate(data: EmailTemplateData): string {
    const {
        newsletter,
        subscriberName = 'Friend',
        unsubscribeUrl,
        viewInBrowserUrl,
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .event-badge {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        .content-text {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
        }
        .cta-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-links a {
            color: #3498db;
            text-decoration: none;
            margin: 0 15px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .unsubscribe {
            color: #95a5a6;
            font-size: 12px;
            margin-top: 20px;
        }
        .unsubscribe a {
            color: #95a5a6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">H3 Network</div>
            <div class="tagline">Hope • Help • Humor</div>
        </div>
        
        <div class="content">
            <div class="event-badge">🎉 Special Event</div>
            
            <h1 class="title">${newsletter.title}</h1>
            
            <p style="font-size: 18px; color: #7f8c8d; margin-bottom: 30px;">
                Hello ${subscriberName},
            </p>
            
            <div class="content-text">
                ${formatNewsletterContent(newsletter.content)}
            </div>
            
            <p style="font-size: 16px; color: #2c3e50; font-weight: bold; margin-bottom: 30px;">
                We hope to see you there! This event is part of our ongoing mission to provide hope, help, and humor to our community.
            </p>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://h3network.org">Visit Website</a>
                <a href="https://h3network.org/videos">Watch Videos</a>
                <a href="https://h3network.org/blog">Read Blog</a>
            </div>
            
            <p style="margin-bottom: 10px;">
                <strong>H3 Network</strong><br>
                Building community through Hope, Help, and Humor
            </p>
            
            <div class="unsubscribe">
                <a href="${viewInBrowserUrl}">View this email in your browser</a> | 
                <a href="${unsubscribeUrl}">Unsubscribe from these emails</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateMajorUpdateTemplate(data: EmailTemplateData): string {
    const {
        newsletter,
        subscriberName = 'Friend',
        unsubscribeUrl,
        viewInBrowserUrl,
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .update-badge {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        .content-text {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
        }
        .highlight-box {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .cta-button {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-links a {
            color: #3498db;
            text-decoration: none;
            margin: 0 15px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .unsubscribe {
            color: #95a5a6;
            font-size: 12px;
            margin-top: 20px;
        }
        .unsubscribe a {
            color: #95a5a6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">H3 Network</div>
            <div class="tagline">Hope • Help • Humor</div>
        </div>
        
        <div class="content">
            <div class="update-badge">📢 Major Update</div>
            
            <h1 class="title">${newsletter.title}</h1>
            
            <p style="font-size: 18px; color: #7f8c8d; margin-bottom: 30px;">
                Hello ${subscriberName},
            </p>
            
            <div class="content-text">
                ${formatNewsletterContent(newsletter.content)}
            </div>
            
            <div class="highlight-box">
                <h3 style="margin-top: 0; margin-bottom: 15px;">Why This Matters</h3>
                <p style="margin-bottom: 0;">
                    This update represents our continued commitment to serving justice-impacted individuals 
                    and their families with resources, support, and community.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://h3network.org">Visit Website</a>
                <a href="https://h3network.org/videos">Watch Videos</a>
                <a href="https://h3network.org/blog">Read Blog</a>
            </div>
            
            <p style="margin-bottom: 10px;">
                <strong>H3 Network</strong><br>
                Building community through Hope, Help, and Humor
            </p>
            
            <div class="unsubscribe">
                <a href="${viewInBrowserUrl}">View this email in your browser</a> | 
                <a href="${unsubscribeUrl}">Unsubscribe from these emails</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateMonthlySummaryTemplate(data: EmailTemplateData): string {
    const {
        newsletter,
        subscriberName = 'Friend',
        unsubscribeUrl,
        viewInBrowserUrl,
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .monthly-badge {
            background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        .content-text {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        .stat-item {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
            color: white;
            border-radius: 8px;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            display: block;
        }
        .stat-label {
            font-size: 14px;
            margin-top: 5px;
        }
        .cta-button {
            background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-links a {
            color: #3498db;
            text-decoration: none;
            margin: 0 15px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .unsubscribe {
            color: #95a5a6;
            font-size: 12px;
            margin-top: 20px;
        }
        .unsubscribe a {
            color: #95a5a6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">H3 Network</div>
            <div class="tagline">Hope • Help • Humor</div>
        </div>
        
        <div class="content">
            <div class="monthly-badge">📊 Monthly Summary</div>
            
            <h1 class="title">${newsletter.title}</h1>
            
            <p style="font-size: 18px; color: #7f8c8d; margin-bottom: 30px;">
                Hello ${subscriberName},
            </p>
            
            <div class="content-text">
                ${formatNewsletterContent(newsletter.content)}
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">15</span>
                    <span class="stat-label">New Videos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">8</span>
                    <span class="stat-label">Blog Posts</span>
                </div>
            </div>
            
            <a href="https://h3network.org" class="cta-button">Explore This Month's Content</a>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://h3network.org">Visit Website</a>
                <a href="https://h3network.org/videos">Watch Videos</a>
                <a href="https://h3network.org/blog">Read Blog</a>
            </div>
            
            <p style="margin-bottom: 10px;">
                <strong>H3 Network</strong><br>
                Building community through Hope, Help, and Humor
            </p>
            
            <div class="unsubscribe">
                <a href="${viewInBrowserUrl}">View this email in your browser</a> | 
                <a href="${unsubscribeUrl}">Unsubscribe from these emails</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateNewContentTemplate(data: EmailTemplateData): string {
    const {
        newsletter,
        subscriberName = 'Friend',
        unsubscribeUrl,
        viewInBrowserUrl,
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .new-content-badge {
            background: linear-gradient(135deg, #00cec9 0%, #00b894 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        .content-text {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
        }
        .content-preview {
            background: linear-gradient(135deg, #81ecec 0%, #74b9ff 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
        }
        .cta-button {
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-links a {
            color: #3498db;
            text-decoration: none;
            margin: 0 15px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .unsubscribe {
            color: #95a5a6;
            font-size: 12px;
            margin-top: 20px;
        }
        .unsubscribe a {
            color: #95a5a6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">H3 Network</div>
            <div class="tagline">Hope • Help • Humor</div>
        </div>
        
        <div class="content">
            <div class="new-content-badge">🎬 New Content</div>
            
            <h1 class="title">${newsletter.title}</h1>
            
            <p style="font-size: 18px; color: #7f8c8d; margin-bottom: 30px;">
                Hello ${subscriberName},
            </p>
            
            <div class="content-text">
                ${formatNewsletterContent(newsletter.content)}
            </div>
            
            <div class="content-preview">
                <h3 style="margin-top: 0; margin-bottom: 15px;">Fresh Content Awaits</h3>
                <p style="margin-bottom: 0;">
                    Don't miss out on our latest videos and articles designed to inspire, 
                    educate, and bring hope to our community.
                </p>
            </div>
            
            <a href="https://h3network.org/videos" class="cta-button">Watch Now</a>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://h3network.org">Visit Website</a>
                <a href="https://h3network.org/videos">Watch Videos</a>
                <a href="https://h3network.org/blog">Read Blog</a>
            </div>
            
            <p style="margin-bottom: 10px;">
                <strong>H3 Network</strong><br>
                Building community through Hope, Help, and Humor
            </p>
            
            <div class="unsubscribe">
                <a href="${viewInBrowserUrl}">View this email in your browser</a> | 
                <a href="${unsubscribeUrl}">Unsubscribe from these emails</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateDefaultTemplate(data: EmailTemplateData): string {
    const {
        newsletter,
        subscriberName = 'Friend',
        unsubscribeUrl,
        viewInBrowserUrl,
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newsletter.subject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            line-height: 1.3;
        }
        .content-text {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-links a {
            color: #3498db;
            text-decoration: none;
            margin: 0 15px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .unsubscribe {
            color: #95a5a6;
            font-size: 12px;
            margin-top: 20px;
        }
        .unsubscribe a {
            color: #95a5a6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">H3 Network</div>
            <div class="tagline">Hope • Help • Humor</div>
        </div>
        
        <div class="content">
            <h1 class="title">${newsletter.title}</h1>
            
            <p style="font-size: 18px; color: #7f8c8d; margin-bottom: 30px;">
                Hello ${subscriberName},
            </p>
            
            <div class="content-text">
                ${formatNewsletterContent(newsletter.content)}
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://h3network.org">Visit Website</a>
                <a href="https://h3network.org/videos">Watch Videos</a>
                <a href="https://h3network.org/blog">Read Blog</a>
            </div>
            
            <p style="margin-bottom: 10px;">
                <strong>H3 Network</strong><br>
                Building community through Hope, Help, and Humor
            </p>
            
            <div class="unsubscribe">
                <a href="${viewInBrowserUrl}">View this email in your browser</a> | 
                <a href="${unsubscribeUrl}">Unsubscribe from these emails</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function formatNewsletterContent(content: string): string {
    // Convert line breaks to HTML paragraphs
    return content
        .split('\n\n')
        .filter((paragraph) => paragraph.trim().length > 0)
        .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`)
        .join('');
}

// Plain text version for email clients that don't support HTML
export function generateNewsletterText(data: EmailTemplateData): string {
    const { newsletter, subscriberName = 'Friend', unsubscribeUrl } = data;

    return `
H3 Network - Hope, Help, Humor

${newsletter.title}

Hello ${subscriberName},

${newsletter.content}

---

Visit our website: https://h3network.org
Watch videos: https://h3network.org/videos
Read our blog: https://h3network.org/blog

H3 Network - Building community through Hope, Help, and Humor

To unsubscribe from these emails, visit: ${unsubscribeUrl}
`.trim();
}
