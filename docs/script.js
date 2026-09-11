const WINNING_LINES = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20]
];

let boardWords = [];
let markedState = Array(25).fill(false);

function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initBoard(forceRegenerate = false) {
    const savedWords = localStorage.getItem("bingo_words");
    const savedMarked = localStorage.getItem("bingo_marked");

    if (!forceRegenerate && savedWords && savedMarked) {
        boardWords = JSON.parse(savedWords);
        markedState = JSON.parse(savedMarked);
    } else {
        boardWords = shuffle(WORD_POOL).slice(0, 25);
        markedState = Array(25).fill(false);
        saveState();
    }
    renderBoard();
}

function saveState() {
    localStorage.setItem("bingo_words", JSON.stringify(boardWords));
    localStorage.setItem("bingo_marked", JSON.stringify(markedState));
}

function evaluateBoard() {
    const winningIndices = new Set();
    let lineCount = 0;

    WINNING_LINES.forEach(line => {
        const isComplete = line.every(index => markedState[index]);
        if (isComplete) {
            lineCount++;
            line.forEach(idx => winningIndices.add(idx));
        }
    });

    return {winningIndices, lineCount};
}

function renderBoard() {
    const $board = $("#bingoBoard").empty();
    const {winningIndices, lineCount} = evaluateBoard();

    boardWords.forEach((word, index) => {
        const isMarked = markedState[index];
        const isWinner = winningIndices.has(index);

        const $cell = $("<button>")
            .addClass("cell")
            .text(word)
            .attr("data-index", index);

        if (isMarked) $cell.addClass("cell--marked");
        if (isWinner) $cell.addClass("cell--winner");

        $board.append($cell);
    });

    if (lineCount > 0) {
        $("#winCountMessage").text(lineCount);
        $("#bingoBanner").show();
    } else {
        $("#bingoBanner").hide();
    }
}

$(document).ready(function () {
    initBoard();

    $("#bingoBoard").on("click", ".cell", function () {
        const index = $(this).data("index");
        markedState[index] = !markedState[index];
        saveState();
        renderBoard();
    });

    $("#regenerateBtn").on("click", function () {
        if (confirm("Generate a new board? Your current board progress will be reset.")) {
            initBoard(true);
        }
    });
});
