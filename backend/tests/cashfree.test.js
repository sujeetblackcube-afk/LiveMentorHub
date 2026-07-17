import test from 'node:test';
import assert from 'node:assert/strict';
import { createCashfreeClient, default as cashfreeClient } from '../utils/cashfree.js';

test('cashfree client exposes order and webhook methods', () => {
  const client = createCashfreeClient();

  assert.ok(client, 'expected a Cashfree client instance');
  assert.equal(typeof client.PGCreateOrder, 'function');
  assert.equal(typeof client.PGVerifyWebhookSignature, 'function');
  assert.equal(typeof cashfreeClient.PGCreateOrder, 'function');
});
