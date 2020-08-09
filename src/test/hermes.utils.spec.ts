import { HttpResponse } from 'uWebSockets.js';

import sinon from 'sinon';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';

import { httpResMock } from './__mocks__';
import { HermesError } from '../hermes.types';
import { stringifyKeyValuePair, errorHandler } from '../hermes.utils';
import { SERVER_SIDE_ERROR_STATUS, SERVER_SIDE_ERROR_MESSAGE } from '../hermes.constants';

describe('Hermes utils module', () => {
  describe('stringifyKeyValuePair function', () => {
    it('should return a key value storage as a string', () => {
      const input = {
        hello: 'world',
        this: 1,
        is: 2,
        a: 'test',
        null: null
      };
      const expectedResult = 'hello = world;\nthis = 1;\nis = 2;\na = test;\nnull = null;';
      const result = stringifyKeyValuePair(input);
      expect(result).to.be.a('string');
      expect(result).to.eq(expectedResult);
    });
  });
  describe('errorHandler function', () => {
    beforeEach(() => {
      sinon.reset();
      httpResMock.writeStatus.returnsThis();
    });
    it('should write the default status and default message if the error object has neither', () => {
      const err: HermesError = { error: new Error('hello world') };
      errorHandler(httpResMock as unknown as HttpResponse, err);

      expect(httpResMock.writeStatus.calledWith(SERVER_SIDE_ERROR_STATUS)).to.eq(true);
      expect(httpResMock.end.calledWith(SERVER_SIDE_ERROR_MESSAGE)).to.eq(true);
    });
    it('should write the given status and message', () => {
      const message = 'hello world';
      const err: HermesError = { status: '418', message, error: new Error(message) };
      errorHandler(httpResMock as unknown as HttpResponse, err);

      expect(httpResMock.writeStatus.calledWith(err.status)).to.eq(true);
      expect(httpResMock.end.calledWith(err.message)).to.eq(true);
    });
  });
});
