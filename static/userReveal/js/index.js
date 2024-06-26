/* -------------------------------------- */
/* ------------  Settings  -------------- */
/* -------------------------------------- */

const pullUserButton = document.getElementById('pullUser');
const volumeSlider = document.getElementById('volumeSlider');
const userListWrapper = document.getElementById('userListWrapper');
const userList = document.getElementById('userList');

const message = 'RonstaEnergy'.toUpperCase(); // The message displayed
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-.'; // All possible characters
const fontSize = 80; // Font size and overall scale
const speedLossPerFrame = 0.003; // Speed loss per frame
const startSpeed = 0.8; // Initial speed of the letters
const finalSpeed = 0.4; // Speed at which the letter stops default 0.05
const firstLetterStopFrame = 60 * 1; // Number of frames until the first letter stops (60 frames per second)
let letterStopDelay = 40 / (5 / message.length); // Number of frames between letters stopping
const stopSoundSource = '/assets/EpicReveal.mp3'; // Sound played when a letter stops
let volume = 0.5; // Volume of the sound
let animationRunning = false;
let pulledUsers = [];

//get volume from local storage
if (localStorage.getItem('volume')) {
    volume = localStorage.getItem('volume');
    volumeSlider.value = volume * 100;
}

const canvas = document.getElementById('textReveal');
const ctx = canvas.getContext('2d');

// Resize canvas on window resize
window.onresize = function () {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
};
onresize();

ctx.globalAlpha = 1;
ctx.fillStyle = '#622';
const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
gradient.addColorStop(0.1, 'transparent');
gradient.addColorStop(0.3, '#622'); // Adjust fade start position
gradient.addColorStop(0.7, '#622'); // Adjust fade end position
gradient.addColorStop(0.9, 'transparent');
ctx.fillStyle = gradient;
ctx.fillRect(0, (canvas.height - fontSize) / 2, canvas.width, fontSize);

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function revealText(text) {
    animationRunning = true;
    const messageLetters = text.split('');
    const alphabetLetters = alphabet.split('');
    let charMap = [];
    let letterOffset = [];
    let letterVerticalOffset = [];
    let soundPlayed = [];
    let lettersFinished = 0;
    // Create a separate shuffled alphabet for each letter column
    const shuffledAlphabets = [];
    for (let i = 0; i < messageLetters.length; i++) {
        shuffledAlphabets.push(shuffleArray([...alphabetLetters]));
    }

    // Map each character to its index in the alphabet
    for (let i = 0; i < alphabetLetters.length; i++) {
        charMap[alphabetLetters[i]] = i;
    }

    console.log(charMap);

    // Calculate initial vertical offset and speed for each letter
    for (let i = 0; i < messageLetters.length; i++) {
        const frameToStop = firstLetterStopFrame + letterStopDelay * i;
        letterVerticalOffset[i] = startSpeed + speedLossPerFrame * frameToStop;
        letterOffset[i] =
            (-(1 + frameToStop) *
                (speedLossPerFrame * frameToStop + 2 * startSpeed)) /
            2;
    }

    //const opacity = 1 - Math.abs(j + offset) / (canvas.height / 2 / fontSize + 1);
    //ctx.globalAlpha = opacity;
    ctx.font = fontSize + 'px Montserrat-ExtraBold';

    // Animation loop
    requestAnimationFrame(function loop() {
        // Clear canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background rectangle with fade
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#622';
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0.1, 'transparent');
        gradient.addColorStop(0.3, '#622'); // Adjust fade start position
        gradient.addColorStop(0.7, '#622'); // Adjust fade end position
        gradient.addColorStop(0.9, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, (canvas.height - fontSize) / 2, canvas.width, fontSize);

        // Draw each letter
        for (let i = 0; i < messageLetters.length; i++) {
            ctx.fillStyle = '#ccc';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.setTransform(
                1,
                0,
                0,
                1,
                Math.floor(
                    (canvas.width - fontSize * (messageLetters.length - 1)) / 2
                ),
                Math.floor(canvas.height / 2)
            );

            // Calculate letter offset
            let offset = letterOffset[i];
            while (offset < 0) offset++;
            offset %= 1;

            const characterHeight = Math.ceil(canvas.height / 2 / fontSize);
            // Draw characters above and below the target letter with decreasing opacity
            /*for (let j = -characterHeight; j < characterHeight; j++) {
                let charIndex =
                    charMap[messageLetters[i]] +
                    j -
                    Math.floor(letterOffset[i]);
                while (charIndex < 0) charIndex += alphabetLetters.length;
                charIndex %= alphabetLetters.length;

                ctx.fillText(
                    alphabetLetters[charIndex],
                    fontSize * i,
                    (j + offset) * fontSize
                );
            }*/
            for (let j = -characterHeight; j < characterHeight; j++) {
                let charIndex =
                    shuffledAlphabets[i].indexOf(messageLetters[i]) +
                    j -
                    Math.floor(letterOffset[i]);
                while (charIndex < 0) charIndex += shuffledAlphabets[i].length;
                const actualCharIndex = charIndex % shuffledAlphabets[i].length;
                ctx.fillText(
                    shuffledAlphabets[i][actualCharIndex],
                    fontSize * i,
                    (j + offset) * fontSize
                );
            }

            // Update letter offset and speed
            letterOffset[i] += letterVerticalOffset[i];
            letterVerticalOffset[i] -= speedLossPerFrame;

            // Stop letter when it reaches the final speed
            if (letterVerticalOffset[i] < finalSpeed) {
                letterOffset[i] = 0;
                letterVerticalOffset[i] = 0;
                if (!soundPlayed[i]) {
                    const audio = new Audio(stopSoundSource);
                    audio.volume = volume;
                    audio.play();
                    soundPlayed[i] = true;
                    lettersFinished++;
                    if (lettersFinished == messageLetters.length) {
                        animationRunning = false;
                    }
                }
            }
        }

        // Request next frame
        requestAnimationFrame(loop);
    });
}

pullUserButton.addEventListener('click', () => {
    if (animationRunning) return;
    if (pulledUsers.length == window.users.length) {
        console.log('All users pulled');
        //set scrool to one page down
        userListWrapper.classList.remove('invisible');
        userListWrapper.classList.remove('opacity-0');
        for (let i = 0; i < window.users.length; i++) {
            let li = document.createElement('li');
            li.innerText = window.userNames[i];
            userList.appendChild(li);
        }
        return;
    }
    let user = window.users[pulledUsers.length];
    letterStopDelay = 15; // 40 / (user.length / 5);
    revealText(window.users[pulledUsers.length].toUpperCase());
    if (pulledUsers.length == window.users.length - 1) {
        pullUserButton.innerText = 'Continue';
    }
    pulledUsers.push(window.users[pulledUsers.length]);
});

volumeSlider.addEventListener('input', () => {
    volume = volumeSlider.value / 100;
    localStorage.setItem('volume', volume);
});
