import {Express} from 'express';
import request from 'supertest';

const testServer = async (app: Express) => {
  return new Promise((resolve, reject) => {
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
  });
};

const testInvalidRoute = async (app: Express, endpoint: string) => {
  return new Promise((resolve, reject) => {
    request(app)
      .get(endpoint)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
  });
};

export {testServer, testInvalidRoute};
