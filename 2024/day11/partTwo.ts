import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  let stones = text.split(' ').map(BigInt);

  let result = 0;
  for (let i = 0; i < stones.length; i++) {
    result += performStoneChange(stones[i], 0, 75);
  }

  return result;
}

const cache = new Map<string, number>();

function performStoneChange(stone: bigint, blink: number, finalBlink: number) {
  const key = stone.toString() + '_' + blink.toString();
  const cached = cache.get(key);
  if (cached) return cached;

  const stoneText = stone.toString();
  const stoneLength = stoneText.length;
  const isEven = stoneLength % 2 === 0;
  const newDepth = blink + 1;

  let result: number;

  switch (true) {
    case blink === finalBlink: {
      result = 1;
      break;
    }
    case stone === 0n: {
      result = performStoneChange(1n, newDepth, finalBlink);
      break;
    }
    case isEven: {
      const h1 = BigInt(stoneText.slice(0, stoneLength / 2));
      const h2 = BigInt(stoneText.slice(stoneLength / 2, stoneLength));
      result =
        performStoneChange(h1, newDepth, finalBlink) +
        performStoneChange(h2, newDepth, finalBlink);
      break;
    }
    default: {
      result = performStoneChange(stone * 2024n, newDepth, finalBlink);
      break;
    }
  }

  cache.set(key, result);
  return result;
}