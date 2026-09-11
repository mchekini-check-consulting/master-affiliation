// Tests de l'orchestrateur (executeRun + daemon) sur API backend mockée.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { executeRun } from '../src/run.js';
import { createDaemon } from '../src/daemon.js';

// --- API backend mockée -------------------------------------------------

function makeApi({ agentEnabled = true, keywords = [], articlesDue = [], requestedRuns = [] } = {}) {
  const calls = [];
  const keywordPatches = [];
  const runPatches = [];
  const articlePatches = [];
  return {
    calls, keywordPatches, runPatches, articlePatches,
    async getConfig() {
      calls.push('getConfig');
      return { agent_enabled: agentEnabled, keywords };
    },
    async createRun(trigger) {
      calls.push(`createRun:${trigger}`);
      return { id: 'run-1', trigger, status: 'running' };
    },
    async updateRun(id, patch) {
      calls.push(`updateRun:${id}`);
      runPatches.push(patch);
      return { id, ...patch };
    },
    async listRuns(status) {
      calls.push(`listRuns:${status}`);
      return requestedRuns;
    },
    async updateKeyword(id, patch) {
      calls.push(`updateKeyword:${id}`);
      keywordPatches.push({ id, ...patch });
      return { id, ...patch };
    },
    async listArticles({ status, publishBefore }) {
      calls.push(`listArticles:${status}:${Boolean(publishBefore)}`);
      return articlesDue;
    },
    async updateArticle(id, patch) {
      calls.push(`updateArticle:${id}`);
      articlePatches.push({ id, ...patch });
      return { id, ...patch };
    },
    async createArticle() {
      throw new Error('non utilisé dans ces tests');
    },
  };
}

const stubAgents = {
  implemented: false,
  async processKeyword() {
    return { implemented: false, reason: 'Agents 1-4 non encore livrés (étapes 4-6) — mot-clé laissé à traiter' };
  },
};

const noPublisher = { isConfigured: () => false, publishArticle: async () => { throw new Error('non configurée'); } };

const baseDeps = (api, extra = {}) => ({
  api, agents: stubAgents, publisher: noPublisher,
  sleep: async () => {}, rng: () => 0.5, log: () => {},
  ...extra,
});

// --- Court-circuit ------------------------------------------------------

test('agent désactivé : run skipped, zéro traitement', async () => {
  const api = makeApi({ agentEnabled: false, keywords: [{ id: 'k1', keyword: 'a', status: 'to_process' }] });
  const result = await executeRun(baseDeps(api), { trigger: 'cron' });

  assert.equal(result.skipped, true);
  assert.equal(api.keywordPatches.length, 0); // aucun mot-clé touché
  const final = api.runPatches.at(-1);
  assert.equal(final.status, 'skipped');
  assert.equal(final.skipped, true);
  assert.match(final.current_step, /aucun appel DataForSEO ni LLM/);
  assert.ok(final.finished_at);
});

// --- Traitement des mots-clés -------------------------------------------

test('agents non livrés : mot-clé processing puis rendu to_process', async () => {
  const api = makeApi({ keywords: [{ id: 'k1', keyword: 'formation ia', status: 'to_process' }] });
  const result = await executeRun(baseDeps(api), { trigger: 'manual' });

  assert.equal(result.processed, 0);
  assert.deepEqual(api.keywordPatches.map((p) => p.status), ['processing', 'to_process']);
  assert.ok(api.runPatches.some((p) => p.current_keyword === 'formation ia'));
  assert.equal(api.runPatches.at(-1).status, 'done');
});

test('seuls les mots-clés to_process sont traités', async () => {
  const api = makeApi({ keywords: [
    { id: 'k1', keyword: 'a', status: 'done' },
    { id: 'k2', keyword: 'b', status: 'error' },
    { id: 'k3', keyword: 'c', status: 'to_process' },
  ] });
  await executeRun(baseDeps(api), { trigger: 'manual' });
  const touched = new Set(api.keywordPatches.map((p) => p.id));
  assert.deepEqual([...touched], ['k3']);
});

test('chaîne d\'agents réelle : done + article, une erreur ne bloque pas la suite', async () => {
  const api = makeApi({ keywords: [
    { id: 'k1', keyword: 'ok', status: 'to_process' },
    { id: 'k2', keyword: 'boom', status: 'to_process' },
    { id: 'k3', keyword: 'ok2', status: 'to_process' },
  ] });
  const agents = {
    implemented: true,
    async processKeyword(ctx, kw) {
      if (kw.keyword === 'boom') throw new Error('SERP indisponible');
      return { articleId: `article-${kw.id}` };
    },
  };
  const result = await executeRun(baseDeps(api, { agents }), { trigger: 'manual' });

  assert.equal(result.processed, 2);
  const byId = Object.fromEntries(api.keywordPatches.filter((p) => p.status !== 'processing').map((p) => [p.id, p]));
  assert.equal(byId.k1.status, 'done');
  assert.equal(byId.k2.status, 'error');
  assert.match(byId.k2.error_message, /SERP indisponible/);
  assert.equal(byId.k3.status, 'done');
  assert.equal(api.runPatches.at(-1).keywords_processed, 2);
});

// --- Délai aléatoire -----------------------------------------------------

test('run cron : attente aléatoire entre 60 et 2400 s avant publication', async () => {
  const waits = [];
  const api = makeApi();
  await executeRun(baseDeps(api, { sleep: async (ms) => waits.push(ms), rng: () => 0 }), { trigger: 'cron' });
  await executeRun(baseDeps(api, { sleep: async (ms) => waits.push(ms), rng: () => 0.999999 }), { trigger: 'cron' });

  assert.equal(waits.length, 2);
  assert.ok(waits[0] >= 60_000, `borne basse : ${waits[0]}`);
  assert.ok(waits[1] < 2_400_000, `borne haute : ${waits[1]}`);
});

test('run manuel : aucune attente aléatoire', async () => {
  const waits = [];
  const api = makeApi();
  await executeRun(baseDeps(api, { sleep: async (ms) => waits.push(ms) }), { trigger: 'manual' });
  assert.equal(waits.length, 0);
});

// --- Publication ----------------------------------------------------------

test('publication non configurée : articles laissés validés, run done', async () => {
  const api = makeApi({ articlesDue: [{ id: 'a1', title: 'Article', status: 'validated' }] });
  const result = await executeRun(baseDeps(api), { trigger: 'manual' });

  assert.equal(result.published, 0);
  assert.equal(api.articlePatches.length, 0);
  assert.ok(api.runPatches.some((p) => /Publication CMS non configurée/.test(p.current_step ?? '')));
  assert.equal(api.runPatches.at(-1).status, 'done');
});

test('publication configurée : chaque article échu passe published avec cms_url', async () => {
  const api = makeApi({ articlesDue: [
    { id: 'a1', title: 'Un', status: 'validated' },
    { id: 'a2', title: 'Deux', status: 'validated' },
  ] });
  const publisher = {
    isConfigured: () => true,
    publishArticle: async (article) => `https://hi-tech-academy.fr/blog/${article.id}`,
  };
  const result = await executeRun(baseDeps(api, { publisher }), { trigger: 'manual' });

  assert.equal(result.published, 2);
  assert.equal(api.articlePatches[0].status, 'published');
  assert.equal(api.articlePatches[0].cms_url, 'https://hi-tech-academy.fr/blog/a1');
  assert.ok(api.articlePatches[0].published_at);
  assert.equal(api.runPatches.at(-1).articles_published, 2);
});

// --- Journal et coût -------------------------------------------------------

test('run manuel réclamé : updateRun(runId → running) au lieu de createRun', async () => {
  const api = makeApi();
  await executeRun(baseDeps(api), { trigger: 'manual', runId: 'run-42' });
  assert.ok(api.calls.includes('updateRun:run-42'));
  assert.ok(!api.calls.some((c) => c.startsWith('createRun')));
  assert.equal(api.runPatches[0].status, 'running');
  assert.ok(api.runPatches[0].started_at);
});

test('coût DataForSEO consigné à la clôture (getCost)', async () => {
  const api = makeApi();
  await executeRun(baseDeps(api, { getCost: () => 0.123 }), { trigger: 'manual' });
  assert.equal(api.runPatches.at(-1).cost_usd, 0.123);
});

test('échec pendant le run : clôture en error puis propagation', async () => {
  const api = makeApi();
  api.getConfig = async () => { throw new Error('backend injoignable'); };
  await assert.rejects(() => executeRun(baseDeps(api), { trigger: 'cron' }), /backend injoignable/);
  const final = api.runPatches.at(-1);
  assert.equal(final.status, 'error');
  assert.match(final.error, /backend injoignable/);
});

// --- Démon -----------------------------------------------------------------

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpLock = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'seo-lock-')), 'runs.lock');

test('démon : réclame les runs requested au tick', async () => {
  const api = makeApi({ agentEnabled: false, requestedRuns: [{ id: 'run-9', status: 'requested' }] });
  const daemon = createDaemon(
      { api, agents: stubAgents, publisher: noPublisher, sleep: async () => {}, rng: () => 0.5, log: () => {} },
      { lockPath: tmpLock(), now: () => new Date('2026-09-11T15:30:00'), log: () => {} });

  await daemon.tick();
  assert.ok(api.calls.includes('updateRun:run-9')); // réclamé puis clôturé (skipped)
  assert.equal(api.runPatches[0].status, 'running');
});

test('démon : un seul run cron par créneau 00 h / 12 h', async () => {
  const api = makeApi({ agentEnabled: false });
  let clock = new Date('2026-09-11T12:05:00');
  const daemon = createDaemon(
      { api, agents: stubAgents, publisher: noPublisher, sleep: async () => {}, rng: () => 0.5, log: () => {} },
      { lockPath: tmpLock(), now: () => clock, log: () => {} });

  await daemon.tick(); // 12h05 → run cron
  clock = new Date('2026-09-11T12:06:00');
  await daemon.tick(); // même créneau → rien
  clock = new Date('2026-09-11T15:00:00');
  await daemon.tick(); // 15 h → pas un créneau cron

  const cronRuns = api.calls.filter((c) => c === 'createRun:cron');
  assert.equal(cronRuns.length, 1);

  clock = new Date('2026-09-12T00:01:00');
  await daemon.tick(); // minuit le lendemain → nouveau run
  assert.equal(api.calls.filter((c) => c === 'createRun:cron').length, 2);
});

test('démon : le verrou empêche une exécution concurrente', async () => {
  const lockPath = tmpLock();
  fs.writeFileSync(lockPath, JSON.stringify({ pid: 1, at: Date.now() })); // verrou déjà pris
  const api = makeApi({ agentEnabled: false });
  const daemon = createDaemon(
      { api, agents: stubAgents, publisher: noPublisher, sleep: async () => {}, rng: () => 0.5, log: () => {} },
      { lockPath, now: () => new Date('2026-09-11T12:05:00'), log: () => {} });

  await daemon.tick();
  assert.ok(!api.calls.some((c) => c.startsWith('createRun'))); // run cron bloqué par le verrou
});
