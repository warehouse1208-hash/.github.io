
const selectedLevel = localStorage.getItem('selectedLevel') || '3';

let currentQuizData = [];
let currentQuestionIndex = 0;
let score = 0;
const QUIZ_LENGTH = 10;

const quizTitleEl = document.getElementById('quiz-title');
const progressEl = document.getElementById('progress');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');

function startQuiz() {
    quizTitleEl.textContent = `${selectedLevel}級 単語クイズ`;

    // quizData is loaded from quiz_data.js
    const allQuestions = quizData[selectedLevel];
    if (!allQuestions || allQuestions.length === 0) {
        questionEl.textContent = 'この級の問題はまだありません。';
        progressEl.textContent = '';
        return;
    }

    // Shuffle questions and pick QUIZ_LENGTH
    currentQuizData = allQuestions.sort(() => 0.5 - Math.random()).slice(0, QUIZ_LENGTH);

    currentQuestionIndex = 0;
    score = 0;
    nextBtn.style.display = 'none';
    backBtn.style.display = 'none';
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
        // Mark correct answer
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
    questionEl.textContent = 'クイズ終了！';
    optionsEl.innerHTML = '';
    progressEl.textContent = `正答率: ${((score / currentQuizData.length) * 100).toFixed(0)}%`;
    feedbackEl.textContent = `あなたのスコア: ${score} / ${currentQuizData.length}`;
    nextBtn.style.display = 'none';
    backBtn.style.display = 'block';
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

startQuiz();
