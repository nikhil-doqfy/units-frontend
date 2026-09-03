const HOSTNAME = 'localhost:8000';
export const environment = {
  production: false,
  enableLogging: true,
  HOSTNAME: HOSTNAME,
  SERVER_ADDRESS: `http://${HOSTNAME}`,
  FINANCE_SERVER_ADDRESS: `http://${HOSTNAME}/api/finance`,
};
