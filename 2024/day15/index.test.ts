import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';
import {partOne2} from './partOne2';

const TEST = __dirname + '/data_test.txt'
const FULL = __dirname + '/data_full.txt'
const TEST_RESULT_1 = 10092
const TEST_RESULT_2 = 1

test.describe('day 15', () => {

  test(`partOne test and final result`, async () => {
    const output = await partOne2(TEST);
    expect(output).toBe(TEST_RESULT_1);
    try {
      const output = await partOne2(FULL);
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