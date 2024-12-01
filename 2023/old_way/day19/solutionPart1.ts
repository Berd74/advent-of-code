import {inputFull} from './input';

console.time('Execution Time');

type Part = {x: number, m: number, a: number, s: number}

type Operator = "<" | ">"
type PartTargetSpec = 'x' | 'm' | 'a' | 's'
type Destination = boolean | string
type Condition = {partTargetSpec: PartTargetSpec, operator: Operator, number: number, destination: Destination}
type Rule = Destination | Condition
type Workflows = {[name: string]: Rule[]}

const lines = inputFull.split('\n')

let workflows: Workflows = {}
let parts: Part[] = []

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

lines.findLastIndex(l => {
  if (l.length !== 0) {
    const categoriesStrings = l.replace("{", "").replace("}", "").split(',')
    const categories: any = categoriesStrings.reduce((obj, categoriesString) => {
      const v = categoriesString.split('=')
      return {...obj, [v[0]]: Number(v[1])}
    }, {})
    parts.unshift(categories)
  }
  return l.length === 0
})




// console.log('workflows');
// console.log(workflows);
// console.log('part');
// console.log(parts);

function useWorkflow(part: Part, name: string, index: number) {

  const rule = workflows[name][index]

  if (isRuleCondition(rule)) {

    const partTargetSpecValue = part[rule.partTargetSpec]
    const number = rule.number

    if (rule.operator === '<') {
      if (partTargetSpecValue < number) {
        //go to
        const newRule = rule.destination
        if (isRuleAnotherWorkflow(newRule)) {
          return useWorkflow(part,newRule, 0)
        } else if (newRule === true) {
          return true
        } else {
          return false
        }
        //END
      } else {
        //go to next rule
        return useWorkflow(part,name, index + 1)
        //END
      }
    } else {
      if (partTargetSpecValue > number) {
        //go to
        const newRule = rule.destination
        if (isRuleAnotherWorkflow(newRule)) {
          return useWorkflow(part, newRule, 0)
        } else if (newRule === true) {
          return true
        } else {
          return false
        }
        //END
      } else {
        //go to next rule
        return useWorkflow(part,name, index + 1)
        //END
      }
    }

  } else if (isRuleAnotherWorkflow(rule)) {
    return useWorkflow(part, rule, 0)
  } else if (rule === true) {
    return true
  } else {
    return false
  }

}

function sumAllSpec(part: Part) {
  return part.a + part.m + part.s + part.x
}

function isRuleCondition(v: any): v is Condition {
  return typeof v === 'object';
}

function isRuleAnotherWorkflow(v: any): v is string {
  return typeof v === 'string';
}

export const solution19Part1 = parts.reduce((val ,part) => {
  const test = useWorkflow(part,'in', 0)
  return val + (test ? sumAllSpec(part) : 0)
}, 0)

console.log(solution19Part1);
console.timeEnd('Execution Time');


