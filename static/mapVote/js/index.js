const nextActionButton = document.getElementById('nextAction');
let currentAction = 0;

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
                })
                .catch((error) => {
                    alert('Voting already open');
                });
            changeText('Close Voting');
            break;
        case 1:
            //close vote
            fetch('/api/mapVote/close')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to close vote');
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
            changeText('Show Results');
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
                    window.location.href = `/textReveal?text=${data.map}`;
                })
                .catch((error) => {
                    console.error(error);
                });

            break;
    }
    currentAction++;
});
