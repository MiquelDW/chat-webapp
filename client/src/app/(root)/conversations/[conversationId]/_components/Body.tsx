"use client";

import * as z from "zod";
import TextareaAutosize from "react-textarea-autosize";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { useForm } from "react-hook-form";
import { chatMessageSchema } from "@/schemas/zod-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useEffect, MutableRefObject } from "react";
import Message from "./Message";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { useConversation } from "@/hooks/useConversation";

// predefine interface for chat messages
interface Message {
  content: string;
  createdAt: string;
  senderSocketId: string;
}

const Body = () => {
  // retrieve variable that keeps track if user is currently on an active conversation
  const { conversationId } = useConversation();

  // keeps track of the user's message-input state
  const [message, setMessage] = useState("");
  // disable the send button when textarea is empty
  const messageTextIsEmpty = message.trim().length === 0;
  // keeps track of the chat history
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);
  // ref object that points to the textarea component to directly interact and manipulate the component
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // update message history
  const newMessageReceived = (message: Message) => {
    console.log(`Received message: `, message);
    setMessageHistory((oldMessageHistory) => [...oldMessageHistory, message]);
  };

  useEffect(() => {
    const url = `http://localhost:8080`;

    async function fetchMessageHistory() {
      // send HTTP GET request to the /messages endpoint on the server
      // const responseData = await fetch(`${url}/messages/${conversationId}`);
      const responseData = await fetch(`${url}/messages`);
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

  // set up the form with type inference and validation (using zod)
  // zod uses TS to infer the type of the form data based on the 'chatMessageSchema'
  const form = useForm<z.infer<typeof chatMessageSchema>>({
    // validate submitted or changed form data against 'chatMessageSchema'
    resolver: zodResolver(chatMessageSchema),
    // specify initial values for form fields
    defaultValues: {
      content: "",
    },
  });

  // callback function that handles onChange and onClick events of textarea component
  const handleInputChange = (event: any) => {
    setMessage(event.target.value);

    // get the value and the position of the cursor from the textarea component
    const { value, selectionStart } = event.target;
    // update the FormField component "content" with the retrieved 'value'
    if (!selectionStart !== null) form.setValue("content", value);
  };

  // callback function to handle onSubmit form event
  const sendMessage = async (e: any) => {
    // store the sent message by user and reset the "message" state
    const newMessage = message;
    setMessage(``);
    console.log(`Send message`, newMessage);
    // sent / emit the "chat-message" event to the server with the content of "newMessage"
    socketRef.current?.emit(`chat-message`, conversationId, newMessage);
    form.reset();
  };

  return (
    <>
      {/* Messages */}
      <div className="no-scrollbar flex w-full flex-1 flex-col-reverse gap-2 overflow-y-scroll p-3">
        <div className="flex flex-col gap-2">
          {messageHistory.map((message, i) => (
            <Message
              key={i}
              senderSocketId={message.senderSocketId}
              messageContent={message.content}
              createdAt={message.createdAt}
            />
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <Card className="relative w-full rounded-lg p-2">
        <div className="flex w-full items-end gap-2">
          <Form {...form}>
            <form
              className="flex w-full items-end gap-2"
              onSubmit={form.handleSubmit(sendMessage)}
            >
              <FormField
                // manage the state and validation of this form field
                control={form.control}
                // specify which field from the schema it's dealing with
                name="content"
                render={({ field }) => {
                  return (
                    <FormItem className="h-full w-full">
                      <FormControl>
                        <TextareaAutosize
                          className="h-full w-full resize-none border-0 bg-card p-1.5 text-card-foreground outline-0 placeholder:text-muted-foreground"
                          // attach ref object 'textAreaRef' to <textArea> component
                          ref={textAreaRef}
                          // 'field' object contains the necessary props and methods to connect the input field with react-hook-form's state management
                          // causes warning about the 'formState' prop
                          // {...field}
                          value={field.value}
                          name={field.name}
                          onBlur={field.onBlur}
                          rows={1}
                          maxRows={3}
                          placeholder="Type a message..."
                          onKeyDown={async (e) => {
                            if (e.key !== "Enter" || messageTextIsEmpty) {
                              return;
                            }

                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              // returns another function, so call it with "()"
                              await form.handleSubmit(sendMessage)();
                            }
                          }}
                          // add necessary events to handle input changes within this component
                          onChange={handleInputChange}
                          onClick={handleInputChange}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormMessage />

              <Button disabled={messageTextIsEmpty} size="icon" type="submit">
                <SendHorizonal />
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </>
  );
};

export default Body;
