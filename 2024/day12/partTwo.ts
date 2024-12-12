import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);

  const map = new Map(text);

  map.grid.forEach((row, y) => {
    row.forEach((field, x) => {

      const searchAndSetCore = (field: Field) => {
        if (field.core === undefined) {
          field.core = field.pos.toString()
        }
        const fields = field.map.getFieldsAround(field.pos)
        fields.forEach((newField) => {
          if (newField.core !== undefined) {
            return
          }
          if (newField.gardenType !== field.gardenType) {
            return
          }
          newField.core = field.core
          searchAndSetCore(newField)
        })
      }

      if (field.core === undefined) {
        searchAndSetCore(field)
      }

    })
  })

  const obj : {[gardenGroup: string]: GardenDetails} = {}
  const fencesObj: {[gardenGroup: string]: FenceGroup} = {}

  map.grid.forEach((row, y) => {
    row.forEach((field, x) => {
      const k = field.gardenType + field.core
      if (!(k in obj)) {
        obj[k] = {perimeter: 0, area: 0, price: 0};
      }
      field.fence.top && obj[k].perimeter++
      field.fence.bottom && obj[k].perimeter++
      field.fence.left && obj[k].perimeter++
      field.fence.right && obj[k].perimeter++
      obj[k].area++

      if (!(k in fencesObj)) {
        fencesObj[k] = {fences: [], gardenGroup: obj[k], walls: [], price:0};
      }

      if (field.fence.top) {
        fencesObj[k].fences.push({pos: field.pos.clone(), dir: 'horizontal', baseOn: field.pos.y})
      }
      if (field.fence.bottom) {
        fencesObj[k].fences.push({pos: new Pos(field.pos.y+1, field.pos.x), dir: 'horizontal', baseOn: field.pos.y})
      }
      if (field.fence.left) {
        fencesObj[k].fences.push({pos: field.pos.clone(), dir: 'vertical', baseOn: field.pos.x})
      }
      if (field.fence.right) {
        fencesObj[k].fences.push({pos: new Pos(field.pos.y, field.pos.x+1), dir: 'vertical', baseOn: field.pos.x})
      }
    })
  })


  for (const fencesGroupK in fencesObj) {
    const fencesGroup = fencesObj[fencesGroupK]
    const walls: FenceDetails[][] = []

    fencesGroup.fences.forEach(fenceDetails => {

      function areConnected(f1: FenceDetails, f2: FenceDetails) {
        if (f1.dir !== f2.dir) { return false }

        if (f1.dir === 'vertical' && (f1.pos.y === f2.pos.y-1 || f1.pos.y === f2.pos.y+1)) {
          if (f1.pos.x === f2.pos.x && f1.baseOn === f2.baseOn) {
            return true
          }
        }

        if (f1.dir === 'horizontal' && (f1.pos.x === f2.pos.x-1 || f1.pos.x === f2.pos.x+1)) {
          if (f1.pos.y === f2.pos.y && f1.baseOn === f2.baseOn) {
            return true
          }
        }

        return false
      }

      for (let i = 0; i < walls.length; i++) {
        const wall = walls[i]

        for (let j = 0; j < wall.length; j++) {
          const wallPart = wall[j]

          if (areConnected(wallPart, fenceDetails)) {
            wall.push(fenceDetails)
            return
          }

        }
      }

      walls.push([fenceDetails])

    })

    fencesGroup.walls = walls
  }

  let sum = 0;

  for (const fencesGroupK in fencesObj) {
    const fencesGroup = fencesObj[fencesGroupK]
    const price = fencesGroup.walls.length * fencesGroup.gardenGroup.area
    sum += price
  }



  // let sum = 0;
  // for (const k in obj) {
  //   const details = obj[k]
  //   details.price = details.area * details.perimeter
  //   sum += details.price
  // }

  return sum;
}
type FenceDetails = {pos: Pos, dir: 'horizontal' | 'vertical', baseOn: number};
type GardenDetails = {perimeter: number, area: number, price: number}
type FenceGroup = {fences: FenceDetails[], gardenGroup: GardenDetails, walls: FenceDetails[][], price: 0};
type Fence = {top: boolean, right: boolean, bottom: boolean, left: boolean};
type Field = { gardenType: string, pos: Pos, fence: Fence, map: Map, core?: string, parent?: Field};
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
  readonly maxX: number;
  readonly maxY: number;


  constructor(text: string) {
    const lines = text.split('\n');

    this.grid = lines.map((row, y) => {
      return row.split('').map((gardenType, x) => {
        const f: Field = {gardenType: gardenType, pos: new Pos(y, x),
          fence: {top: true, right: true, bottom: true, left: true},
          map: this,
        };
        return f;
      });
    });

    this.maxX = this.grid[0].length - 1;
    this.maxY = this.grid.length - 1;

    // fence setting
    this.grid.forEach((row, y) => {
      row.forEach((field, x) => {
        const fieldsAround = this.getFieldsAround(field.pos)
        fieldsAround.forEach(fieldAround => {
          if (fieldAround.gardenType !== field.gardenType) {return}
          // if (fieldAround.link === undefined && fieldAround !== field.link) {
          //   fieldAround.link = field;
          //   fieldAround === field.link
          // }
          // if (field.link === undefined) {
          //   field.core = field.pos.toString()
          // }
          if (fieldAround.pos.y < field.pos.y) {
            field.fence.top = false
          } else if (fieldAround.pos.y > field.pos.y) {
            field.fence.bottom = false
          } else if (fieldAround.pos.x < field.pos.x) {
            field.fence.left = false
          } else {
            field.fence.right = false
          }
        })
      })
    })

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

// class PlayersManager {
//   players: Player[] = []
//
//   constructor(...players: Player[]) {
//     this.players.push(...players)
//   }
//
//   moveWithCloning() {
//     const newPlayers: Player[] = [];
//
//     this.players.forEach((player) => {
//       const nextFields = player.getNextFields()
//       if (nextFields.length === 0) {return}
//
//       while (nextFields.length > 1) {
//         const field = nextFields.pop()!
//         const newPlayer = player.moveCloneUnsafe(field.pos)
//         newPlayers.push(newPlayer)
//       }
//
//       player.moveUnsafe(nextFields[0].pos)
//     })
//
//     this.players.push(...newPlayers)
//   }
//
//   arePossibleMoves() {
//     return !!this.players.find(player => player.getNextFields().length > 0)
//   }
//
//   getPlayersOnTop() {
//     return this.players.filter(player => {
//       const h = player.map.getField(player.pos)?.height
//       return h === 9
//     })
//   }
//
// }
//
// class Player {
//   readonly map: Map;
//   readonly startPos: Pos;
//   pos: Pos;
//   score: number;
//
//   constructor(
//     map: Map,
//     pos: Pos,
//     startPos: Pos = pos,
//     score = 0
//   ) {
//     this.map = map;
//     this.startPos = pos.clone();
//     this.pos = pos;
//     this.score = score;
//   }
//
//   clone() {
//     return new Player(this.map, this.startPos, this.pos.clone(), this.score);
//   }
//
//   getNextFields() {
//     const hillToDo = 1
//     const curField = this.map.getField(this.pos)
//     if (!curField) {throw Error("impossible player position")}
//     const fieldsAround = this.map.getFieldsAround(curField.pos)
//     return fieldsAround.filter(f => f.height === curField.height + hillToDo)
//   }
//
//   moveUnsafe(newPos: Pos) {
//     this.pos = newPos;
//     this.score++
//   }
//
//   moveCloneUnsafe(newPos: Pos) {
//     const newPlayer = this.clone()
//     newPlayer.moveUnsafe(newPos)
//     return newPlayer
//   }
//
// }
