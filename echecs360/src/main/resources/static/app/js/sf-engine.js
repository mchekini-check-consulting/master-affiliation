/*
 * Échecs360 — pilote Stockfish (WASM, single thread) via protocole UCI.
 *
 * SfEngine.ready()                       → Promise<bool> (chargement + handshake)
 * SfEngine.analyze(fen, opts)            → Promise<[{uci, cp, mate, pv}]>
 *     opts : { multipv=1, movetime=400, depth=18 }
 *     cp/mate sont exprimés du point de vue des BLANCS.
 * SfEngine.stop()                        → interrompt l'analyse en cours
 * SfEngine.createEngine(hashMb)          → instance indépendante { ready,
 *     analyze, stop, terminate } — permet un POOL de moteurs pour analyser
 *     plusieurs positions en parallèle (les analyses d'une même instance
 *     restent sérialisées ; le wasm est mono-thread, le parallélisme vient
 *     du nombre d'instances, une par cœur disponible).
 *
 * Chaque moteur tourne dans un Web Worker : l'interface ne bloque jamais.
 */
(function (global) {
  'use strict';

  const SCRIPT = '/app/js/stockfish/stockfish-18-lite-single.js';

  function makeEngine(hashMb) {
    let worker = null;
    let readyPromise = null;
    let queue = Promise.resolve();
    let currentResolve = null;
    let currentLines = [];
    let currentTurn = 'w';

    function send(cmd) {
      worker.postMessage(cmd);
    }

    function handleLine(line) {
      if (typeof line !== 'string') return;
      if (line.startsWith('info ') && line.includes(' pv ')) {
        // info depth 18 ... multipv 2 score cp -35 ... pv e2e4 e7e5 ...
        const mpv = / multipv (\d+)/.exec(line);
        const scoreCp = / score cp (-?\d+)/.exec(line);
        const scoreMate = / score mate (-?\d+)/.exec(line);
        const pv = / pv (.+)$/.exec(line);
        if (!pv) return;
        const index = mpv ? +mpv[1] - 1 : 0;
        const moves = pv[1].trim().split(/\s+/);
        // Score renvoyé du point de vue du camp au trait → normalisation Blancs
        const sign = currentTurn === 'w' ? 1 : -1;
        currentLines[index] = {
          uci: moves[0],
          pv: moves,
          cp: scoreCp ? sign * (+scoreCp[1]) : null,
          mate: scoreMate ? sign * (+scoreMate[1]) : null
        };
      } else if (line.startsWith('bestmove')) {
        if (currentResolve) {
          const resolve = currentResolve;
          currentResolve = null;
          resolve(currentLines.filter(Boolean));
        }
      }
    }

    function ready() {
      if (readyPromise) return readyPromise;
      readyPromise = new Promise((resolve) => {
        let settled = false;
        const fail = () => { if (!settled) { settled = true; resolve(false); } };
        try {
          worker = new Worker(SCRIPT);
        } catch (e) {
          fail();
          return;
        }
        const timeout = setTimeout(fail, 20000); // wasm ~7 Mo : premier chargement long
        worker.onerror = fail;
        worker.onmessage = (event) => {
          const line = event.data;
          if (line === 'uciok') {
            send('setoption name Threads value 1');
            send('setoption name Hash value ' + (hashMb || 32));
            send('isready');
          } else if (line === 'readyok' && !settled) {
            settled = true;
            clearTimeout(timeout);
            worker.onmessage = (e) => handleLine(e.data);
            resolve(true);
          }
        };
        send('uci');
      });
      return readyPromise;
    }

    function analyze(fen, options) {
      const opts = options || {};
      const multipv = opts.multipv || 1;
      const movetime = opts.movetime || 400;
      const depth = opts.depth || 18;
      const job = () => ready().then(ok => {
        if (!ok) return null;
        return new Promise((resolve) => {
          currentLines = [];
          currentTurn = fen.split(' ')[1] || 'w';
          currentResolve = resolve;
          send('setoption name MultiPV value ' + multipv);
          send('position fen ' + fen);
          send('go depth ' + depth + ' movetime ' + movetime);
        });
      });
      queue = queue.then(job, job);
      return queue;
    }

    function stop() {
      if (worker && currentResolve) send('stop');
    }

    function terminate() {
      if (worker) { worker.terminate(); worker = null; }
      if (currentResolve) { currentResolve([]); currentResolve = null; }
    }

    return { ready, analyze, stop, terminate };
  }

  // Instance principale partagée (bot, vérification de puzzles, Miss Mates…)
  const main = makeEngine(32);
  const SfEngine = {
    ready: main.ready,
    analyze: main.analyze,
    stop: main.stop,
    createEngine: makeEngine
  };
  global.SfEngine = SfEngine;
})(typeof self !== 'undefined' ? self : globalThis);
