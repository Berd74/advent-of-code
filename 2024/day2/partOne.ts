import {readFile} from '../utils/readFile';

function isReportSafe(report: number[]): boolean {
  const diff = [];

  report.forEach((r, i, arr) => {
    if (i === 0) {return}
    diff.push(r - arr[i-1]);
  })

  return diff.every((d) => d > 0 && d <= 3) || diff.every((d) => d < 0 && d >= -3);
}

export async function partOne(input: string) {
  const text = await readFile(input);
  const line = text.split('\n');
  const reports = line
    .map((l) => l.split(" ").map(Number));

  return reports.filter(r => isReportSafe(r)).length;
}