import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

// Initialize Upstash Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_KV_REST_API_URL || process.env.KV_REST_API_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || '',
});

export interface Subscriber {
    email: string;
    types: string[]; // "weekly" | "fishMaze" | "geniemon"
    createdAt: string;
}

function generateWelcomeEmailHtml(types: string[]): string {
    const typeLabels = types.map(t => {
        switch (t) {
            case 'weekly': return '🟣 Weekly Reset';
            case 'fishMaze': return '🐟 Fish / Maze Reset';
            case 'geniemon': return '🐾 Geniemon Reset';
            default: return t;
        }
    });

    const typeList = typeLabels.map(label => `<li style="margin: 8px 0; font-size: 16px;">${label}</li>`).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: #a78bfa; margin: 0 0 20px 0; font-size: 24px;">🎉 Subscription Confirmed!</h1>
            
            <p style="color: #94a3b8; margin: 0 0 20px 0; font-size: 14px;">
                You have successfully subscribed to the following notifications:
            </p>
            
            <ul style="list-style: none; padding: 0; margin: 0 0 25px 0;">
                ${typeList}
            </ul>
            
            <div style="background: rgba(139, 92, 246, 0.1); border-radius: 8px; padding: 15px; border-left: 3px solid #a78bfa;">
                <p style="margin: 0; font-size: 14px; color: #c4b5fd;">
                    You will receive an email reminder at 04:00 (UTC+7) on the day of these resets.
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, types } = body;

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Validate types
        const validTypes = ['weekly', 'fishMaze', 'geniemon'];
        const selectedTypes = types?.filter((t: string) => validTypes.includes(t)) || [];

        if (selectedTypes.length === 0) {
            return NextResponse.json(
                { error: 'Please select at least one notification type' },
                { status: 400 }
            );
        }

        // Store subscriber in Vercel KV
        const subscriber: Subscriber = {
            email: email.toLowerCase().trim(),
            types: selectedTypes,
            createdAt: new Date().toISOString(),
        };

        // Use email as key (prevents duplicates)
        await redis.hset(`subscriber:${subscriber.email}`, {
            email: subscriber.email,
            types: JSON.stringify(subscriber.types),
            createdAt: subscriber.createdAt,
        });

        // Also add to a set of all subscribers for easy iteration
        await redis.sadd('subscribers', subscriber.email);

        // Send welcome email
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            const resend = new Resend(apiKey);
            try {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'AbyssBuilder <notifications@resend.dev>',
                    to: subscriber.email,
                    subject: '🎉 Subscription Confirmed - AbyssBuilder',
                    html: generateWelcomeEmailHtml(selectedTypes),
                });
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // We don't block the response if email fails, but we log it
            }
        } else {
            console.warn('RESEND_API_KEY is missing, skipping welcome email');
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to notifications!',
            types: selectedTypes,
        });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe. Please try again.' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Remove from Redis
        await redis.del(`subscriber:${normalizedEmail}`);
        await redis.srem('subscribers', normalizedEmail);

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed from notifications.',
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe. Please try again.' },
            { status: 500 }
        );
    }
}
