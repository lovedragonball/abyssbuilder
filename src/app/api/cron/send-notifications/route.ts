import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';

// Initialize Resend client inside the handler to avoid build-time errors
// const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Upstash Redis client inside handler
// const redis = new Redis({ ... });

// Base dates for cyclic resets (21:00 UTC = 04:00 UTC+7 next day)
const FISH_MAZE_BASE = new Date(Date.UTC(2025, 10, 23, 21, 0, 0, 0));
const GENIEMON_BASE = new Date(Date.UTC(2025, 9, 28, 21, 0, 0, 0));

interface Subscriber {
    email: string;
    types: string[];
    createdAt: string;
}

function getTodayResets(): string[] {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const resets: string[] = [];

    // Weekly: Monday
    if (today.getUTCDay() === 1) {
        resets.push('weekly');
    }

    // Fish/Maze: Every 28 days
    const fishDiff = Math.floor((today.getTime() - FISH_MAZE_BASE.getTime()) / (24 * 60 * 60 * 1000));
    if (fishDiff >= 0 && fishDiff % 28 === 0) {
        resets.push('fishMaze');
    }

    // Geniemon: Every 3 days
    const geniemonDiff = Math.floor((today.getTime() - GENIEMON_BASE.getTime()) / (24 * 60 * 60 * 1000));
    if (geniemonDiff >= 0 && geniemonDiff % 3 === 0) {
        resets.push('geniemon');
    }

    return resets;
}

function getResetLabel(type: string): string {
    switch (type) {
        case 'weekly': return '🟣 Weekly Reset';
        case 'fishMaze': return '🐟 Fish / Maze Reset';
        case 'geniemon': return '🐾 Geniemon Reset';
        default: return type;
    }
}

function generateEmailHtml(resets: string[]): string {
    const resetItems = resets.map(r => `<li style="margin: 8px 0; font-size: 16px;">${getResetLabel(r)}</li>`).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: #a78bfa; margin: 0 0 20px 0; font-size: 24px;">🔔 Server Reset Reminder</h1>
            
            <p style="color: #94a3b8; margin: 0 0 20px 0; font-size: 14px;">
                Today's resets at <strong style="color: #ffffff;">04:00 (UTC+7)</strong>:
            </p>
            
            <ul style="list-style: none; padding: 0; margin: 0 0 25px 0;">
                ${resetItems}
            </ul>
            
            <div style="background: rgba(139, 92, 246, 0.1); border-radius: 8px; padding: 15px; border-left: 3px solid #a78bfa;">
                <p style="margin: 0; font-size: 14px; color: #c4b5fd;">
                    💡 Don't forget to claim your rewards before the reset!
                </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 25px 0;">
            
            <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
                Sent from <a href="https://abyssbuilder.vercel.app" style="color: #a78bfa; text-decoration: none;">AbyssBuilder</a>
            </p>
        </div>
    </body>
    </html>
    `;
}

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.error("RESEND_API_KEY is missing");
            return NextResponse.json({ error: 'Configuration error: Missing Email API Key' }, { status: 500 });
        }
        const resend = new Resend(apiKey);

        const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_KV_REST_API_URL || process.env.KV_REST_API_URL;
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

        if (!redisUrl || !redisToken) {
            console.error("Redis configuration missing");
            return NextResponse.json({ error: 'Configuration error: Missing Redis credentials' }, { status: 500 });
        }

        const redis = new Redis({
            url: redisUrl,
            token: redisToken,
        });

        // Verify cron secret (optional security measure)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's resets
        const todayResets = getTodayResets();

        if (todayResets.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No special resets today',
                emailsSent: 0,
            });
        }

        // Get all subscribers
        const subscriberEmails = await redis.smembers('subscribers') as string[];

        if (!subscriberEmails || subscriberEmails.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No subscribers',
                emailsSent: 0,
            });
        }

        let emailsSent = 0;
        const errors: string[] = [];

        // Send emails to each subscriber
        for (const email of subscriberEmails) {
            try {
                const subscriberData = await redis.hgetall(`subscriber:${email}`) as { email: string; types: string; createdAt: string } | null;

                if (!subscriberData || !subscriberData.types) continue;

                // Parse types from JSON string
                const subscriberTypes: string[] = typeof subscriberData.types === 'string'
                    ? JSON.parse(subscriberData.types)
                    : subscriberData.types;

                // Find matching resets for this subscriber
                const matchingResets = todayResets.filter(r => subscriberTypes.includes(r));

                if (matchingResets.length === 0) continue;

                // Send email
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'AbyssBuilder <notifications@resend.dev>',
                    to: subscriberData.email,
                    subject: `🔔 Server Reset Today: ${matchingResets.map(r => getResetLabel(r).split(' ').slice(1).join(' ')).join(', ')}`,
                    html: generateEmailHtml(matchingResets),
                });

                emailsSent++;
            } catch (emailError) {
                console.error(`Failed to send email to ${email}:`, emailError);
                errors.push(email);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${emailsSent} notification emails`,
            todayResets,
            emailsSent,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Failed to send notifications' },
            { status: 500 }
        );
    }
}
