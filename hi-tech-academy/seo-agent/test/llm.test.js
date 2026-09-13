// Tests du client LLM (extraction JSON, relance sur sortie invalide,
// rate limit → retryNextRun) sur query() mocké — aucun appel réel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLlm, extractJson } from '../src/llm.js';

function makeQuery(results) {
  const calls = [];
  const queryImpl = ({ prompt, options }) => {
    calls.push({ prompt, options });
    const next = results.shift();
    return (async function* () {
      if (next instanceof Error) {
        yield { type: 'result', subtype: 'error_during_execution', is_error: true, result: next.message };
      } else {
        yield { type: 'assistant', message: {} }; // bruit à ignorer
        yield { type: 'result', subtype: 'success', is_error: false, result: next };
      }
    })();
  };
  return { queryImpl, calls };
}

test('extractJson : JSON brut, bloc ```json, texte autour', () => {
  assert.deepEqual(extractJson('{"a": 1}'), { a: 1 });
  assert.deepEqual(extractJson('Voici :\n```json\n{"a": 2}\n```\nfin'), { a: 2 });
  assert.deepEqual(extractJson('préambule {"a": {"b": 3}} conclusion'), { a: { b: 3 } });
  assert.throws(() => extractJson('aucun objet ici'), /Aucun objet JSON/);
});

test('generate : un tour, aucun outil, modèle et système transmis', async () => {
  const { queryImpl, calls } = makeQuery(['réponse']);
  const llm = createLlm({ queryImpl, model: 'claude-sonnet-4-6' });
  const out = await llm.generate('question', { system: 'contexte' });

  assert.equal(out, 'réponse');
  assert.equal(calls[0].options.model, 'claude-sonnet-4-6');
  assert.equal(calls[0].options.maxTurns, 1);
  assert.deepEqual(calls[0].options.allowedTools, []);
  assert.equal(calls[0].options.systemPrompt, 'contexte');
});

test('generateJson : sortie invalide → une relance avec l\'erreur en contexte', async () => {
  const { queryImpl, calls } = makeQuery([
    '{"angle": ""}',                       // invalide
    '{"angle": "un angle éditorial valide"}', // corrigé
  ]);
  const llm = createLlm({ queryImpl });
  const out = await llm.generateJson('prompt', {
    validate: (o) => {
      if (!o.angle || o.angle.length < 10) throw new Error('angle trop court');
      return o;
    },
  });

  assert.equal(out.angle, 'un angle éditorial valide');
  assert.equal(calls.length, 2);
  assert.match(calls[1].prompt, /angle trop court/); // erreur renvoyée au modèle
});

test('generateJson : toujours invalide après relance → erreur', async () => {
  const { queryImpl } = makeQuery(['pas du json', 'toujours pas']);
  const llm = createLlm({ queryImpl });
  await assert.rejects(
      () => llm.generateJson('prompt', { validate: (o) => o }),
      /invalide après relance/);
});

test('rate limit : backoff puis succès', async () => {
  const waits = [];
  const { queryImpl, calls } = makeQuery([
    new Error('429 rate limit exceeded'),
    '"ok"',
  ]);
  const llm = createLlm({ queryImpl, sleep: async (ms) => waits.push(ms), retryBaseMs: 30_000 });
  const out = await llm.generate('prompt');

  assert.equal(out, '"ok"');
  assert.equal(calls.length, 2);
  assert.deepEqual(waits, [30_000]);
});

test('rate limit persistant : erreur marquée retryNextRun (report du mot-clé)', async () => {
  const { queryImpl } = makeQuery([
    new Error('usage limit reached'),
    new Error('usage limit reached'),
    new Error('usage limit reached'),
  ]);
  const llm = createLlm({ queryImpl, sleep: async () => {}, maxAttempts: 3 });
  try {
    await llm.generate('prompt');
    assert.fail('aurait dû lever');
  } catch (err) {
    assert.equal(err.retryNextRun, true);
  }
});

test('timeout : appel abandonné, erreur marquée retryNextRun, pas de retry', async () => {
  const queryImpl = () => (async function* () {
    await new Promise(() => {}); // sous-processus qui ne répond jamais
    yield { type: 'result' };
  })();
  const llm = createLlm({ queryImpl, timeoutMs: 50 });
  try {
    await llm.generate('prompt');
    assert.fail('aurait dû lever');
  } catch (err) {
    assert.match(err.message, /délai dépassé/);
    assert.equal(err.retryNextRun, true);
  }
});

test('erreur non-rate-limit : pas de retry, pas de retryNextRun', async () => {
  const { queryImpl, calls } = makeQuery([new Error('invalid request')]);
  const llm = createLlm({ queryImpl, sleep: async () => {} });
  try {
    await llm.generate('prompt');
    assert.fail('aurait dû lever');
  } catch (err) {
    assert.equal(err.retryNextRun, undefined);
    assert.equal(calls.length, 1);
  }
});
