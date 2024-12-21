import {readFile} from '../utils/readFile';

let noCheatBest = 0;

export async function partOne(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');



  // return array.filter((obj) => {
  //   // Create a unique string representation of the object's properties
  //   const key = JSON.stringify({ x: obj.x, y: obj.y, haker: obj.haker });
  //
  //   // Check if the key is already in the Set
  //   if (seen.has(key)) {
  //     return false; // Exclude the duplicate
  //   }
  //
  //   seen.add(key); // Add the key to the Set
  //   return true; // Include the object
  // });

  async function main(cheat: boolean) {
    const map = new Map(lines);
    Player.map = map
    const player = new Player()
    player.cheater = cheat
    map.players = [player];

    let bestLenght = 0
    const winners: Player[] = [];
    let smallestScore: number = Infinity;
    let largestScore: number = 0;
    let best: Player | undefined;
    let a = 0;

    const seen = new Set();

    while (map.players.some(p => p.alive)) {

      // map.players.filter((p) => {
      //   const key = JSON.stringify({
      //     a: p.cheatedPos?.toString(),
      //     b: p.pos?.toString(),
      //     c: p.
      //     obj.haker
      //   });
      //   if (seen.has(key)) {
      //     return false; // Exclude the duplicate
      //   }
      //
      //   seen.add(key); // Add the key to the Set
      //   return true; // Include the object
      // });

      // console.log("iteration: " + ++a);
      map.players = map.players.map(p => p.move()).flat();
      // console.log( map.players.length);

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
        if (Math.abs(map.players.length - bestLenght) > 100 ) {
          bestLenght = map.players.length
          console.log(bestLenght);
        }
        // const aa = map.getFieldAtXY(3,3)?.visitedPoints
        // console.log(aa);
        // await new Promise(resolve => setTimeout(resolve, 10));
      }


    }

    // const visitedFieldsPos = new Set();

    winners
      .filter(p => p.score === smallestScore)
      .forEach(winner => {
        // winner.history.forEach(f => {
        //   visitedFieldsPos.add(f.pos.toString());
        // });
      });

    // console.log('winners scores');
    // console.log(winners.map(p => p.score).join(','));
    // console.log('---------------');

    // if (best && cheat) {
    //   setInterval(() => {
    //     map.grid.forEach((row, y) => {
    //       const line = row.map((field, x) => {
    //         if (best!.history.find(wf => wf.pos.isEqual(field.pos))) {
    //           if (!cheat) {
    //             const t = Field.cache[field.pos.toString()].toString()
    //             return t.slice(t.length-1,t.length)
    //           }
    //           return 'O';
    //         }
    //         if (field.wall) {
    //           return '▒';
    //         }
    //         return '.';
    //       }).join('');
    //       console.log(line);
    //     });
    //   }, 5000)
    // }

   return {smallestScore, winners}
  }



  const noCheat = await main(false)
  console.log('noCheat.smallestScore');
  console.log(noCheat.smallestScore);
  noCheatBest = noCheat.smallestScore
  const cheat = await main(true)

  const savedTimes = cheat.winners.map(winner => {
    return Math.abs(winner.score - noCheat.smallestScore)
  }).filter(savedTime => savedTime >= 100)


  return savedTimes.length;
}

type Grid = Field[][]
type Direction = '<' | '>' | '^' | 'v'
type Moves = Direction[]

class Field {
  readonly pos: Pos;
  readonly map: Map;
  wall: boolean;
  _visitedPoints: number = Infinity;
  visitedPointsWithCheatUsed: number = Infinity;
  static cache: {[key: string]: number} = {};
  static cacheStartPoint: {[startPoint: string]: {[pos: string]: number}} = {};

  get visitedPoints() {
    return this._visitedPoints;
  }
  setVisitedPoints(n: number, useCache = false) {
    this._visitedPoints = n;
    if (useCache) {
      const pos = this.pos.toString()
      Field.cache[pos] = n
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

  cloneAdd(y: number, x: number) {
    const clonned = this.clone();
    clonned.y += y;
    clonned.x += x;
    return clonned;
  }
}

class Player {
  pos: Pos;
  static map: Map;
  score: number;
  alive = true;
  // history: Field[] = [];
  cheater: boolean = false;
  cheatedPos?: Pos = undefined;

  constructor( pos?: Pos, score: number = 0) {
    this.pos = pos === undefined ? Player.map.startPos : pos;
    this.score = score;
  }

  clone() {
    const newP = new Player(this.pos, this.score);
    newP.cheater = this.cheater;
    newP.cheatedPos = this.cheatedPos;
    return newP;
  }

  move() {
    if (!this.alive) {return [];}
    const possibleFields = Player.map
      .getNextPossibleFields(this.pos)
      .filter(f => {
        if (f.wall) {
          if (this.cheater && !this.cheatedPos ) {
            return true;
          }
          return false;
        } else {
          return true;
        }
      });
    const newPlayers: Player[] = [];
    possibleFields.forEach(obj => {
      if (this.cheater && this.score+1 > noCheatBest - 100) {
        return
      }
      const clone = this.clone();
      clone.score += 1;
      clone.pos = obj.pos;
      // clone.history.push(obj.field);
      if (!clone.cheatedPos && obj.wall) {
        clone.cheatedPos = obj.pos.clone()
      }
      // don't ignore fields with 1000 points less,
      // the player they might rotate itself in future and make the points equal
      if (clone.cheater) {
        if (clone.score > noCheatBest - 100) {
          return
        }
        const hasCheatedPos = clone.cheatedPos
        const fromCache = Field.cache[obj.pos.toString()]

        if (hasCheatedPos) {
          const fromCacheExtra = Field.cacheStartPoint[hasCheatedPos.toString()]?.[obj.pos.toString()]

          if ((!fromCacheExtra || clone.score <= fromCacheExtra) &&
            (!fromCache || clone.score + 100 <= fromCache)) {
            newPlayers.push(clone);
          }
        }

        // Field.cacheStartPoint[this.cheatedPos.toString()][field.pos.toString()]
        if (!hasCheatedPos) {
          if ((!fromCache || clone.score <= fromCache)) {
            newPlayers.push(clone);
          }
        }
      } else {
        if (clone.score < obj.visitedPoints) {
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
        character === 'S' && (newField.visitedPointsWithCheatUsed = 0);
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

  getNextPossibleFields(pos: Pos): Field[] {
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

  makeFieldsVisited(players: Player[]) {
    players.forEach(player => {
      const field = this.getFieldAtPos(player.pos);
      if (!player.cheater) {
        // player is no cheater
        field && (field.setVisitedPoints(Math.min(player.score, field.visitedPoints), true));
      } else if (player.cheater && player.cheatedPos) {
        // cheater which cheated
        if (field) {
          const fieldVal = Field.cacheStartPoint[player.cheatedPos.toString()]?.[field.pos.toString()] || Infinity
          if (Field.cacheStartPoint[player.cheatedPos.toString()]) {
            Field.cacheStartPoint[player.cheatedPos.toString()][field.pos.toString()] = Math.min(player.score, fieldVal)
          } else {
            Field.cacheStartPoint[player.cheatedPos.toString()] = {}
            Field.cacheStartPoint[player.cheatedPos.toString()][field.pos.toString()] = Math.min(player.score, fieldVal)
          }
        }
        // field && (field.visitedPointsWithCheatUsed = Math.min(player.score, field.visitedPointsWithCheatUsed));
      } else if (player.cheater && !player.cheatedPos) {
        // player is cheater but didn't cheat yet
        //todo no needed propably

        // field && (field.setVisitedPoints(Math.min(player.score, field.visitedPoints)));
      }

    });
  }

}
