import {engineFull} from './inputs';

function isNotNumber(value: any) {
  return isNaN(value);
}
function isNotAsterisk(value: any) {
  return value !== "*"
}
function isNumber(value: any) {
  return !isNaN(value);
}
function isAsterisk(value: any) {
  return value === "*"
}

type EnginePart = {el: string, elId: string, hasSymbolNear: boolean, cords: [number, number][]} | undefined;

function isSymbolInGrid(grid: string[][], col: number, row: number) {
  const val = grid[row][col]
  // console.log(' checking col: ' + col + ' | row: ' + row);
  // console.log(' found: ' + val);
  return val !== undefined && isNotNumber(val) && val !== '.'
}

function isNumberInGrid(grid: (EnginePart)[][], col: number, row: number) {
  // console.log(grid[row][col]);
  return grid[row][col] as undefined | EnginePart
}

function numbersFinder(grid: string[][]) {

  const numbersInfoGrid: ({el: string, elId: string, hasSymbolNear: boolean, cords: [number, number][]} | undefined )[][] = []
  const rowsAmount = grid.length;

  grid.forEach((row, _rowIndex) => {
    const rowIndex = _rowIndex;
    const columnsAmount = row.length;
    const numbersInfoRow: ({el: string, elId: string, hasSymbolNear: boolean, cords: [number, number][]} | undefined)[] = [];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const el = row[colIndex]
      if (isNotNumber(el)) {
        numbersInfoRow.push(undefined)
        continue;
      }

      const nextEl = row[colIndex + 1]
      if (isNumber(nextEl)) {
        continue;
      }

      let hasSymbolNear = false;
      let finalEl = "";
      const finalElCords: [number, number][] = []
      let cursor = 0
      let currentColIndex = colIndex - cursor
      let currentEl = row[currentColIndex]

      while (isNumber(currentEl)) {

        // add to final el the number
        finalEl = currentEl + finalEl
        // check if hasSymbolNear - check fields around
        // if (!hasSymbolNear) {
        const prevCol = currentColIndex - 1 < 0 ? undefined : currentColIndex - 1
        const midCol = currentColIndex
        const nextCol = currentColIndex + 1 > columnsAmount ? undefined : currentColIndex + 1
        const prevRow = rowIndex - 1 < 0 ? undefined : rowIndex - 1
        const midRow = rowIndex
        const nextRow = rowIndex + 1 >= rowsAmount ? undefined : rowIndex + 1
        // console.log(' ==== CHECKING VAL: ' + grid[rowIndex][currentColIndex] + ' ==== r:' + rowIndex + ' c:' + currentColIndex);
        finalElCords.unshift([rowIndex, currentColIndex])
        if (
          // prevRow
          ((prevCol !== undefined && prevRow !== undefined) && isSymbolInGrid(grid, prevCol, prevRow)) ||
          ((prevRow !== undefined) && isSymbolInGrid(grid, midCol, prevRow)) ||
          ((nextCol !== undefined && prevRow !== undefined) && isSymbolInGrid(grid, nextCol, prevRow )) ||
          // midRow
          ((nextCol !== undefined) && isSymbolInGrid(grid, nextCol, midRow)) ||
          ((prevCol !== undefined) && isSymbolInGrid(grid, prevCol, midRow)) ||
          // nextRow
          ((prevCol !== undefined && nextRow !== undefined) && isSymbolInGrid(grid, prevCol, nextRow)) ||
          ((nextRow !== undefined) && isSymbolInGrid(grid, midCol, nextRow)) ||
          ((nextCol !== undefined && nextRow !== undefined) && isSymbolInGrid(grid, nextCol, nextRow))
        ) {
          // console.log('FOUND');
          hasSymbolNear = true;
        }
        // }
        // setting next val to add
        cursor++
        const nextIndexToCheck = colIndex - cursor
        if (nextIndexToCheck < 0) break;
        currentEl = row[nextIndexToCheck]
        currentColIndex = colIndex - cursor
      }
      const cordsToString = finalElCords.map(cords => cords[0] + ',' + cords[1]).join("|")
      const elId = "[" + finalEl + "]" + cordsToString
      const partInfo = {el: finalEl, hasSymbolNear, cords: finalElCords, elId}
      partInfo.cords.forEach(() => {
        numbersInfoRow.push(partInfo)
      })
    }

    numbersInfoGrid.push(numbersInfoRow)
  })

  return numbersInfoGrid

}

function asterisksFinder(grid: string[][], numbersInfoGrid: (EnginePart | undefined)[][]) {

  const asterisksInfoGrid: Map<string, EnginePart>[][] = []
  const rowsAmount = grid.length;

  grid.forEach((row, _rowIndex) => {
    const rowIndex = _rowIndex;
    const columnsAmount = row.length;
    const asterisksInfoRow: Map<string, EnginePart>[] = [];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const el = row[colIndex]
      if (isNotAsterisk(el)) continue;

      const nextEl = row[colIndex + 1]
      if (isAsterisk(nextEl)) continue;

      let numbersIdsNear = new Map<string, EnginePart>();
      let finalEl = el;

      const prevCol = colIndex - 1 < 0 ? undefined : colIndex - 1
      const midCol = colIndex
      const nextCol = colIndex + 1 > columnsAmount ? undefined : colIndex + 1
      const prevRow = rowIndex - 1 < 0 ? undefined : rowIndex - 1
      const midRow = rowIndex
      const nextRow = rowIndex + 1 >= rowsAmount ? undefined : rowIndex + 1
      // console.log(' ==== CHECKING around VAL: ' + grid[rowIndex][colIndex] + ' ==== r:' + rowIndex + ' c:' + colIndex);

      // prevRow
      const tl = (prevCol !== undefined && prevRow !== undefined) ? isNumberInGrid(numbersInfoGrid, prevCol, prevRow) : undefined
      if (tl) {
        numbersIdsNear.set(tl.elId, tl)
      }
      const tm = (prevRow !== undefined) ? isNumberInGrid(numbersInfoGrid, midCol, prevRow) : undefined
      if (tm) {
        numbersIdsNear.set(tm.elId, tm)
      }
      const tr = (nextCol !== undefined && prevRow !== undefined) ? isNumberInGrid(numbersInfoGrid, nextCol, prevRow ) : undefined
      if (tr) {
        numbersIdsNear.set(tr.elId, tr)
      }
      // midRow
      const mr = (nextCol !== undefined) ? isNumberInGrid(numbersInfoGrid, nextCol, midRow) : undefined
      if (mr) {
        numbersIdsNear.set(mr.elId, mr)
      }
      const ml = (prevCol !== undefined) ? isNumberInGrid(numbersInfoGrid, prevCol, midRow) : undefined
      if (ml) {
        numbersIdsNear.set(ml.elId, ml)
      }
      // nextRow
      const br = (prevCol !== undefined && nextRow !== undefined) ? isNumberInGrid(numbersInfoGrid, prevCol, nextRow) : undefined
      if (br) {
        numbersIdsNear.set(br.elId, br)
      }
      const bm = (nextRow !== undefined) ? isNumberInGrid(numbersInfoGrid, midCol, nextRow) : undefined
      if (bm) {
        numbersIdsNear.set(bm.elId, bm)
      }
      const bl = (nextCol !== undefined && nextRow !== undefined) ? isNumberInGrid(numbersInfoGrid, nextCol, nextRow) : undefined
      if (bl) {
        numbersIdsNear.set(bl.elId, bl)
      }

      asterisksInfoRow.push(numbersIdsNear)
    }

    asterisksInfoGrid.push(asterisksInfoRow)
  })

  return asterisksInfoGrid

}

function calcSolutionPart1(engine: string) {

  const lines = engine.split('\n').filter((l) => l.length !== 0)
  const grid: string[][] = lines.map(l => l.split(''))

  const partInfosAll = numbersFinder(grid)

  const mapWithElToSum = new Map<string, number>()

  partInfosAll.flat().forEach((el) => {
    if (el?.hasSymbolNear) {
      mapWithElToSum.set(el.elId, Number(el.el))
    }
  })
  let sum = 0;
  mapWithElToSum.forEach(v => {
    sum += v
  })
  return sum
}

function calcSolutionPart2(engine: string) {

  const lines = engine.split('\n').filter((l) => l.length !== 0)
  const grid: string[][] = lines.map(l => l.split(''))

  const partInfosAll = numbersFinder(grid)
  const asterisksInfoAll = asterisksFinder(grid, partInfosAll)

  const asterisksInfoFiltered = asterisksInfoAll.flat().filter(map => {
    const  isAsteriskNearTwoNumbers = map.size === 2;
    return isAsteriskNearTwoNumbers
  })

  const numbersToMultiplyAndSum: [number, number][] = []

  asterisksInfoFiltered.forEach((el) => {
    const engineParts = Array.from(el.values()) as [EnginePart, EnginePart]
    const numbers = engineParts.map(part => Number(part!.el)) as [number, number]
    numbersToMultiplyAndSum.push(numbers)
  })

  const sum = numbersToMultiplyAndSum.reduce((cur, el) => {
    return cur + el[0] * el[1];
  }, 0)

  return sum
}

export const solution3Part1 = calcSolutionPart1(engineFull);

console.log(solution3Part1); //532331

export const solution3Part2 = calcSolutionPart2(engineFull);

console.log(solution3Part2); //82301120
