import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
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

  console.log(cardsResults);

  const sum = cardsResults.reduce((acc, cur) => acc + cur, 0)

  return sum;
}