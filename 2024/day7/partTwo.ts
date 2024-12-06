import {readFile} from '../utils/readFile';

export async function partTwo(path: string) {
  const text = await readFile(path);
  const lines = text.split('\n');
  return 0

}
