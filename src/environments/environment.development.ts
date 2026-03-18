const HOSTNAME = 'localhost:8000';
// const HOSTNAME = '192.168.1.17';
export const environment = {
  production: false,
  enableLogging: true,
  HOSTNAME: HOSTNAME,
  SERVER_ADDRESS: `http://${HOSTNAME}`,
  // SERVER_ADDRESS: `https://${HOSTNAME}:8000`,
};
