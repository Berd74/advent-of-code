import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);

  const map = new Map(text);
  const players: Player[] = []

  map.startFields.forEach((f) => {
    players.push(new Player(map, f.pos))
  })

  const pm = new PlayersManager(...players)

  while (pm.arePossibleMoves()) {
    pm.moveWithCloning()
  }

  const playersOnTop = pm.getPlayersOnTop()
  const playersByRoute: {[key: string]: {start: Pos, end: Pos, players: Player[] }} = {}

  playersOnTop.forEach(p => {
    const key = p.startPos.toString() + p.pos.toString()
    const obj = playersByRoute[key] ||
      {start: p.startPos.toString(), end: p.pos.toString(), players: []}
    obj.players = [...obj.players, p]
    playersByRoute[key] = obj
  })

  let sum = 0;
  for (const k in playersByRoute) {
    const obj = playersByRoute[k]
    sum += obj.players.length
  }

  return sum;
}

type Field = { height: number, pos: Pos};
type Grid = Field[][]

class Pos {
  y: number
  x: number

  constructor(y: number, x: number) {
    this.y = y;
    this.x = x;
  }

  isEqual(otherPos: Pos) {
    return this.x === otherPos.x && this.y === otherPos.y
  }

  clone() {
    return new Pos(this.y, this.x);
  }

  toString() {
    return "y" + this.y.toString() + "x" + this.x.toString();
  }
}

class Map {
  readonly grid: Grid;
  readonly startFields: Field[] = [];
  readonly endFields: Field[] = [];
  readonly maxX: number;
  readonly maxY: number;


  constructor(text: string) {
    const lines = text.split('\n');

    this.grid = lines.map((row, y) => {
      return row.split('').map((fieldHeight, x) => {
        const f: Field = {height: Number(fieldHeight), pos: new Pos(y, x)};
        if (f.height === 0) {
          this.startFields.push(f);
        } else if (f.height === 9) {
          this.endFields.push(f);
        }
        return f;
      });
    });

    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }

  getFieldsAround(pos: Pos): Field[] {
    const fields: Field[] = []
    const lookY = [-1,0,1]
    const lookX = [-1,0,1]
    lookY.forEach(y => {
      lookX.forEach(x => {
        const newPosX = pos.x + x
        const newPosY = pos.y + y
        if (y === 0 && x === 0) {return}
        if (y === -1 && x === -1) {return}
        if (y === -1 && x === 1) {return}
        if (y === 1 && x === -1) {return}
        if (y === 1 && x === 1) {return}
        const f = this.getField(new Pos(newPosY, newPosX))
        if (!f) {return}
        fields.push(f)
      })
    })
    return fields
  }

  getField(pos: Pos): Field | undefined {
    const x = pos.x
    const y = pos.y
    if (!(x >= 0 && y >= 0)) {return}
    if (!(x <= this.maxX && y <= this.maxY)) {return}
    return this.grid[y][x]
  }

}

class PlayersManager {
  players: Player[] = []

  constructor(...players: Player[]) {
    this.players.push(...players)
  }

  moveWithCloning() {
    const newPlayers: Player[] = [];

    this.players.forEach((player) => {
      const nextFields = player.getNextFields()
      if (nextFields.length === 0) {return}

      while (nextFields.length > 1) {
        const field = nextFields.pop()!
        const newPlayer = player.moveCloneUnsafe(field.pos)
        newPlayers.push(newPlayer)
      }

      player.moveUnsafe(nextFields[0].pos)
    })

    this.players.push(...newPlayers)
  }

  arePossibleMoves() {
    return !!this.players.find(player => player.getNextFields().length > 0)
  }

  getPlayersOnTop() {
    return this.players.filter(player => {
      const h = player.map.getField(player.pos)?.height
      return h === 9
    })
  }

}

class Player {
  readonly map: Map;
  readonly startPos: Pos;
  pos: Pos;
  score: number;

  constructor(
    map: Map,
    pos: Pos,
    startPos: Pos = pos,
    score = 0
  ) {
    this.map = map;
    this.startPos = pos.clone();
    this.pos = pos;
    this.score = score;
  }

  clone() {
    return new Player(this.map, this.startPos, this.pos.clone(), this.score);
  }

  getNextFields() {
    const hillToDo = 1
    const curField = this.map.getField(this.pos)
    if (!curField) {throw Error("impossible player position")}
    const fieldsAround = this.map.getFieldsAround(curField.pos)
    return fieldsAround.filter(f => f.height === curField.height + hillToDo)
  }

  moveUnsafe(newPos: Pos) {
    this.pos = newPos;
    this.score++
  }

  moveCloneUnsafe(newPos: Pos) {
    const newPlayer = this.clone()
    newPlayer.moveUnsafe(newPos)
    return newPlayer
  }

}
