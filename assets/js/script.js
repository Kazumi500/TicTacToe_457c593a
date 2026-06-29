const gameBoard = (() => {
    const board = new Array(9).fill('');
    const getCell = (index) => board[index];
    const setCell = (index, marker) => {
            if (board[index] !== '') return false;
            board[index] = marker;
            return true;
    };

    const reset = () => board.fill('');
    const getBoard = () => [...board];
    return { getCell, setCell, reset, getBoard}
})();

const createPlayer = (name, marker) => {
    let score = 0;

    const getName = () => name;
    const getMarker = () => marker;
    const getScore = () => score;
    const addScore = () => score++;
    const resetScore = () => score = 0;
    return { getName, getMarker, getScore, addScore, resetScore };
};

const playerX = createPlayer('Pemain 1', 'X');
const playerO = createPlayer('Pemain 2', 'O');


const gameController = ((
    player1,
    player2,
    board = gameBoard 
) => {
    let currentPlayer = player1;
    let gameOver = false;
    let draws = 0; 

    const getCurrentPlayer = () => currentPlayer;
    const isGameOver = () => gameOver;
    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const checkWin = () => {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8], // baris
      [0,3,6],[1,4,7],[2,5,8], // kolom
      [0,4,8],[2,4,6] // diagonal
    ];
    const b = board.getBoard();
    for (const [a, b2, c] of wins) {
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) {
            return { winner: currentPlayer, line: [a,b2,c] };
            }
        }
      return null;
    };

    const checkDraw = () => {
        return board.getBoard().every(cell => cell !== '');
    };

    const playerTurn = (index) => {
        if (gameOver) return { type: 'gameover'};
        const success = board.setCell(index, currentPlayer.getMarker());
        if (!success) return { type: 'invalid'};
        
        const winResult = checkWin();
        if (winResult) {
            gameOver = true;
            currentPlayer.addScore();
            return { type: 'win', ...winResult };
        } 
        if (checkDraw()) {
            gameOver = true;
            draws++;
            return { type: 'draw' };
        }
        
        switchPlayer();
        return { type: 'continue', nextPlayer: currentPlayer };
    };

    const reset = () => {
        board.reset();
        currentPlayer = player1;
        gameOver = false;
    };

    const getScores = () => ({
        x: player1.getScore(),
        o: player2.getScore(),
        draws
    });

    return { getCurrentPlayer, isGameOver, playerTurn, reset, getScores};
})(playerX, playerO);

const displayController = (() => {
  const cells = document.querySelectorAll(".game-cell");
  const turnDisplay = document.getElementById("turn-display");
  const scoreXEl = document.getElementById("score-x");
  const scoreOEl = document.getElementById("score-o");
  const scoreDrawEl = document.getElementById("score-draw");
  const resetBtn = document.getElementById("reset-btn");
  const overlay = document.getElementById("game-over-overlay");
  const overlayCard = document.getElementById("overlay-card");
  const resultTitle = document.getElementById("result-title");
  const resultSubtitle = document.getElementById("result-subtitle");
  const playAgainBtn = document.getElementById("play-again-btn");
  

  const updateTurnDisplay = (player) => {
    turnDisplay.textContent = `GILIRAN ${player.getName().toUpperCase()}`;
  };

  const updateScoreDisplay = () => {
    const scores = gameController.getScores();
    scoreXEl.textContent = scores.x;
    scoreOEl.textContent = scores.o;
    scoreDrawEl.textContent = scores.draws;
  };

  const renderMark = (index, marker) => {
    const cell = cells[index];
    const markEl = cell.querySelector(".mark");
    markEl.textContent = marker;
    markEl.classList.remove("hidden");
    cell.classList.add("taken");
  };

  const highlightWinCells = (line) => {
    line.forEach((index) => {
      cells[index].classList.add("win-cell");
    });
  };

  const showOverlay = (title, subtitle) => {
    resultTitle.textContent = title;
    resultSubtitle.textContent = subtitle;
    overlay.classList.remove("hidden");
    void overlayCard.offsetHeight;
    overlay.classList.add("visible");
  };

  const hideOverlay = () => {
    overlay.classList.remove("visible");
    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 300);
  };

  const clearBoard = () => {
    cells.forEach((cell) => {
      const markEl = cell.querySelector(".mark");
      markEl.textContent = "";
      markEl.classList.add("hidden");
      cell.classList.remove("taken", "win-cell");
    });
  };

  const boardContainer = document.querySelector("#board-container");
    boardContainer.addEventListener("click", (e) => {
        const cell = e.target.closest(".game-cell");
        if (!cell) return;
    
        const index = parseInt(cell.dataset.cell, 10);
        handleCellClick(index);
    });

  const handleCellClick = (index) => {
    const result = gameController.playerTurn(index);

    switch (result.type) {
      case "continue":
        const prevMarker =
          result.nextPlayer.getMarker() === "X" ? "O" : "X";
        renderMark(index, prevMarker);
        updateTurnDisplay(result.nextPlayer);
        break;

      case "win":
        renderMark(index, result.winner.getMarker());
        highlightWinCells(result.line);
        updateScoreDisplay();
        setTimeout(() => {
          const subtitle = getRandomWinMessage(result.winner.getName());
          showOverlay("Victory!", subtitle);
        }, 600);
        break;

      case "draw":
        renderMark(index, gameController.getCurrentPlayer().getMarker());
        updateScoreDisplay();
        setTimeout(() => {
          showOverlay("Draw!", "Neither player achieves enlightenment.");
        }, 400);
        break;

      case "invalid":
      case "gameover":
        break;
    }
  };

  const getRandomWinMessage = (name) => {
    const messages = [
      `${name} has achieved enlightenment.`,
      `${name} dominates the grid.`,
      `${name} outmaneuvered the opposition.`,
      `${name}'s strategy was flawless.`,
      `A decisive victory for ${name}.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  resetBtn.addEventListener("click", () => {
    gameController.reset()
    clearBoard();
    updateTurnDisplay(gameController.getCurrentPlayer());
  });

  playAgainBtn.addEventListener("click", () => {
    hideOverlay();
    setTimeout(() => {
      gameController.reset()
      clearBoard();
      updateTurnDisplay(gameController.getCurrentPlayer());
    }, 300);
  });

  updateTurnDisplay(gameController.getCurrentPlayer());
  updateScoreDisplay();
})();