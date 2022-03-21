import { useRef, useState } from 'react';
import Chess from 'chess.js';

import { Chessboard } from 'react-chessboard';

export default function SingleMode({ boardWidth }) {
  const chessboardRef = useRef();

  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const pieceValue = {'p':10, 'r':50, 'n':30, 'b':30, 'q':90, 'k':900}
  const turnChange = {'w':'b', 'b':'w'}
  let turn = 'w';
  let won = false;

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      won = true;
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }



  function evaluate(gameboard){
    let value = 0;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if(gameboard[i][j] !== null){
         
          if(gameboard[i][j].color === 'b'){
            value = value + pieceValue[gameboard[i][j].type];
          }
          else{
            value = value - pieceValue[gameboard[i][j].type];
          }    
        }
          
      }
    }
    
    return value;
  }

  function getBestMove(depth, game, player){
    if(depth === 0){
      return evaluate(game.board());
    }

    const possibleMoves = game.moves();

    if(player === 'b'){
      let max = -9999;
      for(let i = 0; i < possibleMoves.length; i++){
        game.move(possibleMoves[i]);
        max = Math.max(max, getBestMove(depth - 1, game, turnChange[player]));
        game.undo();
      }
      return max;
    }
    else{
      let min = 9999;
      for(let i = 0; i < possibleMoves.length; i++){
        game.move(possibleMoves[i]);
        min = Math.min(min, getBestMove(depth - 1, game, turnChange[player]));
        game.undo();
      }
      return min;
    }
  }

  function computerMove() {
    const possibleMoves = game.moves();
    
    // exit if the game is over
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0){
      won = true;
      return;
    }
    
    let max = -9999;
    let moveIndex = 0;
    for(let i = 0; i < possibleMoves.length; i++){ 
      game.move(possibleMoves[i]);
      let value = getBestMove(2, game, turnChange[turn]);
      game.undo();
      if (value >= max){
        moveIndex = i;
        max = value;
      }
    }
    
    safeGameMutate((game) => {
      game.move(possibleMoves[moveIndex]);
    });
    console.log(evaluate(game.board()));
    turn = 'w';
  }

 
  function onSquareClick(square) {
    function resetFirstMove(square) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // attempt to make move
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: moveFrom,
      to: square,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);

    // if invalid, setMoveFrom and getMoveOptions
    if (move === null) {
      resetFirstMove(square);
      return;
    }

    setTimeout(computerMove, 300);
    setMoveFrom('');
    setOptionSquares({});
  }

  let res = <div>
  <Chessboard
    id="vsComputer"
    animationDuration={200}
    arePiecesDraggable={false}
    boardWidth={boardWidth}
    position={game.fen()}
    onSquareClick={onSquareClick}
    customBoardStyle={{
      borderRadius: '4px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
    }}
    customSquareStyles={{
      ...moveSquares,
      ...optionSquares,
    }}
    ref={chessboardRef}
  />
  <button
    className="rc-button"
    onClick={() => {
      safeGameMutate((game) => {
        game.reset();
      });
      chessboardRef.current.clearPremoves();
      setMoveSquares({});
      turn = 'b';
      won = false;
    }}
  >
    reset
  </button>
  <button
    className="rc-button"
    onClick={() => {
      safeGameMutate((game) => {
        game.undo();
      });
      chessboardRef.current.clearPremoves();
      setMoveSquares({});
      turn = turnChange[turn];
      won = false;
    }}
  >
    undo
  </button>
</div>;
if(won){
  return [<div class="blur"></div>,res]
}
return (res);
}