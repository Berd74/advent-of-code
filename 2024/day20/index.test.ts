import { test, expect } from '@playwright/test';
import {partOne} from './partOne';
import {partTwo} from './partTwo';

const TEST = __dirname + '/data_test.txt'
const TEST2 = __dirname + '/data_test2.txt'
const FULL = __dirname + '/data_full.txt'

test.describe('day 19', () => {


  // due to globals test are separated
  test(`partOne test (but it uses partTwo code)`, async () => {
    // partOne is shity, don't use it, it only works for FULL data
    // const output = await partOne(FULL);
    const output = await partTwo(TEST, 100, 2);
    expect(output).toBe(44);
  });

  test(`partOne final result (but it uses partTwo code)`, async () => {
      const output = await partTwo(FULL, 100, 2);
      console.log('output1: ' + output);
  });

  test(`partTwo test `, async () => {
    const output = await partTwo(TEST, 50, 20);
    expect(output).toBe(285);
  });

  test(`partTwo final result`, async () => {
    const output = await partTwo(FULL, 100, 20);
    console.log('output2: ' + output);

  });

});
