#!/usr/bin/env node

/**
 * H3 Network Auto-Publish Scheduler
 * 
 * This script can be run as a cron job to automatically publish scheduled content.
 * It calls the auto-publish API endpoint to check for content that should be published.
 * 
 * Usage:
 * - Run manually: node scripts/auto-publish.js
 * - Run as cron job: Add to crontab for regular execution
 * 
 * Recommended cron schedule (runs every 15 minutes):
 * */15 * * * * cd /path/to/h3-network-platform && node scripts/auto-publish.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001';
const AUTO_PUBLISH_ENDPOINT = '/api/auto-publish';

async function triggerAutoPublish() {
    const url = new URL(AUTO_PUBLISH_ENDPOINT, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'H3-Network-Auto-Publisher/1.0',
        },
    };

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ status: res.statusCode, data: result });
                } catch (error) {
                    resolve({ status: res.statusCode, data: { raw: data } });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function main() {
    const timestamp = new Date().toISOString();
    console.log(`🚀 H3 Network Auto-Publish Starting at ${timestamp}`);
    console.log(`📡 Calling: ${BASE_URL}${AUTO_PUBLISH_ENDPOINT}`);

    try {
        const { status, data } = await triggerAutoPublish();

        if (status === 200 && data.success) {
            console.log(`✅ Auto-publish completed successfully`);
            console.log(`📊 Summary: ${data.summary.total} total, ${data.summary.published} published, ${data.summary.failed} failed`);
            
            if (data.results && data.results.length > 0) {
                console.log(`📋 Details:`);
                data.results.forEach((result, index) => {
                    const icon = result.status === 'published' ? '✅' : '❌';
                    console.log(`   ${icon} ${result.type}: "${result.title}" by ${result.creator} - ${result.status}`);
                    if (result.error) {
                        console.log(`      Error: ${result.error}`);
                    }
                });
            } else {
                console.log(`📋 No content was ready for publishing`);
            }
        } else {
            console.error(`❌ Auto-publish failed with status ${status}`);
            console.error(`📋 Response:`, data);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Auto-publish error:`, error.message);
        console.error(`📋 Full error:`, error);
        process.exit(1);
    }

    console.log(`🏁 Auto-publish completed at ${new Date().toISOString()}`);
}

// Run the auto-publish check
main().catch((error) => {
    console.error(`💥 Fatal error:`, error);
    process.exit(1);
});

// Export for potential use as a module
module.exports = { triggerAutoPublish };