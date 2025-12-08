import { WORDS } from './words.js';

const NUMBER_OF_GUESSES = 6;
const WORD_LENGTH = 5;

let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let gameOver = false;

const rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
const allGuessedLetters = new Set();

const showHintGuessCount = 3;
let isHintPressed = false;

function initBoard() {
    const board = document.getElementById('game-board');

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'letter-row flex';

        for (let j = 0; j < WORD_LENGTH; j++) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            row.appendChild(box);
        }
        board.appendChild(row);
    }
}

function shadeKeyBoard(letter, color) {
    if (!letter) return;
    for (const elem of document.getElementsByClassName('keyboard-button')) {
        if (elem.textContent === letter) {
            elem.style.backgroundColor = color;
        }
    }
}

function deleteLetter() {
    if (nextLetter === 0) return;

    currentGuess.pop();
    nextLetter--;

    const row = document.getElementsByClassName('letter-row')[NUMBER_OF_GUESSES - guessesRemaining];
    const box = row.children[nextLetter];

    box.textContent = '';
    box.classList.remove('filled-box');
}

function checkGuess() {
    const row = document.getElementsByClassName('letter-row')[NUMBER_OF_GUESSES - guessesRemaining];
    const guessString = currentGuess.join('');

    if (guessString.length !== WORD_LENGTH) {
        alert('Not enough letters!');
        return;
    }

    if (!WORDS.includes(guessString)) {
        alert('Not an English word!');
        return;
    }

    for (const ch of currentGuess) {
        allGuessedLetters.add(ch);
    }

    const rightGuess = Array.from(rightGuessString);
    const colors = Array(WORD_LENGTH).fill('grey');

    const freq = {};
    for (const c of rightGuess) {
        freq[c] = (freq[c] || 0) + 1;
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (currentGuess[i] === rightGuess[i]) {
            colors[i] = 'green';
            freq[currentGuess[i]]--;
        }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (colors[i] !== 'grey') continue;
        const ch = currentGuess[i];
        if (freq[ch] > 0) {
            colors[i] = 'yellow';
            freq[ch]--;
        }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        const box = row.children[i];
        const letter = currentGuess[i];
        const letterColor = colors[i];

        setTimeout(() => {
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, 50 * i);
    }

    if (guessString === rightGuessString) {
        gameOver = true;
        guessesRemaining--;
        alert('You guessed right! Game over!');
        return;
    }

    guessesRemaining--;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining <= showHintGuessCount && !isHintPressed) {
        showHintButton();
    }

    if (guessesRemaining === 0) {
        gameOver = true;
        alert(`You've run out of guesses!\nThe correct word was "${rightGuessString}"`);
    }
}

function removeCurrentGuessRow() {
    const row = document.getElementsByClassName('letter-row')[NUMBER_OF_GUESSES - guessesRemaining];

    for (let i = 0; i < WORD_LENGTH; i++) {
        const box = row.children[i];
        box.textContent = '';
        box.style.backgroundColor = 'grey';
        box.classList.add('filled-box');
    }

    guessesRemaining--;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
        gameOver = true;
        alert(`You've run out of guesses!\nThe correct word was "${rightGuessString}"`);
    }
}

function insertLetter(k) {
    if (nextLetter === WORD_LENGTH) return;

    const row = document.getElementsByClassName('letter-row')[NUMBER_OF_GUESSES - guessesRemaining];
    const box = row.children[nextLetter];

    box.textContent = k;
    box.classList.add('filled-box');

    currentGuess.push(k);
    nextLetter++;
}

function generateHint() {
    const wordLetters = Array.from(rightGuessString);

    const unguessed = wordLetters.filter(ch => !allGuessedLetters.has(ch));
    const guessed = [...allGuessedLetters];

    if (Math.random() < 0.7 && unguessed.length > 0) {
        const letter = unguessed[Math.floor(Math.random() * unguessed.length)];
        return `The letter "${letter.toUpperCase()}" is in the word.`;
    }

    if (guessed.length > 0) {
        const letter = guessed[Math.floor(Math.random() * guessed.length)];
        return `The letter "${letter.toUpperCase()}" is NOT in the word.`;
    }

    return `The word contains the letter "${wordLetters[0].toUpperCase()}".`;
}

function showHintButton() {
    const btn = document.getElementById('hint-button');
    btn.classList.remove('hidden');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        if (isHintPressed) {
            alert('You already used your hint!');
            return;
        }

        if (guessesRemaining === 1) {
            alert('Using a hint now will make you LOSE.\nProceed?');
        }

        const hint = generateHint();
        alert(`Your hint is:\n${hint}`);

        isHintPressed = true;
        removeCurrentGuessRow();

        newBtn.classList.add('hidden');
    });
}

document.addEventListener('keyup', e => {
    if (gameOver) return;

    const key = e.key;

    if (key === 'Backspace') {
        deleteLetter();
        return;
    }
    if (key === 'Enter') {
        checkGuess();
        return;
    }

    if (/^[a-zA-Z]$/.test(key)) {
        insertLetter(key.toLowerCase());
    }
});

document.getElementById('keyboard-cont').addEventListener('click', e => {
    if (!e.target.classList.contains('keyboard-button')) return;

    let key = e.target.textContent;
    if (key === 'Del') key = 'Backspace';

    document.dispatchEvent(new KeyboardEvent('keyup', { key }));
});

initBoard();
