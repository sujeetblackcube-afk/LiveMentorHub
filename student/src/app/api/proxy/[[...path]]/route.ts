import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://clussplus.auby.in";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    return handleRequest(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    return handleRequest(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    return handleRequest(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    return handleRequest(req, params);
}

async function handleRequest(req: NextRequest, paramsPromise: Promise<{ path?: string[] }>) {
    const { path } = await paramsPromise;
    const fullPath = path ? path.join("/") : "";
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/${fullPath}${searchParams ? '?' + searchParams : ''}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const headers = new Headers();
        req.headers.forEach((value, key) => {
            const k = key.toLowerCase();
            // Most critical: remove hop-by-hop headers
            if (![
                'host', 'connection', 'keep-alive', 'proxy-authenticate',
                'proxy-authorization', 'te', 'trailer', 'transfer-encoding',
                'upgrade', 'content-length'
            ].includes(k)) {
                headers.set(key, value);
            }
        });

        // Use duplex: 'half' for streaming support in Next.js/Undici
        const res = await fetch(url, {
            method: req.method,
            headers: headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? null : await req.text(),
            signal: controller.signal,
            // @ts-ignore - duplex is required for some environments
            duplex: 'half'
        });

        clearTimeout(timeoutId);

        const contentType = res.headers.get("content-type");
        const bodyText = await res.text();

        const responseHeaders = new Headers();
        if (contentType) responseHeaders.set("Content-Type", contentType);

        return new NextResponse(bodyText, {
            status: res.status,
            headers: responseHeaders
        });
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            return NextResponse.json({ success: false, message: "Backend response timeout" }, { status: 504 });
        }
        console.error("[Proxy Error]:", err);
        return NextResponse.json({ success: false, message: "Backend unreachable via proxy" }, { status: 502 });
    }
}
