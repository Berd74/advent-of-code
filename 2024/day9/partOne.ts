import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  const line = text.split('\n')[0].split('');

  const unzip: (File | Space)[] = []
  let unzip2: (string[])[] = []
  line.forEach((_el, i) => {
    const el = Number(_el)
    if (i % 2 === 0) {
      const file: File = {
        id: i/2,
        size: el,
      }
      unzip.push(file)
      unzip2.push(generateFile(i/2, el))
    } else {
      const space: Space = {
        space: el
      }
      unzip.push(space)
      unzip2.push(generateSpace(el))
    }
  })

  unzip2.filter(a => a.length !== 0)

  let unzip3 = unzip.reduce((cur, next) => {
    if ('id' in next) {
      for (let i = 0; i < next.size; i++) {
        cur.push({id: next.id})
      }
    } else {
      for (let i = 0; i < next.space; i++) {
        cur.push({id: -1})
      }
    }
    return cur
  }, [] as {id: number}[])


  while (true) {
    const spaceIndex = getIndexOfFirstSpaceBeforeFile(unzip3)
    if (spaceIndex === -1) {
      break;
    }
    const filePartIndex = unzip3.findLastIndex(el => el.id >= 0)
    unzip3 = swapElements(unzip3, filePartIndex, spaceIndex)
  }

  const r = unzip3
    .filter(el => el.id >= 0)
    .map((el, i) => el.id * i)
    .reduce((a, b) => a + b)

  return r
}


type File = {id: number, size: number};
type Space = {space: number}

function generateSpace(size: number): string[] {
  if (size <= 0) {
    return [];
  }
  return "".padEnd(size, ".").split("");
}

function generateFile(id: number, size: number): string[] {
  if (size <= 0) {
    return [];
  }
  return "".padEnd(size, id.toString()).split("");
}

function getIndexOfFirstSpaceBeforeFile(input: { id: number }[]): number {
  let foundFirstDotPos = -1;

  for (let i = 0; i < input.length; i++) {
    if (foundFirstDotPos !== -1 && input[i].id >= 0) {
      return foundFirstDotPos
    }
    if (input[i].id === -1 && foundFirstDotPos === -1) {
      foundFirstDotPos = i
    }
  }

  return -1;
}

function swapElements<T>(arr: T[], index1: number, index2: number): T[] {
  if (
    index1 < 0 || index2 < 0 ||
    index1 >= arr.length || index2 >= arr.length
  ) {
    throw new Error("Invalid indices for array swap.");
  }

  const newArr = [...arr];

  [newArr[index1], newArr[index2]] = [newArr[index2], newArr[index1]];

  return newArr;
}