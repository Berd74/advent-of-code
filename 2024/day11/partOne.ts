import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  let stones = text.split(' ').map(BigInt);

  for (let i = 0; i < 25; i++) {
    stones = stones.map(s => performStoneChange(s)).flat()
  }

  return stones.length
}

function performStoneChange(stone: bigint) {
  const stoneText = stone.toString();
  const stoneLength = stoneText.length
  const isEven = stoneLength % 2 === 0;

  switch(true) {
    case stone === 0n: {
      return [1n]
    }
    case isEven: {
      const h1 = stoneText.slice(0, stoneLength/2)
      const h2 = stoneText.slice(stoneLength/2, stoneLength)
      return [BigInt(h1), BigInt(h2)]
    }
    default: {
      return [stone * 2024n]
    }
  }

}