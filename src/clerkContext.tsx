import React from "react";
import { Client, Session, User } from "./clerkClasses";

type ClerkContextValue = {
  client?: Client;
  session?: Session;
  user?: User;
};
const ClerkContext =
  React.createContext<ClerkContextValue | undefined>(undefined);

type ClerkContextProviderProps = {
  children: React.ReactNode;
};

// This is similar to our ClerkCoreContext
// instead of the Clerk singleton it emits the
// 3 resources but does not include any methods
// Emitting Clerk should be more or less the same
export function ClerkContextProvider({
  children,
}: ClerkContextProviderProps): JSX.Element {
  const ClerkSingleton = window.Clerk;
  if (!ClerkSingleton) {
    throw new Error("no clerk");
  }

  const [state, setState] = React.useState<ClerkContextValue>({
    client: window.Clerk.client!,
    session: window.Clerk.client!.session,
    user: window.Clerk.client!.user,
  });

  React.useEffect(() => {
    return ClerkSingleton.addListener((e) => {
      setState(e);
    });
  }, []);

  return (
    <ClerkContext.Provider value={state}>{children}</ClerkContext.Provider>
  );
}

export function useClerk() {
  const ctx = React.useContext(ClerkContext);
  if (!ctx) {
    throw new Error("");
  }
  return ctx;
}

type UserSliceValue = { user: User };
const UserSliceContext =
  React.createContext<UserSliceValue | undefined>(undefined);
UserSliceContext.displayName = "UserSliceContext";

//
export function withUserSlice<P extends { user: User }>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, "user">> {
  console.log("withUserSlice outer");

  return (props: Omit<P, "user">) => {
    console.log("withUserSlice inner");
    const { user } = useClerk();
    return React.useMemo(
      () => <WrappedComponent {...(props as P)} user={user} />,
      [user]
    );
  };
}

export const UserSliceProvider = withUserSlice(({ user, children }) => {
  console.log("UserSliceProvider renders");
  return (
    <UserSliceContext.Provider value={{ user }}>
      {children}
    </UserSliceContext.Provider>
  );
});

export function useUser() {
  const ctx = React.useContext(UserSliceContext);
  if (!ctx) {
    throw new Error("");
  }
  return ctx.user as User;
}
