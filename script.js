// State
let fonts = [];
let currentFontId = null;
let previousFontId = null;
let score = { correct: 0, total: 0 };
let answered = false;
let hardMode = false;

// DOM elements
const fontDisplay = document.getElementById('font-display');
const customWordInput = document.getElementById('custom-word');
const fontOptionsContainer = document.getElementById('font-options');
const correctCount = document.getElementById('correct-count');
const totalCount = document.getElementById('total-count');
const nextBtn = document.getElementById('next-btn');
const hardModeToggle = document.getElementById('hard-mode-toggle');

// Initialize
async function init() {
    await loadFonts();
    renderFontButtons();
    pickRandomFont();
    setupEventListeners();
}

// Load fonts from JSON and inject @font-face rules
async function loadFonts() {
    try {
        const response = await fetch('fonts/fonts.json');
        fonts = await response.json();

        // Load fonts using FontFace API
        const fontPromises = fonts.map(font => {
            const fontFace = new FontFace(font.id, `url('fonts/${font.file}')`);
            return fontFace.load().then(loadedFont => {
                document.fonts.add(loadedFont);
                return loadedFont;
            });
        });

        await Promise.all(fontPromises);

        // Sort fonts alphabetically by Hebrew name
        fonts.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    } catch (error) {
        console.error('Error loading fonts:', error);
        fontOptionsContainer.innerHTML = '<p>שגיאה בטעינת הפונטים. ודאו שקובץ fonts.json קיים.</p>';
    }
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

// Render all font buttons grouped by family, in alphabetical order
function renderFontButtons() {
    fontOptionsContainer.innerHTML = '';
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

            item.fonts.forEach(font => {
                const button = document.createElement('button');
                button.className = 'font-option';
                button.textContent = font.name;
                if (hardMode) {
                    button.style.fontFamily = "'narkiss-block-regular', sans-serif";
                } else {
                    button.style.fontFamily = `'${font.id}'`;
                }
                button.dataset.fontId = font.id;
                button.addEventListener('click', () => handleGuess(font.id));
                familyContainer.appendChild(button);
            });

            fontOptionsContainer.appendChild(familyContainer);
        } else {
            const button = document.createElement('button');
            button.className = 'font-option';
            button.textContent = item.font.name;
            if (hardMode) {
                button.style.fontFamily = "'narkiss-block-regular', sans-serif";
            } else {
                button.style.fontFamily = `'${item.font.id}'`;
            }
            button.dataset.fontId = item.font.id;
            button.addEventListener('click', () => handleGuess(item.font.id));
            fontOptionsContainer.appendChild(button);
        }
    });
}

// Set difficulty mode
function setMode(isHard) {
    hardMode = isHard;
    renderFontButtons();
}

// Pick a random font and apply it to the display
function pickRandomFont() {
    if (fonts.length === 0) return;

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * fonts.length);
    } while (fonts[randomIndex].id === previousFontId && fonts.length > 1);

    previousFontId = currentFontId;
    currentFontId = fonts[randomIndex].id;
    fontDisplay.style.fontFamily = `'${currentFontId}'`;
}

// Handle user's guess
function handleGuess(fontId) {
    if (answered) return;

    answered = true;
    score.total++;

    const buttons = fontOptionsContainer.querySelectorAll('.font-option');

    buttons.forEach(button => {
        button.disabled = true;

        if (button.dataset.fontId === currentFontId) {
            button.classList.add('correct');
        }

        if (button.dataset.fontId === fontId && fontId !== currentFontId) {
            button.classList.add('wrong');
        }
    });

    if (fontId === currentFontId) {
        score.correct++;
    }

    updateScore();
    nextBtn.disabled = false;
}

// Update score display
function updateScore() {
    correctCount.textContent = score.correct;
    totalCount.textContent = score.total;
}

// Move to next question
function nextQuestion() {
    answered = false;
    nextBtn.disabled = true;

    // Reset button states
    const buttons = fontOptionsContainer.querySelectorAll('.font-option');
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
    });

    pickRandomFont();
}

// Setup event listeners
function setupEventListeners() {
    // Update displayed word when input changes
    customWordInput.addEventListener('input', (e) => {
        fontDisplay.textContent = e.target.value || 'שלום';
    });

    // Next button
    nextBtn.addEventListener('click', nextQuestion);

    // Mode toggle
    hardModeToggle.addEventListener('change', (e) => setMode(e.target.checked));
}

// Start the app
init();
