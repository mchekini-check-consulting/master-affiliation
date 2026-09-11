// Tests de l'agent 1 (veille concurrentielle : snapshots + deltas)
// sur DataForSEO mocké.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWatchAgent } from '../src/agents/watch.js';
import { createMemorySnapshotStore } from '../src/snapshots.js';

const rankedItem = (url, etv) => ({
  ranked_serp_element: { serp_item: { url, etv, rank_group: 5 } },
});

const gapItem = (kw, volume, etv) => ({
  keyword_data: { keyword: kw, keyword_info: { search_volume: volume } },
  first_domain_serp_element: { etv },
});

function makeDfs({ competitors = [], rankedByDomain = {}, gapByDomain = {} } = {}) {
  const calls = [];
  return {
    calls,
    async competitorsDomain(target, params) {
      calls.push({ fn: 'competitorsDomain', target, params });
      return competitors;
    },
    async rankedKeywords(target) {
      calls.push({ fn: 'rankedKeywords', target });
      return rankedByDomain[target] ?? [];
    },
    async domainIntersection(target1, target2) {
      calls.push({ fn: 'domainIntersection', target1, target2 });
      return gapByDomain[target1] ?? [];
    },
  };
}

const COMPETITORS = [
  { domain: 'hi-tech-academy.fr', metrics: { organic: { etv: 999 } } }, // nous : exclu
  { domain: 'concurrent-a.fr', metrics: { organic: { etv: 1234.567 } } },
  { domain: 'concurrent-b.fr', metrics: { organic: { etv: 42 } } },
];

test('cartographie : concurrents (site exclu), top pages agrégées, gap trié par volume', async () => {
  const dfs = makeDfs({
    competitors: COMPETITORS,
    rankedByDomain: {
      'concurrent-a.fr': [
        rankedItem('https://a.fr/p1', 10), rankedItem('https://a.fr/p1', 5), rankedItem('https://a.fr/p2', 3),
      ],
    },
    gapByDomain: {
      'concurrent-a.fr': [gapItem('petit kw', 50, 5), gapItem('gros kw', 900, 80.123)],
    },
  });
  const snapshots = createMemorySnapshotStore();
  const agent = createWatchAgent({ dfs, snapshots, siteDomain: 'hi-tech-academy.fr' });
  const out = await agent.watch({ keywordId: 'kw-1' });

  assert.equal(out.keyword_id, 'kw-1');
  assert.equal(out.competitors.length, 2);
  const [a] = out.competitors;
  assert.equal(a.domain, 'concurrent-a.fr');
  assert.equal(a.visibility_score, 1234.57);
  // p1 : 2 mots-clés, etv 15 — devant p2
  assert.deepEqual(a.top_pages[0], { url: 'https://a.fr/p1', keywords_count: 2, etv: 15 });
  // gap trié par volume décroissant, gap_score = etv du concurrent
  assert.deepEqual(a.gap_keywords, [
    { kw: 'gros kw', gap_score: 80.12 },
    { kw: 'petit kw', gap_score: 5 },
  ]);
  // intersection dans le bon sens : concurrent ranke, pas nous
  const inter = dfs.calls.find((c) => c.fn === 'domainIntersection');
  assert.equal(inter.target1, 'concurrent-a.fr');
  assert.equal(inter.target2, 'hi-tech-academy.fr');
});

test('deltas : premier run sans nouveautés, le second remonte les nouvelles URLs', async () => {
  const snapshots = createMemorySnapshotStore();
  const makeAgent = (urls) => createWatchAgent({
    dfs: makeDfs({
      competitors: [COMPETITORS[1]],
      rankedByDomain: { 'concurrent-a.fr': urls.map((u) => rankedItem(u, 10)) },
    }),
    snapshots,
    siteDomain: 'hi-tech-academy.fr',
  });

  const run1 = await makeAgent(['https://a.fr/p1', 'https://a.fr/p2']).watch({});
  assert.deepEqual(run1.competitors[0].new_urls_since_last_run, []); // pas de référence

  const run2 = await makeAgent(['https://a.fr/p1', 'https://a.fr/p3']).watch({});
  assert.deepEqual(run2.competitors[0].new_urls_since_last_run, ['https://a.fr/p3']);
});

test('maxCompetitors borne la cartographie', async () => {
  const many = Array.from({ length: 10 }, (_, i) =>
    ({ domain: `c${i}.fr`, metrics: { organic: { etv: 100 - i } } }));
  const dfs = makeDfs({ competitors: many });
  const agent = createWatchAgent({
    dfs, snapshots: createMemorySnapshotStore(),
    siteDomain: 'hi-tech-academy.fr', maxCompetitors: 3,
  });
  const out = await agent.watch({});
  assert.equal(out.competitors.length, 3);
  assert.equal(dfs.calls.filter((c) => c.fn === 'rankedKeywords').length, 3);
});
