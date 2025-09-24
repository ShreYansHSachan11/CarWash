import { isConnected, getConnectionStatus } from '../../utils/database.js';

describe('Database Utilities', () => {
  describe('Connection Status Functions', () => {
    test('isConnected should return boolean', () => {
      const result = isConnected();
      expect(typeof result).toBe('boolean');
    });

    test('getConnectionStatus should return valid status', () => {
      const status = getConnectionStatus();
      const validStatuses = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      expect(validStatuses).toContain(status);
    });

    test('status functions should be consistent', () => {
      const connected = isConnected();
      const status = getConnectionStatus();
      
      if (connected) {
        expect(status).toBe('connected');
      } else {
        expect(status).not.toBe('connected');
      }
    });
  });
});