import {recordsFull} from './inputs';

type Color = 'red' | 'green' | 'blue'

function convertRecords(rec: string) {
  const regexNum = /[0-9]/g;
  const regexLetters = /[a-zA-Z]/g;
  const games = rec.split('\n');

  const max: { [key in Color]: number } = {
    red: 12,
    green: 13,
    blue: 14
  };

  const finalGames = games.map(game => {
    const split = game.split(':');
    const gameIndex = Number(split[0].match(regexNum)!.join(''));
    const values = split[1];
    const sets = values.split(';');


    const setsFinal = sets.map(game => {
      const plays = game.split(',');

      const usedColors: { [key in Color]: number } = {
        red: 0,
        green: 0,
        blue: 0
      };

      plays.forEach(values => {
        const amount = Number(values.match(regexNum)?.join(''));
        const color = values.match(regexLetters)?.join('') as Color;
        usedColors[color] = usedColors[color] + amount;
      });

      let tooMany = false;
      for (const color in usedColors) {
        if (!tooMany) {
          tooMany = max[color as Color] < usedColors[color as Color];
        }
      }

      return {index: gameIndex, tooMany: tooMany, usedColors};
    });
    return setsFinal;
  });

  return finalGames;
}

// part 1 - addedIndexes

const convertedRecords = convertRecords(recordsFull)

export const solution2Part1 = convertedRecords.reduce((amount, set) => {
  if (!!set.find(game => game.tooMany)) {
    return amount
  }
  return amount + set[0].index
}, 0)

console.log(solution2Part1); //2810

//part 2 - sumOfPowersOfSets

export const solution2Part2 = convertedRecords.reduce((amount, set) => {
  let maxRed = 0;
  let maxGreen = 0;
  let maxBlue = 0;
  set.forEach(game => {
    if (game.usedColors.red > maxRed) maxRed = game.usedColors.red;
    if (game.usedColors.green > maxGreen) maxGreen = game.usedColors.green;
    if (game.usedColors.blue > maxBlue) maxBlue = game.usedColors.blue;
  })
  return amount + maxRed * maxGreen * maxBlue
}, 0)

console.log(solution2Part2); //69110
