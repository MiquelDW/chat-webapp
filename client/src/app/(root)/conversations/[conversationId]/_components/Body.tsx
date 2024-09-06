"use client";

import { useRef, useState, useEffect, MutableRefObject } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { useConversation } from "@/hooks/useConversation";
import { Message } from "@prisma/client";
import ChatInput from "./ChatInput";

const Body = () => {
  // retrieve variable that keeps track if user is currently on an active conversation
  const { conversationId } = useConversation();
  // keeps track of the chat history
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);

  // update message history
  const newMessageReceived = (message: Message) => {
    console.log(`Received message: `, message);
    setMessageHistory((oldMessageHistory) => [...oldMessageHistory, message]);
  };

  useEffect(() => {
    const url = `http://localhost:8080`;

    async function fetchMessageHistory() {
      // send HTTP GET request to the /messages endpoint on the server
      const responseData = await fetch(`${url}/messages/${conversationId}`);
      // const responseData = await fetch(`${url}/messages`);
      // retireve response object and convert it to JSON format and then update state variable 'messageHistory'
      const response = await responseData.json();
      setMessageHistory(response);
    }
    fetchMessageHistory();

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

  return (
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
