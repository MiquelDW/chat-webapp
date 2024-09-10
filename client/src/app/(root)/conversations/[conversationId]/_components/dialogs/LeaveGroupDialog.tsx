"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
// useMutation hook is used to create/update/delete data or perform server side-effects
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
// define a router obj to programmatically redirect users to the given route
import { useRouter } from "next/navigation";
// the useToast hook returns a toast function that you can use to display the 'Toaster' component
import { useToast } from "@/hooks/use-toast";
import { leaveGroup } from "@/data/conversation";

// predefine object structure for given 'props' object
interface LeaveGroupDialogProps {
  conversationId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const LeaveGroupDialog = ({
  conversationId,
  open,
  setOpen,
}: LeaveGroupDialogProps) => {
  const router = useRouter();
  const { toast } = useToast();

  // destructure defined mutation function and the provided 'isPending' var
  const { mutate: leaveGroupConvo, isPending } = useMutation({
    // mutationKey is useful for caching and invalidation
    mutationKey: ["leave-group"],
    // delete the the group conversation and its members and messages
    mutationFn: async () => await leaveGroup(conversationId),
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
        title: "Group deleted!",
        description:
          "You have successfully leaved the group, no further actions are needed.",
        variant: "default",
      });

      // TEST IF THIS WORKS
      // navigate user to the given route
      router.push("/conversations");
    },
  });

  const handleLeaveGroup = async () => {
    // delete the friendship between the current user and its private convo member
    leaveGroupConvo();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You will not be able to see any
            previous messages or send new messages to this group
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLeaveGroup}>
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeaveGroupDialog;
