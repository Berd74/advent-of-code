import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';

const TEST = __dirname + '/data_test.txt'
const FULL = __dirname + '/data_full.txt'

test.describe('day 21', () => {

  test(`partOne test and final result`, async () => {
    const output = await partOne(TEST);
    expect(output).toBe(126384);
    try {
      const output = await partOne(FULL);
      console.log('output1: ' + output);
    } catch (err) {}
  });

  test(`partTwo test and final result`, async () => {
    const output = await partTwo(TEST);
    expect(output).toBe(0);
    try {
      const output = await partTwo(FULL);
      console.log('output2: ' + output);
    } catch (err) {}
  });

});
