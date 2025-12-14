import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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
