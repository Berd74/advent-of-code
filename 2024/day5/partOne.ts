import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  const [instructions, updates] = splitSection(lines)

  const correctUpdates = updates.filter(order => {
    const test = order.every((_, index) => {
      const n1 = order[index];
      const n2 = order[index+1];
      if (n2 === undefined) {return true}
      const found_instruction = instructions.find(instruction => {
        return instruction[0] === n1 && instruction[1] === n2
      })
      return !!found_instruction;
    });
    return test
  })

  const middleNumbers = correctUpdates.map(arr => arr[Math.floor(arr.length / 2)]);
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
