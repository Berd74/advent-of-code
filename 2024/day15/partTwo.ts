import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');

  const map = new Map(lines);
  while (map.bot.move()) {
    // map.displayFields();
  }

  let sum = 0;
  const boxes = map.getAllBoxes()
  boxes.forEach(box => {
    const boxPos = box.positions[0]
      sum += boxPos.y * 100 + boxPos.x
  })

  return sum;
}

type Grid = Field[][]
type Direction = '<' | '>' | '^' | 'v'
type Moves = Direction[]

class Element {
  type: 'box' | 'wall'
  positions: Pos[] = []
  map: Map

  constructor(type: 'box' | 'wall', positions: Pos[], map: Map) {
    this.type = type
    this.positions = positions
    this.map = map
  }

  toString() {
    return this.type + '[' + this.positions.toString() + ']'
  }

  unsafeMove(dir: Direction) {
    switch (dir) {
      case '^':
        this.positions.forEach(pos => {
          pos.y += -1
        })
        break;
      case '>':
        this.positions.forEach(pos => {
          pos.x += 1
        })
        break;
      case 'v':
        this.positions.forEach(pos => {
          pos.y += 1
        })
        break;
      case '<':
        this.positions.forEach(pos => {
          pos.x += -1
        })
        break;
    }

  }

}

class Field {
  readonly pos: Pos;
  readonly map: Map;

  constructor(pos: Pos, map: Map) {
    this.pos = pos;
    this.map = map;
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
      boxes.forEach((box) => {
        box.unsafeMove(dir)
      })
    }
    return true
  }

  isMovePossible(dir: Direction, positions = [this.pos.clone()], boxes: Element[] = []):
    { isPossible: boolean, boxes: Element[] } {
    switch (dir) {
      case '^':
        positions.forEach(p => p.y += -1)
        break;
      case '>':
        positions.forEach(p => p.x += 1)
        break;
      case 'v':
        positions.forEach(p => p.y += 1)
        break;
      case '<':
        positions.forEach(p => p.x += -1)
        break;
    }
    const elements = this.map.getElements(positions)
    const newBoxes = elements.filter(el => el.type === 'box')
    const isThereWall = !!elements.find(el => el.type === 'wall')
    const areThereBoxes = !!elements.find(el => el.type === 'box')
    if (!isThereWall) {
      boxes.push(...newBoxes)
    }
    const newPositions2 = newBoxes
      .map(b => b.positions)
      .flat()
      .map(p => p.clone());

    const newPositions = dir === "<" || dir === '>' ? newPositions2.filter(nPos => positions.find(oldP => oldP.isEqual(nPos))) : newPositions2

    return {
      isPossible: isThereWall ? false : (areThereBoxes ? this.isMovePossible(dir, newPositions, boxes).isPossible : true),
      boxes: boxes.filter(function(el, pos, arr) {
        return arr.indexOf(el) == pos;
      })
    };
  }


}

class Map {
  readonly grid: Grid = [];
  readonly maxX: number;
  readonly maxY: number;
  readonly bot: Bot;
  readonly elements: Element[] = []

  constructor(texts: string[]) {
    const mapDesc = texts.slice(0, texts.findIndex(l => l === ''));
    let bot!: Bot;

    this.grid = mapDesc.map((row, y) => {
      return row.split('').map((character, xx) => {
        const x = xx*2
        if (character === '@') {
          bot = new Bot(texts, new Pos(y, x), this);
        }
        if (character === '#') {
          this.elements.push(new Element('wall', [new Pos(y, x), new Pos(y, x+1)], this))
        }
        if (character === 'O') {
          this.elements.push(new Element('box', [new Pos(y, x), new Pos(y, x+1)], this))
        }
        return [
          new Field(
            new Pos(y, x),
            this
          ),
          new Field(
            new Pos(y, x+1),
            this
          )
        ];
      }).flat();
    });

    this.bot = bot;
    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }

  // only for testing
  displayFields() {
    const botPos = this.bot.pos;
    this.grid.map((row, y) => {
      let header = "   "
      let subheader = "   "
      const rowText = row.map((field, x) => {
        if (y === 0) {
          header += (x%10) + " "
          subheader += '| '
        }

        if (botPos.isEqual(field.pos)) {
          return '@';
        }
        const elements = this.getElements([field.pos])
        if (elements.length > 1) {
          console.log('!!!! found 2 elements in one spot !!!!')
          console.log(elements);
        }
        if (elements.length === 0) {
          return '.';
        }
        const el = elements[0]
        return el.type === 'box' ? 'O' : '#';
      });
      if (header !== "   ") {
        console.log(header);
        console.log(subheader);
      }
      console.log(y + '- ' + rowText.join(' '));
    });
  }

  getElements(searchPositions: Pos[]): Element[]{
    return this.elements.filter(
      element => element.positions.find(elPos => searchPositions.find(searchPos => searchPos.isEqual(elPos)))
    )
  }

  getAllBoxes(): Element[]{
    return this.elements.filter(e => e.type === 'box')
  }

}
