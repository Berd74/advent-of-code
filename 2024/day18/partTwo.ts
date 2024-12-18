import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  const size = Number(lines.shift()!)
  let bitesToShow = Number(lines.shift()!)

  const wallsPosOrgi = lines.map(line => {
    const [x,y] = line.split(',').map(Number);
    return new Pos(y+1, x+1)
  })

  const mapGrid: string[][] = []
  for (let y = 0; y < size; y++) {
    const row: string [] = []
    if (y === 0) {
      mapGrid.push(Array(size+2).fill("#"))
    }
    for (let x = 0; x < size; x++) {
      if (x === 0) {
        row.push("#")
      }
      row.push(".")
      if (x === size-1) {
        row.push("#")
      }
    }
    mapGrid.push(row);
    if (y === size-1) {
      mapGrid.push(Array(size+2).fill("#"))
    }
  }
  mapGrid[1][1] = 'S'
  mapGrid[mapGrid.length-2][mapGrid.length-2] = 'E'



  const mapLines = mapGrid.map(row => row.join(''))

  while (true) {
    const wallsPos = [...wallsPosOrgi]
    const map = new Map(mapLines);
    map.players = [new Player(map)];
    const winners: Player[] = [];
    let smallestScore: number = Infinity;
    let largestScore: number = 0;
    let best: Player | undefined;
    let a = 0
    addWall(bitesToShow)

    while ( map.players.some(p => p.alive)) {
      // console.log("iteration: " + ++a);
      map.players = map.players.map(p => p.move()).flat()
      // console.log( map.players.length);

      map.players.forEach((p, i) => {
        if (p.score > largestScore) {
          largestScore = p.score;
          best = p
        }
      })
      const foundWinners =  map.players.filter(p => p.pos.isEqual(map.endPos))

      foundWinners.forEach(winner => {
        winners.push(winner)
        winner.alive = false
        if (winner.score < smallestScore) {
          smallestScore = winner.score
        }
      });

      // Wait for 100ms before the next iteration
      // console.log(players.map(p => p.pos));
      // const aa = map.getFieldAtXY(3,3)?.visitedPoints
      // console.log(aa);
      // await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (smallestScore === Infinity) {
      break;
    }
    // const isWall = wallsPos.find(w => w.isEqual(new Pos(y, x)));
    function addWall(n: number) {
      for (let i = 0; i < n; i++) {
        const wall = wallsPos.shift()
        if (wall) {
          map.grid[wall.y][wall.x].wall = true
        }
      }
    }
    bitesToShow++
  }


  const xx= wallsPosOrgi.map((o, i) => {
    // console.log('byte ' + i + ": " + o.toString());
    return (wallsPosOrgi[i].x-1) + "," + (wallsPosOrgi[i].y-1);
  })
  //add one to count the starting point as well
  const str = xx[bitesToShow-1]
  return str
}

type Grid = Field[][]
type Direction = '<' | '>' | '^' | 'v'
type Moves = Direction[]

class Field {
  readonly pos: Pos;
  readonly map: Map;
  wall: boolean;
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
      clone.score += 1
      clone.direction = obj.direction
      clone.pos = obj.field.pos
      clone.history.push(obj.field)
      // don't ignore fields with 1000 points less,
      // the player they might rotate itself in future and make the points equal
      if (clone.score < obj.field.visitedPoints) {
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
  players: Player[] = [];
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
      field && (field.visitedPoints = Math.min(player.score, field.visitedPoints));

    })
  }

}
