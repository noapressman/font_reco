// State
let fonts = [];
let visibleFonts = new Set();

// DOM elements
const previewTextInput = document.getElementById('preview-text');
const fontCatalog = document.getElementById('font-catalog');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontFilters = document.getElementById('font-filters');
const toggleAllBtn = document.getElementById('toggle-all-btn');

// Initialize
async function init() {
    await loadFonts();
    fonts.forEach(font => visibleFonts.add(font.id));
    renderFilters();
    renderCatalog();
    setupEventListeners();
    updateFontSize();
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

// Render filter buttons
function renderFilters() {
    fontFilters.innerHTML = '';

    fonts.forEach(font => {
        const btn = document.createElement('button');
        btn.className = 'font-filter-btn active';
        btn.textContent = font.name;
        btn.dataset.fontId = font.id;
        btn.addEventListener('click', () => toggleFont(font.id));
        fontFilters.appendChild(btn);
    });

    updateToggleAllBtn();
}

// Toggle a font's visibility
function toggleFont(fontId) {
    if (visibleFonts.has(fontId)) {
        visibleFonts.delete(fontId);
    } else {
        visibleFonts.add(fontId);
    }

    const btn = fontFilters.querySelector(`[data-font-id="${fontId}"]`);
    btn.classList.toggle('active', visibleFonts.has(fontId));

    updateToggleAllBtn();
    renderCatalog();
    updateFontSize();
}

// Toggle all fonts
function toggleAllFonts() {
    const allVisible = visibleFonts.size === fonts.length;

    if (allVisible) {
        visibleFonts.clear();
    } else {
        fonts.forEach(font => visibleFonts.add(font.id));
    }

    fontFilters.querySelectorAll('.font-filter-btn').forEach(btn => {
        btn.classList.toggle('active', visibleFonts.has(btn.dataset.fontId));
    });

    updateToggleAllBtn();
    renderCatalog();
    updateFontSize();
}

// Update toggle all button text
function updateToggleAllBtn() {
    const allVisible = visibleFonts.size === fonts.length;
    toggleAllBtn.textContent = allVisible ? 'בטל הכל' : 'בחר הכל';
}

// Render all fonts in the catalog
function renderCatalog() {
    const previewText = previewTextInput.value || 'שלום עולם';
    fontCatalog.innerHTML = '';

    fonts.filter(font => visibleFonts.has(font.id)).forEach(font => {
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

// Update font size from slider
function updateFontSize() {
    const size = fontSizeSlider.value;
    const previews = fontCatalog.querySelectorAll('.font-preview');
    previews.forEach(preview => {
        preview.style.fontSize = `${size}rem`;
    });
}

// Setup event listeners
function setupEventListeners() {
    previewTextInput.addEventListener('input', updatePreviews);
    fontSizeSlider.addEventListener('input', updateFontSize);
    toggleAllBtn.addEventListener('click', toggleAllFonts);
}

// Start the app
init();
