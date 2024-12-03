import {readFile} from '../utils/readFile';

const DO_TEXT = 'do()';
const DONT_TEXT = 'don\'t()';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const regex = /mul\(\d+,\d+\)|do\(\)|don't\(\)/g;
  const matches = text.match(regex);

  const sliced: string[] = [];
  let enabled = true;
  matches.forEach(m => {
    switch (m) {
      case DO_TEXT: {
        enabled = true;
        break;
      }
      case DONT_TEXT: {
        enabled = false;
        break;
      }
      default: {
        enabled && sliced.push(m.slice(4, -1));
        break;
      }
    }
  });

  const numbers = sliced.map(m => m.split(',').map(Number) as [number, number]);
  return numbers.reduce((acc, pair) => acc + pair[0] * pair[1], 0);
}