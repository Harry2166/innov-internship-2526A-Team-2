import { WORDS } from './words.js';

const NUMBER_OF_GUESSES = 6;
const WORD_LENGTH = 5;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let gameOver = false;
const rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];

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
    for (const elem of document.getElementsByClassName('keyboard-button')) {
        if (elem.textContent === letter) {
            elem.style.backgroundColor = color;
            break;
        }
    }
}

function deleteLetter() {
    currentGuess.pop();
    nextLetter -= 1;
    const row = document.getElementsByClassName('letter-row')[6 - guessesRemaining];
    const box = row.children[nextLetter];
    box.textContent = '';
    box.classList.remove('filled-box');
}

function checkGuess() {
    const row = document.getElementsByClassName('letter-row')[6 - guessesRemaining];
    const guessString = currentGuess.join('');
    const rightGuess = Array.from(rightGuessString);

    if (guessString.length !== WORD_LENGTH) {
        alert('Not enough letters!');
        return;
    }

    if (!WORDS.includes(guessString)) {
        alert('Not an English word!');
        return;
    }

    const colors = Array(WORD_LENGTH).fill('grey');

    // count frequency of each letter
    const freq = {};
    for (const letter of rightGuess) {
        if (freq[letter]) {
            freq[letter] += 1;
        } else {
            freq[letter] = 1;
        }
    }

    // mark greens first
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (currentGuess[i] === rightGuess[i]) {
            colors[i] = 'green';
            freq[currentGuess[i]] -= 1;
        }
    }

    // mark yellows next, considering freq
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = currentGuess[i];

        if (colors[i] === 'grey' && freq[letter] > 0) {
            colors[i] = 'yellow';
            freq[letter] -= 1;
        }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        const box = row.children[i];
        const letter = currentGuess[i];
        const letterColor = colors[i];

        const delay = 50 * i;
        setTimeout(() => {
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, delay);
    }

    if (guessString === rightGuessString && guessesRemaining > 0) {
        guessesRemaining -= 1;
        gameOver = true;
        alert('You guessed right! Game over!');
        return;
    }

    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining <= 0) {
        gameOver = true;
        alert("You've run out of guesses! Game over!");
        alert(`The right word was: "${rightGuessString}"`);
    }
}

function removeCurrentGuess() {
    const row = document.getElementsByClassName('letter-row')[6 - guessesRemaining];
    const colors = Array(WORD_LENGTH).fill('grey');

    for (let i = 0; i < WORD_LENGTH; i++) {
        const box = row.children[i];
        const letterColor = colors[i];

        const delay = 50 * i;
        setTimeout(() => {
            box.style.backgroundColor = letterColor;
            box.classList.add('filled-box');
            shadeKeyBoard('', letterColor);
        }, delay);
    }

    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining <= 0) {
        gameOver = true;
        alert("You've run out of guesses! Game over!");
        alert(`The right word was: "${rightGuessString}"`);
    }
}

function insertLetter(pressedKey) {
    if (nextLetter === WORD_LENGTH) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();

    const row = document.getElementsByClassName('letter-row')[6 - guessesRemaining];
    const box = row.children[nextLetter];
    box.textContent = pressedKey;
    box.classList.add('filled-box');
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

document.addEventListener('keyup', e => {
    if (gameOver || guessesRemaining <= 0) {
        return;
    }

    const pressedKey = String(e.key);
    if (pressedKey === 'Backspace' && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === 'Enter') {
        checkGuess();
        return;
    }

    const found = pressedKey.match(/[a-z]/gi);
    if (!found || found.length > 1) {
        return;
    }
    insertLetter(pressedKey);
});

document.getElementById('keyboard-cont').addEventListener('click', e => {
    const target = e.target;

    if (!target.classList.contains('keyboard-button')) {
        return;
    }
    let key = target.textContent;

    if (key === 'Del') {
        key = 'Backspace';
    }

    document.dispatchEvent(new KeyboardEvent('keyup', { key: key }));
});

initBoard();
