// State
let fonts = [];
let visibleFonts = new Set();
let allTags = [];

// DOM elements
const previewTextInput = document.getElementById('preview-text');
const fontCatalog = document.getElementById('font-catalog');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontFilters = document.getElementById('font-filters');
const tagFilters = document.getElementById('tag-filters');
const toggleAllBtn = document.getElementById('toggle-all-btn');

// Initialize
async function init() {
    await loadFonts();
    fonts.forEach(font => visibleFonts.add(font.id));
    extractAllTags();
    renderTagFilters();
    renderFilters();
    updateTagButtonStates();
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

// Extract all unique tags from fonts
function extractAllTags() {
    const tagSet = new Set();
    fonts.forEach(font => {
        if (font.tags) {
            font.tags.forEach(tag => tagSet.add(tag));
        }
    });
    allTags = Array.from(tagSet).sort();
}

// Render tag filter buttons
function renderTagFilters() {
    tagFilters.innerHTML = '';

    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-filter-btn';
        btn.textContent = tag;
        btn.dataset.tag = tag;
        btn.addEventListener('click', () => toggleTag(tag));
        tagFilters.appendChild(btn);
    });
}

// Toggle a tag - turns on/off all fonts with this tag
function toggleTag(tag) {
    const fontsWithTag = fonts.filter(f => f.tags && f.tags.includes(tag));
    const allVisible = fontsWithTag.every(f => visibleFonts.has(f.id));

    fontsWithTag.forEach(font => {
        if (allVisible) {
            visibleFonts.delete(font.id);
        } else {
            visibleFonts.add(font.id);
        }

        // Update font filter button
        const btn = fontFilters.querySelector(`[data-font-id="${font.id}"]`);
        if (btn) {
            btn.classList.toggle('active', visibleFonts.has(font.id));
        }

        // Update family header if applicable
        if (font.family) {
            updateFamilyHeaderState(font.family);
        }
    });

    updateTagButtonStates();
    updateToggleAllBtn();
    renderCatalog();
    updateFontSize();
}

// Update tag button states based on visible fonts
function updateTagButtonStates() {
    allTags.forEach(tag => {
        const fontsWithTag = fonts.filter(f => f.tags && f.tags.includes(tag));
        const anyVisible = fontsWithTag.some(f => visibleFonts.has(f.id));
        const btn = tagFilters.querySelector(`[data-tag="${tag}"]`);
        if (btn) {
            btn.classList.toggle('active', anyVisible);
        }
    });
}

// Group fonts by family
function groupFontsByFamily() {
    const families = new Map();
    const standalone = [];

    fonts.forEach(font => {
        if (font.family) {
            if (!families.has(font.family)) {
                families.set(font.family, []);
            }
            families.get(font.family).push(font);
        } else {
            standalone.push(font);
        }
    });

    return { families, standalone };
}

// Render filter buttons grouped by family, in alphabetical order
function renderFilters() {
    fontFilters.innerHTML = '';
    const { families, standalone } = groupFontsByFamily();

    // Create a sorted list of items (families and standalone fonts)
    const items = [];

    families.forEach((familyFonts, familyName) => {
        items.push({ type: 'family', name: familyName, fonts: familyFonts });
    });

    standalone.forEach(font => {
        items.push({ type: 'standalone', name: font.name, font: font });
    });

    // Sort alphabetically by name
    items.sort((a, b) => a.name.localeCompare(b.name, 'he'));

    // Render items in sorted order
    items.forEach(item => {
        if (item.type === 'family') {
            const familyContainer = document.createElement('div');
            familyContainer.className = 'font-family-group';
            familyContainer.dataset.family = item.name;

            const familyHeader = document.createElement('button');
            familyHeader.className = 'font-family-header active';
            familyHeader.textContent = item.name;
            familyHeader.addEventListener('click', () => toggleFamily(item.name));
            familyContainer.appendChild(familyHeader);

            const familyButtons = document.createElement('div');
            familyButtons.className = 'font-family-buttons';

            item.fonts.forEach(font => {
                const btn = document.createElement('button');
                btn.className = 'font-filter-btn active';
                btn.textContent = font.name;
                btn.dataset.fontId = font.id;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFont(font.id);
                });
                familyButtons.appendChild(btn);
            });

            familyContainer.appendChild(familyButtons);
            fontFilters.appendChild(familyContainer);
        } else {
            const btn = document.createElement('button');
            btn.className = 'font-filter-btn active standalone';
            btn.textContent = item.font.name;
            btn.dataset.fontId = item.font.id;
            btn.addEventListener('click', () => toggleFont(item.font.id));
            fontFilters.appendChild(btn);
        }
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

    // Update family header state
    const font = fonts.find(f => f.id === fontId);
    if (font && font.family) {
        updateFamilyHeaderState(font.family);
    }

    updateTagButtonStates();
    updateToggleAllBtn();
    renderCatalog();
    updateFontSize();
}

// Toggle all fonts in a family
function toggleFamily(familyName) {
    const familyFonts = fonts.filter(f => f.family === familyName);
    const allVisible = familyFonts.every(f => visibleFonts.has(f.id));

    familyFonts.forEach(font => {
        if (allVisible) {
            visibleFonts.delete(font.id);
        } else {
            visibleFonts.add(font.id);
        }

        const btn = fontFilters.querySelector(`[data-font-id="${font.id}"]`);
        btn.classList.toggle('active', visibleFonts.has(font.id));
    });

    updateFamilyHeaderState(familyName);
    updateTagButtonStates();
    updateToggleAllBtn();
    renderCatalog();
    updateFontSize();
}

// Update family header active state
function updateFamilyHeaderState(familyName) {
    const familyFonts = fonts.filter(f => f.family === familyName);
    const anyVisible = familyFonts.some(f => visibleFonts.has(f.id));
    const familyGroup = fontFilters.querySelector(`[data-family="${familyName}"]`);
    if (familyGroup) {
        const header = familyGroup.querySelector('.font-family-header');
        header.classList.toggle('active', anyVisible);
    }
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

    fontFilters.querySelectorAll('.font-family-header').forEach(header => {
        const familyName = header.parentElement.dataset.family;
        const familyFonts = fonts.filter(f => f.family === familyName);
        const anyVisible = familyFonts.some(f => visibleFonts.has(f.id));
        header.classList.toggle('active', anyVisible);
    });

    updateTagButtonStates();
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

    fonts
        .filter(font => visibleFonts.has(font.id))
        .forEach(font => {
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
