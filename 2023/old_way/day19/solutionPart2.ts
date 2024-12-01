import {inputDemo, inputFull} from './input';

console.time('Execution Time');

const lines = inputFull.split('\n')

type Operator = "<" | ">"
type PartTargetSpec = 'x' | 'm' | 'a' | 's'
type Destination = boolean | string
type Condition = {partTargetSpec: PartTargetSpec, operator: Operator, number: number, destination: Destination}
type Rule = Destination | Condition
type Workflows = {[name: string]: Rule[]}

const workflows: Workflows = {}

const regexIsCondition = /[<>]/g;

lines.findIndex((l, i) => {
  if (l.length !== 0) {
    const v = l.split('{')
    const name = v[0]
    const rules = v[1].replace("}", "").split(",").map(ruleString => {
      const index = ruleString.search(regexIsCondition)
      if (index !== -1) {
        const operator = ruleString[index]
        const [partCategory, rest] = ruleString.split(operator)
        const [number, destinationString] = rest.split(":")
        const destination = destinationString === 'A' ? true :
          destinationString === 'R' ? false : destinationString
        return {partTargetSpec: partCategory as PartTargetSpec, operator: operator as Operator, number: Number(number), destination}
      } else {
        return ruleString === 'A' ? true :
          ruleString === 'R' ? false : ruleString
      }
    })
    workflows[name] = rules
  }
  return i !== 0 && l.length === 0
})

//*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*//

function isRuleCondition(v: any): v is Condition {
  return typeof v === 'object';
}

function isRuleAnotherWorkflow(v: any): v is string {
  return typeof v === 'string';
}

//*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*//
const ranges1 = {
  xmin: 1, xmax: 4000,
  mmin: 1, mmax: 4000,
  amin: 1, amax: 4000,
  smin: 1, smax: 4000,
};
const start = {destination: 'in', ranges: ranges1}

//*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*#*//

let result: number = 0

runWorkflow(start)

function runWorkflow (info: {destination: Destination, ranges: typeof ranges1}) {
  const ranges = info.ranges
  const destination = info.destination
  if (!isRuleAnotherWorkflow(destination)) {
    // R or A = break;
    if (destination) {
      const v = (1 + ranges.xmax - ranges.xmin) * (1 + ranges.mmax - ranges.mmin) * (1 + ranges.amax - ranges.amin) *
        (1 + ranges.smax - ranges.smin)
      result += v;
    }
    return;
  }

  const rules = workflows[destination]
  while (rules.length) {
    const nextRule = rules.shift()

    if (isRuleAnotherWorkflow(nextRule)) {
      // go to another
      runWorkflow({destination: nextRule, ranges: ranges})
      break;
    } else if (isRuleCondition(nextRule)) {
      //modify newRanges in this loop
      const newRanges = {...ranges}

      if (nextRule.operator === "<") {
        // new ranges passed to next runWorkflow
        const curMax = newRanges[`${nextRule.partTargetSpec}max`];
        const potentialNewVal = nextRule.number - 1;
        newRanges[`${nextRule.partTargetSpec}max`] = potentialNewVal < curMax ? potentialNewVal : curMax
        // current ranges
        const _curMin = newRanges[`${nextRule.partTargetSpec}min`];
        const _potentialNewVal = newRanges[`${nextRule.partTargetSpec}max`] + 1;
        ranges[`${nextRule.partTargetSpec}min`] = _potentialNewVal > _curMin ? _potentialNewVal : _curMin
      } else {

        // new ranges passed to next runWorkflow
        const curMin = newRanges[`${nextRule.partTargetSpec}min`];
        const potentialNewVal = nextRule.number + 1;
        newRanges[`${nextRule.partTargetSpec}min`] = potentialNewVal > curMin ? potentialNewVal : curMin

        // current ranges
        const _curMax = newRanges[`${nextRule.partTargetSpec}max`];
        const _potentialNewVal = newRanges[`${nextRule.partTargetSpec}min`] - 1;
        ranges[`${nextRule.partTargetSpec}max`] = _potentialNewVal < _curMax ? _potentialNewVal : _curMax

      }
      // run another flow
      runWorkflow({destination: nextRule.destination, ranges: newRanges})
    } else {
      // R or A = break;
      if (nextRule) {

        const v = (1 + ranges.xmax - ranges.xmin) * (1 + ranges.mmax - ranges.mmin) * (1 + ranges.amax - ranges.amin) *
          (1 + ranges.smax - ranges.smin)
        result += v;
      }
      break;
    }

  }

}

export const solution19Part2 = result;
console.log(solution19Part2);
console.timeEnd('Execution Time');

