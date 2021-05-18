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

export const UserSliceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log("UserSliceProvider renders");
  const { user } = useClerk();
  // We got 2 ways to stop a context from propagating down the tree:
  // 1. Use a HOC that returns a new component and pass that value as a prop (so that
  // component is not a context consumer, so it will rerender when props change)
  // 2. Use useMemo and a comparator to decide when to rerender the provider
  //
  // option 1 is not optimal since we cant easily create a "useUser" hook
  return React.useMemo(
    () => (
      <UserSliceContext.Provider value={{ user: user! }}>
        {children}
      </UserSliceContext.Provider>
    ),
    [user]
  );
};

export function useUser() {
  const ctx = React.useContext(UserSliceContext);
  if (!ctx) {
    throw new Error("");
  }
  return ctx.user as User;
}
