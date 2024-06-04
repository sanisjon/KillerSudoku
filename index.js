let HAS_CONTINUE = false;
let TO_CONTINUE = null;

const play =document.getElementById('play');
const instruction =document.getElementById('instruction');

function make_grid_preview(blocks){

    let grid_prew = document.createElement("div");
    grid_prew.classList.add('grid');

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
        grid_prew.appendChild(square)
    }
    return grid_prew
}

async function fetch_game_from_clipboard() {
    return new Promise((resolve, reject) => {
        try {
            const gamesList = JSON.parse(localStorage.getItem('last_game')) || [];
            resolve(gamesList[0]);
        } catch (error) {
            reject(error);
        }
    });
}
async function ContinueGame() {
    const game = await fetch_game_from_clipboard();
    if (game) {
        HAS_CONTINUE = true;
        TO_CONTINUE = game;
        // play.innerText='Continue';
        play.innerHTML = `
                            <p>Continue</p>
                            <span>
                                <p><img src="svg/stopky.svg" alt=" "> ${game.time}</p>
                                <p>${game.difficulty.toUpperCase()}</p>
                            </span>
                        `;

        const grid = make_grid_preview(game.blocks);
        instruction.innerHTML=''
        instruction.appendChild(grid)
    }

}

ContinueGame().then()

document.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('.radio-buttons input[type="radio"]');
    const skullEasy = document.getElementById('skull_easy');
    const skullHard = document.getElementById('skull_hard');
    const skullExpert = document.getElementById('skull_expert');
    const skulls = [skullEasy, skullHard, skullExpert];
    const info =document.getElementById('instruction');

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            HAS_CONTINUE = false;
            info.style.display = 'none';

            play.innerHTML='<p>New Game</p>';
            skulls.forEach(skull => {
                if (skull.classList.contains('show')) {
                    skull.classList.remove('show');
                    skull.classList.add('hide');
                    setTimeout(() => {
                        skull.classList.remove('hide');
                    }, 500);
                }
            });

            if (radio.checked) {
                let selectedSkull;
                if (radio.id === 'easy') {
                    selectedSkull = skullEasy;
                } else if (radio.id === 'hard') {
                    selectedSkull = skullHard;
                } else if (radio.id === 'expert') {
                    selectedSkull = skullExpert;
                }

                setTimeout(() => {
                    selectedSkull.classList.add('show');
                }, 10);
            }
        });
    });
});
play.addEventListener('click', function(event) {
    event.preventDefault();
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    if (HAS_CONTINUE){
        window.location.href = `KillerSudoku.html?clipboard=${1}`;
        return
    }
    if (selectedDifficulty) {
        const difficulty = selectedDifficulty.value;
        window.location.href = `KillerSudoku.html?difficulty=${difficulty}`;
    } else {
        alert('Please select a difficulty level.');
    }
});


