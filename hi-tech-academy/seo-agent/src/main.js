// Point d'entrée du conteneur seo-agent : assemble les dépendances réelles
// et démarre le démon. Variables d'environnement : voir README.md.

import { createBackendApi } from './backendApi.js';
import { createAgents } from './agents/index.js';
import { createPublisher } from './publisher.js';
import { createDaemon } from './daemon.js';

const api = createBackendApi();
const daemon = createDaemon({
  api,
  agents: createAgents(),
  publisher: createPublisher(),
});

daemon.start();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`${signal} reçu, arrêt de l'orchestrateur`);
    process.exit(0);
  });
}
