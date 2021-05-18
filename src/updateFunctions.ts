import { Client, Session, User } from "./clerkClasses";

export const updateAll = () => {
  const newUser = new User(window.Clerk.client!.user.version + 1);
  const newSession = new Session(
    newUser,
    window.Clerk.client!.session.version + 1
  );
  const newClient = new Client(newSession, window.Clerk.client!.version + 1);
  window.Clerk.updateClient(newClient);
};

export const updateClient = () => {
  const newClient = new Client(
    window.Clerk.client!.session,
    window.Clerk.client!.version + 1
  );
  window.Clerk.updateClient(newClient);
};

export const updateSession = () => {
  const newSession = new Session(
    window.Clerk.client!.user,
    window.Clerk.client!.session.version + 1
  );
  const newClient = new Client(newSession, window.Clerk.client!.version + 1);
  window.Clerk.updateClient(newClient);
};
