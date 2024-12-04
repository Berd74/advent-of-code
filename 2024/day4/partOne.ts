import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  const forHorizontal = text.split('\n');

  const verticals: string[] = []
  const diagonal: string[] = []
  const diagonal2: string[] = []
  forHorizontal.forEach((_, i) => {
    let diagonal2UpWord = ''
    let diagonalUpWord = ''
    let diagonal2DownWord = ''
    let diagonalDownWord = ''
    let vertical = ''
    forHorizontal.forEach((line, j) => {
      vertical += line[i] ? line[i] : ''
      diagonal2UpWord += line[i+(line.length-1-j)] ? line[i+(line.length-1-j)] : ''
      if (i !== 0) {
        diagonal2DownWord += line[(line.length-1-j)-i] ? line[(line.length-1-j)-i] : ''
      }
      diagonalUpWord += line[i+j] ? line[i+j] : ''
      if (i !== 0) {
        diagonalDownWord += line[j-i] ? line[j-i] : ''
      }
    })
    verticals.push(vertical)
    diagonal2.push(diagonal2UpWord, diagonal2DownWord)
    diagonal.push(diagonalUpWord, diagonalDownWord)
  })

  const forHorizontalReverse = [...forHorizontal].map(a => a.split('').reverse().join(''));
  const forVerticalsReverse = [...verticals].map(a => a.split('').reverse().join(''));
  const forDiagonalReverse = [...diagonal].map(a => a.split('').reverse().join(''));
  const forDiagonal2Reverse = [...diagonal2].map(a => a.split('').reverse().join(''));


  const a = forHorizontal.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)
  const ar = forHorizontalReverse.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)
  const c = verticals.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)
  const cr = forVerticalsReverse.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)
  const d = diagonal.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)
  const d2 = diagonal2.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)
  const dr = forDiagonalReverse.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)
  const d2r = forDiagonal2Reverse.map(f => findXMAS(f))
    .reduce((acc, f) => acc+ f, 0)

  const sum = a + ar + c + cr + d + d2 + dr + d2r
  return sum
}

const findXMAS = (input: string): number => {
  const regex = /XMAS/g;
  const a = input.match(regex)
  return a ? a.length : 0;
};
