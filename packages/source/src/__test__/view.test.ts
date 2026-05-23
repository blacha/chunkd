import assert from 'node:assert';
import { describe, it } from 'node:test';

import type { SourceMiddleware } from '../middleware.js';
import type { Source } from '../source.js';
import { SourceView } from '../view.js';

function createTestSource(): Source {
  return {
    type: 'test',
    url: new URL('memory://test'),
    head() {
      return Promise.resolve({});
    },
    fetch(_offset: number, length?: number) {
      return Promise.resolve(new Uint8Array(length ?? 0).buffer);
    },
  };
}

function recordSignals(seen: (AbortSignal | undefined)[]): SourceMiddleware {
  return {
    name: 'recorder',
    fetch(req, next) {
      seen.push(req.signal);
      return next(req);
    },
  };
}

describe('SourceView', () => {
  it('should forward the abort signal to middleware', async () => {
    const seen: (AbortSignal | undefined)[] = [];
    const view = new SourceView(createTestSource(), [recordSignals(seen)]);
    const controller = new AbortController();

    await view.fetch(0, 4, { signal: controller.signal });
    assert.equal(seen[0], controller.signal);
  });

  it('should pass undefined to middleware when no signal is given', async () => {
    const seen: (AbortSignal | undefined)[] = [];
    const view = new SourceView(createTestSource(), [recordSignals(seen)]);

    await view.fetch(0, 4);
    assert.equal(seen[0], undefined);
  });
});
