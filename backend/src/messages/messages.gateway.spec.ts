import { MessagesGateway } from './messages.gateway';

describe('MessagesGateway auth', () => {
  const jwt = { verify: jest.fn() };
  const blocks = { isBlocked: jest.fn() };
  const gateway = new MessagesGateway({} as any, jwt as any, blocks as any);

  const makeClient = (token?: string) => ({
    id: 's1',
    userId: undefined as number | undefined,
    handshake: { auth: token ? { token } : {}, headers: {} },
    emit: jest.fn(),
    disconnect: jest.fn(),
  });

  beforeEach(() => jest.clearAllMocks());

  it('disconnects a client with an invalid token', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    const client = makeClient('bad');
    gateway.handleConnection(client as any);
    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(client.userId).toBeUndefined();
  });

  it('takes userId from the token, not from the join payload', () => {
    jwt.verify.mockReturnValue({ sub: 7 });
    const client = makeClient('good');
    gateway.handleConnection(client as any);
    expect(client.userId).toBe(7);
    gateway.handleJoin(client as any);
    expect(client.emit).toHaveBeenCalledWith('joined', { userId: 7 });
  });

  it('refuses join for an unauthenticated socket', () => {
    const client = makeClient();
    gateway.handleJoin(client as any);
    expect(client.emit).toHaveBeenCalledWith('error', { message: 'Not authenticated' });
  });
});
