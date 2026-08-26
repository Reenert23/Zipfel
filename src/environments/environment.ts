export const environment = {
  production: false,
  apiUrl: '/api', // Wird local zu localhost:8080 proxied

  /* Bewusst ein eigenes Flag statt production: der Service Worker laeuft nur
     in einem echten Build, nicht unter `ng serve`. Haenge man ihn an
     production, liesse er sich lokal nur mit einem Prod-Build testen - und
     der zeigt per environment.prod.ts auf die Render-Produktionsdatenbank.
     So kann environment.local.ts ihn einschalten und trotzdem auf localhost
     zeigen. */
  serviceWorker: false
};
