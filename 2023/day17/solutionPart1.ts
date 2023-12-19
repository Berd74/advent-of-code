import {textBoardDemo, textBoardDemoBig, textBoardDemoMed, textBoardFull, textBoardMy, textBoardMy2} from './inputs';

type Move = 'up' | 'down' | 'left' | 'right'

type BoardField = {value: number, minPoints: number, players: Player[]}

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
  grid: BoardGrid
  readonly maxX: number;
  readonly maxY: number;

  constructor(textBoard: string) {
    // construct BoardGrid
    const row =  textBoard.split('\n').filter(row => row.length !== 0)
    this.grid = row.map(row => row.split('').map(string => {
      const newBoardFiled: BoardField = {value: Number(string), minPoints: Infinity, players: []}
      return newBoardFiled
    }))

    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }

  cloneAllPlayers() {
    let atLeastOnePlayerCouldBeCloned = false;

    const allCurPlayers = this.grid.map((row, y) => {
      return row.map((field, x) => {
        return field.players
      })
    }).flat(2)

    const cloneAndAddIfCan = (player: Player) => {
      while (player.canClone()) {
        atLeastOnePlayerCouldBeCloned = true;
        const newPlayer = player.clone();
        this.grid[newPlayer.y][newPlayer.x].players.push(newPlayer)
        cloneAndAddIfCan(newPlayer);
      }
    }

    allCurPlayers.forEach(player => {
      cloneAndAddIfCan(player)
    })

    return atLeastOnePlayerCouldBeCloned
  }

  moveAllPlayers(){
    const gridCopyNoPlayers: BoardGrid = this.grid.map(row => {
      return row.map(field => ({...field, players: []}))
    })
    // console.log(gridCopyNoPlayers.map(row => {
    //   return row.map(f => f.minPoints).join(',')
    // }).join('\n'));

    this.grid.forEach((row, _) => {
      row.forEach((field, _) => {
        field.players.forEach(player => {

          //update values in Player
          player.moveAndUpdate()

          //ignore winners
          if (player.isPlayerOnFinish()) {
            if (player.points < this.bestWinnerPoints) {
              this.bestWinnerPoints = player.points
              this.winner = player
            }
            return;
          }

          //ignore stoped
          if (player.stopped) {
            return;
          }

          //new cords
          const x = player.x
          const y = player.y

          // updated points if better - if this player has best
          if (player.points < gridCopyNoPlayers[y][x].minPoints) gridCopyNoPlayers[y][x].minPoints = player.points

          //if on this field was player with better points ignore that player (with margin)
          const margin = 8
          if (gridCopyNoPlayers[y][x].minPoints + margin < player.points) return

          //if there is player with less points and have the same last 3 moves - don't add him
          const betterExistingPlayer = gridCopyNoPlayers[y][x].players.find(existingPlayer => {
            // const newPlayerMoves = player.possibleMoves;
            // const existingPlayerMoves = existingPlayer.possibleMoves;
            // //check if cur Player has extra possibilities
            // const curPlayerExtraMoves = !existingPlayerMoves.every(v => newPlayerMoves.includes(v))
            // //check if new Player has extra possibilities
            // const newPlayerExtraMoves = !newPlayerMoves.every(v => existingPlayerMoves.includes(v))
            const sameHistory = areArraysEqual(player.movesHistory, existingPlayer.movesHistory)
            const existingPlayerLessPoints = existingPlayer.points <= player.points
            // const existingPlayerMuchLessPoints = existingPlayer.points + 9 < player.points
            // const newPlayerLessPoints = player.points < existingPlayer.points
            return (existingPlayerLessPoints && sameHistory)
            // return existingPlayerMuchLessPoints || (existingPlayerLessPoints && sameHistory)
          })

          if (betterExistingPlayer) return;

          // if there is player with more points and have the same last 3 moves - remove the player from grid - it creates array with no worse players
          const noWorseExistingPlayers = gridCopyNoPlayers[y][x].players.filter(existingPlayer => {
            // const newPlayerMoves = player.possibleMoves;
            // const existingPlayerMoves = existingPlayer.possibleMoves;
            // //check if cur Player has extra possibilities
            // const curPlayerExtraMoves = !existingPlayerMoves.every(v => newPlayerMoves.includes(v))
            // //check if new Player has extra possibilities
            // const newPlayerExtraMoves = !newPlayerMoves.every(v => existingPlayerMoves.includes(v))
            const existingPlayerLessPoints = existingPlayer.points <= player.points
            // const newPlayerMuchLessPoints = existingPlayer.points > player.points + 9
            // const newPlayerLessPoints = player.points < existingPlayer.points
            const sameHistory = areArraysEqual(player.movesHistory, existingPlayer.movesHistory)
            return !(existingPlayerLessPoints && sameHistory)
            // return !newPlayerMuchLessPoints || !(existingPlayerLessPoints && sameHistory)
          })

          noWorseExistingPlayers.push(player)

          gridCopyNoPlayers[y][x].players = noWorseExistingPlayers;
          // gridCopyNoPlayers[y][x].players.push(player)
        })
      })
    })


    this.grid = gridCopyNoPlayers; // at this moment new players are here
  }

  addPlayerOnStart (p: Player) {
    this.grid[0][0] = {...this.grid[0][0], minPoints: p.points, players: [p]}
  }

}

class Player {
  x: number;
  y: number;
  points: number;
  possibleMoves: Move[];
  movesHistory: [Move | undefined, Move | undefined, Move | undefined];
  // cordsHistory: ({x: number, y: number} | undefined)[];
  clonability = true;
  stopped: boolean;
  readonly boardData: Board;


  constructor(
    boardData: Board,
    usedMoves: Move[] = [],
    points = 0,
    x = 0,
    y = 0,
    movesHistory: [Move | undefined, Move | undefined, Move | undefined] = [undefined, undefined, undefined],
    // cordsHistory = [{x: 0, y: 0}] as ({x: number, y: number}| undefined)[],
    stoped = false,
  ) {
    this.points = points
    this.x = x
    this.y = y
    // this.cordsHistory = [...cordsHistory]
    this.movesHistory = [...movesHistory]
    this.stopped = stoped
    this.boardData = boardData
    this.possibleMoves = this.calculateNewMoves(usedMoves)
  }

  /**
   * Clone returns new Player with removed first possible move.
   * Points and coords are passed to the new Player.
   * Cloned values is set to false.
   */
  clone(): Player {
    if (this.stopped) throw Error('this player is stopped already')
    if (!this.clonability) throw Error('this player was cloned already')
    if (this.possibleMoves.length <= 1) throw Error('can NOT clone because only ONE possible move is left')
    const allMoves: Move[] = ['up' , 'down' , 'left' , 'right'];
    const [_,...possibleMovesInClone] = this.possibleMoves
    const usedMoves: Move[] = allMoves.filter(move => !possibleMovesInClone.includes(move))

    this.clonability = false;
    return new Player(this.boardData, usedMoves, this.points, this.x, this.y, this.movesHistory, this.stopped)
  }

  canClone(): boolean {
    if (this.stopped) return false;
    if (!this.clonability) return false
    if (this.possibleMoves.length <= 1) return false
    if (this.isPlayerOnFinish()) return false
    return true
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

    const curMove = this.possibleMoves[0]
    const lastMove1 = this.movesHistory.at(-1)
    const lastMove2 = this.movesHistory.at(-2)
    const lastMove3 = this.movesHistory.at(-3)

    // check if the same move 3 times in row to avoid straight lines
    if (curMove === lastMove1 && curMove === lastMove2 && curMove === lastMove3) {
      this.clonability = false;
      this.stopped = true;
      return;
    }

    switch (curMove) {
      case 'up': {
        this.y--
        this.possibleMoves = this.calculateNewMoves(['down'])
        break;
      }
      case 'right': {
        this.x++
        this.possibleMoves = this.calculateNewMoves(['left'])
        break;
      }
      case 'down': {
        this.y++
        this.possibleMoves = this.calculateNewMoves(['up'])
        break;
      }
      case 'left': {
        this.x--
        this.possibleMoves = this.calculateNewMoves(['right'])
        break;
      }
    }

    // check if this player was here before (in last 6 moves)
    // if (this.cordsHistory.find(log => log?.x === this.x && log?.y === this.y)) {
    //   this.clonability = false;
    //   this.stopped = true;
    //   return;
    // }

    this.stopped = this.isPlayerOnFinish();
    this.clonability = !this.stopped
    // this.movesHistory.push(curMove) // save whole history for debugging
    this.movesHistory = [lastMove2, lastMove1, curMove]
    // const h = this.cordsHistory
    // this.cordsHistory = [h.at(-6), h.at(-5), h.at(-4), h.at(-3), h.at(-2), h.at(-1)]
    this.points += this.boardData.grid[this.y][this.x].value
  }

  private calculateNewMoves(usedMove: Move[]) {
    const allMoves: Move[] = ['up' , 'down' , 'left' , 'right'];
    return allMoves
      .filter(move => {
        return !usedMove.includes(move) &&
          !(this.y === 0 && move === 'up') &&
          !(this.y === this.boardData.maxY && move === 'down') &&
          !(this.x === 0 && move === 'left') &&
          !(this.x === this.boardData.maxX && move === 'right')
      })
  }

}

class Game {

  board: Board;

  constructor(textBoard: string) {
    this.board = new Board(textBoard)
    const player = new Player(this.board)
    this.board.addPlayerOnStart(player)
  }

  run() {
    while(this.board.cloneAllPlayers()) {
      console.log("loading... | active players: " + this.getAllPlayers().length);
      this.board.moveAllPlayers();
    }
    return this.board.bestWinnerPoints
  }

  getAllPlayers() {
    return this.board.grid.map((row) => {
      return row.map(field => {
        return field.players
      })
    }).flat(2)
  }

}

console.time('Execution Time');
export const solution17Part1 = new Game(textBoardFull).run()
console.log(solution17Part1); //textBoardFull => 1260
console.timeEnd('Execution Time');
