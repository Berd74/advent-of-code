import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  const price = Machine.splitMachineDescription(lines)
    .map((d) => new Machine(d))
    .map((m) => m.getResultForMachine())
    .filter((m) => !!m)
    .map((m) => m!)
    .map((m) => m.multiplayerA * 3 + m.multiplayerB)
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

    let X = 1
    while (true) {
      const maxPosA = posA.multipleByNumber(X)
      const maxPosB = posB.multipleByNumber(X)
      const maxResult = maxPosA.addPosition(maxPosB)
      if (maxResult.y >= finding.y && maxResult.x >= finding.x) {
        for (let i = 0; i <= X; i++) {

          const resWithMaxA = maxPosA.addPosition(posB.multipleByNumber(i))
          if (resWithMaxA.isEqual(finding)) {
            return {multiplayerA: X, multiplayerB: i}
          }
        }
        for (let i = 0; i <= X; i++) {

          const resWithMaxB = maxPosB.addPosition(posA.multipleByNumber(i))
          if (resWithMaxB.isEqual(finding)) {
            return {multiplayerB: X, multiplayerA: i}
          }
        }

      }
      if (X > finding.y+10 && X > finding.x+10) {
        return undefined
      }
      if (X > 150) {
        return undefined
      }
      X++
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
    const x = Number(xDesc.split("=")[1])
    const y = Number(yDesc.split("=")[1])
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