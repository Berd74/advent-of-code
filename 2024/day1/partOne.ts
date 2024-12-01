import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);

  const [l, r] = text
    .split('\n')
    .reduce((acc: [number[], number[]], line) => {
      line.split('   ').forEach((s, i) => acc[i].push(Number(s)));
      return acc;
    }, [[], []])
    .map(arr => arr.sort());

  return l.reduce((cur, _, i) => {
    return cur + Math.abs(l[i] - r[i]);
  }, 0);
}