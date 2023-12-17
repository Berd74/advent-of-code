import {calibrationDocumentFull} from './inputs';

const regex = /(one|two|three|four|five|six|seven|eight|nine)|[0-9]/g;
const mapper = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
}
const regexR = /(eno|owt|eerht|ruof|evif|xis|neves|thgie|enin)|[0-9]/g;
const mapperR = {
  eno: '1',
  owt: '2',
  eerht: '3',
  ruof: '4',
  evif: '5',
  xis: '6',
  neves: '7',
  thgie: '8',
  enin: '9',
}

function isNumber(value: any) {
  return !isNaN(value);
}

function calculateCalibrationSum(text: string) {
  const lines = text.split('\n')

  return lines.reduce((previousValue: number , line: string, i: number) => {
    const lineR = line.split('').reverse().join('')

    const matched = line.match(regex);
    const matchedR = lineR.match(regexR);

    const numbers = matched?.map(n => {
      if (isNumber(n)) {
        return n
      } else {
        return (mapper as any)[n]
      }
    });
    const numbersR = matchedR?.reverse().map(n => {
      if (isNumber(n)) {
        return n
      } else {
        return (mapperR as any)[n]
      }
    });

    const first = numbers?.[0]
    const last = numbersR?.pop()
    const finalNumber = (first && last) ? parseInt(first + last) : 0
    return previousValue + finalNumber
  }, 0)
}

export const solution1Part2 = calculateCalibrationSum(calibrationDocumentFull);
console.log(solution1Part2); //54875
