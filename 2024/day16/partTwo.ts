import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');

  const map = new Map(lines);
  let players = [new Player(map)];
  const winners: Player[] = [];
  let smallestScore: number = Infinity;

  while (players.some(p => p.alive)) {
    players = players.map(p => p.move()).flat()

    const foundWinners = players.filter(p => p.pos.isEqual(map.endPos))

    foundWinners.forEach(winner => {
      winners.push(winner)
      winner.alive = false
      if (winner.score < smallestScore) {
        smallestScore = winner.score
      }
    });

  }

  const visitedFieldsPos = new Set();

  winners
    .filter(p => p.score === smallestScore)
    .forEach(winner => {
      winner.history.forEach(f => {
        visitedFieldsPos.add(f.pos.toString())
      })
      //logger
      // console.log('');
      // map.grid.forEach((row, y) => {
      //   const line = row.map((filed, x) => {
      //     if (winner.history.find(wf => wf.pos.isEqual(filed.pos))) {
      //       return 'O'
      //     }
      //     if (filed.wall) {
      //       return '#'
      //     }
      //     return '.'
      //   }).join()
      //   console.log(line);
      // })
  })


  //add one to count the starting point as well
  return visitedFieldsPos.size + 1
}

type Grid = Field[][]
type Direction = '<' | '>' | '^' | 'v'
type Moves = Direction[]

class Field {
  readonly pos: Pos;
  readonly map: Map;
  readonly wall: boolean;
  visitedPoints: number = Infinity;

  constructor(pos: Pos, map: Map, wall: boolean) {
    this.pos = pos;
    this.map = map;
    this.wall = wall;
  }
}

class Pos {
  y: number;
  x: number;

  constructor(y: number, x: number) {
    this.y = y;
    this.x = x;
  }

  isEqual(otherPos: Pos) {
    return this.x === otherPos.x && this.y === otherPos.y;
  }

  clone() {
    return new Pos(this.y, this.x);
  }

  toString() {
    return 'y' + this.y.toString() + 'x' + this.x.toString();
  }

  cloneAdd(y: number, x: number) {
    const clonned = this.clone();
    clonned.y += y;
    clonned.x += x;
    return clonned;
  }
}

class Player {
  pos: Pos;
  direction: Direction;
  map: Map;
  score: number;
  alive = true;
  history: Field[] = []

  constructor(map: Map, pos?: Pos, direction: Direction = '>', score: number = 0) {
    this.pos = pos === undefined ? map.startPos : pos;
    this.map = map;
    this.direction = direction;
    this.score = score;
  }

  clone(){
    const newP = new Player(this.map, this.pos, this.direction, this.score);
    newP.history = [...this.history];
    return newP;
  }

  move() {
    if (!this.alive) {return []}
    const possibleFields = this.map.getNextPossibleFields(this.pos)
    const newPlayers: Player[] = []
    possibleFields.forEach(obj => {
      const clone = this.clone()
      clone.score += this.rotateFromTo(this.direction, obj.direction) + 1
      clone.direction = obj.direction
      clone.pos = obj.field.pos
      clone.history.push(obj.field)
      // don't ignore fields with 1000 points less,
      // the player they might rotate itself in future and make the points equal
      const margin = 1000
      if (clone.score <= obj.field.visitedPoints + margin) {
        newPlayers.push(clone)
      }

    })
    this.map.makeFieldsVisited(newPlayers)
    this.alive = false
    return newPlayers
  }

  private rotateFromTo(directionFrom: Direction, directionTo: Direction) {
    let directionFromLefting = directionFrom
    let leftingScore = 0
    let directionFromRighting = directionFrom
    let rightingScore = 0
    while (!(directionFromLefting === directionTo || directionFromRighting === directionTo)) {
      directionFromLefting = this.rotateLeft(directionFromLefting)
      directionFromRighting = this.rotateRight(directionFromRighting)
      leftingScore += 1000
      rightingScore += 1000
    }
    if (directionFromLefting === directionTo) {
      return leftingScore
    }
    if (directionFromRighting === directionTo) {
      return rightingScore
    }
    return NaN
  }

  private rotateLeft(direction: Direction){
    switch (direction) {
      case '^':
        return '>'
      case '>':
        return 'v'
      case 'v':
        return '<'
      case '<':
        return '^'
    }
  }

  private rotateRight(direction: Direction){
    switch (direction) {
      case '^':
        return '<'
      case '>':
        return '^'
      case 'v':
        return '>'
      case '<':
        return 'v'
    }
  }

}

class Map {
  readonly grid: Grid = [];
  readonly maxX: number;
  readonly maxY: number;
  readonly players: Player[] = [];
  readonly startPos!: Pos;
  readonly endPos!: Pos;

  constructor(lines: string[]) {

    for (let y = 0; y < lines.length; y++) {
      const row = lines[y];
      const finalRow: Field[] = [];
      for (let x = 0; x < row.length; x++) {
        const character = row[x];
        character === 'S' && (this.startPos = new Pos(y, x))
        character === 'E' && (this.endPos = new Pos(y, x))
        const newField = new Field(new Pos(y, x), this, character === '#')
        character === 'S' && (newField.visitedPoints = 0)
        finalRow.push(newField);

      }
      this.grid.push(finalRow);
    }

    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }


  getFieldAtPos(pos: Pos): Field | undefined {
    const x = pos.x;
    const y = pos.y;
    return this.getFieldAtXY(y,x)
  }

  getFieldAtXY(lookY: number, lookX: number): Field | undefined {
    const x = lookX;
    const y = lookY;
    if (!(x >= 0 && y >= 0)) {return;}
    if (!(x <= this.maxX && y <= this.maxY)) {return;}
    return this.grid[y][x];
  }

  getNextPossibleFields(pos: Pos): {field: Field, direction: Direction}[] {
    const possibleFields: {field: Field, direction: Direction}[] = []

    const topField = this.getFieldAtXY(pos.y-1, pos.x)
    topField && possibleFields.push({field: topField, direction: '^'})

    const rightField = this.getFieldAtXY(pos.y, pos.x+1)
    rightField && possibleFields.push({field: rightField, direction: '>'})

    const bottomField = this.getFieldAtXY(pos.y+1, pos.x)
    bottomField && possibleFields.push({field: bottomField, direction: 'v'})

    const leftField = this.getFieldAtXY(pos.y, pos.x-1)
    leftField && possibleFields.push({field: leftField, direction: '<'})

    return possibleFields.filter(f => !f.field.wall)
  }

  makeFieldsVisited(players: Player[]) {
    players.forEach(player => {
      const field = this.getFieldAtPos(player.pos)
      field && (field.visitedPoints = player.score);
    })
  }

}
