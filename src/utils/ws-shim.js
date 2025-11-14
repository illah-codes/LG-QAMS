/**
 * Browser shim for 'ws' Node.js module
 * Supabase's realtime client includes conditional imports for Node.js environments.
 * This shim ensures the browser build doesn't try to import the 'ws' module.
 */
export default undefined;
