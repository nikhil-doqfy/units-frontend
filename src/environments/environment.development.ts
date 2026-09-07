const HOSTNAME = 'localhost:8000';
// Relative (same-origin) path: `ng serve`'s dev-server proxy
// (proxy.conf.json) intercepts /api/finance/* and forwards it to
// units-finance, and docker_config/frontend-dev.conf's nginx does the same
// for the port-8002 static build -- either way this must stay same-origin
// with whatever is serving the Angular app itself, or the browser blocks it
// as cross-origin (units-finance sends no CORS headers, matching prod, which
// also never needs them since prod routes through one nginx entrypoint).
export const environment = {
  production: false,
  enableLogging: true,
  HOSTNAME: HOSTNAME,
  SERVER_ADDRESS: `http://${HOSTNAME}`,
  FINANCE_SERVER_ADDRESS: `/api/finance`,
};
