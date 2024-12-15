import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
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

  let unzip3 = unzip.reduce((cur: ({id: number} | File)[], next) => {
    if ('id' in next) {
      cur.push(next)
    } else {
      for (let i = 0; i < next.space; i++) {
        cur.push({id: -1})
      }
    }
    return cur
  }, [])

  const lastFile = unzip3.findLast(el => 'size' in el && el.id >= 0) as File
  const lastFileId = lastFile.id

  // const rx = unzip3
  //   .reduce((cur, next) => {
  //     if ('size' in next) {
  //       for (let i = 0; i < next.size; i++) {
  //         cur.push({id: next.id})
  //       }
  //     } else {
  //       cur.push(next)
  //     }
  //     return cur
  //   }, [] as {id: number}[])
  // console.log(rx.map(el => el.id === -1 ? '[.]' : "[" +el.id.toString()+']').join(''));

  for (let id = lastFileId; id >= 0; id--) {
    const file = unzip3.findLast(el => el.id === id) as File
    const fileIndex = unzip3.findLastIndex(el => el.id === id)
    const lookhereforspace = unzip3.slice(0,fileIndex+1)
    //cut the unzip to not look at far spaces only from file starts
    const space = getIndexOfFirstSpaceBeforeFile(file.size-1, lookhereforspace)
    if (space === undefined) {continue}
    unzip3 = unzip3.filter(el => el.id !== file.id)
    const removed = unzip3.splice(space.startIndex, file.size , file);
    unzip3.splice(fileIndex-removed.length+1, 0 , {size: removed.length, id: -1});
    // console.log('moving index:' + file.id);
    // const r = unzip3
    //   .reduce((cur, next) => {
    //     if ('size' in next) {
    //       for (let i = 0; i < next.size; i++) {
    //         cur.push({id: next.id})
    //       }
    //     } else {
    //       cur.push(next)
    //     }
    //     return cur
    //   }, [] as {id: number}[])
    // console.log(r.map(el => el.id === -1 ? '[.]' : "[" +el.id.toString()+']').join(''));

  }


  const r = unzip3
    .reduce((cur, next) => {
      if ('size' in next) {
        for (let i = 0; i < next.size; i++) {
          cur.push({id: next.id})
        }
      } else {
        cur.push(next)
      }
      return cur
    }, [] as {id: number}[])
  const r2 = r
    .map((el, i) => el.id * i)
    .reduce((a, b) => b < 0 ? a : a+b)

  return r2
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

function getIndexOfFirstSpaceBeforeFile(neededSize: number, input: ({ id: number } | File)[]): { endIndex: number, startIndex: number, size: number } | undefined {
  let startIndex = -1;
  let size = -1;

  for (let i = 0; i < input.length; i++) {
    if (startIndex !== -1 && input[i].id >= 0) {
      if (size < neededSize) {
        startIndex = -1;
        size = -1;
      } else {
        return {startIndex: startIndex, endIndex: i-1, size: size}
      }
    }
    if (input[i].id === -1 && startIndex === -1) {
      startIndex = i
    }
    if (input[i].id === -1 ) {
      size++
    }
  }

  return undefined
}