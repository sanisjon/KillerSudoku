const play =document.getElementById('play');
const show_stage =document.getElementById("show");
let selected_index = null


async function fetch_all_games() {
    return new Promise((resolve, reject) => {
        try {
            const gamesList = JSON.parse(localStorage.getItem('gamesList')) || [];
            resolve(gamesList);
        } catch (error) {
            reject(error);
        }
    });
}
async function delete_game(index) {
    try {
        let gamesList = JSON.parse(localStorage.getItem('gamesList')) || [];
        if (index >= 0 && index < gamesList.length) {
            gamesList.splice(index, 1);
            localStorage.setItem('gamesList', JSON.stringify(gamesList));
        }
    } catch (error) {
        console.error('Error deleting game:', error);
    }
}


function make_grid(blocks){

    let grid = document.createElement("div");
    grid.classList.add('grid');

    const BlockToHTML = (block) => {
        const value = block.value
        const hidden = block.hidden
        const guess = block.guess

        let blockDiv = document.createElement('div');
        blockDiv.classList.add('block');

        let value_div = document.createElement("div");

        if(guess != null){
            value_div.innerText = guess;
            value_div.classList.add('value');
            blockDiv.classList.add('guess')
        }else {
            if(hidden){
                value_div.innerText = " ";
            }
            else{
                value_div.innerText = value;
            }
            value_div.classList.add('value');
        }


        blockDiv.appendChild(value_div)
        return blockDiv
    }

    // Pocet Square
    for (let i = 0; i < 9; i++) {
        let square = document.createElement("div");
        square.classList.add('square');
        for (let j = 0; j < 9; j++) {
            square.appendChild(BlockToHTML(blocks[9*i+j]));
        }
        grid.appendChild(square)
    }
    return grid
}
function create_card(time, mistakes, score, blocks, difficulty, index){
    const grid = make_grid(blocks);

    let cardDiv = document.createElement('div');
    cardDiv.classList.add('play_card');
    cardDiv.setAttribute('data-index', index);
    cardDiv.innerHTML = `
        <div class="${difficulty} diff" >${difficulty.toUpperCase()}</div>
        <div class="preview"></div>
        <section> 
            <div>
                <p>Time</p>
                <p>${time}</p>
            </div>
            <div>
                <p>Mistakes</p>
                <p>${mistakes}</p>   
            </div>
            <div>
                <p>Score</p>
                <p>${score}</p>
            </div>        
        </section>
        <button class="delete-button"><img src="svg/bin.svg" alt="Delete"></button>
    `;

    cardDiv.querySelector('.preview').appendChild(grid);

    return cardDiv;
}

async function show_games() {
    try {
        const games = await fetch_all_games();
        show_stage.innerHTML = '<h1>No games found</h1>';
        if (games.length > 0) {
            show_stage.innerHTML = '';
            games.forEach((game, index) => {

                const card = create_card(game.time, game.mistakes, game.score, game.blocks, game.difficulty, index);

                // SELECT
                card.addEventListener("click", (event)=>{
                    selected_index = event.currentTarget.getAttribute('data-index');
                    play.classList.add('show');

                    const selectedCard = show_stage.querySelector('.play_card.selected');

                    // Yoinking class .selected from selected block if exist
                    if (selectedCard) {
                        selectedCard.classList.remove('selected');
                    }
                    card.classList.add('selected');
                })
                // DELETE
                card.querySelector('.delete-button').addEventListener("click", (event) => {
                    event.stopPropagation();
                    card.classList.add('deleted');
                    setTimeout(() => {
                        delete_game(selected_index).then(show_games)
                        selected_index = null;

                        play.classList.remove('show')
                    }, 600);
                });

                show_stage.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching games:', error);
    }
}

show_games().then((games) => {})

// PLAY
play.addEventListener('click', function(event) {
    event.preventDefault();
    if (selected_index) {
        window.location.href = `KillerSudoku.html?game_index=${selected_index}`;
    } else {
        alert('Please select game to continue.');
    }
});
// removeSelection
window.addEventListener("click", () =>{
        show_stage.querySelectorAll('.play_card').forEach(playCard => {playCard.classList.remove('selected');});
    play.classList.remove('show');

    }, true)