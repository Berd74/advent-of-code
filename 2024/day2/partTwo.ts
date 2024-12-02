import {readFile} from '../utils/readFile';

function isReportSafe(report: number[]): boolean {
  const diff = [];

  report.forEach((r, i, arr) => {
    if (i === 0) {return}
    diff.push(r - arr[i-1]);
  })

  return diff.every((d) => d > 0 && d <= 3) || diff.every((d) => d < 0 && d >= -3);
}

function isReportWithRemovingOne(report: number[]): boolean {
  if (isReportSafe(report)) return true;

  for (let i = 0; i < report.length; i++) {
    const edited = report.slice(0, i).concat(report.slice(i + 1));
    if (isReportSafe(edited)) {
      return true;
    }
  }

  return false;
}

export async function partTwo(input: string) {
  const text = await readFile(input);
  const line = text.split('\n');
  const reports = line
    .map((l) => l.split(" ").map(Number));

  return reports.filter(r => isReportWithRemovingOne(r)).length;
}