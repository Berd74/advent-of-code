import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);

  const b = new Board(text)
  const p = new Player(b)

  while (p.isOnEdge() === false) {
    p.move()
  }

  return b.count()
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
  count() {
    let count = 0;
    this.grid.forEach((row, y) => {
      row.forEach((filed, x) => {
        if (filed.mark) {
          count++
        }
      })
    })
    return count
  }
}

class Player {
  pos : {x: number, y: number} = {x: 0, y: 0};
  points: number;
  direction: 'T' | 'R' | 'B' | 'L'
  readonly boardData: Board;

  constructor(
    boardData: Board,
    points = 0,
    direction = 'T' as const,
  ) {
    this.points = points
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
    this.points++
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