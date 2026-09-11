// Tests du verrou fichier runs.lock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { acquireLock, releaseLock } from '../src/lock.js';

const tmpLock = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'seo-lock-')), 'runs.lock');

test('acquisition puis blocage tant que le verrou est tenu', () => {
  const lock = tmpLock();
  assert.equal(acquireLock(lock), true);
  assert.equal(acquireLock(lock), false); // déjà pris
  releaseLock(lock);
  assert.equal(acquireLock(lock), true); // libéré → reprenable
});

test('un verrou plus vieux que staleMs est cassé (crash d\'un run)', () => {
  const lock = tmpLock();
  let clock = 0;
  assert.equal(acquireLock(lock, { staleMs: 1000, now: () => clock }), true);
  clock = 500;
  assert.equal(acquireLock(lock, { staleMs: 1000, now: () => clock }), false); // encore frais
  clock = 1500;
  assert.equal(acquireLock(lock, { staleMs: 1000, now: () => clock }), true); // périmé → cassé et repris
});

test('releaseLock est sans effet si le verrou n\'existe plus', () => {
  releaseLock(tmpLock()); // ne doit pas lever
});
