import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  const [instructions, updates] = splitSection(lines)

  const sortedAll = updates.map(order => {
    let wasSorted = true;
    const sorted = order.sort((n1,n2) => {
      const found_instruction = instructions.find(instruction => {
        return instruction[0] === n2 && instruction[1] === n1
      })
      if (!found_instruction) {
        wasSorted = false;
      }
      return !!found_instruction ? -1 : 1
    });
    if (wasSorted) {
      return []
    }
    return sorted
  }).filter(l => l.length !== 0)

  const middleNumbers = sortedAll.map(arr => arr[Math.floor(arr.length / 2)]);
  const sum = middleNumbers.reduce((a, b) => a + b, 0);
  return sum
}

function splitSection(lines: string[]): [[number, number][],number[][]] {
  const index = lines.findIndex((l) => l === "")
  const section1 = lines.slice(0, index).map((l) => {
    const numbers = l.split("|").map(Number);
    return [numbers[0], numbers[1]] as [number, number];
  })
  const section2 = lines.slice(index+1).map((l) => {
    const numbers = l.split(",").map(Number);
    return numbers
  })
  return [section1, section2]
}
