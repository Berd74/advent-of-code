import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);

  const [l, r] = text
    .split('\n')
    .reduce((acc: [number[], number[]], line) => {
      line.split('   ').forEach((s, i) => acc[i].push(Number(s)));
      return acc;
    }, [[], []])
    .map(arr => arr.sort());

  const counted = new Map<number, number>();
  r.forEach((n) => {
    const curNumber = counted.get(n);
    curNumber ? counted.set(n, curNumber + 1) : counted.set(n, 1);
  });

  return l.reduce((acc, leftN, i) => {
    return acc + (counted.has(leftN) ? counted.get(leftN) * leftN : 0);
  }, 0);
}
