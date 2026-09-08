const HOSTNAME = 'portal.getunits.ai';
export const environment = {
  production: true,
  enableLogging: false,
  HOSTNAME: HOSTNAME,
  SERVER_ADDRESS: `https://${HOSTNAME}/api`,
  FINANCE_SERVER_ADDRESS: `https://${HOSTNAME}/api/finance`,
};
