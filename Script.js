let questions = [];
let currentQuestion = 0;
let userAnswers = JSON.parse(localStorage.getItem('cat_answers')) || {};
let timeLeft = localStorage.getItem('cat_timer') || (90 * 60);

// 1. Fetch Data Soal
async function loadQuestions() {
    try {
        const response = await fetch('soal.json');
        const data = await response.json();
        
        // 2. Acak Soal
        questions = data.sort(() => Math.random() - 0.5);
        
        displayQuestion();
        startTimer();
    } catch (error) {
        console.error("Gagal memuat soal:", error);
    }
}

// 3. Timer dengan LocalStorage
function startTimer() {
    const timerElement = document.getElementById('timer');
    const interval = setInterval(() => {
        let hours = Math.floor(timeLeft / 3600);
        let minutes = Math.floor((timeLeft % 3600) / 60);
        let seconds = timeLeft % 60;
        
        timerElement.innerText = `Sisa Waktu: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            finishQuiz();
        }
        
        timeLeft--;
        localStorage.setItem('cat_timer', timeLeft); // Simpan sisa waktu
    }, 1000);
}

// 4. Display Soal & Kategori
function displayQuestion() {
    if (questions.length === 0) return;

    const q = questions[currentQuestion];
    
    // Update Info Kategori & Nomor
    document.getElementById('question-number').innerText = `Soal ${currentQuestion + 1} dari ${questions.length} [${q.kategori}]`;
    document.getElementById('question-text').innerText = q.q;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    q.a.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = 'option-btn';
        
        // Cek jika sudah pernah dijawab (dari LocalStorage)
        if (userAnswers[currentQuestion] === index) {
            btn.classList.add('selected');
        }

        btn.onclick = () => selectAnswer(index);
        optionsDiv.appendChild(btn);
    });

    // Navigasi Tombol
    document.getElementById('submit-btn').style.display = (currentQuestion === questions.length - 1) ? 'block' : 'none';
}

// 5. Simpan Jawaban ke LocalStorage
function selectAnswer(index) {
    userAnswers[currentQuestion] = index;
    localStorage.setItem('cat_answers', JSON.stringify(userAnswers));
    displayQuestion();
}

function changeQuestion(step) {
    currentQuestion += step;
    if (currentQuestion < 0) currentQuestion = 0;
    if (currentQuestion >= questions.length) currentQuestion = questions.length - 1;
    displayQuestion();
}

// 6. Selesai & Hitung Score per Kategori
function finishQuiz() {
    let score = 0;
    let detailSkor = {};

    questions.forEach((q, i) => {
        if (userAnswers[i] === q.correct) {
            score++;
            detailSkor[q.kategori] = (detailSkor[q.kategori] || 0) + 1;
        }
    });

    alert(`Ujian Selesai! \nTotal Skor: ${score} \n\nCek konsol untuk detail per kategori.`);
    console.table(detailSkor);

    // Bersihkan progres setelah selesai
    localStorage.removeItem('cat_answers');
    localStorage.removeItem('cat_timer');
}

window.onload = loadQuestions;