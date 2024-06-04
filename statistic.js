const statisticEASY =JSON.parse(localStorage.getItem('easy')) || false;
const statisticHARD = JSON.parse(localStorage.getItem('hard')) || false;
const statisticEXPERT = JSON.parse(localStorage.getItem('expert')) || false;

const section = document.querySelector('section');
const radioButtons = document.querySelectorAll('input[name="difficulty"]');

function convertSecondsToMinutes(seconds) {
    if (typeof seconds !== 'number') {
        return "---";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
}
function create_column(game_difficulty){
    if(game_difficulty === 'all'){return createAllStatisticCard()}
    let statistic =  JSON.parse(localStorage.getItem(game_difficulty)) || false
    if(statistic){
        let column = document.createElement('div');
        column.classList.add('column');

        // const averageWinRate = (statistic.numOfGames && statistic.wins) ? (statistic.wins / statistic.numOfGames) * 100 : 0;
        const averageWinRate = (statistic.numOfGames && statistic.wins) ? parseFloat(((statistic.wins / statistic.numOfGames) * 100).toFixed(1)) : 0;
        const imgSrc = 'img/'+game_difficulty+'_skull.png';

        column.innerHTML = `
          <img class="skull" src="${imgSrc}" ALT="">
            <h2>${game_difficulty.toUpperCase()}</h2>
            <div class="container">
                <div class="stat">
                    <img src="svg/score.svg" alt="">
                    Best Score: <span id="easy-best-score">${statistic.bestScore}</span>
                </div>
                <div class="stat">
                    <img src="svg/time.svg" alt="">
                    Best Time: <span id="easy-best-time">${convertSecondsToMinutes(statistic.betsTime)}</span></div>
                <div class="stat">
                    <img src="svg/win_cup.svg" alt="">
                    Number of Wins: <span id="easy-wins">${statistic.wins}</span></div>
                <div class="stat">
                    <img src="svg/lose.svg" alt="">
                    Number of Losses: <span id="easy-losses">${statistic.lose}</span></div>
                <div class="stat">
                    <img src="svg/scale.svg" alt="">
                    Average Win Rate: <span id="easy-win-rate">${averageWinRate}%</span></div>
            </div>
    `;

        return column;
    }else{
        return false
    }
}
function createAllStatisticCard(){
    const getBestTime = (...times) => {
        const validTimes = times.filter(time => typeof time === 'number');

        if (validTimes.length === 0) {
            return "___";
        }

        return Math.min(...validTimes);
    };

    const bets_score = Math.max(
        statisticEASY?.bestScore || 0,
        statisticHARD?.bestScore || 0,
        statisticEXPERT?.bestScore || 0
    );

    const bets_time = getBestTime(
        statisticEASY?.betsTime,
        statisticHARD?.betsTime,
        statisticEXPERT?.betsTime
    );

    const num_of_wins = (statisticEASY?.wins || 0) + (statisticHARD?.wins || 0) + (statisticEXPERT?.wins || 0);
    const num_of_loses = (statisticEASY?.lose || 0) + (statisticHARD?.lose || 0) + (statisticEXPERT?.lose || 0);

    const averageWinRate = num_of_wins > 0 ? parseFloat((num_of_wins / (num_of_wins + num_of_loses)) * 100).toFixed(1) : 0;


    let column = document.createElement('div');
    column.classList.add('column');
    column.innerHTML = `
          <img class="skull" src="svg/all.svg" ALT="All">
            <h2>ALL GAMES</h2>
            <div class="container">
                <div class="stat">
                    <img src="svg/score.svg" alt="">
                    Best Score: <span id="best-score">${bets_score}</span>
                </div>
                <div class="stat">
                    <img src="svg/time.svg" alt="">
                    Best Time: <span id="best-time">${convertSecondsToMinutes(bets_time)}</span></div>
                <div class="stat">
                    <img src="svg/win_cup.svg" alt="">
                    Number of Wins: <span id="wins">${num_of_wins}</span></div>
                <div class="stat">
                    <img src="svg/lose.svg" alt="">
                    <p id="loses_text">Number of Losses: </p> <span id="losses">${num_of_loses}</span></div>
                <div class="stat">
                    <img src="svg/scale.svg" alt="">
                    <p id="AWR_text">Average Win Rate: </p> <span id="win-rate">${averageWinRate}%</span></div>
            </div>
    `;

    return column;

}


radioButtons.forEach(radioButton => {
    radioButton.addEventListener('click', (event)=>{
            console.log("Radios clicked");
            const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
            console.log(selectedDifficulty.value)

            const DifficultyStatisticCard = create_column(selectedDifficulty.value);
            if(DifficultyStatisticCard){
                section.innerHTML=''
                section.appendChild(DifficultyStatisticCard);
            }else{
                section.innerHTML = `<h1> No ${selectedDifficulty.value.toUpperCase()} games has been played </h1>`;
            }
        });

})

section.appendChild(create_column('all'))

function checkWindowSize() {
    const lossesElement = document.getElementById('loses_text');
    const winRateElement = document.getElementById('AWR_text');
    if (window.innerWidth <= 550) {
        lossesElement.innerText = 'Loses: ';
        winRateElement.innerText = 'AWR: ';
    }else{
        lossesElement.innerText = 'Number of Losses: ';
        winRateElement.innerText = 'Average Win Rate: ';
    }
}


window.addEventListener('resize', checkWindowSize)
checkWindowSize()