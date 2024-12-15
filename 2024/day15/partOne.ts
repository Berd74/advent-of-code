import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');

  const map = new Map(lines);

  // map.displayFields();
  while (map.bot.move()) {
    // map.displayFields();
  }

  let sum = 0;
  map.grid.forEach((row, y) => {
    row.forEach((field, x) => {
      if (field.element === 'box') {
        sum += field.pos.y * 100 + field.pos.x
      }
    })
  })

  return sum;
}

type Element = undefined | 'box' | 'wall';
type Grid = Field[][]
type Direction = '<' | '>' | '^' | 'v'
type Moves = Direction[]

class Field {
  readonly pos: Pos;
  readonly map: Map;
  element: Element;

  constructor(pos: Pos, map: Map, element: Element) {
    this.pos = pos;
    this.map = map;
    this.element = element;
  }

  move(dir: Direction) {
    let targetField: Field | undefined;
    switch (dir) {
      case '^':
        targetField = this.map.getField(this.pos.cloneAdd(-1,0))
        break;
      case '>':
        targetField = this.map.getField(this.pos.cloneAdd(0,1))
        break;
      case 'v':
        targetField = this.map.getField(this.pos.cloneAdd(1,0))
        break;
      case '<':
        targetField = this.map.getField(this.pos.cloneAdd(0,-1))
        break;
    }
    if (targetField && targetField.element === undefined) {
      this.element = undefined;
      targetField.element = 'box';
    } else {
      throw Error(`Unable to move field at position: ${this.pos.toString()} in direction ${dir} 
       the targetField is ${!targetField ? 'not found' : targetField.element}`);
    }
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

class Bot {
  pos: Pos;
  map: Map;
  moves: Moves;

  constructor(texts: string[], pos: Pos, map: Map) {
    this.moves = Bot.movesFromDescription(texts);
    this.pos = pos;
    this.map = map;
  }

  private static movesFromDescription(texts: string[]) {
    return texts.slice(texts.findIndex(l => l === '') + 1).join().split('') as Moves;
  }

  move() {
    const dir = this.moves.shift();
    if (!dir) {
      return false
    }
    const {isPossible, boxes} = this.isMovePossible(dir)

    if (isPossible) {
      switch (dir) {
        case '^':
          this.pos.y += -1;
          break;
        case '>':
          this.pos.x += 1;
          break;
        case 'v':
          this.pos.y += 1;
          break;
        case '<':
          this.pos.x += -1;
          break;
      }
      boxes.reverse().forEach((box) => {
        box.move(dir)
      })
    }
    return true
  }

  isMovePossible(dir: Direction, pos = this.pos.clone(), boxes: Field[] = []):
    { isPossible: boolean, boxes: Field[] } {
    switch (dir) {
      case '^':
        pos.y += -1;
        break;
      case '>':
        pos.x += 1;
        break;
      case 'v':
        pos.y += 1;
        break;
      case '<':
        pos.x += -1;
        break;
    }
    const field = this.map.getField(pos)!;
    const el = field.element;
    if (el === 'box') {boxes.push(field);}
    return {
      isPossible: el === 'box' ? this.isMovePossible(dir, pos, boxes).isPossible : el !== 'wall',
      boxes: boxes
    };
  }


}

class Map {
  readonly grid: Grid = [];
  readonly maxX: number;
  readonly maxY: number;
  readonly bot: Bot;

  constructor(texts: string[]) {
    const mapDesc = texts.slice(0, texts.findIndex(l => l === ''));
    let bot!: Bot;

    this.grid = mapDesc.map((row, y) => {
      return row.split('').map((character, x) => {
        if (character === '@' && this.bot === undefined) {
          bot = new Bot(texts, new Pos(y, x), this);
        }
        return new Field(
          new Pos(y, x),
          this,
          character === '#' ? 'wall' : character === 'O' ? 'box' : undefined
        );
      });
    });

    this.bot = bot;
    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }

  displayFields() {
    console.log('');
    const botPos = this.bot.pos;

    this.grid.map((row, y) => {
      let header = "   "
      let subheader = "   "
      const rowText = row.map((field, x) => {
        if (y === 0) {
          header += x + " "
          subheader += '| '
        }

        if (botPos.isEqual(field.pos)) {
          return '@';
        }
        return field.element === 'box' ? 'O' : field.element === 'wall' ? '#' : '.';
      });
      if (header !== "   ") {
        console.log(header);
        console.log(subheader);
      }
      console.log(y + '- ' + rowText.join(' '));
    });
  }

  getField(pos: Pos): Field | undefined {
    const x = pos.x;
    const y = pos.y;
    if (!(x >= 0 && y >= 0)) {return;}
    if (!(x <= this.maxX && y <= this.maxY)) {return;}
    return this.grid[y][x];
  }

}
