import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';

const TEST = __dirname + '/data_test.txt'
const FULL = __dirname + '/data_full.txt'
const TEST_RESULT_1 = 41
const TEST_RESULT_2 = 6

test.describe('day 3', () => {

  test(`partOne test and final result`, async () => {
    console.time('Execution Time 1');
    const output = await partOne(TEST);
    console.timeEnd('Execution Time 1');
    expect(output).toBe(TEST_RESULT_1);
    try {
      const output = await partOne(FULL);
      console.log('output1: ' + output);
    } catch (err) {}
  });

  test(`partTwo test and final result`, async () => {
    console.time('Execution Time 2');
    const output = await partTwo(TEST);
    console.timeEnd('Execution Time 2');
    expect(output).toBe(TEST_RESULT_2);
    try {
      const output = await partTwo(FULL);
      console.log('output2: ' + output);
    } catch (err) {}
  });

});