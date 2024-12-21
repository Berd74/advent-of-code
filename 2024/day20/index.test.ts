import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';

const TEST = __dirname + '/data_test.txt'
const TEST2 = __dirname + '/data_test2.txt'
const FULL = __dirname + '/data_full.txt'
const TEST_RESULT_1 = 60
const FULL_RESULT_1 = 1363

test.describe('day 19', () => {

  test(`partOne test and final result`, async () => {
    const output = await partOne(FULL);
    expect(output).toBe(TEST_RESULT_1);
    // try {
    //   const output = await partOne(FULL);
    //   console.log('output1: ' + output);
    // } catch (err) {}
  });

  test(`partTwo test and final result`, async () => {
    const output = await partTwo(FULL);
    expect(output).toBe(1363);
    // try {
    //   const output = await partTwo(FULL);
    //   console.log('output2: ' + output);
    // } catch (err) {}
  });

});

//5138