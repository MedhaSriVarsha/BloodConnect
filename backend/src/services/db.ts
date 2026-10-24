/**
 * Database Service Facade
 * Seamlessly re-exports from the dedicated database module at ../database/index.js
 * Preserves 100% backward compatibility for all existing controllers and middleware.
 */

export * from '../database/index.js';
