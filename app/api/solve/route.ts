import { NextResponse } from 'next/server';
import { solve } from '@/lib/solver';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { start, end, mode } = body;

        if (!start || !end || !mode) {
            return NextResponse.json({ error: 'Missing start, end, or mode' }, { status: 400 });
        }

        if (mode !== 'weaver' && mode !== 'weaverx') {
            return NextResponse.json({ error: 'Invalid mode. Must be "weaver" or "weaverx"' }, { status: 400 });
        }

        const result = solve(start, end, mode);

        if ('error' in result) {
            return NextResponse.json(result, { status: 200 }); // Return 200 even on game error to handle gracefully in frontend
        }

        return NextResponse.json(result);

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
