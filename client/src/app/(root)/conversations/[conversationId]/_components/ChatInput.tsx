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
import { useRef, useState, MutableRefObject } from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

interface ChatInputProps {
  conversationId: string;
  // forwardRef not needed because you're not trying to pass a DOM ref or a ref for a function component instance
  socketRef: MutableRefObject<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>;
}

const ChatInput = ({ conversationId, socketRef }: ChatInputProps) => {
  // keeps track of the user's message-input state
  const [message, setMessage] = useState("");
  // disable the send button when textarea is empty
  const messageTextIsEmpty = message.trim().length === 0;

  // ref object that points to the textarea component to directly interact and manipulate the component
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

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
  );
};

export default ChatInput;
