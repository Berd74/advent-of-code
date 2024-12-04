import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lettersBoard = text.split('\n');

  let count = 0

  for (let i = 0; i < lettersBoard.length; i++) {
    const letterLine = lettersBoard[i]
    for (let j = 0; j < letterLine.length; j++) {
      const letter = letterLine[j]
      if (letter === 'A') {
        const tl = lettersBoard[i-1]?.[j-1]
        const tr = lettersBoard[i-1]?.[j+1]
        const bl = lettersBoard[i+1]?.[j-1]
        const br = lettersBoard[i+1]?.[j+1]

        if (tl === 'M' && br === 'S') {
          if (tr === 'M' && bl === 'S') {
            count++
          } else if (tr === 'S' && bl === 'M') {
            count++
          }
        }
        else if (tl === 'S' && br === 'M') {
          if (tr === 'M' && bl === 'S') {
            count++
          } else if (tr === 'S' && bl === 'M') {
            count++
          }
        }

      }
    }
  }

  return count
}