import fs from 'fs';
import path from 'path';

// Singleton to hold loaded words
let validWords: Set<string> | null = null;

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

function loadWords(): Set<string> {
  if (validWords) return validWords;

  try {
    const filePath = path.join(process.cwd(), 'data', 'words.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    validWords = new Set(
      fileContent
        .split(/\r?\n/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0) // words_alpha has no numbers
    );
    console.log(`Loaded ${validWords.size} words.`);
  } catch (error) {
    console.error('Failed to load words:', error);
    validWords = new Set();
  }
  return validWords!;
}

function getNeighbors(word: string, mode: 'weaver' | 'weaverx', vocabulary: Set<string>): string[] {
  const neighbors: string[] = [];
  const chars = word.split('');
  
  // 1. Substitutions (Weaver & Weaver X)
  for (let i = 0; i < chars.length; i++) {
    const original = chars[i];
    for (const letter of ALPHABET) {
      if (letter === original) continue;
      chars[i] = letter;
      const candidate = chars.join('');
      if (vocabulary.has(candidate)) {
        neighbors.push(candidate);
      }
    }
    chars[i] = original; // Restore
  }

  if (mode === 'weaverx') {
    // 2. Insertions
    // Insert at every position (0 to length)
    for (let i = 0; i <= chars.length; i++) {
      for (const letter of ALPHABET) {
        const candidate = word.slice(0, i) + letter + word.slice(i);
        if (vocabulary.has(candidate)) {
          neighbors.push(candidate);
        }
      }
    }

    // 3. Deletions
    // Delete at every position
    if (word.length > 1) { // Assuming words must be at least 1 char? Usually 2+ for puzzles basically
        for (let i = 0; i < chars.length; i++) {
        const candidate = word.slice(0, i) + word.slice(i + 1);
        if (vocabulary.has(candidate)) {
            neighbors.push(candidate);
        }
        }
    }
  }

  return neighbors;
}

export type SolveResult = {
  path: string[];
  steps: number;
} | { error: string };

export function solve(start: string, end: string, mode: 'weaver' | 'weaverx'): SolveResult {
  const vocabulary = loadWords();

  const startLower = start.toLowerCase().trim();
  const endLower = end.toLowerCase().trim();

  if (!vocabulary.has(startLower)) return { error: `Start word "${start}" not found in dictionary.` };
  if (!vocabulary.has(endLower)) return { error: `End word "${end}" not found in dictionary.` };

  if (mode === 'weaver' && startLower.length !== endLower.length) {
    return { error: 'In Weaver mode, start and end words must have the same length.' };
  }

  if (startLower === endLower) {
    return { path: [startLower], steps: 0 };
  }

  // BFS
  const queue: string[][] = [[startLower]]; // Queue of paths
  const visited = new Set<string>([startLower]);
  
  // Safety limits
  let iterations = 0;
  const MAX_ITERATIONS = 200000; 

  while (queue.length > 0) {
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      return { error: 'Search limit exceeded. No solution found within reasonable time.' };
    }

    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (path.length > 50) {
        // Depth limit to prevent infinite loops in weird graph cycles if visited check fails (unlikely)
        continue;
    }

    // Optimization: If current is neighbor of end, we are done + 1
    // Actually, simple BFS is fine.
    
    const neighbors = getNeighbors(current, mode, vocabulary);

    for (const neighbor of neighbors) {
      if (neighbor === endLower) {
        return { path: [...path, neighbor], steps: path.length };
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return { error: 'No solution found.' };
}
