import {engineFull} from './inputs';

function isNotNumber(value: any) {
  return isNaN(value);
}
function isNumber(value: any) {
  return !isNaN(value);
}

function isSymbol(grid: string[][], col: number, row: number) {
  const val = grid[row][col]
  // console.log(' checking col: ' + col + ' | row: ' + row);
  // console.log(' found: ' + val);
  return val !== undefined && isNotNumber(val) && val !== '.'
}

function myFun(engine: string) {

  const lines = engine.split('\n').filter((l) => l.length !== 0)
  const rowsAmount = lines.length;
  const grid: string[][] = lines.map(l => l.split(''))

  const partInfosAll: {el: string, hasSymbolNear: boolean}[] = []
  grid.forEach((row, _rowIndex) => {
    const rowIndex = _rowIndex;
    const columnsAmount = row.length;
    const partInfosInLine: {el: string, hasSymbolNear: boolean}[] = [];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const el = row[colIndex]
      if (isNotNumber(el)) continue;

      const nextEl = row[colIndex + 1]
      // if (nextEl === undefined) return; // to remove
      if (isNumber(nextEl)) continue;

      let hasSymbolNear = false;
      let finalEl = "";
      let cursor = 0
      let currentColIndex = colIndex - cursor
      let currentEl = row[currentColIndex]

      while (isNumber(currentEl)) {

        // add to final el the number
        finalEl = currentEl + finalEl
        // check if hasSymbolNear - check fields around
        if (!hasSymbolNear) {
          const prevCol = currentColIndex - 1 < 0 ? undefined : currentColIndex - 1
          const midCol = currentColIndex
          const nextCol = currentColIndex + 1 > columnsAmount ? undefined : currentColIndex + 1
          const prevRow = rowIndex - 1 < 0 ? undefined : rowIndex - 1
          const midRow = rowIndex
          const nextRow = rowIndex + 1 >= rowsAmount ? undefined : rowIndex + 1
          // console.log(' ==== CHECKING VAL: ' + grid[rowIndex][currentColIndex] + ' ==== r:' + rowIndex + ' c:' + currentColIndex);
          if (
            // prevRow
            ((prevCol !== undefined && prevRow !== undefined) && isSymbol(grid, prevCol, prevRow)) ||
            ((prevRow !== undefined) && isSymbol(grid, midCol, prevRow)) ||
            ((nextCol !== undefined && prevRow !== undefined) && isSymbol(grid, nextCol, prevRow )) ||
            // midRow
            ((nextCol !== undefined) && isSymbol(grid, nextCol, midRow)) ||
            ((prevCol !== undefined) && isSymbol(grid, prevCol, midRow)) ||
            // nextRow
            ((prevCol !== undefined && nextRow !== undefined) && isSymbol(grid, prevCol, nextRow)) ||
            ((nextRow !== undefined) && isSymbol(grid, midCol, nextRow)) ||
            ((nextCol !== undefined && nextRow !== undefined) && isSymbol(grid, nextCol, nextRow))
          ) {
            // console.log('FOUND');
            hasSymbolNear = true;
          }
        }
        // setting next val to add
        cursor++
        const nextIndexToCheck = colIndex - cursor
        if (nextIndexToCheck < 0) break;
        currentEl = row[nextIndexToCheck]
        currentColIndex = colIndex - cursor
      }

      const partInfo = {el: finalEl, hasSymbolNear}
      partInfosInLine.push(partInfo)
    }

    partInfosInLine.length && partInfosAll.push(...partInfosInLine)

  })

  return partInfosAll.reduce((prev, cur) => {
    return (cur.hasSymbolNear) ? prev + Number(cur.el) : prev
  }, 0)
}

export const solution3Part1 = myFun(engineFull);

console.log(solution3Part1); //532331

