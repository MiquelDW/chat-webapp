"use client";

import { useState, useEffect, useRef, MutableRefObject } from "react";
import { io, Socket } from "socket.io-client";

// predefine interface for chat messages
interface Message {
  text: string;
  createdAt: string;
  senderSocketId: string;
}

const Conversation = () => {
  // keeps track of the user's message-input state
  const [message, setMessage] = useState("");
  // keeps track of the chat history
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  // create a persistent reference for storing a WebSocket connection that doesn't trigger re-renders when updated
  let socketRef: MutableRefObject<Socket | null> = useRef(null);

  // update message history
  const newMessageReceived = (message: Message) => {
    console.log(`Received message: `, message);
    setMessageHistory((oldMessageHistory) => [...oldMessageHistory, message]);
  };

  useEffect(() => {
    const url = `http://localhost:8080`;

    async function fetchMessageHistory() {
      // send HTTP GET request to the /api/messages endpoint on the server
      const responseData = await fetch(`${url}/api/messages`);
      // retireve response object and convert it to JSON format and then update state variable 'messageHistory'
      const response = await responseData.json();
      setMessageHistory(response);
    }
    fetchMessageHistory();

    // initialize new WebSockets connection to the given url using Socket.IO
    socketRef.current = io(url);
    // listens for "chat-message" event and calls callback function after the event occured (message received)
    socketRef.current.on("chat-message", newMessageReceived);

    return () => {
      // remove event listener for the "chat-message" event
      socketRef.current?.off("chat-message", newMessageReceived);
    };
  }, []);

  // callback function to handle onSubmit form event
  const sendMessage = async (e: any) => {
    e.preventDefault();
    // store the sent message by user and reset the "message" state
    const newMessage = message;
    setMessage(``);
    console.log(`Send message`, newMessage);
    // sent / emit the "chat-message" event to the server with the content of "newMessage"
    socketRef.current?.emit(`chat-message`, newMessage);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-100">
      <div className="w-full md:w-2/3 lg:w-1/2 bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-y-auto max-h-[70vh]">
          {messageHistory.map((message, i) => (
            <div key={i} className="mb-4 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  {message.senderSocketId}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-800">{message.text}</p>
            </div>
          ))}
        </div>
      </div>

      <form
        id="text-input-container"
        className="py-4 px-2 w-full flex items-center justify-center"
        onSubmit={sendMessage}
      >
        <div className="bg-white w-full md:w-2/3 lg:w-1/2 px-3 py-2 flex gap-3 rounded-xl shadow-lg">
          <input
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            id="message"
            className="focus:outline-none px-2 flex-1 rounded-xl border border-gray-300"
            type="text"
            placeholder="What do you want to say?"
            autoComplete="off"
          />
          <button
            type="submit"
            className="rounded-xl px-3 py-2 bg-blue-600 text-white text-sm"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
};

export default Conversation;
