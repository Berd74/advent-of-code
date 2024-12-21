import {readFile} from '../utils/readFile';

let noCheatBest = 0;
const timeToSave = 100
const availableCheatDistance = 20
export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');

  async function main(cheat: boolean) {
    const map = new Map(lines);
    Player.map = map;
    const player = new Player();
    player.cheater = cheat;
    map.players = [player];

    let bestLenght = 0;
    const winners: Player[] = [];
    let smallestScore: number = Infinity;
    let largestScore: number = 0;
    let best: Player | undefined;

    while (map.players.some(p => p.alive)) {
      map.players = map.players.map(p => p.move()).flat();

      map.players.forEach((p, i) => {
        if (p.score > largestScore) {
          largestScore = p.score;
        }
      });
      const foundWinners = map.players.filter(p => p.pos.isEqual(map.endPos));

      foundWinners.forEach(winner => {
        winners.push(winner);
        winner.alive = false;
        if (winner.score < smallestScore) {
          smallestScore = winner.score;
          best = winner;
        }
      });

      if (cheat) {
        // Wait for 100ms before the next iteration
        // console.log(map.players.map(p => ({p: p.pos, cheatedPod: p.cheatedPos})));
        if (Math.abs(map.players.length - bestLenght) > 1000) {
          bestLenght = map.players.length;
          console.log('len:' + bestLenght);
        }
          // console.log('no cheaters');
        //   console.log(
        //     map.players
        //       .filter(p => !p.cheated)
        //       .map((p, i) => ({xy: p.pos.toString(), scr: p.score}))
        //   )
        //   console.log('cheaters');
        //   console.log(
        //     map.players
        //       .filter(p => p.cheated)
        //       .map((p, i) => ({xy: p.pos.toString(), scr: p.score}))
        //   )
        // const aa = map.getFieldAtXY(3,3)?.visitedPoints
        // console.log(aa);
        // await new Promise(resolve => setTimeout(resolve, 1000));
      }


    }


      // .filter(p => p.score === smallestScore)
      // .forEach(winner => {
        // winner.history.forEach(f => {
        //   visitedFieldsPos.add(f.pos.toString());
        // });
      // });


    return {smallestScore, winners, best, map};
  }

  // noCheat.map.grid.forEach((row, y) => {
  //   const line = row.map((field, x) => {
  //     const score: string | undefined = Field.cache[field.pos.toString()]?.toString();
  //
  //     if (score) {
  //       return score.slice(score.length - 1, score.length);
  //     }
  //     if (field.wall) {
  //       return '▒';
  //     }
  //     return '.';
  //   }).join('');
  //   console.log(line);
  // });

  const noCheat = await main(false);
  noCheatBest = noCheat.smallestScore
  const cheat = await main(true)

  // const a = cheat.winners
  //   .map((p, i) => ({xy: p.pos.toString(), scr: p.score}))
  // console.log(a);

  const savedTimes = cheat.winners.map(winner => {
    return Math.abs(winner.score - noCheat.smallestScore)
  }).filter(savedTime => savedTime >= timeToSave)

  console.log(savedTimes);

  return savedTimes.length;
}

type Grid = Field[][]

class Field {
  readonly pos: Pos;
  readonly map: Map;
  wall: boolean;
  _visitedPoints: number = Infinity;
  static cache: { [key: string]: number } = {};

  get visitedPoints() {
    return this._visitedPoints;
  }

  setVisitedPoints(n: number, useCache = false) {
    this._visitedPoints = n;
    if (useCache) {
      const pos = this.pos.toString();
      Field.cache[pos] = n;
    }
  }

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

  calcDiff(otherPos: Pos) {
    const y = Math.abs(this.y - otherPos.y);
    const x = Math.abs(this.x - otherPos.x);
    return x + y;
  }
}

class Player {
  pos: Pos;
  static map: Map;
  score: number;
  alive = true;
  cheater: boolean = false;
  cheated: boolean = false;

  constructor(pos?: Pos, score: number = 0) {
    this.pos = pos === undefined ? Player.map.startPos : pos;
    this.score = score;
  }

  clone() {
    const newP = new Player(this.pos, this.score);
    newP.cheater = this.cheater;
    newP.cheated = this.cheated;
    return newP;
  }

  move() {
    if (!this.alive) {return [];}
    const possibleFields = Player.map.getNextPossibleFields(this);
    const newPlayers: Player[] = [];

    possibleFields.forEach(field => {
      if (this.cheater && this.cheated && this.score > noCheatBest - timeToSave) {
        return
      }

      const clone = this.clone();
      const posDiff = clone.pos.calcDiff(field.pos);
      clone.score += posDiff;
      clone.pos = field.pos;
      if (posDiff > 1) {
        clone.cheated = true;
      }

      if (clone.cheater && clone.cheated) {
        const fromCache = Field.cache[clone.pos.toString()];
        if (clone.score + timeToSave <= fromCache) {
          newPlayers.push(clone);
        }
      } else if (clone.cheater && !clone.cheated) {
        const fromCache = Field.cache[clone.pos.toString()];
        if (clone.score <= fromCache) {
          newPlayers.push(clone);
        }
      } else if (!clone.cheater) {
        if (clone.score < field.visitedPoints) {
          newPlayers.push(clone);
        }
      }
    });

    Player.map.makeFieldsVisited(newPlayers);
    this.alive = false;
    return newPlayers;
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
        character === 'S' && (this.startPos = new Pos(y, x));
        character === 'E' && (this.endPos = new Pos(y, x));
        const newField = new Field(new Pos(y, x), this, character === '#');
        character === 'S' && (newField.setVisitedPoints(0));
        character === 'S' && (Field.cache[newField.pos.toString()] = 0)
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
    return this.getFieldAtXY(y, x);
  }

  getFieldAtXY(lookY: number, lookX: number): Field | undefined {
    const x = lookX;
    const y = lookY;
    if (!(x >= 0 && y >= 0)) {return;}
    if (!(x <= this.maxX && y <= this.maxY)) {return;}
    return this.grid[y][x];
  }

  getNextPossibleFieldsHelper(pos: Pos) {
    const possibleFields: Field[] = [];

    const topField = this.getFieldAtXY(pos.y - 1, pos.x);
    topField && possibleFields.push(topField);

    const rightField = this.getFieldAtXY(pos.y, pos.x + 1);
    rightField && possibleFields.push(rightField);

    const bottomField = this.getFieldAtXY(pos.y + 1, pos.x);
    bottomField && possibleFields.push(bottomField);

    const leftField = this.getFieldAtXY(pos.y, pos.x - 1);
    leftField && possibleFields.push(leftField);

    return possibleFields;
  }

  getFieldsAndCheatedHelper(curPos: Pos, maxDistance: number) {
    const yArr =  Array.from({ length: 41 }, (_, i) => i - 20);
    const xArr =  Array.from({ length: 41 }, (_, i) => i - 20);
    const fields: (Field | undefined)[] = [];
    for (const y of yArr) {
      for (const x of xArr) {
        fields.push(this.getFieldAtXY(curPos.y+y, curPos.x+x))
      }
    }
    const f =  fields
      .reduce((cur: Field[], next) => {
        next && cur.push(next)
        return cur
      }, [])
      .filter(field => {
        const distance = field.pos.calcDiff(curPos)
        return distance >= 1 && distance <= maxDistance
      })
    return f
  }

  getNextPossibleFields(player: Player): Field[] {

    if (player.cheater && !player.cheated) {
      return this.getFieldsAndCheatedHelper(player.pos, availableCheatDistance)
      .filter(f => !f.wall)
      .filter(f => Field.cache[f.pos.toString()] ? player.score < Field.cache[f.pos.toString()] : true )
    } else if (player.cheater && player.cheated) {
      const a = this.getNextPossibleFieldsHelper(player.pos)
      .filter(f => !f.wall)
      .sort((a,b) => Field.cache[a.pos.toString()] > Field.cache[b.pos.toString()] ? -1 : 0)[0]
      return [a]
    } else if (!player.cheater) {
      return this.getNextPossibleFieldsHelper(player.pos)
      .filter(f => !f.wall)
      .filter(f => Field.cache[f.pos.toString()] ? player.score+1 < Field.cache[f.pos.toString()] : true )
    }

    throw new Error("impossible case")
  }

  makeFieldsVisited(players: Player[]) {
    players.forEach(player => {
      const field = this.getFieldAtPos(player.pos);

      if (!player.cheater) {
        // player is no cheater
        field && (field.setVisitedPoints(Math.min(player.score, field.visitedPoints), true));
      }

    });
  }

}
