/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { lastValueFrom, toArray } from 'rxjs';
import { JsonValue } from '../json/utils';
import { Logger } from './logger';

describe('Logger', () => {
  it('works', (done: DoneFn) => {
    const logger = new Logger('test');
    lastValueFrom(logger.pipe(toArray()))
      .then((observed: JsonValue[]) => {
        expect(observed).toEqual([
          jasmine.objectContaining({ message: 'hello', level: 'debug', name: 'test' }),
          jasmine.objectContaining({ message: 'world', level: 'info', name: 'test' }),
        ]);
      })
      .then(
        () => done(),
        (err) => done.fail(err),
      );

    logger.debug('hello');
    logger.info('world');
    logger.complete();
  });

  it('works with children', (done: DoneFn) => {
    const logger = new Logger('test');
    let hasCompleted = false;
    lastValueFrom(logger.pipe(toArray()))
      .then((observed: JsonValue[]) => {
        expect(observed).toEqual([
          jasmine.objectContaining({ message: 'hello', level: 'debug', name: 'child' }) as any,
          jasmine.objectContaining({ message: 'world', level: 'info', name: 'child' }) as any,
        ]);
        expect(hasCompleted).toBe(true);
      })
      .then(
        () => done(),
        (err) => done.fail(err),
      );

    const childLogger = new Logger('child', logger);
    childLogger.subscribe(undefined, undefined, () => (hasCompleted = true));
    childLogger.debug('hello');
    childLogger.info('world');
    logger.complete();
  });

  it('misses messages if not subscribed', (done: DoneFn) => {
    const logger = new Logger('test');
    logger.debug('woah');

    lastValueFrom(logger.pipe(toArray()))
      .then((observed: JsonValue[]) => {
        expect(observed).toEqual([
          jasmine.objectContaining({ message: 'hello', level: 'debug', name: 'test' }) as any,
        ]);
      })
      .then(
        () => done(),
        (err) => done.fail(err),
      );

    logger.debug('hello');
    logger.complete();
  });
});
