// State
let fonts = [];
let currentFontId = null;
let score = { correct: 0, total: 0 };
let answered = false;

// DOM elements
const fontDisplay = document.getElementById('font-display');
const customWordInput = document.getElementById('custom-word');
const fontOptionsContainer = document.getElementById('font-options');
const correctCount = document.getElementById('correct-count');
const totalCount = document.getElementById('total-count');
const nextBtn = document.getElementById('next-btn');

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

// Render all font buttons
function renderFontButtons() {
    fontOptionsContainer.innerHTML = '';

    fonts.forEach(font => {
        const button = document.createElement('button');
        button.className = 'font-option';
        button.textContent = font.name;
        button.style.fontFamily = `'${font.id}'`;
        button.dataset.fontId = font.id;
        button.addEventListener('click', () => handleGuess(font.id));
        fontOptionsContainer.appendChild(button);
    });
}

// Pick a random font and apply it to the display
function pickRandomFont() {
    if (fonts.length === 0) return;

    const randomIndex = Math.floor(Math.random() * fonts.length);
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
}

// Start the app
init();
