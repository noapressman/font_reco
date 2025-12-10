// State
let fonts = [];

// DOM elements
const previewTextInput = document.getElementById('preview-text');
const fontCatalog = document.getElementById('font-catalog');

// Initialize
async function init() {
    await loadFonts();
    renderCatalog();
    setupEventListeners();
}

// Load fonts from JSON and inject @font-face rules
async function loadFonts() {
    try {
        const response = await fetch('fonts/fonts.json');
        fonts = await response.json();

        // Create style element for @font-face rules
        const styleEl = document.createElement('style');
        let cssRules = '';

        fonts.forEach(font => {
            let format = 'truetype'; // default for .ttf
            if (font.file.endsWith('.woff2')) format = 'woff2';
            else if (font.file.endsWith('.woff')) format = 'woff';
            else if (font.file.endsWith('.otf')) format = 'opentype';

            cssRules += `
                @font-face {
                    font-family: '${font.id}';
                    src: url('fonts/${font.file}') format('${format}');
                    font-display: swap;
                }
            `;
        });

        styleEl.textContent = cssRules;
        document.head.appendChild(styleEl);

        // Sort fonts alphabetically by Hebrew name
        fonts.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    } catch (error) {
        console.error('Error loading fonts:', error);
        fontCatalog.innerHTML = '<p>שגיאה בטעינת הפונטים. ודאו שקובץ fonts.json קיים.</p>';
    }
}

// Render all fonts in the catalog
function renderCatalog() {
    const previewText = previewTextInput.value || 'שלום עולם';
    fontCatalog.innerHTML = '';

    fonts.forEach(font => {
        const card = document.createElement('div');
        card.className = 'font-card';

        const nameEl = document.createElement('div');
        nameEl.className = 'font-name';
        nameEl.textContent = font.name;

        const previewEl = document.createElement('div');
        previewEl.className = 'font-preview';
        previewEl.style.fontFamily = `'${font.id}'`;
        previewEl.textContent = previewText;

        card.appendChild(nameEl);
        card.appendChild(previewEl);
        fontCatalog.appendChild(card);
    });
}

// Update all previews when text changes
function updatePreviews() {
    const previewText = previewTextInput.value || 'שלום עולם';
    const previews = fontCatalog.querySelectorAll('.font-preview');
    previews.forEach(preview => {
        preview.textContent = previewText;
    });
}

// Setup event listeners
function setupEventListeners() {
    previewTextInput.addEventListener('input', updatePreviews);
}

// Start the app
init();
