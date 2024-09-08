"use client";

// import { queryClient } from "@/components/QCProvider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AvatarFallback } from "@radix-ui/react-avatar";
// useMutation hook is used to create/update/delete data or perform server side-effects
import { useMutation } from "@tanstack/react-query";
import { Check, User, X } from "lucide-react";
import { MutableRefObject, useEffect } from "react";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Socket } from "socket.io-client";
import useStateContext from "@/hooks/useStateContext";
import { acceptRequest, denyRequest, getRequests } from "@/data/requests";

interface RequestProps {
  reqId: string;
  imageUrl: string;
  username: string;
  email: string;
  socketRef: MutableRefObject<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>;
}

const Request = ({
  reqId,
  imageUrl,
  username,
  email,
  socketRef,
}: RequestProps) => {
  const { toast } = useToast();
  // updates request history state
  const { setRequestsHistory } = useStateContext();

  // update request history state
  const updateRequests = async () => {
    const requestsData = await getRequests();
    setRequestsHistory(requestsData);
  };

  useEffect(() => {
    socketRef.current?.on("delete-friend-request", updateRequests);

    return () => {
      // remove event listener for the "friend-request" event
      socketRef.current?.off("delete-friend-request", updateRequests);
    };
  }, []);

  // destructure defined mutation function and the provided 'isPending' var
  const { mutate: denyFriendRequest, isPending: denyPending } = useMutation({
    // mutationKey is useful for caching and invalidation
    mutationKey: ["deny-request"],
    // deny received friend request
    mutationFn: async (reqId: string) => {
      await denyRequest(reqId);
    },
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
    // fire this func if mutation function has successfully completed
    onSuccess: () => {
      toast({
        title: "Friend request denied!",
        description:
          "Request has been successfully denied, no further actions are needed.",
        variant: "default",
      });
    },
  });

  // destructure defined mutation function and the provided 'isPending' var
  const { mutate: acceptFriendRequest, isPending: acceptPending } = useMutation(
    {
      // mutationKey is useful for caching and invalidation
      mutationKey: ["accept-request"],
      // accept a friend request and start a private conversation
      mutationFn: async (reqId: string) => await acceptRequest(reqId),
      // fire this func if an error occurs during execution of mutation function
      onError: (err) => {
        toast({
          title: "Something went wrong",
          description: `${
            err
              ? err.message
              : "There was an error on our end. Please try again."
          }`,
          variant: "destructive",
        });
      },
      // fire this func if mutation function has successfully completed
      onSuccess: () => {
        toast({
          title: "Friend request accepted!",
          description:
            "Request has been successfully accepted, have fun chatting!",
          variant: "default",
        });

        // invalidate every query with a key that starts with the given value
        // queryClient.invalidateQueries({ queryKey: ["get-all-requests"] });
        // queryClient.invalidateQueries({ queryKey: ["get-requests-count"] });
        // queryClient.invalidateQueries({ queryKey: ["get-all-conversations"] });
        // queryClient.invalidateQueries({
        //   queryKey: ["get-individual-conversation"],
        // });
      },
    }
  );

  return (
    <Card className="flex w-full items-center justify-between gap-2 p-2">
      <div className="flex items-center gap-4 truncate">
        <Avatar>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col truncate">
          <h4 className="truncate">{username}</h4>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          disabled={denyPending || acceptPending}
          onClick={() => acceptFriendRequest(reqId)}
          className="h-8 w-8"
        >
          <Check className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          disabled={denyPending || acceptPending}
          variant="destructive"
          onClick={() => denyFriendRequest(reqId)}
          className="h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};

export default Request;
