// script.js
/* GLOBALS
* */
const color_select = "var(--selected_block)"
const color_sumFields = "var(--selected_sumFields)"
const color_select_rest = "var(--selected_block_rest)"
const color_select_same = "var(--selected_block_same)"

// SUPER_CONF
let IS_FETCHED = false;
let IS_CONTINUING =false;
let GAME_INDEX = null

// GLOBAL CONF
let difficulty = null;
let game_id = null;
let game_num = null
let fetched_blocks = null;
let points = {correct: 600, wrong: 900}

// State variables
let SelectedBlock = null
let Note = false;
let HistoryOfMoves = null;

// Behavioral;
let Mistakes = 0;
let Hints = 3;
let Score = 0;
let timerInterval;
let totalSeconds = 0;

// HTML ELEMENTS
const main = document.getElementById('sudoku-container')
const NumBar = document.getElementById('number_bar')

const undo = document.getElementById('undo');
const note = document.getElementById('note');
    const note_checkbox = document.getElementById('note_checkbox');
const erase = document.getElementById('erase');
const hint = document.getElementById('hint');
    const remainder = document.getElementById('remainder');

const mistakes = document.getElementById('mistakes');
const score = document.getElementById('score');
let play_button = document.getElementById('play_button')
    const overlay = document.getElementById('overlay');
const Home = document.getElementById('Home')

// Classes and structure
let KillerGrid= null;
let SumFields = []
let Squares = []
let Blocks =[]
let NumberBlocks = []



/* Grid class definition
* */
class Grid {
    constructor() {
        this.field = new Array(3).fill(null).map(() => new Array(3).fill(null));
    }

    // @return HTML Grid
    toHTML(){
        let grid_div = document.createElement("div");
        grid_div.classList.add("grid");
        for(let i = 0; i < this.field.length; i++){
            for(let j = 0; j < this.field[i].length; j++){
                grid_div.appendChild(this.field[i][j].toHTML());
            }
        }
        return grid_div;
    }
}

/* Square class Definition
* */
class Square{
    constructor(row, col) {
        this.row = row
        this.col = col
        this.field = new Array(3).fill(null).map(() => new Array(3).fill(null));
    }

    // @return HTML Square
    toHTML(){
        let square_div = document.createElement("div");
        square_div.classList.add("square");
        for(let i = 0; i < this.field.length; i++){
            for(let j = 0; j < this.field[i].length; j++){
                square_div.appendChild(this.field[i][j].toHTML());
            }
        }
        return square_div;
    }
    setColorToBlocks(Color){
        this.field.forEach((row) => {
            row.forEach((block) => {
                block.setColor(Color);
            })
        })
    }
}

/* Block class definition*/
class Block {
    constructor(row, col, value, square) {

        this.value = value;
        this.hidden = false;
        this.guess = null;
        this.note = Array(9).fill(null);

        this.row = row;
        this.col = col;

        this.square = square;

        this.sumField = null;
        this.sumValue = null;
        this.baseColor = 'var(--base_block)';
        this.color = this.baseColor;

        this.styles = {};

        this.borderColor = 'var(--base_border)'
        this.borderWidth = "3px";
        this.borderStyle = "dashed";

        this.margin = "3px"

    }
    left() {
        this.styles.borderLeft = this.borderWidth +' '+ this.borderStyle +' '+ this.borderColor;
        this.styles.marginLeft = this.margin;
        return this;
    }
    right() {
        this.styles.borderRight = this.borderWidth +' '+ this.borderStyle +' '+ this.borderColor;
        this.styles.marginRight = this.margin;
        return this;
    }
    top() {
        this.styles.borderTop = this.borderWidth +' '+ this.borderStyle +' '+ this.borderColor;
        this.styles.marginTop = this.margin;
        return this;
    }
    bottom() {
        this.styles.borderBottom = this.borderWidth +' '+ this.borderStyle +' '+ this.borderColor;
        this.styles.marginBottom = this.margin;
        return this;
    }

    // @return HTML Block
    toHTML() {
        let blockDiv = document.createElement('div');
        blockDiv.classList.add('block');

        let sumValueDiv = document.createElement('div');
        sumValueDiv.innerText = this.sumValue;
        sumValueDiv.classList.add('sum_of_field');
        blockDiv.appendChild(sumValueDiv);
        if(this.isNoted()){
            blockDiv.appendChild(this.NoteToHTML())
        }else{
            if (this.hidden === false){
                let value = document.createElement("div");
                value.innerText = this.value;
                value.classList.add('value');
                blockDiv.appendChild(value)
            }
            if(this.guess != null){
                let guess = document.createElement("div");
                guess.innerText = this.guess;
                guess.classList.add('guess');
                blockDiv.appendChild(guess)
            }
        }

        Object.assign(blockDiv.style, this.styles);
        blockDiv.style.backgroundColor = this.color;

        blockDiv.addEventListener('click', this.handleClick.bind(this));

        return blockDiv;
    }
    // @return Note HTML grid
    NoteToHTML(){
        let NoteGrid = document.createElement('div');
        NoteGrid.classList.add('noteGrid');

        this.note.forEach(note =>{
            const noteDiv = document.createElement("div");
            noteDiv.classList.add('noteNumber');

            if(note != null){
                noteDiv.innerText = note;
            }else{
                noteDiv.innerText = " ";
            }

            NoteGrid.appendChild(noteDiv)
        })
        return NoteGrid
    }

    // GUESS
    makeGuess(guess){
        if(this.hidden === false){
                console.log("   Block already filled")
            return}
        if (guess === this.value){
            this.hidden = false;
            this.guess = null;

            this.correctGuess();
            return;
        }

        this.guess = guess;
        if(HistoryOfMoves == null)HistoryOfMoves = new History();
        HistoryOfMoves.push(SelectedBlock);
        this.madeMistake();
    }
    correctGuess(){
        Score += points.correct
        score.innerText = Score
        checkWin()
    }
    madeMistake(){
        Score -= points.wrong;
        score.innerText = Score

        Mistakes += 1;
        mistakes.innerText = `${Mistakes}/3`;

        if(Mistakes > 2){
            clearInterval(timerInterval);
            SelectedBlock = null
            GameOver();
        }
    }
    addNote(number){
        if(this.hidden === false){
            console.log("   Block already filled")
            return;
        }
        if(this.note[number-1] === null)
            this.note[number-1] = number;
        else{
            this.note[number-1] = null;
        }
    }
        isNoted() {
        return this.note.some(value => value !== null);
    }
        resetNoteValues() {
            this.note.fill(null);
        }

    // HANDLE
    handleClick(event){
        SelectedBlock = this
        resetColors();
        this.square.setColorToBlocks(color_select_rest);
        this.color_row_col(color_select_rest)
        this.sumField.setColorToBlocks(color_sumFields);
        if(this.hidden === false){
            Blocks.forEach(block =>{
                if(block.hidden === false && block.value === this.value){
                    block.setColor(color_select_same);
                }
            })
        }
        this.setColor(color_select);
        render();
        event.stopPropagation();
    }

    color_row_col(color){
        const squares = this.get_neighbour_square();
        for (let i = 0; i <= 8; i++){
            switch (i) {
                case 0:
                    if(squares[i] != null){
                        this.color_row(squares[i], color);
                    }
                    break;
                case 1:
                    if(squares[i] != null){
                        this.color_row(squares[i], color);
                    }
                    break;
                case 2:
                    if(squares[i] != null){
                        this.color_row(squares[i], color);
                    }
                    break;
                case 3:
                    if(squares[i] != null){
                        this.color_row(squares[i], color);
                    }
                    break;
                case 4:
                    if(squares[i] != null){
                        this.color_col(squares[i], color);
                    }
                    break;
                case 5:
                    if(squares[i] != null){
                        this.color_col(squares[i], color);
                    }break;
                case 6:
                    if(squares[i] != null){
                        this.color_col(squares[i], color);
                    }break;
                case 7:
                    if(squares[i] != null){
                        this.color_col(squares[i], color);
                    }break;
                default:
                    break;
            }

        }
    }
        get_neighbour_square(){

            const getLeft = (x, y) => {
                if (x < 1) return null;
                else return { x: x - 1, y: y };
            }
            const getRight = (x, y) => {
                if (x > 1) return null;
                else return { x: x + 1, y: y };
            }
            const getTop = (x, y) => {
                if (y < 1) return null;
                else return { x: x, y: y - 1 };
            }
            const getDown = (x, y) => {
                if (y > 1) return null;
                else return { x: x, y: y + 1 };
            }

            const x = this.square.col
            const y = this.square.row

            let squares = [getLeft(x-1, y), getLeft(x, y),
                                  getRight(x+1, y), getRight(x, y),
                                  getTop(x, y-1), getTop(x, y),
                                  getDown(x, y+1), getDown(x, y)];
            for (let i = 0; i < 8; i++) {
                if(squares[i] === null)continue;
                Squares.forEach(square => {
                    let { col: x, row: y } = square;
                    if (x === squares[i].x && y===squares[i].y)squares[i]=square;
                })
            }
            return squares;
        }
        color_row(square, color){
            square.field.forEach(sq_row =>{
                sq_row.forEach(block =>{
                    if(block.row === this.row){
                        block.setColor(color)
                    }
                })
            })
        }
        color_col(square, color){
            square.field.forEach(sq_row =>{
                sq_row.forEach(block =>{
                    if(block.col === this.col){
                        block.setColor(color)
                    }
                })
            })
        }

    // RESET
    resetColor(){
        this.color = this.baseColor;
    }
    setColor(color){
        this.color = color;
    }
}

class SumField {
    constructor(sum) {
        this.field = [];
        this.sum = sum;
        this.color = null;
    }
    setColorToBlocks(color){
        for(let i = 0; i < this.field.length; i++){
            this.field[i].setColor(color);
        }
    }

    setBordersToBlock(pairs,KGrid){

        // console.log("\n\n")
        // console.log("Sum ",this.sum)
        // console.log("Field ", this.field)
        // console.log("positions.pairs", pairs)
        // console.log("\n")

        // GET
        const getLeft = (pair) => {
            const x = pair.position[1];
            const y = pair.position[0];
            if (x === 0) return null;
            else return { x: x - 1, y: y };
        }
        const getRight = (pair) => {
            const x = pair.position[1];
            const y = pair.position[0];
            if (x === 8) return null;
            else return { x: x + 1, y: y };
        }
        const getTop = (pair) => {
            const x = pair.position[1];
            const y = pair.position[0];
            if (y === 0) return null;
            else return { x: x, y: y - 1 };
        }
        const getDown = (pair) => {
            const x = pair.position[1];
            const y = pair.position[0];
            if (y === 8) return null;
            else return { x: x, y: y + 1 };
        }

        // HAS
        const hasLeft = (left) =>{
            if(left == null) return false;
            const x = left.x
            const y = left.y

            // const sq = KGrid.field[(x - (x%3))/3][(y - (y%3))/3]
            const sq = KGrid.field[Math.floor(y / 3)][Math.floor(x / 3)];
            const leftBlock = sq.field[y % 3][x % 3]
            return this.field.includes(leftBlock)
        }
        const hasRight = (right) => {
            if (right === null) return false;
            const x = right.x;
            const y = right.y;

            const sq = KGrid.field[Math.floor(y / 3)][Math.floor(x / 3)];
            const rightBlock = sq.field[y % 3][x % 3];

            return this.field.includes(rightBlock);
        }
        const hasTop = (top) => {
            if (top === null) return false;
            const x = top.x;
            const y = top.y;

            const sq = KGrid.field[Math.floor(y / 3)][Math.floor(x / 3)];
            const topBlock = sq.field[y % 3][x % 3];

            return this.field.includes(topBlock);
        }
        const hasDown = (down) => {
            if (down === null) return false;
            const x = down.x;
            const y = down.y;

            const sq = KGrid.field[Math.floor(y / 3)][Math.floor(x / 3)];
            const downBlock = sq.field[y % 3][x % 3];

            return this.field.includes(downBlock);
        }


        for (let i = 0; i < pairs.length; i++) {
            // console.log("Setting border for Block "+this.field[i].value +"  "+ pairs[i].position);
            if(!hasLeft(getLeft(pairs[i]))){
                this.field[i].left()
            }
            if(!hasRight(getRight(pairs[i]))){
                this.field[i].right()
            }
            if(!hasTop(getTop(pairs[i]))){
                this.field[i].top()
            }
            if(!hasDown(getDown(pairs[i]))){
                this.field[i].bottom()
            }
        }

    }

    bindSumFieldToBlocks(){
        for(let i = 0; i < this.field.length; i++){
            this.field[i].sumField = this;
        }
    }

    setSumValueToBlock(pairs, KGrid){
        const get_highest = (pairs) => {

            let highest = [pairs[0]]

            for (let i = 1; i < pairs.length; i++) {
                if (pairs[i].position[0] < highest[0].position[0]) {
                    highest = [pairs[i]]
                }
                else if(pairs[i].position[0] === highest[0].position[0]) {
                    highest.push(pairs[i])
                }
            }

            return highest;
        }
        const get_left = (pairs) => {

            let leftest = pairs[0]

            for (let i = 1; i < pairs.length; i++) {
                if (pairs[i].position[1] < leftest.position[1]) {
                    leftest = pairs[i]
                }
            }
            return leftest
        }
        const pivotPair = get_left(get_highest(pairs))
        const x = pivotPair.position[1];
        const y = pivotPair.position[0];

        const sq = KGrid.field[Math.floor(y / 3)][Math.floor(x / 3)];
        const pivot = sq.field[y % 3][x % 3]
        pivot.sumValue = this.sum
    }
}

/*Number bar*/
class Number_block{
    constructor(value) {
        this.value = value;
    }
    // @return HTML NumBlock
    toHTML(){
        let NumberBlock = document.createElement("div");
        NumberBlock.classList.add("num_block");
        NumberBlock.innerHTML = this.value;

        NumberBlock.addEventListener('click', this.handleClick.bind(this));
        return NumberBlock
    }
    handleClick(event){
        console.log("   Number clicked -> "+this.value);

        if(SelectedBlock === null){
            console.log("   No block is selected");
            return;
        }
        if(Note){
            SelectedBlock.addNote(this.value)
            event.stopPropagation()
        }else{
            SelectedBlock.resetNoteValues()
            SelectedBlock.makeGuess(this.value);
        }
        render();

    }
}

class History{
    constructor() {
        this.stack = [];
    }
    push(item) {
        this.stack.push(item);
    }

    pop() {
        if (this.stack.length === 0) {
            return null;
        }
        return this.stack.pop();
    }
}

// GET FUNCTIONS
function get_random_number(min, max){
    return Math.floor(Math.random()*(max - min + 1)) + min;
}
function get_randomColor() {
    // Generate random values for red, green, and blue components
    const r = Math.floor(Math.random() * 256); // Random number between 0 and 255
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r}, ${g}, ${b})`;
}
function generateUniqueId() {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base-36 string
    const randomString = Math.random().toString(36).substr(2, 5); // Generate a random string
    return timestamp + '-' + randomString; // Combine timestamp and random string
}


// FETCH FUNCTIONS
/* Function @return Matrix[][]
   if number of #file is valid and false if it is not*/
/* Function @return ArrayList of
    parsed data for SumFields*/
async function fetch_sudoku_ans(sudokuNumber, difficulty) {
    const filePath = "sudoku/" + difficulty + "/"+ sudokuNumber + ".ans";
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Chyba při načítání dat sudoku.ans');
        }
        const data = await response.text();

        const matrix = [];

        // Load rows
        const rows = data.trim().split('\n');

        rows.forEach(function(row) {
            // Clean rows from artefacts
            const cleanedRow = row.replace(/[\[\]\r]/g, '');

            // Make row array
            const numbers = cleanedRow.split(',').map(Number);

            matrix.push(numbers);
        });

        return matrix;
    } catch (err) {
        console.error('Chyba při čtení souboru sudoku.ans :', err);
        return false;
    }
}
async function fetch_sudoku_killer(sudokuNumber, difficulty) {
    const filePath = "sudoku/" + difficulty + "/"+ sudokuNumber + ".killer";
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Chyba při načítání dat sudoku.killer');
        }
        // const dataMap = new Map();
        const dataArray = [];
        const input = await response.text();
        const data = input.split("\n");

        // Funkce pro parsování řetězce na pozice a hodnoty
        const parseData = (str) => {
            // console.log("\n\n\nStr: "+str)
            const ROW = str.split('=');
            // console.log("ROW: " + ROW)
            const sum = parseInt(ROW[0], 10);
            // console.log("Sum: "+ sum+'\n\n')

            // console.log("Parts = "+ROW[1])

            const pairs = ROW[1].split('+').map(pairStr => {
                // console.log("PairStr: " + pairStr + "=> ")

                // Clean pairStr from artefacts
                const cleanedPair = pairStr.replace(/[()]/g, '');
                // console.log("   cleanedPair: "+cleanedPair)
                // Split to separate values
                const positionValue = cleanedPair.split(',').map(Number);
                const position = [positionValue[0], positionValue[1]];
                const value = positionValue[2];
                // console.log("   Result part = ["+ position+";"+ value+"]" );
                return { position, value};
            });
            return { sum, pairs};
        };

        // Uložení dat do mapy
        data.forEach(line => {
            if(line){
                const { sum, pairs } = parseData(line);
                dataArray.push({sum, pairs});
                // dataMap.set(sum, pairs);
            }
        });
        return dataArray


    }catch (err){
        console.error('Chyba při čtení souboru sudoku.killer :', err);
        return false;
    }
}

/* Function @return param passed by url
* */
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(name);
    return value !== null ? value : null;
}

/* Functions fetch saved delete games from local storage
* */
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
async function fetchGameByIndex(index) {
    const games = await fetch_all_games();
    return games[index];
}
async function fetchGameFromClipboard(){
    return new Promise((resolve, reject) => {
        try {
            const gamesList = JSON.parse(localStorage.getItem('last_game')) || [];
            resolve(gamesList[0]);
        } catch (error) {
            reject(error);
        }
    });
}

// DELETE
async function delete_game_from_clipboard(){
    try {
        localStorage.setItem('last_game', JSON.stringify([]));
    }catch (error){
        console.error('Error deleting game from clipboard:', error);
    }
}
async function delete_game_from_index(index) {
    if(index === null)return;
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

// SAVE FUNCTIONS
/* Function save important values to local storage

 */
function save_game() {
    const DTO_blocks = Blocks.map(block => ({
        value: block.value,
        hidden: block.hidden,
        guess: block.guess,
        note: block.note
    }));
    const game = {
        id: game_id,
        game_num: game_num,
        mistakes: Mistakes,
        score: Score,
        totalSeconds: totalSeconds,
        time: document.getElementById('time').textContent,
        difficulty: difficulty,
        hints: Hints,
        blocks: DTO_blocks,
    };

    let gamesList = JSON.parse(localStorage.getItem('gamesList')) || [];
    const existingGameIndex = gamesList.findIndex(g => g.id === game_id);

    if (existingGameIndex !== -1) {
        console.log("Overwrite game "+game_id)
        gamesList[existingGameIndex] = game;
    } else {
        console.log("Pushing game "+game_id)
        gamesList.push(game);
    }

    localStorage.setItem('gamesList', JSON.stringify(gamesList));
    delete_game_from_clipboard().then();
}
function save_game_to_clipboard(){
    const DTO_blocks = Blocks.map(block => ({
        value: block.value,
        hidden: block.hidden,
        guess: block.guess,
        note: block.note
    }));
    const game = {
        id: game_id,
        game_num: game_num,
        mistakes: Mistakes,
        score: Score,
        totalSeconds: totalSeconds,
        time: document.getElementById('time').textContent,
        difficulty: difficulty,
        hints: Hints,
        blocks: DTO_blocks,
    };

    let last_game = JSON.parse(localStorage.getItem('last_game')) || [];
    last_game[0] = game;
    localStorage.setItem('last_game', JSON.stringify(last_game));

}
function save_win(){
    let statistic =  JSON.parse(localStorage.getItem(difficulty)) || false
    let new_statistic;
    if (statistic){
        new_statistic ={
            bestScore: (statistic.bestScore < Score) ? Score : statistic.bestScore,
            betsTime: (statistic.betsTime > totalSeconds) ? totalSeconds : statistic.betsTime,
            wins: statistic.wins+1,
            lose: statistic.lose,
            numOfGames: statistic.numOfGames+1,
        }
    }else{
        new_statistic ={
            bestScore: Score,
            betsTime: totalSeconds,
            wins: 1,
            lose: 0,
            numOfGames: 1,
        }
    }
    localStorage.setItem(difficulty, JSON.stringify(new_statistic));
}
function save_lose(){
    let statistic =  JSON.parse(localStorage.getItem(difficulty)) || false
    let new_statistic;
    if (statistic){
        new_statistic ={
            bestScore: (statistic.bestScore < Score) ? Score : statistic.bestScore,
            betsTime: statistic.betsTime,
            wins: statistic.wins,
            lose: statistic.lose+1,
            numOfGames: statistic.numOfGames+1,
        }
    }else{
        new_statistic ={
            bestScore: Score,
            betsTime: "____",
            wins: 0,
            lose: 1,
            numOfGames: 1,
        }
    }
    localStorage.setItem(difficulty, JSON.stringify(new_statistic));
}





// INITIAL FUNCTIONS
/*@return Grid
    of squares by @sudoku input*/
function init_grid(sudoku){
    let grid = new Grid();
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            grid.field[i][j]= init_square(i,j,sudoku)
        }
    }
    return grid;

}
/* @return Square
   Return square with initialize(block)*/
function init_square(row, col, sudoku){
    let sq = new Square(row,col);
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            let rowIndex = (3*row)+i
            let colIndex = (3*col)+j
            let value = sudoku[rowIndex][colIndex]

            if (value){
                const block = new Block(i,j, value, sq)
                Blocks.push(block)
                sq.field[i][j] = block
            }
            else
            {
                console.log("FUCK")
                return;
            }
        }
    }
    Squares.push(sq)
    return sq;
}
/*@return SumField
by positions SumField is owner of Block*/
function init_SumField(positions, KGrid){
    let sumField = new SumField(positions.sum)

    positions.pairs.forEach(pair => {
        const row = pair.position[0]
        const col = pair.position[1]
        const hidden = pair.value === 0

        const sq = KGrid.field[(row - (row%3))/3][(col - (col%3))/3]

        let block = sq.field[row%3][col%3]
        block.hidden = hidden
        sumField.field.push(block)
    })

    sumField.setBordersToBlock(positions.pairs,KGrid)
    sumField.bindSumFieldToBlocks()
    sumField.setSumValueToBlock(positions.pairs, KGrid)
    SumFields.push(sumField)
}
/*@return Numbar for selecting numbers for input
* */
function init_numBar(){
    for (let i = 1; i < 10; i++) {
        const numBlock = new Number_block(i)
        NumberBlocks.push(numBlock)
        NumBar.appendChild(numBlock.toHTML())
    }
}

/* Modify Block bzy setup from fetched saved game blocks
* */
function init_apply_fetched_blocks(){
    if(IS_FETCHED || IS_CONTINUING){
        for (let i = 0; i < Blocks.length; i++) {
            const f_block = fetched_blocks[i];
            let locBlock = Blocks[i];
            locBlock.hidden = f_block.hidden;
            locBlock.guess = f_block.guess;
            locBlock.note = f_block.note;
        }
    }

}
function init_apply_behaviors() {
    mistakes.innerText = `${Mistakes}/3`;
    score.innerText = Score;
    remainder.innerText = Hints;
    if (Hints < 1) {
        remainder.classList.add('disable');
    } else {
        remainder.classList.add('available');
    }
}
function init_points(){
    if(difficulty === "easy"){
        points.correct = 650;
        points.wrong = 1000;
    }else if(difficulty === "hard"){
        points.correct = 800;
        points.wrong = 1500;
    }else{
        points.correct = 1000;
        points.wrong = 2000;
    }
}
function checkWindowSize() {
    console.log("Resiying")
    if (window.innerWidth <= 560) {
        console.log("yes")
        Blocks.forEach(block =>{
            block.margin ="2px";
            block.borderWidth ="1px";
        })
    }else{
        console.log("no")
        Blocks.forEach(block =>{
            block.margin ="3px";
            block.borderWidth ="3px";
        })
    }
}



// CREATE FUNCTIONS
// 1. Fetch parsed Sudoku_ans date
// 2. Init the Grid
// @return Grid
async function create_KillerGrid_and_SumField() {
    try {

        const clipboard = getQueryParameter('clipboard')
        if(clipboard != null){
            const clip = await fetchGameFromClipboard();
            IS_CONTINUING = true;
            game_id = clip.id;
            game_num  = clip.game_num;
            difficulty = clip.difficulty;

            fetched_blocks = clip.blocks;

            Mistakes = clip.mistakes;
            Score = clip.score;
            Hints = clip.hints;
            totalSeconds = clip.totalSeconds;
        }else{
            GAME_INDEX = getQueryParameter('game_index')
            if(GAME_INDEX != null){
                IS_FETCHED = true;
                const game = await fetchGameByIndex(GAME_INDEX);
                game_id = game.id;
                game_num  = game.game_num;
                difficulty = game.difficulty;

                fetched_blocks = game.blocks;

                Mistakes = game.mistakes;
                Score = game.score;
                Hints = game.hints;
                totalSeconds = game.totalSeconds;

            }
            else{
                game_id = generateUniqueId()
                game_num = get_random_number(1,2)
                difficulty = getQueryParameter('difficulty');
            }
        }


        const sudokuAns = await fetch_sudoku_ans(game_num,difficulty);
        KillerGrid = init_grid(sudokuAns);

        checkWindowSize()

        const sudokuKiller = await fetch_sudoku_killer(game_num, difficulty);
        sudokuKiller.forEach(positions =>{
            init_SumField(positions, KillerGrid)
        })


        init_numBar();
        init_apply_fetched_blocks();
        init_apply_behaviors();
        init_points();
        window.addEventListener('resize',() =>{
            checkWindowSize()
            sudokuKiller.forEach(positions =>{
                init_SumField(positions, KillerGrid)
            })
            render()
        })
        return true;
    } catch (error) {
            console.error('Chyba načítání sudoku při vytváření Grid: ', error);
            return false;
        }
    }


// RENDER
// 1. Reset color state for all Blocks
// 2. Render it to main as HTML
// 3. Append Time interrupting banner
// 4. Append Game interrupting banner
function resetColors(){
        Blocks.forEach(block => block.resetColor())
}
function render(){
    main.innerHTML='';
    main.appendChild(KillerGrid.toHTML())
}
function interruptTimer(){
    let time = document.getElementById('time').textContent;
    let mis = `${Mistakes}/3`
    let img_path = 'img/'+ difficulty +'_skull.png'
    let UPcase =  difficulty.toUpperCase()

    overlay.innerHTML = `
                            <div id="interrupted">
                                <div>
                                    <div>Pause</div>
                                    <section>
                                        <div>
                                            <p>Time</p>
                                            <p>${time}</p>
                                        </div>
                                        <div>
                                            <p>Mistakes</p>
                                            <p>${mis}</p>   
                                        </div>
                                        <div>
                                            <p>Score</p>
                                            <p>${Score}</p>
                                        </div>
                                        
                                    </section>
                                    <div id ="image" class="${difficulty}">
                                        <img src="${img_path}" alt="¯\_(ツ)_/¯">
                                        ${UPcase}
                                    </div>
                                    <button>
                                        <a href="#">
                                            Resume game    
                                        </a>
                                    </button>
                                    <a href="#" id="save_game">Save game</a>
                                </div>
                            </div>
                        `;

    const resumeButton = document.querySelector('#interrupted button');
    const save = document.getElementById('save_game');
    resumeButton.addEventListener('click', () => {
        overlay.innerHTML =''
        play_button.checked = false;
        startTimer()
    });
    save.addEventListener("click", (event)=>{
        save_game()
        overlay.style.pointerEvents = 'none';
        main.style.pointerEvents = 'none';
        event.stopPropagation()

        redirectTo('index.html')
    })
}
function GameOver(){
    const time = document.getElementById('time').textContent
    const mis = `${Mistakes}/3`
    let img_path = 'img/'+ difficulty +'_skull.png'
    let UPCase =  difficulty.toUpperCase()
    overlay.innerHTML = `
                            <div id="interrupted">
                                <div>
                                    <div>Game Over</div>
                                    <section>
                                        <div>
                                            <p>Time</p>
                                            <p>${time}</p>
                                        </div>
                                        <div>
                                            <p>Mistakes</p>
                                            <p>${mis}</p>   
                                        </div>
                                        <div>
                                            <p>Score</p>
                                            <p>${Score}</p>
                                        </div>
                                        
                                    </section>
                                    <div class="image"></div>
                                    <div id ="image" class="${difficulty}">
                                        <img src="${img_path}" alt="LOSER">
                                        ${UPCase}
                                    </div>
                                    <button>
                                        <a href="#">
                                            New Game
                                        </a>
                                    </button>
                                </div>
                            </div>
                        `;

    save_lose();

    const resumeButton = document.querySelector('#interrupted button');
    resumeButton.addEventListener('click', (event) => {
        overlay.innerHTML =''
        main.innerHTML =''

        overlay.style.pointerEvents = 'none';
        main.style.pointerEvents = 'none';
        event.stopPropagation()

        delete_game_from_clipboard().then()
        delete_game_from_index(GAME_INDEX).then()

        redirectTo('index.html')
    });
}

function WIN(){
    const time = document.getElementById('time').textContent
    const mis = `${Mistakes}/3`
    let img_path = 'img/'+ difficulty +'_skull.png'
    let UPcase =  difficulty.toUpperCase()
    overlay.innerHTML = `
                            <div id="interrupted">
                                <div>
                                    <div>Victory</div>
                                    <section>
                                        <div>
                                            <p>Time</p>
                                            <p>${time}</p>
                                        </div>
                                        <div>
                                            <p>Mistakes</p>
                                            <p>${mis}</p>   
                                        </div>
                                        <div>
                                            <p>Score</p>
                                            <p>${Score}</p>
                                        </div>
                                        
                                    </section>
                                    <div id ="image" class="${difficulty}">
                                        <img src="img/win.png" alt="WIN">
                                    </div>
                                    <button>
                                        <a href="#">
                                            New Game
                                        </a>
                                    </button>
                                </div>
                            </div>
                        `;

    save_win();

    const NewGameButton = document.querySelector('#interrupted button');
    NewGameButton.addEventListener('click', (event) => {
        overlay.innerHTML =''
        main.innerHTML =''

        overlay.style.pointerEvents = 'none';
        main.style.pointerEvents = 'none';
        event.stopPropagation()

        delete_game_from_clipboard().then()
        delete_game_from_index(GAME_INDEX).then()
        redirectTo('index.html')
    });
}
function redirectTo(url){
    setTimeout(() => {
        window.location.href = url;
    }, 500);

}

// BEHAVIORAL
function startTimer() {
    timerInterval = setInterval(() => {
        totalSeconds++;
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        document.getElementById('time').textContent = `${minutes}:${seconds}`;
    }, 1000);
}
function checkWin(){
    let win = true
    Blocks.forEach(block => {if(block.hidden)win = false})
    if(win){
        console.log("WIN")
        WIN()
    }
}

// MAIN
create_KillerGrid_and_SumField().then(render).then(startTimer)

// LISTENERS
window.addEventListener('click', function(event) {
    resetColors();
    SelectedBlock = null
    render()
});
document.addEventListener('keydown', function(event) {
    if(SelectedBlock === null){
        console.log("   No block is selected");
        return;
    }

    if (event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
        if (event.key >= '1' && event.key <= '9') {
            if(Note){
                SelectedBlock.addNote(event.key)
                event.stopPropagation()
                render();
            }else{
                SelectedBlock.resetNoteValues()
                SelectedBlock.makeGuess(parseInt(event.key));
                render();
            }
        }
    }
})

undo.addEventListener('click', () => {
    console.log("Undo button clicked");
    if(HistoryOfMoves){
        let last = HistoryOfMoves.pop()
        if(last){
            last.guess = null;
        }else{
            console.log("   No moves in stack")
        }
    }else{
        console.log("   No move have been done")
    }
    undo.classList.add("rotate")
    undo.addEventListener('animationend', () => {
        undo.classList.remove('rotate');
    }, { once: true });
});

note.addEventListener('click', (event) => {
    Note = !Note;

    console.log("Note button:");
    if(Note){console.log("   Active");}else{console.log("   Deactivated")}

    note_checkbox.addEventListener('click', (event) =>{
        event.stopPropagation()
    })
});

erase.addEventListener('click', () => {
    console.log("Erase button clicked");
    if(SelectedBlock){
        if (SelectedBlock.hidden){
            SelectedBlock.resetNoteValues()
            SelectedBlock.guess = null
        }else{
            console.log("Selected bock is already guessed")
        }
    }else{
        console.log("   No block is selected")
    }
    render();
});

hint.addEventListener('click', (event) => {
    console.log("Hint:");
    if(Hints<1){
        console.log("   No hints left ");
        return;
    }
    let trash_hold = 0;
    while (trash_hold < 100000) {
        const index = get_random_number(0,80)
        let block = Blocks[index]

        if(block.hidden === true){
            block.makeGuess(block.value);
            Hints--;
            remainder.innerText=Hints;
            break;
        }
        trash_hold ++
    }
    if(Hints<1){
        console.log("   No hints left");
        remainder.classList.remove('available')
        remainder.classList.add('disable')
        return;
    }
    render()
});

play_button.addEventListener('change', function() {
    play_button.classList.toggle("paused")
    if (this.checked) {
        clearInterval(timerInterval);
        interruptTimer();
    } else {
        startTimer();
    }
});

Home.addEventListener("click", ()=>{
    if(IS_FETCHED){
        save_game()
    }else{
        save_game_to_clipboard()
    }
    redirectTo('index.html')
})

