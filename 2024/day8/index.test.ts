import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';

const TEST = __dirname + '/data_test.txt'
const FULL = __dirname + '/data_full.txt'
const TEST_RESULT_1 = 14
const TEST_RESULT_2 = 34

test.describe('day 8', () => {

  test(`partOne test and final result`, async () => {
    const output = await partOne(TEST);
    expect(output).toBe(TEST_RESULT_1);
    try {
      const output = await partOne(FULL);
      console.log('output1: ' + output);
    } catch (err) {}
  });

  test(`partTwo test and final result`, async () => {
    const output = await partTwo(TEST);
    expect(output).toBe(TEST_RESULT_2);
    try {
      const output = await partTwo(FULL);
      console.log('output2: ' + output);
    } catch (err) {}
  });

});