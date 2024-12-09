// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCSk6fZPfKkn_w92zdJuEZIEJOTDEeUGyA",
    authDomain: "ymson-gej-m.firebaseapp.com",
    projectId: "ymson-gej-m",
    storageBucket: "ymson-gej-m.appspot.com",
    messagingSenderId: "568752979376",
    appId: "1:568752979376:web:b0ac29eb8447e010402a75",
    measurementId: "G-2PKF7W48EP"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const playerNameInput = document.getElementById('playerName');
const startScreen = document.querySelector('.start-screen');
const gameContainer = document.querySelector('.game-container');
const gameOverContainer = document.querySelector('.game-over-container');
const livesElement = document.querySelector('.lives');
const scoreElement = document.querySelector('.score');
const highscoresList = document.getElementById('highscores-list');

let lives = 3;
let score = 0;
let playerName = "";

// Funkcja aktualizująca liczbę żyć
function updateLives() {
    livesElement.textContent = `Życia: ${'❤️'.repeat(lives)}`;
}

// Funkcja aktualizująca wynik
function updateScore() {
    scoreElement.textContent = `Wynik: ${score}`;
}

// Funkcja tworząca obiekt do kliknięcia
function createTarget() {
    const target = document.createElement('div');
    target.classList.add('target');
    target.style.left = Math.random() * (window.innerWidth - 50) + 'px';
    target.style.top = Math.random() * (window.innerHeight - 50) + 'px';
    target.style.backgroundImage = 'url("ymszon.png")';
    target.style.backgroundSize = 'cover';
    target.addEventListener('click', handleTargetClick);
    document.body.appendChild(target);

    // Usuwanie obiektu po 2 sekundach, jeśli nie został kliknięty
    setTimeout(() => {
        if (target.parentElement) {
            target.remove();
            loseLife();
        }
    }, 2000);
}

// Funkcja obsługująca kliknięcie w cel
function handleTargetClick(event) {
    event.target.remove();
    score++;
    updateScore();
    document.getElementById('click-sound').play();
}

// Funkcja tracenia życia
function loseLife() {
    lives--;
    updateLives();
    if (lives <= 0) {
        gameOver();
    }
}

// Funkcja zakończenia gry
function gameOver() {
    gameContainer.style.display = 'none';
    gameOverContainer.style.display = 'block';
    const finalScore = document.querySelector('.final-score');
    finalScore.textContent = `Twój wynik: ${score}`;
    saveScoreToFirebase();
}

// Funkcja zapisywania wyniku do Firestore
function saveScoreToFirebase() {
    if (playerName) {
        db.collection("highscores").add({
            player: playerName,
            score: score,
        }).then(() => {
            loadHighscores();
        });
    }
}

// Funkcja wczytująca tabelę wyników
function loadHighscores() {
    db.collection("highscores").orderBy("score", "desc").limit(10).get().then((querySnapshot) => {
        highscoresList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const listItem = document.createElement('li');
            listItem.textContent = `${data.player}: ${data.score}`;
            highscoresList.appendChild(listItem);
        });
    });
}

// Funkcja uruchamiająca grę
function startGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert("Podaj swój nick!");
        return;
    }

    lives = 3;
    score = 0;
    updateLives();
    updateScore();
    gameContainer.style.display = 'block';
    startScreen.style.display = 'none';
    gameOverContainer.style.display = 'none';

    // Tworzenie celów co sekundę
    const targetInterval = setInterval(() => {
        if (lives > 0) {
            createTarget();
        } else {
            clearInterval(targetInterval);
        }
    }, 1000);
}

// Funkcja restartująca grę
function restartGame() {
    gameOverContainer.style.display = 'none';
    startGame();
}

// Dodanie event listenerów
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Wczytanie wyników
loadHighscores();
