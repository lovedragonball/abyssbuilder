import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="space-y-2">
                    <h1 className="text-8xl font-bold text-gradient-primary">404</h1>
                    <h2 className="text-2xl font-semibold">Page Not Found</h2>
                    <p className="text-muted-foreground">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex gap-4 justify-center">
                    <Link href="/">
                        <Button size="lg">
                            Back to Home
                        </Button>
                    </Link>
                    <Link href="/news">
                        <Button variant="outline" size="lg">
                            View News
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
