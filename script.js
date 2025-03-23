// French words for the game
const frenchWordsByDifficulty = {
    pasiuni: [
        "JOUER", "DESSINER", "CHANTER", "DANSER", "CUISINER", 
        "ÉCOUTER LA RADIO", "LIRE", "NAGER", "PEINDRE", "FAIRE DU VELO", 
        "CONSTRUIRE", "COUDRE", "SCULPTER", "APPRENDRE UNE LANGUE ", "FAIRE DU SPORT"
    ],
    materii: [
        "MATHÉMATIQUES", "PHYSIQUE", "CHIMIE", "BIOLOGIE", "HISTOIRE", 
        "GÉOGRAPHIE", "FRANÇAIS", "ANGLAIS", "ESPAGNOL", "ALLEMAND", 
        "INFORMATIQUE", "PHILOSOPHIE", "ÉDUCATION CIVIQUE", "MUSIQUE", "ARTS PLASTIQUES"
    ],
    numere: [
        "DOUZE", "VINGT-SEPT", "QUARANTE-TROIS", "CINQ", "SOIXANTE-DEUX",
         "QUINZE", "TRENTE-NEUF", "HUIT", "CINQUANTE-QUATRE", "SOIXANTE-DIX",
         "NEUF", "QUATRE-VINGT-CINQ", "TRENTE-DEUX", "ONZE", "QUATRE"
    ],
    tari: [
        "FRANCE", "ALLEMAGNE", "ITALIE", "ESPAGNE", "ROYAUME-UNI",
        "JAPON", "CHINE", "INDONÉSIE", "BRÉSIL", "ÉTATS-UNIS",
        "CANADA", "AUSTRALIE", "AFRIQUE DU SUD", "ÉGYPTE", "MEXIQUE"
    ],
    monumente: [
        "EIFFEL", "TOUR EIFFEL", "TOUR DE PISE", "TOUR DE PISA", "TOUR DE PISA",
        "TOUR DE PISA", "TOUR DE PISA", "TOUR DE PISA", "TOUR DE PISA", "TOUR DE PISA",
        "TOUR DE PISA", "TOUR DE PISA", "TOUR DE PISA", "TOUR DE PISA", "TOUR DE PISA"
    ],
    actori: [
        "JEAN PAUL BELMONDO", "GERARD DEPARDIEU", "MARION COTILLARD", "AUDREY HEPBURN", "OLIVIER MARCHAL",
        "ISABELLE HUPPERT", "RICHARD BERRY", "CATHERINE DENEUVE", "LOUIS DE FUNÈS", "JULIETTE BINOCHE",
        "PIERRE RICHARD", "FRANÇOIS CLUZET", "VANESSA PARADIS", "JACQUES PERRIN", "NATHALIE BAYE"
    ],
    incaperi: [
        "SALLE DE BAIN", "CUISINE", "CHAMBRE", "SALON", "BUREAU", 
        "DRESSING", "WC", "COULOIR", "JARDIN", "CELLIER",
        "GARAGE", "VERANDA", "COMMODE", "SOUS-SOL", "ATELIER"
    ]
};

// French alphabet with frequency weights
const frenchAlphabet = {
    'A': 8, 'B': 1, 'C': 3, 'D': 3, 'E': 15, 
    'F': 1, 'G': 1, 'H': 1, 'I': 7, 'J': 1, 
    'K': 0.5, 'L': 5, 'M': 3, 'N': 7, 'O': 5, 
    'P': 3, 'Q': 1, 'R': 6, 'S': 8, 'T': 7, 
    'U': 6, 'V': 2, 'W': 0.1, 'X': 0.5, 'Y': 0.5, 'Z': 0.5
};

// Game variables
let grid = [];
let selectedCells = [];
let currentWord = "";
let words = [];
let foundWords = [];
let score = 0;
let timer;
let timeLeft = 300; // 5 minutes
let isPaused = false;
let isTimerStarted = false;
let isTouchDevice = false;
let isSelecting = false;

// DOM elements
const gridElement = document.getElementById('grid');
const wordListElement = document.getElementById('word-list');
const currentWordElement = document.getElementById('current-word');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const difficultySelect = document.getElementById('difficulty');
const newGameButton = document.getElementById('new-game');
const startTimerButton = document.createElement('button');
const pauseButton = document.createElement('button');

// Initialize the game
function initGame() {
    clearInterval(timer);
    grid = [];
    selectedCells = [];
    currentWord = "";
    foundWords = [];
    score = 0;
    timeLeft = 300;
    isPaused = true
    isTimerStarted = false;
    
    // Get selected difficulty
    const difficulty = difficultySelect.value;
    words = [...frenchWordsByDifficulty[difficulty]];
    
    // Update UI
    scoreElement.textContent = score;
    updateTimer();
    
    // Create grid
    createGrid();
    placeWords();
    fillEmptyCells();
    renderGrid();
    renderWordList();
    


    // Update button states
    startTimerButton.textContent = "Démarrer";
    startTimerButton.disabled = false;
    pauseButton.textContent = "Pause";
    pauseButton.disabled = true;
}

// Create empty grid
function createGrid() {
    for (let i = 0; i < 20; i++) {
        grid[i] = [];
        for (let j = 0; j < 20; j++) {
            grid[i][j] = '';
        }
    }
}

// Place words in the grid
function placeWords() {
    const directions = [
        [0, 1],   // right
        [1, 0],   // down
       // [1, 1],   // diagonal down-right
       // [1, -1],  // diagonal down-left
        [0, -1],  // left
        [-1, 0],  // up
       // [-1, 1],  // diagonal up-right
      //  [-1, -1]  // diagonal up-left
    ];

    for (const word of words) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            attempts++;
            
            // Random starting position
            const row = Math.floor(Math.random() * 20);
            const col = Math.floor(Math.random() * 20);
            
            // Random direction
            const dirIndex = Math.floor(Math.random() * directions.length);
            const [dRow, dCol] = directions[dirIndex];
            
            // Check if word fits
            if (wordFits(word, row, col, dRow, dCol)) {
                // Place the word
                for (let i = 0; i < word.length; i++) {
                    grid[row + i * dRow][col + i * dCol] = word[i];
                }
                placed = true;
            }
        }
    }
}

// Check if a word fits at the given position and direction
function wordFits(word, row, col, dRow, dCol) {
    for (let i = 0; i < word.length; i++) {
        const newRow = row + i * dRow;
        const newCol = col + i * dCol;
        
        // Check if position is out of bounds
        if (newRow < 0 || newRow >= 20 || newCol < 0 || newCol >= 20) {
            return false;
        }
        
        // Check if cell is already filled with a different letter
        if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
            return false;
        }
    }
    return true;
}

// Fill empty cells with random letters
function fillEmptyCells() {
    // Create weighted array of letters based on French frequency
    const weightedAlphabet = [];
    for (const [letter, weight] of Object.entries(frenchAlphabet)) {
        for (let i = 0; i < weight * 10; i++) {
            weightedAlphabet.push(letter);
        }
    }
    
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if (grid[i][j] === '') {
                const randomIndex = Math.floor(Math.random() * weightedAlphabet.length);
                grid[i][j] = weightedAlphabet[randomIndex];
            }
        }
    }
}

// Render the grid
function renderGrid() {
    gridElement.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = grid[i][j];
            
           // Add both mouse and touch events
           cell.addEventListener('mousedown', startSelection);
           cell.addEventListener('mouseover', continueSelection);
           cell.addEventListener('touchstart', handleTouchStart, { passive: false });
           cell.addEventListener('touchmove', handleTouchMove, { passive: false });
           cell.addEventListener('touchend', handleTouchEnd, { passive: false });
           
           gridElement.appendChild(cell);
        }
    }
    
    document.addEventListener('mouseup', endSelection);
}

// Handle touch end
function handleTouchEnd(e) {
    e.preventDefault();
    if (!isSelecting || !isTimerStarted || isPaused) return;
    
    isSelecting = false;
    
    // Check if word is in the list
    if (words.includes(currentWord) && !foundWords.includes(currentWord)) {
        foundWords.push(currentWord);
        score += currentWord.length * 10;
        scoreElement.textContent = score;
        renderWordList();
        
        // Check if all words are found
        if (foundWords.length === words.length) {
            clearInterval(timer);
            isTimerStarted = false;
            pauseButton.disabled = true;
            startTimerButton.disabled = true;
            setTimeout(() => {
                alert(`Félicitations! Vous avez trouvé tous les mots! Score final: ${score}`);
            }, 100);
        }
    }
    
    resetSelection();
}

// Render the word list
function renderWordList() {
    wordListElement.innerHTML = '';
    
    for (const word of words) {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        if (foundWords.includes(word)) {
            wordItem.classList.add('found');
        }
        wordItem.textContent = word;
        wordListElement.appendChild(wordItem);
    }
}

// Start selecting cells
function startSelection(e) {

    if (!e.target.classList.contains('cell') || !isTimerStarted || isPaused) return;
    
    // Reset selection
    resetSelection();
    
    // Add cell to selection
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    selectedCells.push({ row, col });
    e.target.classList.add('selected');
    
    currentWord = grid[row][col];
    currentWordElement.textContent = currentWord;
}

// Continue selection
function continueSelection(e) {

    if (!e.target.classList.contains('cell') || selectedCells.length === 0 || !isTimerStarted || isPaused) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // Check if cell is adjacent to last selected cell
    const lastCell = selectedCells[selectedCells.length - 1];
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);
    
    if ((rowDiff <= 1 && colDiff <= 1) && // Adjacent cell
        !selectedCells.some(cell => cell.row === row && cell.col === col)) { // Not already selected
        
        selectedCells.push({ row, col });
        e.target.classList.add('selected');
        
        currentWord += grid[row][col];
        currentWordElement.textContent = currentWord;
    }
}

// End selection
function endSelection() {

    if (selectedCells.length === 0 || !isTimerStarted || isPaused) return;
    
    // Check if word is in the list
    if (words.includes(currentWord) && !foundWords.includes(currentWord)) {
        foundWords.push(currentWord);
        score += currentWord.length * 10;
        scoreElement.textContent = score;
        renderWordList();
        
        // Check if all words are found
        if (foundWords.length === words.length) {
            clearInterval(timer);
            isTimerStarted = false;
            pauseButton.disabled = true;
            startTimerButton.disabled = true;
            setTimeout(() => {
                alert(`Félicitations! Vous avez trouvé tous les mots! Score final: ${score}`);
            }, 100);
        }
    }
    
    resetSelection();
}

// Reset selection
function resetSelection() {
    selectedCells.forEach(cell => {
        const cellElement = document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
        if (cellElement) {
            cellElement.classList.remove('selected');
        }
    });
    
    selectedCells = [];
    currentWord = "";
    currentWordElement.textContent = "";
}

// Update timer
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        isTimerStarted = false;
        pauseButton.disabled = true;
        startTimerButton.disabled = true;
        alert(`Temps écoulé! Votre score: ${score}`);
    } else {
        timeLeft--;
    }
}

// Start timer function
function startTimer() {
    if (!isTimerStarted) {
        isTimerStarted = true;
        isPaused = false;
        timer = setInterval(updateTimer, 1000);
        startTimerButton.textContent = "Redémarrer";
        pauseButton.disabled = false;
    } else {
        // If already started, this acts as a restart button
        clearInterval(timer);
        initGame();
    }
}

// Toggle pause function
function togglePause() {
    if (isTimerStarted) {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(timer);
            pauseButton.textContent = "Reprendre";
        } else {
            timer = setInterval(updateTimer, 1000);
            pauseButton.textContent = "Pause";
        }
    }
}

// Setup UI for timer controls
function setupTimerControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'timer-controls';
    
    startTimerButton.id = 'start-timer';
    startTimerButton.textContent = 'Démarrer';
    startTimerButton.addEventListener('click', startTimer);
    
    pauseButton.id = 'pause-game';
    pauseButton.textContent = 'Pause';
    pauseButton.disabled = true;
    pauseButton.addEventListener('click', togglePause);
    
    controlsContainer.appendChild(startTimerButton);
    controlsContainer.appendChild(pauseButton);
    
    // Insert after the time display
    timeElement.parentNode.insertBefore(controlsContainer, timeElement.nextSibling);
}

// Event listeners
newGameButton.addEventListener('click', initGame);

// Initialize game on page load

window.addEventListener('load', () => {
    setupTimerControls();
    initGame();
});
