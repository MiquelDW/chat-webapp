"use client";

import { getConversations } from "@/data/conversation";
import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import useStateContext from "./useStateContext";
import { countRequests } from "@/data/requests";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

const useNavigation = () => {
  const [_, startTransition] = useTransition();
  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);
  // state variable keeps track of all active coversations of current user
  const { conversations, setConversations } = useStateContext();
  // state variable keeps track of number of received friend requests
  const [requestsCount, setRequestsCount] =
    useState<Awaited<ReturnType<typeof countRequests>>>();

  useEffect(() => {
    async function fetchRequestsCount() {
      const requestsCount = await countRequests();
      setRequestsCount(requestsCount);
    }
    async function fetchAllConversations() {
      const conversationsData = await getConversations();
      setConversations(conversationsData);
    }
    // run async functions in parallel with loading state
    startTransition(async () => {
      await Promise.all([fetchAllConversations(), fetchRequestsCount()]);
    });

    // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
    socketRef.current = getSocket();
    // listens for given events and calls callback function after a event occured
    socketRef.current?.on("friend-request", fetchRequestsCount);
    socketRef.current?.on("delete-friend-request", fetchRequestsCount);
    socketRef.current?.on("updated-conversation-member", fetchAllConversations);

    return () => {
      // remove given event listener
      socketRef.current?.off("friend-request", fetchRequestsCount);
      socketRef.current?.off("delete-friend-request", fetchRequestsCount);
      socketRef.current?.off(
        "updated-conversation-member",
        fetchAllConversations
      );
    };
  }, []);

  // retrieve the current pathname
  const pathname = usePathname();

  // reduce array to a single value by accumulating the count of unseen messages
  const unseenMessagesCount = useMemo(() => {
    return conversations?.reduce((acc, currConvo) => {
      return acc + currConvo.unseenMessagesCount;
    }, 0);
  }, [conversations]);

  // determine array of (up-to-date) path objects
  const paths = useMemo(() => {
    // console.log("useMemo");
    // console.log(unseenMessagesCount);
    return [
      {
        name: "Conversations",
        href: "/conversations",
        icon: <MessageSquare />,
        active: pathname.startsWith("/conversations"),
        count: unseenMessagesCount,
      },
      {
        name: "Friends",
        href: "/friends",
        icon: <Users />,
        active: pathname === "/friends",
        count: requestsCount,
      },
    ];
  }, [pathname, requestsCount, unseenMessagesCount]);

  return paths;
};

export default useNavigation;
