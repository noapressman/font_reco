# Hebrew Font Recognition Quiz

A web-based tool for learning to identify Hebrew fonts. Users are shown text in a random font and must guess which font it is from a list of options.

## Project Structure

```
font_reco/
├── index.html              # Main quiz page
├── script.js               # Quiz logic (font loading, scoring, game flow)
├── styles.css              # Quiz page styles
├── catalog.html            # Font catalog - browse all fonts with custom preview text
├── catalog.js              # Catalog logic
├── catalog.css             # Catalog styles
├── bezalel-catalog.html    # Embedded PDF viewer for Bezalel Hebrew Type Catalog
├── Bezalel Hebrew Type Cat 2020.pdf  # Reference PDF catalog
└── fonts/
    ├── fonts.json          # Font metadata (id, Hebrew name, filename)
    └── *.otf               # Font files
```

## Pages

1. **Quiz (index.html)**: Displays a word in a random font. User guesses the font from buttons showing each font's name in its own typeface. Tracks correct/total score.

2. **Font Catalog (catalog.html)**: Lists all fonts with a preview. User can type custom text to see how it renders in each font.

3. **Bezalel Catalog (bezalel-catalog.html)**: Embedded PDF viewer for the Bezalel Hebrew Type Catalog 2020.

## Adding New Fonts

1. Add the font file (`.otf`, `.ttf`, `.woff`, `.woff2`) to the `fonts/` directory
2. Add an entry to `fonts/fonts.json`:
   ```json
   { "id": "unique-id", "name": "Hebrew Display Name", "file": "FontFileName.otf" }
   ```

The fonts are sorted alphabetically by Hebrew name in the UI.

## Running Locally

The app uses `fetch()` to load fonts.json, which requires a local server (won't work with file:// protocol due to CORS).

```bash
cd /path/to/font_reco
python3 -m http.server 8000
```

Then open `http://localhost:8000`

## Technical Notes

- UI font: Narkiss Block Regular (loaded via @font-face in CSS files)
- Language: Hebrew (RTL)
- Quiz fonts loaded dynamically using FontFace API
- Catalog fonts loaded via @font-face CSS injection
- No build process or dependencies - vanilla HTML/CSS/JS
