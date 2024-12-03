import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  const regex = /mul\(\d+,\d+\)/g;
  const matches = text.match(regex); // Finds the first match
  const sliced = matches.map(m => m.slice(4, -1));
  const numbers = sliced.map(m => m.split(',').map(Number) as [number, number]);
  return numbers.reduce((acc, pair) => acc + pair[0] * pair[1], 0);
}