export interface ListenerEmission {
  client?: Client;
  session?: Session;
  user?: User;
}

type ListenerCallback = (emission: ListenerEmission) => void;
type UnsubscribeCallback = () => void;

export class Clerk {
  public client: Client | undefined;
  public listeners: Array<(emission: ListenerEmission) => void> = [];

  public updateClient(client: Client) {
    this.client = new Client(client.session, client.version);
    // easily check for user referential equality
    window.userRef = this.client.user;
    this.emit();
  }

  public emit = (): void => {
    if (!this.client) {
      return;
    }
    for (const listener of this.listeners) {
      listener({
        client: this.client,
        session: this.client.session,
        user: this.client.user,
      });
    }
  };

  addListener = (listener: ListenerCallback): UnsubscribeCallback => {
    this.listeners.push(listener);
    console.log(`Clerk: we have ${this.listeners.length} listeners`);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  };
}

export class Client {
  get user() {
    return this.session.user;
  }

  constructor(public session: Session, public version: number) {}

  public toString() {
    return `Client version: ${this.version}`;
  }
}

export class Session {
  constructor(public user: User, public version: number) {}

  public toString() {
    return `Session version: ${this.version}`;
  }
}

export class User {
  public createdAt: number;
  constructor(public version: number) {
    this.createdAt = Date.now();
  }

  public toString() {
    return `User version: ${this.version}`;
  }
}
