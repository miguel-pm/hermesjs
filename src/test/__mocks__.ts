import sinon from 'sinon';

interface HttpResMock {
  end: sinon.SinonStub
  writeStatus: sinon.SinonStub
}
export const httpResMock: HttpResMock = {
  end: sinon.stub(),
  writeStatus: sinon.stub()
};

interface LoggerMock {
  debug: sinon.SinonStub
  info: sinon.SinonStub
  warn: sinon.SinonStub
  error: sinon.SinonStub
}
export const loggerMock: LoggerMock = {
  debug: sinon.stub(),
  info: sinon.stub(),
  warn: sinon.stub(),
  error: sinon.stub()
};
