import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const FALLBACK_PATH = path.join(process.cwd(), "public", "social", "facebook-fallback.json")

export async function GET() {
    try {
        const raw = await fs.readFile(FALLBACK_PATH, "utf-8")
        const json = JSON.parse(raw)
        return NextResponse.json({ posts: json.posts }, { status: 200 })
    } catch (error) {
        console.error("Facebook API error:", error)
        return NextResponse.json({
            posts: [
                {
                    id: "fb-fallback-error",
                    message: "Unable to load latest posts. Please check our official page.",
                    postUrl: "https://www.facebook.com/DNAbyss.Official",
                    createdTime: "Now"
                }
            ]
        }, { status: 200 })
    }
}
