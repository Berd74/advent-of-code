import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  const instructions = lines.map(line => {
    const [a,b] = line.split(':')
    const x =b.slice(1).split(" ")
    const obj: Instruction = {
      result: Number(a),
      nums: x.map(Number)
    }
    return obj
  })


  const x  = instructions.map(instruction => {

    const operators = ['+', '*', '||'];

    function generateOperatorCombinations(count: number): string[][] {
      if (count === 0) return [[]];
      const smallerCombs = generateOperatorCombinations(count - 1);
      const combs: string[][] = [];
      for (const sm of smallerCombs) {
        for (const operator of operators) {
          combs.push([...sm, operator]);
        }
      }
      return combs;
    }
    const operatorCombinations = generateOperatorCombinations(instruction.nums.length - 1);

    const expressions: {exp: string, nums: number[], expectedResult: number, result: number}[] = [];
    for (let i = 0; i < operatorCombinations.length; i++) {
      const ops = operatorCombinations[i]
      let expression= ""

      for (let j = 0; j < ops.length; j++) {
        if (j === 0) {
          expression += instruction.nums[0].toString();
        }

        // if (ops[j] === "||") {
        //   expression = `${expression}${instruction.nums[j + 1]}`
        // } else {
        //   expression = eval(`${expression}${ops[j]}${instruction.nums[j + 1]}`);
        // }
        if (ops[j] === "||") {
          if (expression[expression.length-1] === ")") {
            expression = expression.slice(0, -1)
            // const {beforeLastNumber, lastNumber} = splitExpression(expression)
            expression = `Number(Number(${expression}).toString() + Number(${instruction.nums[j + 1]}).toString()))`;
          } else {
            expression = `Number(Number(${expression}).toString() + Number(${instruction.nums[j + 1]}).toString())`;
          }
        } else {
          expression = `(${expression}`;
          expression += ` ${ops[j]} ${instruction.nums[j + 1]})`;
        }
      }
      // console.log(expression);
      const r = eval(expression)

      expressions.push({exp: expression, nums: instruction.nums, expectedResult: instruction.result, result: r});
      if (r === instruction.result) {
        break
      }
    }

    const results = expressions.filter(e => {
      return e.expectedResult === e.result
    }).reduce((acc, cur) => {
      // console.log(cur);
      return acc + cur.result
    }, 0)

    return results

  }).reduce((acc, cur) => {
    return acc + cur
  }, 0)


  return x
}

function splitExpression(expression: string) {
  // Find the last space to separate the expression
  const lastSpaceIndex = expression.lastIndexOf(' ');

  if (lastSpaceIndex === -1) {
    throw new Error("Invalid expression format");
  }

  // Split into two parts
  const beforeLastNumber = expression.substring(0, lastSpaceIndex);
  const lastNumber = expression.substring(lastSpaceIndex + 1);

  return { beforeLastNumber, lastNumber };
}

type Instruction = {result: number, nums: number[]}