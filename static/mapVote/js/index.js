const nextActionButton = document.getElementById('nextAction');
const validContent = document.getElementById('validContent');
let currentAction = 0;
let map;
let mapAbbr;
let gamemode;

const maps = {
    'monaco': 'Monaco',
    'horizon': 'Sys Horizon',
    'vegas': 'Las Vegas',
    'skyway': 'Skyway Stadium',
    'kyoto': 'Kyoto',
    'seoul': 'Seoul',
};

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
const firstLetterStopFrame = 60 * 2; // Number of frames until the first letter stops (60 frames per second)
let letterStopDelay = 20; // Number of frames between letters stopping
const stopSoundSource = '/assets/EpicReveal.mp3'; // Sound played when a letter stops
let volume = 0.5; // Volume of the sound
let animationRunning = false;

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

function changeText(text) {
    nextActionButton.classList.add('fadeOutIn');
    setTimeout(() => {
        nextActionButton.innerText = text;
    }, 250);
    setTimeout(() => {
        nextActionButton.classList.remove('fadeOutIn');
    }, 250);
}

nextActionButton.addEventListener('click', () => {
    switch (currentAction) {
        case 0:
            //start vote
            fetch('/api/mapVote/start')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to start vote');
                    }
                    changeText('Close Map Voting');
                })
                .catch((error) => {
                    alert('Voting already open');
                });
            break;
        case 1:
            //close vote
            fetch('/api/mapVote/close')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to close vote');
                    }
                    validContent.classList.add('hidden');
                    initTextReveal();
                    changeText('Reveal Map');
                })
                .catch((error) => {
                    console.error(error);
                });
            break;
        case 2:
            //show results
            nextActionButton.classList.add('fadeOut');
            fetch('/api/mapVote/results')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to show results');
                    }
                    return response.json();
                })
                .then((data) => {
                    //go to /textReveal?text=map
                    //window.location.href = `/textReveal?text=${data.map}`;
                    mapAbbr = data.map.toUpperCase();
                    map = maps[data.map.toLowerCase()].toUpperCase();
                    let dashes = '-'.repeat(
                        Math.floor((16 - data.map.length) / 2)
                    );
                    revealText(`${dashes}${map.replace(' ', '-')}${dashes}`);
                    nextActionButton.classList.remove('fadeOut');
                    nextActionButton.innerText = 'Open Gamemode Voting';
                })
                .catch((error) => {
                    console.error(error);
                });
            break;
        case 3:
            //start vote
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            fetch('/api/gamemodeVote/getValidOptions?map=' + mapAbbr)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to get valid options');
                    }
                    return response.json();
                })
                .then((data) => {
                    validContent.innerHTML = '';
                    let li = document.createElement('li');
                    li.innerText = 'VALID GAMEMODES:';
                    validContent.appendChild(li);
                    data.forEach((option) => {
                        let li = document.createElement('li');
                        li.innerText = option.toUpperCase();
                        validContent.appendChild(li);
                    });
                    validContent.classList.remove('hidden');
                    fetch('/api/gamemodeVote/start')
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Failed to start vote');
                            }
                            changeText('Close Gamemode Voting');
                        })
                        .catch((error) => {
                            alert('Voting already open');
                        });
                });
            break;
        case 4:
            //close vote
            fetch('/api/gamemodeVote/close')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to close vote');
                    }
                    validContent.classList.add('hidden');
                    initTextReveal();
                    changeText('Reveal Gamemode');
                })
                .catch((error) => {
                    console.error(error);
                });
            break;
        case 5:
            //show results
            nextActionButton.classList.add('fadeOut');
            fetch('/api/gamemodeVote/results')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to show results');
                    }
                    return response.json();
                })
                .then((data) => {
                    //go to /textReveal?text=map
                    //window.location.href = `/textReveal?text=${data.map}`;
                    gamemode = data.gamemode.toUpperCase();
                    let dashes = '-'.repeat(
                        Math.floor((16 - data.gamemode.length) / 2)
                    );
                    revealText(
                        `${dashes}${gamemode.replace(' ', '-')}${dashes}`
                    );
                    nextActionButton.classList.remove('fadeOut');
                    nextActionButton.innerText = 'Show Results';
                })
                .catch((error) => {
                    console.error(error);
                });
            break;
        case 6:
            userListWrapper.classList.remove('invisible');
            userListWrapper.classList.remove('opacity-0');
            let li = document.createElement('li');
            li.innerText = map;
            userList.appendChild(li);
            li = document.createElement('li');
            li.innerText = gamemode;
            userList.appendChild(li);
            break;
    }
    currentAction++;
});

function initTextReveal() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = ' ';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0.1, 'transparent');
    gradient.addColorStop(0.3, '#2e2e2e'); // Adjust fade start position
    gradient.addColorStop(0.7, '#2e2e2e'); // Adjust fade end position
    gradient.addColorStop(0.9, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, (canvas.height - fontSize) / 2, canvas.width, fontSize);
}

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
        initTextReveal();

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
                if (lettersFinished == messageLetters.length) {
                    animationRunning = false;
                }
                if (!soundPlayed[i]) {
                    const audio = new Audio(stopSoundSource);
                    audio.volume = volume;
                    audio.play();
                    soundPlayed[i] = true;
                    lettersFinished++;
                }
            }
        }

        // Request next frame
        if (!animationRunning) {
            return;
        }
        requestAnimationFrame(loop);
    });
}

volumeSlider.addEventListener('input', () => {
    volume = volumeSlider.value / 100;
    localStorage.setItem('volume', volume);
});
