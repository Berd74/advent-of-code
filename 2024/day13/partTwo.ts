import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  const price = Machine.splitMachineDescription(lines)
    .map((d) => new Machine(d))
    .map((m) => m.getResultForMachine())
    .filter((m) => !!m)
    .map((m) => m!)
    .map((m) => m.y * 3 + m.x)
    .reduce((cur, next) => cur + next, 0);

  console.log(price);
  return price
}

class Machine {
  buttonA: Pos;
  buttonB: Pos;
  prize: Pos;

  constructor([buttonA_desc, buttonB_desc, prize_desc]: [string, string, string]) {
    this.buttonA = this.getButtonPos(buttonA_desc);
    this.buttonB = this.getButtonPos(buttonB_desc)
    this.prize = this.getPrizePos(prize_desc);
  }

  getResultForMachine() {
    return Machine.getResult(this.buttonA, this.buttonB, this.prize);
  }

  static getResult(posA: Pos, posB: Pos, finding: Pos) {
    const result = somethingThatINeverDontBefore2x2(posA.x, posB.x, finding.x, posA.y, posB.y, finding.y)
    if (Number.isInteger(result.y) && Number.isInteger(result.x)) {
      return result
    } else {
      return undefined
    }
  }

  private getButtonPos(desc: string) {
    const [xDesc, yDesc] = desc.split(":")[1].split(",")
    const x = Number(xDesc.split("+")[1])
    const y = Number(yDesc.split("+")[1])
    return new Pos(y,x)
  }

  private getPrizePos(desc: string){
    const [xDesc, yDesc] = desc.split(":")[1].split(",")
    const x = Number(xDesc.split("=")[1]) + 10000000000000
    const y = Number(yDesc.split("=")[1]) + 10000000000000
    return new Pos(y,x)
  }

  static splitMachineDescription(lines : string[] ){
    const descs : [string,string,string][] = []
    lines.forEach((line, i, lines) => {
      if (line === "") {
        descs.push([lines[i-3], lines[i-2], lines[i-1]])
      }
    })
    return descs
  }

};

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

  multipleByNumber(n: number) {
    return new Pos(this.y * n, this.x * n);
  }

  addPosition(p: Pos) {
    return new Pos(this.y + p.y, this.x + p.x);
  }
}

function somethingThatINeverDontBefore2x2(x1: number, y1: number, x: number, x2: number, y2: number, y: number) {
  // console.log(`
  //  ${x1}, ${y1}, ${x},
  //  ${x2}, ${y2}, ${y},
  //  `);
  const w = (y1*x2)-(x1*y2)
  const wx = (y*y1)-(x*y2)
  const wy = (x*x2)-(y*x1)
  // console.log(`
  //  ${w}, ${wx}, ${wy},
  //  `);
  const Rx = wx/w
  const Ry = wy/w
  return new Pos(Rx, Ry);
}