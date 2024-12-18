import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';

const TEST1 = __dirname + '/data_test1.txt'
const TEST2 = __dirname + '/data_test2.txt'
const FULL = __dirname + '/data_full.txt'
const TEST_RESULT_1 = '4,6,3,5,6,3,5,2,1,0'
const TEST_RESULT_2 = 117440

test.describe('day 17', () => {

  test(`partOne test and final result`, async () => {
    const output = await partOne(TEST1);
    expect(output).toBe(TEST_RESULT_1);
    try {
      const output = await partOne(FULL);
      console.log('output2: ' + output);
    } catch (err) {}
  });

  test(`partTwo test and final result`, async () => {
    const output = await partTwo(TEST2);
    expect(output).toBe(TEST_RESULT_2);
    try {
      const output = await partTwo(FULL);
      console.log('output2: ' + output);
    } catch (err) {}
  });

});