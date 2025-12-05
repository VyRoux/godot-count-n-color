document.addEventListener('DOMContentLoaded', () => {

    // --- Seleksi Elemen DOM ---
    const startScreen = document.getElementById('start-screen');
    const playScreen = document.getElementById('play-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const shapesContainer = document.getElementById('shapes-container');
    const questionEl = document.getElementById('question');
    const answerButtonsContainer = document.getElementById('answer-buttons');
    const feedbackEl = document.getElementById('feedback');
    const starsContainer = document.getElementById('stars');
    const animatedBg = document.querySelector('.animated-bg');
    const eventIndicator = document.getElementById('event-indicator');
    const gameOverReason = document.getElementById('game-over-reason');
    const finalScoreEl = document.getElementById('final-score');

    // --- Konstanta & Variabel Game ---
    const COLORS = { merah: '#FF6B6B', biru: '#4DABF7', hijau: '#51CF66', kuning: '#FFD43B', ungu: '#845EC2', pink: '#FFC6FF' };
    const SHAPES = ['lingkaran', 'persegi', 'segitiga'];
    
    let score = 0;
    let currentQuestion = {};
    let currentEvent = 'normal'; // 'normal', 'chaos', 'bonus'
    let isGameOver = false;

    // --- Fungsi Utilitas ---
    function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }

    function updateScore(points) {
        score = Math.max(0, score + points); // Poin tidak boleh kurang dari 0
        starsContainer.innerHTML = '';
        for (let i = 0; i < score; i++) {
            const star = document.createElement('span');
            star.textContent = '⭐';
            starsContainer.appendChild(star);
        }
    }

    // --- Fungsi Latar Belakang Animasi ---
    function createAnimatedBackground() {
        const shapes = ['circle', 'square'];
        const colors = Object.values(COLORS);
        const numberOfShapes = 15;
        for (let i = 0; i < numberOfShapes; i++) {
            const shape = document.createElement('div');
            shape.classList.add('floating-shape');
            shape.style.borderRadius = getRandomItem(['50%', '10%']);
            const size = Math.random() * 60 + 20;
            shape.style.width = `${size}px`; shape.style.height = `${size}px`;
            shape.style.left = `${Math.random() * 100}%`;
            shape.style.backgroundColor = getRandomItem(colors);
            shape.style.animationDelay = `${Math.random() * 20}s`;
            shape.style.animationDuration = `${Math.random() * 10 + 20}s`;
            animatedBg.appendChild(shape);
        }
    }

    // --- Logika Inti Permainan ---
    function startGame() {
        score = 0;
        isGameOver = false;
        updateScore(0);
        startScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        playScreen.classList.add('active');
        nextRound();
    }

    function nextRound() {
        if (isGameOver) return;
        
        shapesContainer.innerHTML = '';
        feedbackEl.textContent = '';
        feedbackEl.className = '';
        questionEl.textContent = 'Tunggu...';
        eventIndicator.textContent = '';
        eventIndicator.className = '';
        answerButtonsContainer.innerHTML = ''; // Kosongkan tombol lama

        // Tentukan event
        const rand = Math.random();
        if (rand < 0.15) { // 15% chance for Chaos Event
            currentEvent = 'chaos';
            eventIndicator.textContent = '🔥 CHAOS EVENT! 🔥';
            eventIndicator.classList.add('chaos');
        } else if (rand < 0.25) { // 10% chance for Bonus Round
            currentEvent = 'bonus';
            eventIndicator.textContent = '✨ Bonus Round! ✨';
            eventIndicator.classList.add('bonus');
        } else {
            currentEvent = 'normal';
        }

        // Tentukan jumlah bentuk berdasarkan poin dan event
        let numberOfShapes = 3;
        if (score >= 10) numberOfShapes = 5;
        else if (score >= 5) numberOfShapes = 4;

        if (currentEvent === 'chaos') {
            numberOfShapes = 6; // Chaos selalu punya 6 bentuk
        } else if (currentEvent === 'bonus') {
            numberOfShapes = 1; // Bonus selalu punya 1 bentuk
        }

        // Generate bentuk
        const roundShapes = [];
        for (let i = 0; i < numberOfShapes; i++) {
            const colorName = getRandomItem(Object.keys(COLORS));
            const colorHex = COLORS[colorName];
            const shapeType = getRandomItem(SHAPES);
            roundShapes.push({ color: colorName, type: shapeType });
            
            const shapeEl = document.createElement('div');
            shapeEl.classList.add('shape');
            if (shapeType === 'persegi') { shapeEl.classList.add('square'); shapeEl.style.backgroundColor = colorHex; }
            else if (shapeType === 'segitiga') { shapeEl.classList.add('triangle'); shapeEl.style.borderBottomColor = colorHex; }
            else { shapeEl.style.backgroundColor = colorHex; }
            shapesContainer.appendChild(shapeEl);
        }
        
        generateQuestion(roundShapes);
    }

    function generateQuestion(shapes) {
        const questionType = getRandomItem(['warna', 'bentuk']);
        let target, count;

        if (questionType === 'warna') {
            target = getRandomItem(Object.keys(COLORS));
            count = shapes.filter(s => s.color === target).length;
            currentQuestion = { text: `Berapa banyak warna ${target}?`, answer: count };
        } else {
            target = getRandomItem(SHAPES);
            count = shapes.filter(s => s.type === target).length;
            currentQuestion = { text: `Berapa banyak bentuk ${target}?`, answer: count };
        }
        
        // Tampilkan pertanyaan dan buat tombol jawaban
        questionEl.textContent = currentQuestion.text;
        createAnswerButtons(currentQuestion.answer);
    }

    function createAnswerButtons(correctAnswer) {
        // Buat array pilihan jawaban (benar + salah)
        let choices = [correctAnswer];
        while (choices.length < 4) {
            const wrongAnswer = Math.floor(Math.random() * (currentEvent === 'chaos' ? 7 : 6));
            if (!choices.includes(wrongAnswer)) {
                choices.push(wrongAnswer);
            }
        }
        shuffleArray(choices);

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('answer-btn');
            button.textContent = choice;
            button.dataset.answer = choice;
            button.addEventListener('click', selectAnswer);
            answerButtonsContainer.appendChild(button);
        });
    }

    function selectAnswer(e) {
        if (isGameOver) return;
        
        const chosenAnswer = parseInt(e.target.dataset.answer);
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true); // Nonaktifkan semua tombol

        if (chosenAnswer === currentQuestion.answer) {
            feedbackEl.textContent = 'Hebat! Kamu benar! ✨';
            feedbackEl.className = 'success';
            updateScore(1);
            setTimeout(nextRound, 2000);
        } else {
            feedbackEl.textContent = `Oops, jawabannya ${currentQuestion.answer}.`;
            feedbackEl.className = 'error';
            setTimeout(() => handleGameOver(), 2000);
        }
    }

    function handleGameOver() {
        isGameOver = true;
        let pointsLost = 0;
        let reason = '';

        if (currentEvent === 'chaos') {
            pointsLost = score; // Hapus semua poin
            reason = 'Kamu gagal di Chaos Event! Semua poin hilang!';
        } else {
            pointsLost = 1;
            reason = 'Kamu menjawab salah! Poin berkurang 1.';
        }

        updateScore(-pointsLost);
        finalScoreEl.textContent = score;
        gameOverReason.textContent = reason;
        
        playScreen.classList.remove('active');
        gameOverScreen.classList.add('active');
    }

    // --- Inisialisasi & Event Listener ---
    createAnimatedBackground();
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

});