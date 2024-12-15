import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';

const TEST = __dirname + '/data_test.txt'
const FULL = __dirname + '/data_full.txt'
const TEST_RESULT_1 = 13
const TEST_RESULT_2 = 12

test.describe('day 14', () => {

  test(`partOne test and final result`, async () => {
    const output = await partOne(TEST, 11, 7);
    expect(output).toBe(TEST_RESULT_1);
    try {
      const output = await partOne(FULL, 101, 103);
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