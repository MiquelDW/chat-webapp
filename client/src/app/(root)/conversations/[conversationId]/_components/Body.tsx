"use client";

import {
  useRef,
  useState,
  useEffect,
  MutableRefObject,
  useTransition,
} from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { Message } from "@prisma/client";
import ChatInput from "./ChatInput";
import { getMessages } from "@/data/messages";
import { Loader2 } from "lucide-react";

// predefine object structure for the given 'props' object
interface BodyProps {
  conversationId: string;
  otherMembers: {
    lastSeenMessageId?: string | null;
    username?: string;
    // use index signature to tell TS that 'otherMembers' obj can have any number of properties, each with a key of type any
    // index signatures allow you to define the types of properties for an object when you don't know the exact prop names
    [key: string]: any;
  }[];
}

const Body = ({ conversationId, otherMembers }: BodyProps) => {
  // 'isPending' keeps track of whether a transition is currently running
  const [isPending, startTransition] = useTransition();
  // keeps track of the chat history
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  console.log(messageHistory);

  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);

  // update message history
  const newMessageReceived = (message: Message) => {
    console.log(`Received message: `, message);
    setMessageHistory((oldMessageHistory) => [...oldMessageHistory, message]);
  };

  useEffect(() => {
    async function fetchMessageHistory() {
      const messages = await getMessages(conversationId);
      setMessageHistory(
        messages.map((message) => {
          return message.message;
        })
      );
    }
    // fetch all messages of the given conversation with loading state
    startTransition(() => {
      fetchMessageHistory();
    });

    // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
    socketRef.current = getSocket();
    // sent / emit the "joinRoom" event to the server with the given "conversationId"
    socketRef.current.emit("joinRoom", conversationId);
    // listens for "roomMessage" event and calls callback function after the event occured (message received)
    socketRef.current.on("roomMessage", newMessageReceived);

    return () => {
      // remove event listener for the "roomMessage" event
      socketRef.current?.off("roomMessage", newMessageReceived);
    };
  }, []);

  return isPending ? (
    // show spinner while conversation data is being loaded in
    <div className="flex h-full w-full items-center justify-center gap-2">
      <p>Loading messages...</p>
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : messageHistory === null ? (
    // conversation doesn't exist
    <div className="flex h-full w-full items-center justify-center">
      Messages not found
    </div>
  ) : (
    <>
      {/* Messages */}
      <div className="no-scrollbar flex w-full flex-1 flex-col-reverse gap-2 overflow-y-scroll p-3">
        <div className="flex flex-col gap-2">
          {messageHistory.map((message, i) => (
            // <Message
            //   key={i}
            //   senderSocketId={message.senderSocketId}
            //   messageContent={message.content}
            //   createdAt={message.createdAt}
            // />
            <p key={i}>{message.content}</p>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput conversationId={conversationId} socketRef={socketRef} />
    </>
  );
};

export default Body;
