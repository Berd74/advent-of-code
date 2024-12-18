import {readFile} from '../utils/readFile';

type Bit3 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
type Operation = {opcode: Bit3, operand: Bit3}


export async function partOne(path: string) {
  const obj = {
    regA: 0,
    regB: 0,
    regC: 0,
    pointer: 0,
  }

  const text = await readFile(path);
  const lines = text.split('\n');

  obj.regA = Number(lines.shift()!.slice(12));
  obj.regB = Number(lines.shift()!.slice(12));
  obj.regC = Number(lines.shift()!.slice(12));

  const programDesc = lines.pop()!.slice(9).split(',').map(n => Number(n) as Bit3)

  const doOperation = (op: Operation) => {
    let output: Bit3 | undefined = undefined
    switch (op.opcode) {
      case 0: {
        //adv
        obj.regA = Math.floor(obj.regA / 2 ** getCombo(op.operand))
        break;
      }
      case 1: {
        //bxl
        obj.regB = obj.regB ^ op.operand;
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
        obj.regB = obj.regB ^ obj.regC;
        break;
      }
      case 5: {
        //out
        output = (getCombo(op.operand) % 8) as Bit3
        break;
      }
      case 6: {
        //bdv => adv
        obj.regB = Math.floor(obj.regA / 2 ** getCombo(op.operand))
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

  const getCombo = (operand: Bit3) => {
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

  const output: string[] = []
  while (true) {
    if (obj.pointer === programDesc.length) {break;}
    const x = doOperation({opcode:programDesc[obj.pointer], operand:programDesc[obj.pointer+1]})
    if (x !== undefined) {
      output.push(x.toString())
    }
  }

  console.log('output: ' + output.toString());

  return output.toString()
}

