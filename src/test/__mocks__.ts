import sinon from 'sinon';

interface HttpResMock {
  end: sinon.SinonStub
  writeStatus: sinon.SinonStub
}
export const httpResMock: HttpResMock = {
  end: sinon.stub(),
  writeStatus: sinon.stub()
};
