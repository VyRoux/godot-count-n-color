document.addEventListener('DOMContentLoaded', () => {

    // --- Seleksi Elemen DOM ---
    const startScreen = document.getElementById('start-screen');
    const playScreen = document.getElementById('play-screen');
    const endScreen = document.getElementById('end-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const nextBtn = document.getElementById('next-btn');
    const shapesContainer = document.getElementById('shapes-container');
    const questionEl = document.getElementById('question');
    const answerButtons = document.querySelectorAll('.answer-btn');
    const feedbackEl = document.getElementById('feedback');
    const currentLevelEl = document.getElementById('current-level');
    const totalLevelsEl = document.getElementById('total-levels');
    const animatedBg = document.querySelector('.animated-bg');

    // --- Konfigurasi Game ---
    const MAX_LEVEL = 50;
    const COLORS = { merah: '#FF6B6B', biru: '#4DABF7', hijau: '#51CF66', kuning: '#FFD43B', ungu: '#845EC2', pink: '#FFC6FF', orange: '#FFA500' };
    const SHAPES = { kotak: 'square', lingkaran: '', segitiga: 'triangle' };
    
    let currentLevel = 0;
    let currentLevelData = {}; // Untuk menyimpan data level saat ini

    // --- Fungsi Utilitas ---
    function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

    // --- Fungsi Latar Belakang Animasi ---
    function createAnimatedBackground() {
        const colors = Object.values(COLORS);
        const numberOfShapes = 20;
        for (let i = 0; i < numberOfShapes; i++) {
            const shape = document.createElement('div');
            shape.classList.add('floating-shape');
            shape.style.borderRadius = getRandomItem(['50%', '10%']);
            const size = Math.random() * 60 + 20;
            shape.style.width = `${size}px`; shape.style.height = `${size}px`;
            shape.style.left = `${Math.random() * 100}%`;
            shape.style.backgroundColor = getRandomItem(colors);
            shape.style.animationDelay = `${Math.random() * 15}s`;
            shape.style.animationDuration = `${Math.random() * 10 + 20}s`;
            animatedBg.appendChild(shape);
        }
    }

    // --- Level Generator Otomatis (LOGIKA BENAR) ---
    function generateLevel(levelNumber) {
        // 1. Tentukan kesulitan berdasarkan level
        let availableColors = Object.keys(COLORS);
        let availableShapes = Object.keys(SHAPES);
        
        // Batasi warna dan bentuk di level awal
        if (levelNumber <= 5) availableColors = availableColors.slice(0, 4);
        if (levelNumber <= 2) availableShapes = availableShapes.slice(0, 2);

        let totalShapes = 4 + Math.floor(levelNumber / 3);
        totalShapes = Math.min(totalShapes, 15); // Maksimal 15 bentuk

        // 2. Buat pertanyaan (target)
        const targetShape = getRandomItem(availableShapes);
        const targetColor = getRandomItem(availableColors);
        
        // 3. Tentukan jumlah jawaban benar secara acak
        let correctAnswer = Math.floor(Math.random() * (totalShapes / 2)) + 1;

        // 4. Buat array bentuk
        const levelShapes = [];
        for (let i = 0; i < correctAnswer; i++) {
            levelShapes.push({ type: targetShape, color: targetColor });
        }

        // 5. Isi sisa bentuk dengan "pengganggu" (distractors) - PERBAIKAN KRUSIAL
        for (let i = levelShapes.length; i < totalShapes; i++) {
            let distractorShape, distractorColor;
            // Pastikan pengganggu tidak sama dengan target
            do {
                distractorShape = getRandomItem(availableShapes);
                distractorColor = getRandomItem(availableColors);
            } while (distractorShape === targetShape && distractorColor === targetColor);

            levelShapes.push({ type: distractorShape, color: distractorColor });
        }

        // 6. Buat pilihan jawaban
        const choices = [correctAnswer];
        while (choices.length < 4) {
            let wrongAnswer = getRandomItem([correctAnswer - 1, correctAnswer + 1, correctAnswer - 2, correctAnswer + 2]);
            if (wrongAnswer > 0 && wrongAnswer <= totalShapes && !choices.includes(wrongAnswer)) {
                choices.push(wrongAnswer);
            }
        }

        return {
            shapes: shuffleArray(levelShapes),
            question: { type: targetShape, color: targetColor },
            choices: shuffleArray(choices),
            correctAnswer: correctAnswer // Simpan jawaban benar
        };
    }

    // --- Logika Inti Permainan ---
    function startGame() {
        currentLevel = 1;
        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        playScreen.classList.add('active');
        totalLevelsEl.textContent = MAX_LEVEL;
        loadLevel(currentLevel);
    }

    function loadLevel(levelNumber) {
        currentLevelData = generateLevel(levelNumber); // Simpan data level
        currentLevelEl.textContent = levelNumber;

        // Reset tampilan
        shapesContainer.innerHTML = '';
        feedbackEl.textContent = '';
        feedbackEl.className = '';
        nextBtn.classList.add('hidden');
        
        // Aktifkan kembali semua tombol jawaban
        answerButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.backgroundColor = ''; // Kembalikan ke warna semula
        });

        // Generate bentuk
        currentLevelData.shapes.forEach(shapeData => {
            const colorHex = COLORS[shapeData.color];
            const shapeClass = SHAPES[shapeData.type];
            
            const shapeEl = document.createElement('div');
            shapeEl.classList.add('shape');
            if (shapeClass) {
                shapeEl.classList.add(shapeClass);
            }

            if (shapeData.type === 'segitiga') {
                shapeEl.style.borderBottomColor = colorHex;
            } else {
                shapeEl.style.backgroundColor = colorHex;
            }
            
            shapesContainer.appendChild(shapeEl);
        });
        
        // Tampilkan pertanyaan
        questionEl.textContent = `Ada berapa ${currentLevelData.question.type} berwarna ${currentLevelData.question.color}?`;

        // Siapkan tombol jawaban
        answerButtons.forEach((btn, index) => {
            btn.textContent = currentLevelData.choices[index];
            btn.dataset.answer = currentLevelData.choices[index];
        });
    }

    function selectAnswer(e) {
        if (e.target.disabled) return; // Mencegah klik ganda

        const selectedButton = e.target;
        const chosenAnswer = parseInt(selectedButton.dataset.answer);
        
        // Gunakan currentLevelData untuk pengecekan
        if (chosenAnswer === currentLevelData.correctAnswer) {
            feedbackEl.textContent = 'Hebat! Kamu benar! ✨';
            feedbackEl.className = 'success';
            selectedButton.style.backgroundColor = 'var(--success-color)';
            
            // Nonaktifkan semua tombol dan tampilkan tombol lanjut
            answerButtons.forEach(btn => btn.disabled = true);
            nextBtn.classList.remove('hidden');
        } else {
            feedbackEl.textContent = 'Coba lagi! 🤔';
            feedbackEl.className = 'error';
            selectedButton.disabled = true;
            selectedButton.style.opacity = '0.5';
        }
    }

    function nextLevel() {
        currentLevel++;
        if (currentLevel > MAX_LEVEL) {
            showEndScreen();
        } else {
            loadLevel(currentLevel);
        }
    }
    
    function showEndScreen() {
        playScreen.classList.remove('active');
        endScreen.classList.add('active');
    }

    // --- Inisialisasi & Event Listener ---
    createAnimatedBackground();
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    nextBtn.addEventListener('click', nextLevel);
    answerButtons.forEach(button => {
        button.addEventListener('click', selectAnswer);
    });

});