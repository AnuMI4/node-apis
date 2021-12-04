const request = require('supertest');
const app = require('./index');
describe('Sample Test', () => {
    it('should return correct message on /', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Welcome to the Server');
    });

    it('should return correct message on /api endpoint', async () => {
      const res = await request(app).get('/api');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Welcome to the API');
    });
  });