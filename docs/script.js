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

    // --- Data Level (Storyboard) ---
    const levels = [
        {
            shapes: [
                { type: 'kotak', color: 'merah' }, { type: 'kotak', color: 'merah' }, { type: 'kotak', color: 'merah' },
                { type: 'kotak', color: 'hijau' },
                { type: 'lingkaran', color: 'biru' },
                { type: 'segitiga', color: 'kuning' }
            ],
            question: { type: 'kotak', color: 'merah' },
            choices: [2, 3, 5]
        },
        {
            shapes: [
                { type: 'segitiga', color: 'kuning' }, { type: 'segitiga', color: 'kuning' },
                { type: 'lingkaran', color: 'merah' }, { type: 'lingkaran', color: 'merah' },
                { type: 'lingkaran', color: 'hijau' },
                { type: 'segitiga', color: 'biru' }
            ],
            question: { type: 'lingkaran', color: 'merah' },
            choices: [1, 2, 4]
        },
        {
            shapes: [
                { type: 'lingkaran', color: 'biru' }, { type: 'lingkaran', color: 'biru' }, { type: 'lingkaran', color: 'biru' },
                { type: 'lingkaran', color: 'biru' },
                { type: 'kotak', color: 'kuning' }, { type: 'kotak', color: 'kuning' },
                { type: 'segitiga', color: 'merah' }
            ],
            question: { type: 'lingkaran', color: 'biru' },
            choices: [3, 4, 5]
        },
        {
            shapes: [
                { type: 'segitiga', color: 'hijau' }, { type: 'segitiga', color: 'hijau' }, { type: 'segitiga', color: 'hijau' },
                { type: 'segitiga', color: 'hijau' }, { type: 'segitiga', color: 'hijau' },
                { type: 'kotak', color: 'merah' }, { type: 'kotak', color: 'merah' },
                { type: 'lingkaran', color: 'kuning' }
            ],
            question: { type: 'segitiga', color: 'hijau' },
            choices: [4, 5, 6]
        },
        {
            shapes: [
                { type: 'kotak', color: 'merah' }, { type: 'kotak', color: 'hijau' }, { type: 'kotak', color: 'biru' },
                { type: 'lingkaran', color: 'merah' }, { type: 'lingkaran', color: 'hijau' }, { type: 'lingkaran', color: 'biru' },
                { type: 'segitiga', color: 'merah' }, { type: 'segitiga', color: 'hijau' }, { type: 'segitiga', color: 'biru' }
            ],
            question: { type: 'segitiga', color: 'biru' },
            choices: [0, 1, 2]
        }
    ];

    // --- Konstanta & Variabel Game ---
    const COLORS = { merah: '#FF6B6B', biru: '#4DABF7', hijau: '#51CF66', kuning: '#FFD43B' };
    const SHAPE_CLASS_MAP = { kotak: 'square', lingkaran: '', segitiga: 'triangle' };
    
    let currentLevel = 0;

    // --- Fungsi Utilitas ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Fungsi Latar Belakang Animasi (Diperbaiki) ---
    function createAnimatedBackground() {
        const colors = Object.values(COLORS);
        const numberOfShapes = 20; // Lebih banyak bentuk untuk efek yang lebih bagus

        for (let i = 0; i < numberOfShapes; i++) {
            const shape = document.createElement('div');
            shape.classList.add('floating-shape');
            
            // Pilih bentuk acak
            const isCircle = Math.random() > 0.5;
            if (isCircle) {
                shape.style.borderRadius = '50%';
            } else {
                shape.style.borderRadius = '10%';
            }

            // Atur ukuran, posisi, warna, dan delay animasi secara acak
            const size = Math.random() * 60 + 20;
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
            shape.style.left = `${Math.random() * 100}%`;
            shape.style.backgroundColor = getRandomItem(colors);
            shape.style.animationDelay = `${Math.random() * 15}s`;
            shape.style.animationDuration = `${Math.random() * 10 + 20}s`;

            animatedBg.appendChild(shape);
        }
    }
    
    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }


    // --- Logika Inti Permainan ---
    function startGame() {
        currentLevel = 0;
        startScreen.classList.remove('active');
        endScreen.classList.remove('active');
        playScreen.classList.add('active');
        totalLevelsEl.textContent = levels.length;
        loadLevel(currentLevel);
    }

    function loadLevel(levelIndex) {
        if (levelIndex >= levels.length) {
            showEndScreen();
            return;
        }

        const level = levels[levelIndex];
        currentLevelEl.textContent = levelIndex + 1;

        // Reset tampilan
        shapesContainer.innerHTML = '';
        feedbackEl.textContent = '';
        feedbackEl.className = '';
        nextBtn.classList.add('hidden');
        
        // Aktifkan kembali semua tombol jawaban
        answerButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });

        // Acak posisi bentuk
        const shuffledShapes = shuffleArray([...level.shapes]);

        // Generate bentuk
        shuffledShapes.forEach(shapeData => {
            const colorHex = COLORS[shapeData.color];
            const shapeClass = SHAPE_CLASS_MAP[shapeData.type];
            
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
        questionEl.textContent = `Ada berapa ${level.question.type} berwarna ${level.question.color}?`;

        // Siapkan tombol jawaban
        const shuffledChoices = shuffleArray([...level.choices]);
        answerButtons.forEach((btn, index) => {
            btn.textContent = shuffledChoices[index];
            btn.dataset.answer = shuffledChoices[index];
        });
    }

    function selectAnswer(e) {
        const selectedButton = e.target;
        const chosenAnswer = parseInt(selectedButton.dataset.answer);
        const level = levels[currentLevel];
        const correctAnswer = level.shapes.filter(s => s.type === level.question.type && s.color === level.question.color).length;

        if (chosenAnswer === correctAnswer) {
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
        loadLevel(currentLevel);
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