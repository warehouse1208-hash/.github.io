const selectedLevel = localStorage.getItem('selectedLevel') || '3';

let currentQuizData = [];
let currentQuestionIndex = 0;
let score = 0;
const QUIZ_LENGTH = 10;
let chartInstance = null; // グラフのインスタンスを保持する変数

const quizTitleEl = document.getElementById('quiz-title');
const progressEl = document.getElementById('progress');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const resultActionsEl = document.getElementById('result-actions');
const showProgressBtn = document.getElementById('show-progress-btn');

// スコアをlocalStorageに保存する関数
function saveScore(level, scorePercent) {
    const today = new Date().toLocaleDateString('ja-JP');
    const newRecord = { date: today, score: scorePercent };

    // 既存のデータを取得
    const scoresJSON = localStorage.getItem('quizScores');
    const scores = scoresJSON ? JSON.parse(scoresJSON) : { '1': [], '2': [], '3': [] };

    // 新しい記録を追加
    if (!scores[level]) {
        scores[level] = [];
    }
    scores[level].push(newRecord);

    // 保存
    localStorage.setItem('quizScores', JSON.stringify(scores));
}

// グラフを描画する関数
function renderProgressChart(level) {
    const scoresJSON = localStorage.getItem('quizScores');
    const scores = scoresJSON ? JSON.parse(scoresJSON) : {};

    const levelScores = scores[level] || [];

    if (levelScores.length === 0) {
        alert('この級の学習記録はまだありません。');
        return;
    }

    const labels = levelScores.map(record => record.date);
    const data = levelScores.map(record => record.score);

    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // 既存のグラフがあれば破棄する
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${level}級 正答率 (%)`,
                data: data,
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            responsive: true,
            maintainAspectRatio: true
        }
    });
    showProgressBtn.style.display = 'none'; // グラフ表示後はボタンを隠す
}

function startQuiz() {
    quizTitleEl.textContent = `${selectedLevel}級 単語クイズ`;

    const allQuestions = quizData[selectedLevel];
    if (!allQuestions || allQuestions.length === 0) {
        questionEl.textContent = 'この級の問題はまだありません。';
        progressEl.textContent = '';
        return;
    }
    
    currentQuizData = allQuestions.sort(() => 0.5 - Math.random()).slice(0, QUIZ_LENGTH);
    currentQuestionIndex = 0;
    score = 0;
    nextBtn.style.display = 'none';
    resultActionsEl.style.display = 'none';
    document.getElementById('chart-container').style.display = 'none';
    if(chartInstance) chartInstance.destroy();


    showQuestion();
}

function showQuestion() {
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    nextBtn.style.display = 'none';
    optionsEl.innerHTML = '';

    if (currentQuestionIndex >= currentQuizData.length) {
        showResult();
        return;
    }

    progressEl.textContent = `第 ${currentQuestionIndex + 1} 問 / ${currentQuizData.length} 問`;
    const questionData = currentQuizData[currentQuestionIndex];
    questionEl.textContent = questionData.word;

    questionData.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerHTML = `<span style="display: inline-block; width: 25px; font-weight: bold;">${index + 1}.</span> ${option}`;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectAnswer(button, option, questionData.answer));
        optionsEl.appendChild(button);
    });
}

function selectAnswer(button, selectedOption, correctAnswer) {
    const optionButtons = optionsEl.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.includes(correctAnswer)) {
            btn.classList.add('correct');
        }
    });

    if (selectedOption === correctAnswer) {
        feedbackEl.textContent = '正解！';
        feedbackEl.classList.add('result-correct');
        score++;
    } else {
        button.classList.add('incorrect');
        feedbackEl.textContent = `不正解！`;
        feedbackEl.classList.add('result-incorrect');
    }

    nextBtn.style.display = 'block';
}

function showResult() {
    const scorePercent = (score / currentQuizData.length) * 100;
    saveScore(selectedLevel, scorePercent);

    questionEl.textContent = 'クイズ終了！';
    optionsEl.innerHTML = '';
    progressEl.textContent = `正答率: ${scorePercent.toFixed(0)}%`;
    feedbackEl.textContent = `あなたのスコア: ${score} / ${currentQuizData.length}`;
    nextBtn.style.display = 'none';
    resultActionsEl.style.display = 'block';
    showProgressBtn.style.display = 'inline-block';
    document.getElementById('chart-container').style.display = 'block';

}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

showProgressBtn.addEventListener('click', () => {
    renderProgressChart(selectedLevel);
});

startQuiz();
