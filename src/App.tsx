import React from "react";
import "./App.css";
import { Clerk, Client, Session, User } from "./clerkClasses";
import {
  ClerkContextProvider,
  useClerk,
  UserSliceProvider,
  useUser,
} from "./clerkContext";
import { updateAll, updateClient, updateSession } from "./updateFunctions";

declare global {
  interface Window {
    Clerk: Clerk;
    userRef: User;
  }
}

const ClerkSingleton = new Clerk();
const v1Client = new Client(new Session(new User(1), 1), 1);
ClerkSingleton.updateClient(v1Client); // similar to Clerk.load
window.Clerk = ClerkSingleton;

function useCount() {
  const ref = React.useRef(0);
  return ++ref.current;
}

function useForceUpdateEvery(n: number) {
  const [state, setState] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setState((a) => a + 1), n);
    return () => clearInterval(id);
  }, []);
  return state;
}

const ComponentWithTimer = () => {
  const renders = useCount();
  const state = useForceUpdateEvery(2000);
  return (
    <pre className="component-container">
      ComponentWithTimer <br />
      --- <br />
      Renders: {renders} <br />
      State: {state}
    </pre>
  );
};

const Indirection: React.FC = ({ children }) => {
  const renders = useCount();
  return (
    <pre className="component-container">
      Indirection renders: {renders} <br />
      {children}
    </pre>
  );
};

function ParentCountRender(props: { parentName: string }) {
  const renders = useCount();
  return (
    <div>
      {props.parentName} render count: {renders}
    </div>
  );
}

function ComponentWithNoHooks() {
  const renders = useCount();
  return (
    <pre className="component-container">
      Component no hooks <br />
      --- <br />
      Renders: {renders}
    </pre>
  );
}

function ClientComponent() {
  const renders = useCount();
  const clerk = useClerk();
  return (
    <pre className="component-container">
      Client <br />
      --- <br />
      Renders: {renders} <br />
      Version: {clerk.client?.version}
    </pre>
  );
}

function UserComponentClerkContext() {
  const renders = useCount();
  const { client } = useClerk();
  const user = client!.user;
  return (
    <pre className="component-container">
      User (clerk context)
      <br />
      --- <br />
      Renders: {renders} <br />
      Version: {user.version} <br />
      SameAsWindow: {user === window.userRef ? "true" : "false"}
    </pre>
  );
}

function UserComponentUserContext() {
  const renders = useCount();
  const user = useUser();
  return (
    <pre className="component-container">
      User (user context)
      <br />
      --- <br />
      Renders: {renders} <br />
      Version: {user.version} <br />
      CreatedAt: {user.createdAt} <br />
      SameAsWindow: {user === window.userRef ? "true" : "false"}
    </pre>
  );
}

function App() {
  return (
    <>
      <ParentCountRender parentName="App" />
      <ClerkContextProvider>
        <ParentCountRender parentName="ClerkContextProvider" />
        <UserSliceProvider>
          <ParentCountRender parentName="UserSliceProvider" />
          <div className="App component-container">
            <h2>
              Refresh window before testing to clear any leftover state, timers
              etc
            </h2>
            <div className="button-container">
              <button onClick={updateAll}>
                update user + session + client
              </button>
              <button onClick={updateSession}>update session + client</button>
              <button onClick={updateClient}>update client</button>
            </div>
            <ComponentWithTimer />
            <Indirection>
              <ComponentWithNoHooks />
              <ComponentWithTimer />
              <ClientComponent />
              <UserComponentClerkContext />
              <UserComponentUserContext />
            </Indirection>
          </div>
        </UserSliceProvider>
      </ClerkContextProvider>
    </>
  );
}

export default App;
