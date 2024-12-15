import {readFile} from '../utils/readFile';

export async function partTwo(path: string, w: number, h: number) {
  const text = await readFile(path);
  const lines = text.split('\n');

  const bots = Bot.botsFromDescription(lines);
  const map = new Map(w, h);
  map.attachBots(bots);

  let foundSquare = false
  let seconds = 0
  while (!foundSquare) {
    map.moveAllBots(1)
    seconds++
    const startingSquareBot = map.areBotsInLine(10)
    if (startingSquareBot) {
      foundSquare = true
      console.log(startingSquareBot);
      map.displayFieldsWithBots()
    }
  }

  return seconds
}

type Field = { pos: Pos };
type Grid = Field[][]

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
  readonly pos: Pos;
  readonly vector: Pos;
  readonly name: string;
  map!: Map;
  static counter = 0

  constructor(pos: Pos, vector: Pos) {
    this.name = "b" + Bot.counter
    Bot.counter++
    this.pos = pos;
    this.vector = vector;
  }

  move(steps = 1) {
    const newPosX = this.pos.x + (this.vector.x * steps);
    const lenX = this.map.maxX + 1;
    const restX = Math.abs(newPosX % lenX);

    const newPosY = this.pos.y + (this.vector.y * steps);
    const lenY = this.map.maxY + 1;
    const restY = Math.abs(newPosY % lenY);

    if (newPosX > this.map.maxX) {
      this.pos.x = restX;
    } else if (newPosX < 0) {
      if (restX === 0) {
        this.pos.x = 0
      } else {
        this.pos.x = this.map.maxX - restX + 1;
      }
    } else {
      this.pos.x = newPosX;
    }


    if (newPosY > this.map.maxY) {
      this.pos.y = restY;
    } else if (newPosY < 0) {
      if (restY === 0) {
        this.pos.y = 0
      } else {
        this.pos.y = this.map.maxY - restY + 1;
      }
    } else {
      this.pos.y = newPosY;
    }
  }

  static botsFromDescription(texts: string[]): Bot[] {
    return texts.map((text) => Bot.botFromDescription(text));
  }

  static botFromDescription(text: string): Bot {
    const [pDesc, vDesc] = text.split(' ');
    const [pX, pY] = pDesc.slice(2).split(',');
    const [vX, vY] = vDesc.slice(2).split(',');
    const p = new Pos(Number(pY), Number(pX));
    const v = new Pos(Number(vY), Number(vX));
    return new Bot(p, v);
  }

}

class Map {
  readonly grid: Grid = [];
  readonly maxX: number;
  readonly maxY: number;
  bots: Bot[] = [];

  constructor(w: number, h: number) {
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        const f: Field = {pos: new Pos(y, x)};
        row.push(f);
      }
      this.grid.push(row);
    }
    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;
  }

  attachBots(bots: Bot[]) {
    this.bots = bots;
    for (const bot of bots) {
      bot.map = this;
    }
  }

  moveAllBots(steps = 1) {
    this.bots.forEach(b => {
      b.move(steps);
    });
  }

  //only for testing
  displayFieldsWithBots() {
    const a = this.bots.map(b => b.name + " " + b.pos).join(" | ")
    console.log(a);
    let sum = 0;
    this.grid.map((row, y) => {
      const rowText = row.map((filed, x) => {
        const amount = this.findBots(filed.pos).length
        sum += amount
        return amount;
      });
      console.log(rowText.join(''));
    });
    console.log(sum);
  }

  findBots(pos: Pos) {
    return this.bots.filter(b => b.pos.isEqual(pos));
  }

  isBot(pos: Pos) {
    return !!this.bots.find(b => b.pos.isEqual(pos));
  }

  areBotsInLine(lineLength: number) {
    return this.bots.find(b => {
      for (let i = 1; i <= lineLength; i++) {
        const p1 = b.pos.clone()
        p1.x += i
        const p2 = b.pos.clone()
        p2.y += i
        const found1 = this.isBot(p1)
        const found2 = this.isBot(p2)
        if (found1 && found2) {
          continue;
        }
        return
      }
      return b
    })
  }

}
