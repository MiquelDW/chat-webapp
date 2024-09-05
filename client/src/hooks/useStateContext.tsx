import { StateContext, StateContextType } from "@/components/StateProvider";
import { useContext } from "react";

// custom hook that returns pulled data from the Context object
const useStateContext = (): StateContextType => {
  // use the 'useContext' hook to pull context/data from the Context object 'MessageContext'
  const context = useContext(StateContext);

  if (context === undefined) {
    throw new Error("State must not be empty");
  }

  // return the pulled context/data (object)
  return context;
};

export default useStateContext;
