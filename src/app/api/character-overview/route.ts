import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const characterName = searchParams.get('name');

    if (!characterName) {
        return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }

    try {
        const url = `https://dna.interknot-network.com/#character/${characterName}/overview`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch character data');
        }

        const html = await response.text();

        // Extract the content section
        const contentMatch = html.match(/<article id="content">([\s\S]*?)<\/article>/);
        
        // Extract CSS links and styles from the original page
        const cssLinks = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/g) || [];
        const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [];
        
        if (contentMatch) {
            const content = contentMatch[0];
            
            // Build complete HTML with styles
            const styledContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <base href="https://dna.interknot-network.com/">
                    ${cssLinks.join('\n')}
                    ${styleBlocks.join('\n')}
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            background: transparent;
                            overflow-x: hidden;
                        }
                        /* Hide any navigation or unwanted elements */
                        nav:not(.content-nav), header, footer, .site-header, .site-footer {
                            display: none !important;
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `;
            
            return new NextResponse(styledContent, {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600',
                },
            });
        }

        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    } catch (error) {
        console.error('Error fetching character overview:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch character overview',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
