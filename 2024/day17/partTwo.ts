import {readFile} from '../utils/readFile';

type Bit3 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
type Operation = {opcode: Bit3, operand: Bit3}


export async function partTwo(path: string) {

  const isTest = path.includes('test');
  const text = await readFile(path);
  const lines = text.split('\n');

  let startA = 0
  let interiaton = 0
  let best = 0

  while (true) {
    interiaton++
    if (interiaton % 500000 === 0) {
      console.log(interiaton);
    }
    //check logs and look for `patternWillAppearHere` and add numbers until you get it....
    //started with 7275 => 267275 => 33267275 => 5133267275
    //last one gave result
    startA = parseInt(interiaton.toString(8) + '5133267275', 8)  // work with this for input result
    isTest && (startA = interiaton) // do this for testing <---
    const obj = {
      regA: startA,
      regB: 0,
      regC: 0,
      pointer: 0,
    }

    const programDesc = [...lines].pop()!.slice(9).split(',').map(n => Number(n) as Bit3)

    const output: Bit3[] = []
    while (true) {
      if (obj.pointer === programDesc.length ) {break;}
     doOperation({opcode:programDesc[obj.pointer], operand:programDesc[obj.pointer+1]})
      // console.log(obj);
      if (output[output.length - 1] !== programDesc[output.length - 1]) {
        if (output.length > best) {
          best = output.length
          console.log('=======================');
          const patternWillAppearHere = startA.toString(8)
          console.log(output);
          console.log(startA, patternWillAppearHere, best, programDesc.length); // <== look at this
        }
        break;
      }
    }

    if (output.toString() === programDesc.toString()) {
      // console.log(output.toString());
      // console.log(programDesc.toString());
      console.log('interation: ' + startA);
      console.log('output: '  + output);
      return startA
      break;
    }


    function doOperation (op: Operation) {
      switch (op.opcode) {
        case 0: {
          //adv
          obj.regA = Math.floor(obj.regA / 2 ** getCombo(op.operand))
          break;
        }
        case 1: {
          //bxl
          obj.regB = Number(BigInt(obj.regB) ^ BigInt(op.operand));
          break;
        }
        case 2: {
          //bst
          obj.regB = getCombo(op.operand) % 8
          break;
        }
        case 3: {
          //jnz
          if (obj.regA === 0) break;
          obj.pointer = op.operand
          return;
        }
        case 4: {
          //bxc
          const x = Number(BigInt(obj.regB) ^ BigInt( obj.regC));
          obj.regB = x
          break;
        }
        case 5: {
          //out
          const out = (getCombo(op.operand) % 8) as Bit3
          output.push(out)
          break;
        }
        case 6: {
          //bdv => adv
          const x = Math.floor(obj.regA / 2 ** getCombo(op.operand))
          obj.regB = x
          break;
        }
        case 7: {
          //cdv => adv
          obj.regC = Math.floor(obj.regA / 2 ** getCombo(op.operand))
          break;
        }
      }
      obj.pointer = obj.pointer + 2
      return output
    }

    function getCombo(operand: Bit3) {
      switch (operand) {
        case 0:
          return 0
        case 1:
          return 1
        case 2:
          return 2
        case 3:
          return 3
        case 4:
          return obj.regA
        case 5:
          return obj.regB
        case 6:
          return obj.regC
        case 7:
          throw new Error('7 is reserved and will not appear in valid programs')
      }

    }

  }

  return startA
}

