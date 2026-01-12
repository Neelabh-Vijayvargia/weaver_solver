# Weaver / Weaver X Solver

Minimal MVP solver for word ladder puzzles.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Download dictionary (if not present):
   Ensure `data/words.txt` exists. 
   
   If not, run:
   ```bash
   mkdir -p data && curl -L https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt -o data/words.txt
   ```

## Web App

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- **Weaver**: Substitution only (e.g., `cat` -> `bat` -> `bag` -> `bog` -> `dog`).
- **Weaver X**: Substitution, Insertion, Deletion.

## API

`POST /api/solve`
```json
{
  "start": "cat",
  "end": "dog",
  "mode": "weaver" 
}
```
