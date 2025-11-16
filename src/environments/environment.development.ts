// const HOSTNAME = 'units-api.doqfy.in';
const HOSTNAME = '192.168.1.37';
export const environment = {
  production: false,
  enableLogging: true,
  HOSTNAME: HOSTNAME,
  // SERVER_ADDRESS: `http://${HOSTNAME}`,
  SERVER_ADDRESS: `http://${HOSTNAME}:8000`,
};
