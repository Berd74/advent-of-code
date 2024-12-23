import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  let codes = text.split('\n');

  const numericPad = new NumericPad();
  const directionalPad = new DirectionalPad();

  const sum = codes.reduce((sum, code, i) => {
    const codeNumber = Number(code.slice(0,-1))
    console.log(code);
    const p1 = numericPad.generatePath([code])
    const p2 = directionalPad.generatePath(p1)
    const p3 = directionalPad.generatePath(p2)

    return sum + (p3[0].length * codeNumber)
  }, 0)

  return sum;
}

abstract class Pad<T extends string | null> {
  protected pad: T[][];
  protected getMaxPadLength: number;
  readonly startingPos: Pos;
  readonly nullPos: Pos;
  protected currentPos: Pos;
  protected readonly mapping: Map<Exclude<T, null>, Pos>;


  constructor(pad: T[][]) {
    this.pad = pad;
    this.getMaxPadLength = Math.max(pad.length, pad[0].length);
    this.startingPos = this.findPos("A" as T)
    this.nullPos = this.findPos(null as T)
    this.currentPos = this.startingPos.clone()
    this.mapping = this.createMapping()
  }

  private createMapping() {
    const mapping = new Map();
    for (let y = 0; y < this.pad.length; y++) {
      for (let x = 0; x < this.pad[0].length; x++) {
        const key = this.pad[y][x]
        if (key !== null) {
          mapping.set(key as Exclude<T, null>, new Pos(y,x))
        }
      }
    }
    return mapping;
  }

  findPos(key: T) {
    let pos!: Pos;
    for (let y = 0; y < this.pad.length; y++) {
      for (let x = 0; x < this.pad[0].length; x++) {
        if (this.pad[y][x] === key) {
          pos = new Pos(y, x);
        }
      }
      if (pos !== undefined) {
        break;
      }
    }
    return pos
  }

  generatePath(paths: string[]) {

    const newPaths = paths.map(path => {
      const keyPads = path.split('') as T[]
      let finalPaths = [""]
      for (const keyPad of keyPads) {
        const posOfKey = this.findPos(keyPad)
        const pathPart = this.generatePathPart(this.currentPos, posOfKey)
        let uniquePermutations = Array.from(new Set(this.generatePathPartPermutations(pathPart)));
        // omit gap
        if (this.currentPos.y === this.nullPos.y) {
          uniquePermutations = uniquePermutations.filter(path => {
            const diff = this.currentPos.x - this.nullPos.x
            if (diff === 1) {
              if (path.slice(0,1) === '<') {
                return false
              }
            } else if (diff === 2) {
              if (path.slice(0,2) === '<<') {
                return false
              }
            }
            return true;
          })
        } else if (this.currentPos.x === this.nullPos.x) {
          uniquePermutations = uniquePermutations.filter(path => {
            const diff = this.currentPos.y - this.nullPos.y
            if (diff === 1) {
              if (path.slice(0,1) === '^') {
                return false
              }
            } else if (diff === -1) {
              if (path.slice(0,1) === 'v') {
                return false
              }
            } else if (diff === -2) {
              if (path.slice(0,2) === 'vv') {
                return false
              }
            } else if (diff === -3) {
              if (path.slice(0,3) === 'vvv') {
                return false
              }
            }
            return true;
          })
        }
        // omit gap END
        const newFinalPaths: string[] = []
        uniquePermutations.forEach((permutation) => {
          finalPaths.forEach((path) => {
            newFinalPaths.push(path + permutation + 'A')
          })
        })
        this.currentPos = posOfKey
        finalPaths = newFinalPaths
      }
      return finalPaths;
    })

    return this.getShortestStrings(newPaths.flat())
  }

  private getShortestStrings(strings: string[]): string[] {
    if (strings.length === 0) return [];
    const lengths = new Set(strings.map(s => s.length))
    const minLength = Math.min(...lengths);
    return strings.filter(s => s.length === minLength);
  }

  generatePathPartPermutations(str: string): string[] {
    if (str.length <= 1) return [str]; // Base case for recursion

    const result: string[] = [];
    for (let i = 0; i < str.length; i++) {
      const char = str[i]; // Pick one character

      // Remaining string after removing the current character
      const remaining = str.slice(0, i) + str.slice(i + 1);

      // Recursively generate permutations for the remaining characters
      for (const perm of this.generatePathPartPermutations(remaining)) {
        result.push(char + perm); // Prepend the current character
      }
    }

    return result;
  }

  generatePathPart(pos1: Pos, pos2: Pos) {
    let path = ''
    const xDiff = pos1.x - pos2.x
    if (xDiff < 0) {
      path += '>'.repeat(-xDiff)
    } else {
      path += '<'.repeat(xDiff)
    }
    const yDiff = pos1.y - pos2.y
    if (yDiff < 0) {
      path += 'v'.repeat(-yDiff)
    } else {
      path += '^'.repeat(yDiff)
    }
    return path
  }
}

class NumericPad extends Pad<NumericPadKey> {
  constructor() {
    const pad: NumericPadKey[][] = [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      [null, '0', 'A']
    ];
    super(pad);
  }

}

class DirectionalPad extends Pad<DirectionalPadKey> {
  constructor() {
    const pad: DirectionalPadKey[][] = [
      [null, '^', 'A'],
      ['<', 'v', '>']
    ];
    super(pad);
  }

}

type NumericPadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | null;
type DirectionalPadKey = '^' | '>' | 'v' | '<' | 'A' | null;

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

  calcDiff(otherPos: Pos) {
    const y = Math.abs(this.y - otherPos.y);
    const x = Math.abs(this.x - otherPos.x);
    return x + y;
  }
}