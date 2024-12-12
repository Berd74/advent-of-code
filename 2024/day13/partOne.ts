import {readFile} from '../utils/readFile';

export async function partOne(path: string) {
  const text = await readFile(path);
  let lines = text.split('');

  return 0
}

