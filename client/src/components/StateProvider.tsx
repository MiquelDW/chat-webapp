"use client";

import { getConversations } from "@/data/conversation";
import { getRequests } from "@/data/requests";
import React, { createContext, useState } from "react";

// define types for the shared state variables
type Conversations = Awaited<ReturnType<typeof getConversations>>;
type RequestsHistory = Awaited<ReturnType<typeof getRequests>>;

// define type to predefine object structure for the Context object
export interface StateContextType {
  requestsHistory: RequestsHistory;
  setRequestsHistory: React.Dispatch<React.SetStateAction<RequestsHistory>>;
  conversations: Conversations;
  setConversations: React.Dispatch<React.SetStateAction<Conversations>>;
}

// Context object for sharing data without props & prop drilling
// the Context object is of union type 'StateContextType'
export const StateContext = createContext<StateContextType | undefined>(
  undefined
);

// provider component that provides the filled Context object to its children
export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  // state variable keeps track of all requests sent to the current user
  const [requestsHistory, setRequestsHistory] = useState<RequestsHistory>([]);
  // state variable keeps track of all active conversations of the current user
  const [conversations, setConversations] = useState<Conversations>([]);

  return (
    // the Provider component fills the Context object with data / context in 'value' and makes the given data inside the Context object accessible to child components (children), which they can request with useContext hook
    <StateContext.Provider
      value={{
        requestsHistory,
        setRequestsHistory,
        conversations,
        setConversations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
