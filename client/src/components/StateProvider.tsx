"use client";

import React, { createContext, useState } from "react";

// define type of the retrieved friend request details
type RequestDetailsType = {
  sender: {
    id: string;
    createdAt: Date;
    email: string;
    updatedAt: Date;
    imageUrl: string;
    username: string;
  };
  request: {
    id: string;
    receiverId: string;
    createdAt: Date;
    senderId: string;
  };
};

// define type to predefine object structure for the Context object
export interface StateContextType {
  requestsHistory: RequestDetailsType[];
  setRequestsHistory: React.Dispatch<
    React.SetStateAction<RequestDetailsType[]>
  >;
}

// Context object for sharing data without props & prop drilling
// the Context object is of union type 'StateContextType'
export const StateContext = createContext<StateContextType | undefined>(
  undefined
);

// provider component that provides the filled Context object to its children
export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  // state variable keeps track of all requests sent to the current user
  const [requestsHistory, setRequestsHistory] = useState<RequestDetailsType[]>(
    []
  );

  return (
    // the Provider component fills the Context object with data / context in 'value' and makes the given data inside the Context object accessible to child components (children), which they can request with useContext hook
    <StateContext.Provider value={{ requestsHistory, setRequestsHistory }}>
      {children}
    </StateContext.Provider>
  );
};
