import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const line = text.split('\n');
  const line2 = line.map((line) => line.slice(8));
  const cards = line2.map((line) => {
    const [winningA, myA] = line.split(' | ');
    const winning = winningA.split(' ').map(Number).filter(n => !!n);
    const my = myA.split(' ').map(Number).filter(n => !!n);
    return {winning, my};
  });

  const cardsResults = cards.map((card) => {
    const a = card.my.filter(myCard => card.winning.includes(myCard)).length
    return a
  })

  const cardsDef = cards
    .reduce((cur: { [key: string]: typeof cards[0] & {amountOfWinning: number}}, nextCard, i) => {
      cur[i+1] = {...nextCard, amountOfWinning: cardsResults[i]}
      return cur
    }, {});


  const myCards: { [key: string]: number} = {};
  for (const k in cardsDef) {
    myCards[k] = 1
  }

  for (const k in myCards) {
    const amount = myCards[k]
    for (let i = 0; i < amount; i++) {
      const winning = cardsDef[k].amountOfWinning
      for (let j = 0; j < winning; j++) {
        const key = (Number(k) + j+1).toString()
        if (key in myCards) {
          myCards[key] = myCards[key] + 1
        }
      }

    }
  }


  let sum = 0

  for (const k in myCards) {
    sum = sum + myCards[k]
  }

  return sum;
}