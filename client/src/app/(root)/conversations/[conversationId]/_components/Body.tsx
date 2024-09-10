"use client";

import {
  useRef,
  useState,
  useEffect,
  MutableRefObject,
  useTransition,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { ConversationMember, Message as MessagePrisma } from "@prisma/client";
import ChatInput from "./ChatInput";
import { getMessages, markRead } from "@/data/messages";
import { Loader2 } from "lucide-react";
import Message from "./Message";
// useMutation hook is used to create/update/delete data or perform server side-effects
import { useMutation } from "@tanstack/react-query";
// the useToast hook returns a toast function that you can use to display the 'Toaster' component
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  // 'isPending' keeps track of whether a transition is currently running
  const [isPending, startTransition] = useTransition();
  // keeps track of the chat history
  const [messageHistory, setMessageHistory] = useState<
    Awaited<ReturnType<typeof getMessages>>
  >([]);
  // ref object that stores a persistent WebSocket connection
  let socketRef: MutableRefObject<Socket | null> = useRef(null);

  const newReceivedMessage = async (message: MessagePrisma) => {
    // update message history
    // possible improvement for all event callback functions: update state variable with received value from server instead of refetching here
    console.log(`Received message: `, message);
    setMessageHistory(await getMessages(message.conversationId));
  };

  useEffect(() => {
    async function fetchMessageHistory() {
      setMessageHistory(await getMessages(conversationId));
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
    socketRef.current.on("roomMessage", newReceivedMessage);

    return () => {
      // remove event listener for the "roomMessage" event
      socketRef.current?.off("roomMessage", newReceivedMessage);
    };
  }, []);

  // destructure defined mutation function
  const { mutate: markMessageAsRead } = useMutation({
    // mutationKey is useful for caching and invalidation
    mutationKey: ["mark-message-read"],
    // mark the last message in the current conversation as read by the current user
    mutationFn: async ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => await markRead(conversationId, messageId),
    // fire this func if an error occurs during execution of mutation function
    onError: (err) => {
      toast({
        title: "Something went wrong",
        description: `${
          err ? err.message : "There was an error on our end. Please try again."
        }`,
        variant: "destructive",
      });
    },
  });

  // whenever the user opens a conversation, mark the last message sent in the convo (messageDB[0]) as read by that current user
  // also mark the last message sent as read by the current user if a new message is added to the convo (dependency array)
  useEffect(() => {
    if (messageHistory && messageHistory.length > 0) {
      markMessageAsRead({
        conversationId: conversationId,
        messageId: messageHistory[0].message.id,
      });
    }
  }, [
    messageHistory,
    messageHistory.length,
    conversationId,
    markMessageAsRead,
  ]);

  // checks if other convo-member(s) have seen the given message sent by the current user
  const getSeenMessage = (messageId: string) => {
    // retrieve only the other convo-member(s) whose "last message seen" matches the given message sent by the current user
    const seenUsers = otherMembers
      .filter((member) => {
        // console.log(member.lastSeenMessageId);
        return member.lastSeenMessageId === messageId;
      })
      .map((member) => member.username!.split(" ")[0]);

    if (seenUsers.length === 0) return undefined;

    // return formatted HTML element with the other convo-member(s) that have seen the given message sent by the current user
    return formatSeenBy(seenUsers);
  };

  const formatSeenBy = (otherMembersUsernames: string[]) => {
    switch (otherMembersUsernames.length) {
      case 1:
        return (
          <p className="text-right text-sm text-muted-foreground">{`Seen by ${otherMembersUsernames[0]}`}</p>
        );
      case 2:
        return (
          <p className="text-right text-sm text-muted-foreground">{`Seen by ${otherMembersUsernames[0]} and ${otherMembersUsernames[1]}`}</p>
        );
      default:
        return (
          <Tooltip>
            {/* button that toggles the tooltip when you hover over it */}
            <TooltipTrigger
            // change the default rendered element to the one passed as a child, merging their props and behavior (prevents Hydration Error in this case)
            >
              <p className="text-right text-sm text-muted-foreground">{`Seen by ${
                otherMembersUsernames[0]
              }, ${otherMembersUsernames[1]}, and ${
                otherMembersUsernames.length - 2
              } more`}</p>
            </TooltipTrigger>

            {/* this component pops out when the tooltip is open */}
            <TooltipContent sideOffset={4} align="end">
              <ul>
                {otherMembersUsernames.map((username, index) => {
                  return <li key={index}>{username}</li>;
                })}
              </ul>
            </TooltipContent>
          </Tooltip>
        );
    }
  };

  return isPending ? (
    // show spinner while conversation data is being loaded in
    <div className="flex h-full w-full items-center justify-center gap-2">
      <p>Loading messages...</p>
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : (
    <>
      {/* Messages from db */}
      <div className="no-scrollbar flex w-full flex-1 flex-col-reverse gap-2 overflow-y-scroll p-3">
        <div className="flex flex-col-reverse gap-2">
          {messageHistory.map(
            ({ message, senderImage, senderName, isCurrentUser }, i) => {
              // check if someone sent its last consecutive messages within the convo
              /* EXAMPLE:
                 if senderId of message at index 1 === user_123
                 if sender of message at index 2 === user_123
                 ...then it's NOT the last consecutive message sent (false)

                 if senderId of message at index 2 === user_123
                 if senderId of message at index 3 === user_456
                 ...then it's the last consecutive message sent by a user in convo (true)
              */

              const lastByUser =
                messageHistory[i - 1]?.message.senderId !==
                messageHistory[i].message.senderId;

              // retrieve only the other convo-member(s) whose "last message seen" matches the given message sent by the current user
              const seenMessage = isCurrentUser
                ? getSeenMessage(message.id)
                : undefined;
              // console.log(seenMessage);

              return (
                <Message
                  key={message.id}
                  fromCurrentUser={isCurrentUser}
                  senderImage={senderImage}
                  senderName={senderName}
                  lastByUser={lastByUser}
                  content={message.content}
                  createdAt={message.createdAt}
                  type={message.type}
                  seen={seenMessage}
                />
              );
            }
          )}
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput conversationId={conversationId} />
    </>
  );
};

export default Body;
