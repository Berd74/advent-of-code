import {readFile} from '../utils/readFile';

function isReportSafe(report: number[]): boolean {
  if (report[0] === report[1]) return false;
  const direction = report[0] < report[1] ? 'up'  : 'down';
  for (let i = 0; i < report.length; i++) {
    if (i+1 == report.length) break;
    const diff = report[i+1] - report[i]
    if (diff <= 3 && diff > 0 && direction == 'up' || diff >= -3 && diff < 0 && direction == 'down') {continue;}
    return false
  }
  return true
}

export async function partOne(input: string) {
  const text = await readFile(input);
  const line = text.split('\n');
  const reports = line.map((l) => l.split(" ").map(Number));
  return reports.filter(report => isReportSafe(report)).length
}