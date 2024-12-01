import {textBoardFull} from './inputs';

type Move = 'up' | 'down' | 'left' | 'right'

type BoardField = { value: number, minPoints: number, players: Player[] }

type BoardGrid = BoardField[][];

function areArraysEqual(array1: any[], array2: any[]) {
  if (array1.length === array2.length) {
    return array1.every((element, index) => {
      if (element === array2[index]) {
        return true;
      }
      return false;
    });
  }
  return false;
}

class Board {
  bestWinnerPoints: number = Infinity;
  winner: Player | undefined;
  grid: BoardGrid;
  readonly maxX: number;
  readonly maxY: number;

  constructor(textBoard: string) {
    // construct BoardGrid
    const row = textBoard.split('\n').filter(row => row.length !== 0);
    this.grid = row.map(row => row.split('').map(string => {
      const newBoardFiled: BoardField = {value: Number(string), minPoints: Infinity, players: []};
      return newBoardFiled;
    }));

    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }

  cloneAllPlayers() {
    let atLeastOnePlayerCouldBeCloned = false;

    const allCurPlayers = this.grid.map((row, y) => {
      return row.map((field, x) => {
        return field.players;
      });
    }).flat(2);

    const cloneAndAddIfCan = (player: Player) => {
      while (player.canClone()) {
        atLeastOnePlayerCouldBeCloned = true;
        const newPlayer = player.clone();
        this.grid[newPlayer.y][newPlayer.x].players.push(newPlayer);
        cloneAndAddIfCan(newPlayer);
      }
    };

    allCurPlayers.forEach(player => {
      cloneAndAddIfCan(player);
    });

    return atLeastOnePlayerCouldBeCloned;
  }

  moveAllPlayers() {
    const gridCopyNoPlayers: BoardGrid = this.grid.map(row => {
      return row.map(field => ({...field, players: []}));
    });

    this.grid.forEach((row, _) => {
      row.forEach((field, _) => {
        field.players.forEach(player => {

          //update values in Player
          player.moveAndUpdate();

          //ignore winners
          if (player.isPlayerOnFinish()) {
            if (player.points < this.bestWinnerPoints) {
              this.bestWinnerPoints = player.points;
              this.winner = player;
            }
            return;
          }

          //ignore stoped
          if (player.stopped) {
            return;
          }

          //new cords
          const x = player.x;
          const y = player.y;

          // updated points if better - if this player has best
          if (player.points < gridCopyNoPlayers[y][x].minPoints) gridCopyNoPlayers[y][x].minPoints = player.points;

          //if on this field was player with better points ignore that player (with margin)
          const margin = 20;
          if (gridCopyNoPlayers[y][x].minPoints + margin < player.points) return;

          //if there is player with less points and have the same last 3 moves - don't add him
          const betterExistingPlayer = gridCopyNoPlayers[y][x].players.find(existingPlayer => {
            const sameHistory = areArraysEqual(player.movesHistory, existingPlayer.movesHistory);
            const existingPlayerLessPoints = existingPlayer.points <= player.points;
            return (existingPlayerLessPoints && sameHistory);
          });

          if (betterExistingPlayer) return;

          // if there is player with more points and have the same last 3 moves - remove the player from grid - it creates array with no worse players
          const noWorseExistingPlayers = gridCopyNoPlayers[y][x].players.filter(existingPlayer => {
            const existingPlayerLessPoints = existingPlayer.points <= player.points;
            const sameHistory = areArraysEqual(player.movesHistory, existingPlayer.movesHistory);
            return !(existingPlayerLessPoints && sameHistory);
          });

          noWorseExistingPlayers.push(player);

          gridCopyNoPlayers[y][x].players = noWorseExistingPlayers;
        });
      });
    });

    this.grid = gridCopyNoPlayers; // at this moment new players are here
  }

  addPlayerOnStart(p: Player) {
    this.grid[0][0] = {...this.grid[0][0], minPoints: p.points, players: [p]};
  }

}

class Player {
  x: number;
  y: number;
  points: number;
  possibleMoves: Move[];
  movesHistory: (Move | undefined)[];
  clonability = true;
  stopped: boolean;
  readonly boardData: Board;


  constructor(
    boardData: Board,
    usedMoves: Move[] = [],
    points = 0,
    x = 0,
    y = 0,
    movesHistory: (Move | undefined)[] = [],
    stopped = false
  ) {
    this.points = points;
    this.x = x;
    this.y = y;
    this.movesHistory = [...movesHistory];
    this.stopped = stopped;
    this.boardData = boardData;
    this.possibleMoves = this.calculateNewMoves(usedMoves);
  }

  /**
   * Clone returns new Player with removed first possible move.
   * Points and coords are passed to the new Player.
   * Cloned values is set to false.
   */
  clone(): Player {
    if (this.stopped) throw Error('this player is stopped already');
    if (!this.clonability) throw Error('this player was cloned already');
    if (this.possibleMoves.length <= 1) throw Error('can NOT clone because only ONE possible move is left');
    const allMoves: Move[] = ['up', 'down', 'left', 'right'];
    const [_, ...possibleMovesInClone] = this.possibleMoves;
    const usedMoves: Move[] = allMoves.filter(move => !possibleMovesInClone.includes(move));

    this.clonability = false;
    return new Player(this.boardData, usedMoves, this.points, this.x, this.y, this.movesHistory, this.stopped);
  }

  canClone(): boolean {
    if (this.stopped) return false;
    if (!this.clonability) return false;
    if (this.possibleMoves.length <= 1) return false;
    if (this.isPlayerOnFinish()) return false;
    return true;
  }

  isPlayerOnFinish(): boolean {
    return this.x === this.boardData.maxX && this.y === this.boardData.maxY;
  }

  /**
   * Uses first possible move from array
   * Clonability is change to true if player was not on this spot before
   * Calculate new moves
   */

  moveAndUpdate() {
    if (this.stopped) return;
    if (this.isPlayerOnFinish()) return;

    const curMove = this.possibleMoves[0];

    const m1 = this.movesHistory.at(-1);
    const m2 = this.movesHistory.at(-2);
    const m3 = this.movesHistory.at(-3);
    const m4 = this.movesHistory.at(-4);
    const m5 = this.movesHistory.at(-5);
    const m6 = this.movesHistory.at(-6);
    const m7 = this.movesHistory.at(-7);
    const m8 = this.movesHistory.at(-8);
    const m9 = this.movesHistory.at(-9);
    const m10 = this.movesHistory.at(-10);

    // check if ANY curMove is possible so it matches 4 last movesz

    const mustGoStraight =
      (undefined === m1 || undefined === m2 || undefined === m3 || undefined === m4) ||
      ((undefined !== m1 && undefined !== m2 && undefined !== m3 && undefined !== m4) &&
        !(m1 === m2 && m2 === m3 && m3 === m4));

    if (mustGoStraight) {
      //if not the move must match the last move
      // console.log('go');
      if (!(curMove === m1 || m1 === undefined)) {
        // console.log(curMove);
        // console.log(this);
        // we want to turn too soon!
        this.clonability = false;
        this.stopped = true;
        return;
      }
    }

    // console.log(this.movesHistory);

    // check if the same move 10 times in row to avoid long straight lines
    if (
      curMove === m1 &&
      curMove === m2 &&
      curMove === m3 &&
      curMove === m4 &&
      curMove === m5 &&
      curMove === m6 &&
      curMove === m7 &&
      curMove === m8 &&
      curMove === m9 &&
      curMove === m10
    ) {
      this.clonability = false;
      this.stopped = true;
      return;
    }

    switch (curMove) {
      case 'up': {
        this.y--;
        this.possibleMoves = this.calculateNewMoves(['down']);
        break;
      }
      case 'right': {
        this.x++;
        this.possibleMoves = this.calculateNewMoves(['left']);
        break;
      }
      case 'down': {
        this.y++;
        this.possibleMoves = this.calculateNewMoves(['up']);
        break;
      }
      case 'left': {
        this.x--;
        this.possibleMoves = this.calculateNewMoves(['right']);
        break;
      }
    }

    this.stopped = this.isPlayerOnFinish();
    this.clonability = !this.stopped;
    // this.movesHistory.push(curMove) // save whole history for debugging
    this.movesHistory = [m9, m8, m7, m6, m5, m4, m3, m2, m1, curMove];
    this.points += this.boardData.grid[this.y][this.x].value;
  }

  private calculateNewMoves(usedMove: Move[]) {
    const allMoves: Move[] = ['up', 'down', 'left', 'right'];
    return allMoves
      .filter(move => {
        return !usedMove.includes(move) &&
          !(this.y === 0 && move === 'up') &&
          !(this.y === this.boardData.maxY && move === 'down') &&
          !(this.x === 0 && move === 'left') &&
          !(this.x === this.boardData.maxX && move === 'right');
      });
  }

}

class Game {
  board: Board;

  constructor(textBoard: string) {
    this.board = new Board(textBoard);
    const player = new Player(this.board);
    this.board.addPlayerOnStart(player);
  }

  run() {
    while (this.board.cloneAllPlayers()) {
      console.log('loading... | active players: ' + this.getAllPlayers().length);
      this.board.moveAllPlayers();
    }
    return this.board.bestWinnerPoints;
  }

  getAllPlayers() {
    return this.board.grid.map((row) => {
      return row.map(field => {
        return field.players;
      });
    }).flat(2);
  }

}

console.time('Execution Time');
export const solution17Part2 = new Game(textBoardFull).run();
console.log(solution17Part2); //textBoardFull => 1416
console.timeEnd('Execution Time');
