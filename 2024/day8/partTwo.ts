import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  const grid: Grid = lines.map(l => l.split(""))

  const apm = new AntennasPairManager(grid)
  apm.searchAndAdd()

  // grid.forEach((row, y) => {
  //   const r = row.map((field, x) => {
  //     const is = apm.isAntinodeCreated({x, y})
  //     if (is) {
  //       return "#"
  //     }
  //     return field
  //   })
  //   console.log(r.join(""));
  // })

  return apm.antinodes.length
}

type Antenna = {x: number; y: number, freq: string};
type Antinode = {x: number; y: number}
type Grid = string[][]

class AntennasPair {
  a: Antenna
  b: Antenna
  constructor(a:Antenna, b: Antenna) {
    this.a = a
    this.b = b
  }

}

class AntennasPairManager {
  pairs: AntennasPair[] = []
  antinodes: Antinode[] = []
  grid: Grid

  constructor(grid: Grid) {
    this.grid = grid
  }


  isAntinodeCreated(anti: Antinode) {
    return !!this.antinodes.find(curAnti => {
      return curAnti.x === anti.x && curAnti.y === anti.y
    })
  }

  searchAndAddAntinodes(a1: Antenna, a2: Antenna) {
    const biggerY = Math.max(a1.y, a2.y)
    const lowerY = Math.min(a1.y, a2.y)
    const biggerX = Math.max(a1.x, a2.x)
    const lowerX = Math.min(a1.x, a2.x)
    const direction = a1.x > a2.x

    for (let i = 1; i < 100; i++) {
      const x1 = biggerX + ((biggerX - lowerX) * i)
      const x2 = lowerX - ((biggerX - lowerX) * i)
      const anti1: Antinode = {
        y: lowerY - ((biggerY - lowerY) * i) ,
        x: direction ? x1 : x2
      }
      const anti2: Antinode = {
        y: biggerY + ((biggerY - lowerY) * i) ,
        x: direction ?  x2 : x1
      }
      if (
        anti1.x >= 0 && anti1.x < this.grid[0].length &&
        anti1.y >= 0 && anti1.y < this.grid.length &&
        !this.isAntinodeCreated(anti1)
      ) {
        this.antinodes.push(anti1)
      }
      if (
        anti2.x >= 0 && anti2.x < this.grid[0].length &&
        anti2.y >= 0 && anti2.y < this.grid.length &&
        !this.isAntinodeCreated(anti2)
      ) {
        this.antinodes.push(anti2)
      }
    }

  }

  searchAndAddAntennasPair(foundAntenna: Antenna){
    const lookYs = generateList(0,50)
    const lookXs = generateList(-50,50)

    lookYs.forEach(lookY => {
      lookXs.forEach(lookX => {
        // if (lookY === 0 && lookX === 0) {return}
        const y = foundAntenna.y + lookY
        const x = foundAntenna.x + lookX
        const searchingField = this.grid[y]?.[x]
        if (searchingField === foundAntenna.freq) {
          const newAntenna: Antenna = {x,y, freq: searchingField}
          const p = new AntennasPair(foundAntenna, newAntenna)
          this.searchAndAddAntinodes(foundAntenna, newAntenna)
          this.pairs.push(p)
        }
      })
    })

  }

  searchAndAdd() {
    this.grid.forEach((row, y) => {
      row.forEach((field, x) => {
        if (field !== ".") {
          const foundAntenna: Antenna = {x ,y, freq: field}
          this.searchAndAddAntennasPair(foundAntenna)
        }
      })
    })

  }

}

const generateList = (start: number, end: number): number[] => {
  const list = [];
  for (let i = start; i <= end; i++) {
    list.push(i);
  }
  // Add the last number twice
  list.push(end);
  return list;
};