//fetch /api/leaderboard
//division is in query params

const leaderboardList = document.getElementById('leaderboardList');

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

const division = params.division;

fetch(`/api/leaderboard?division=${division}`)
    .then((res) => res.json())
    .then((data) => {
        data.forEach((user) => {
            const li = document.createElement('li');
            li.textContent = `${user.rank}. ${user.name} - ${user.score} score`;
            leaderboardList.appendChild(li);
        });
    })
    .catch((err) => {
        alert('Failed to fetch leaderboard data');
    });
