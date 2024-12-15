import {readFile} from '../utils/readFile';

export async function partOne(path: string, w: number, h: number) {
  const text = await readFile(path);
  const lines = text.split('\n');

  const bots = Bot.botsFromDescription(lines);
  const map = new Map(w, h);
  map.attachBots(bots);
  map.displayFieldsWithBots();
  map.moveAllBots(100);
  map.displayFieldsWithBots();

  const q1: Bot[] = []
  const q2: Bot[] = []
  const q3: Bot[] = []
  const q4: Bot[] = []
  const splitX = Math.ceil(w/2)-1
  const splitY = Math.ceil(h/2)-1
  console.log('--');
  console.log(splitX);
  console.log(splitY);
  console.log('--');

  bots.forEach(b => {
    const x = b.pos.x
    const y = b.pos.y
    if (x < splitX) {
      if (y < splitY) {
        q1.push(b)
      }
      if (y > splitY) {
        q3.push(b)
      }
    }
    if (x > splitX ) {
      if (y < splitY) {
        q2.push(b)
      }
      if (y > splitY) {
        q4.push(b)
      }
    }
  })
  console.log(q1.length);
  console.log(q2.length);
  console.log(q3.length);
  console.log(q4.length);


  return q1.length * q2.length * q3.length * q4.length;
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
    // console.log(this.pos.y, newPosY);
    // console.log(this.pos.x, newPosX);

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
      console.log(rowText.join(','));
    });
    console.log(sum);
  }

  findBots(pos: Pos) {
    return this.bots.filter(b => b.pos.x === pos.x && b.pos.y === pos.y);
  }

  getFieldsAround(pos: Pos): Field[] {
    const fields: Field[] = [];
    const lookY = [-1, 0, 1];
    const lookX = [-1, 0, 1];
    lookY.forEach(y => {
      lookX.forEach(x => {
        const newPosX = pos.x + x;
        const newPosY = pos.y + y;
        if (y === 0 && x === 0) {return;}
        if (y === -1 && x === -1) {return;}
        if (y === -1 && x === 1) {return;}
        if (y === 1 && x === -1) {return;}
        if (y === 1 && x === 1) {return;}
        const f = this.getField(new Pos(newPosY, newPosX));
        if (!f) {return;}
        fields.push(f);
      });
    });
    return fields;
  }

  getField(pos: Pos): Field | undefined {
    const x = pos.x;
    const y = pos.y;
    if (!(x >= 0 && y >= 0)) {return;}
    if (!(x <= this.maxX && y <= this.maxY)) {return;}
    return this.grid[y][x];
  }

}
