import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const mainBoard = new Board(text) //board used to generate other boards and find fields to ignore
  const longestLineSize = Math.max(mainBoard.maxX, mainBoard.maxY) + 1
  let stuckCount = 0;

  const p = new Player(mainBoard)
  while (p.isOnEdge() === false) {
    p.move()
    p.markCurrentPosition()
  }
  const positionsToIgnore = mainBoard.getNotMarkedFieldsPositions()

  mainBoard.grid.forEach((row, y) => {
    row.forEach((_, x) => {
      // ignore start point
      if (mainBoard.startingPoint.x === x && mainBoard.startingPoint.y === y) {
        return;
      }

      //ignore if on the list
      if (positionsToIgnore.find(
        ({x: xIgnore,y:yIgnore})=> x === xIgnore && y === yIgnore)
      ) {
        return;
      }

      const b = new Board(text)
      // ignore if obstacle already exist on the filed
      if (b.grid[y][x].blocked) {
        return;
      }
      b.grid[y][x].blocked = true; //set obstacle on new board

      const p = new Player(b)

      let counter = 0 // if this number is too big we detected loop!

      while (p.isOnEdge() === false) {
        // infinite loop breaker
        if (counter > longestLineSize) {
          stuckCount++
          return;
        }
        p.move()
        p.isPlayerOnMarkedPosition() ? counter++ : counter = 0
        p.markCurrentPosition()
      }

    })
  })

  return stuckCount
}

type BoardField = {blocked: boolean, mark: boolean}

type BoardGrid = BoardField[][];

class Board {
  grid: BoardGrid
  startingPoint: {x: number, y: number} = {x: 0, y: 0};
  readonly maxX: number;
  readonly maxY: number;

  constructor(textBoard: string) {
    // construct BoardGrid
    const row = textBoard.split('\n').filter(row => row.length !== 0)
    this.grid = row.map((row, y) => row.split('').map((string, x) => {
      const newBoardFiled: BoardField = {blocked: string === '#', mark: false};
      if (string === '^') {
        this.startingPoint = {x: x, y: y}
        newBoardFiled.mark = true;
      }
      return newBoardFiled
    }))

    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }

  checkPosition(x: number, y: number) {
    return this.grid[y][x];
  }
  markPosition(x: number, y: number) {
    return this.grid[y][x].mark = true;
  }
  getNotMarkedFieldsPositions() {
    let arr:{x: number, y: number}[] = [];
    this.grid.forEach((row, y) => {
      row.forEach((filed, x) => {
        if (!filed.mark) {
          arr.push({x: x, y: y});
        }
      })
    })
    return arr
  }
}

class Player {
  pos : {x: number, y: number} = {x: 0, y: 0};
  direction: 'T' | 'R' | 'B' | 'L'
  readonly boardData: Board;

  constructor(
    boardData: Board,
    direction = 'T' as const,
  ) {
    this.pos.x = boardData.startingPoint.x
    this.pos.y = boardData.startingPoint.y
    this.direction = direction
    this.boardData = boardData
  }

  rotate(){
    switch (this.direction) {
      case 'T': {
        this.direction = 'R'
        break;
      }
      case 'R': {
        this.direction = 'B'
        break;
      }
      case 'B': {
        this.direction = 'L'
        break;
      }
      case 'L': {
        this.direction = 'T'
        break;
      }
    }
  }

  move() {
    if (this.isOnEdge()) {
      return;
    }
    while (this.checkNextFiled().blocked) {
      this.rotate()
    }
    switch (this.direction) {
      case 'T': {
        this.pos.y = this.pos.y-1
        break;
      }
      case 'R': {
        this.pos.x = this.pos.x+1
        break;
      }
      case 'B': {
        this.pos.y = this.pos.y+1
        break;
      }
      case 'L': {
        this.pos.x = this.pos.x-1
        break;
      }
    }
  }

  isPlayerOnMarkedPosition() {
    return this.boardData.grid[this.pos.y][this.pos.x].mark
  }

  markCurrentPosition() {
    this.boardData.markPosition(this.pos.x, this.pos.y)
  }

  isOnEdge() {
    return (
      this.pos.x === this.boardData.maxX ||
      this.pos.x === 0 ||
      this.pos.y === this.boardData.maxY ||
      this.pos.y === 0
    )
  }

  checkNextFiled() {
    switch (this.direction) {
      case 'T': {
        return this.boardData.checkPosition(this.pos.x, this.pos.y -1)
      }
      case 'R': {
        return this.boardData.checkPosition(this.pos.x +1, this.pos.y)
      }
      case 'B': {
        return this.boardData.checkPosition(this.pos.x, this.pos.y +1)
      }
      case 'L': {
        return this.boardData.checkPosition(this.pos.x -1 , this.pos.y)
      }
    }
  }


}