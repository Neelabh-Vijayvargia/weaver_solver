import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { word } = await req.json();

        if (!word) {
            return NextResponse.json({ error: 'Word is required' }, { status: 400 });
        }

        const wordsPath = path.join(process.cwd(), 'data', 'words.txt');

        // Read current words
        const fileContent = fs.readFileSync(wordsPath, 'utf-8');
        const words = fileContent.split('\n');

        const target = word.trim();

        // Filter out the word
        const newWords = words.filter(w => w.trim() !== target);

        if (newWords.length === words.length) {
            return NextResponse.json({ message: `Word "${target}" not found` }, { status: 404 });
        }

        // Write back
        fs.writeFileSync(wordsPath, newWords.join('\n'));

        return NextResponse.json({ message: `Successfully deleted "${target}"` });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
