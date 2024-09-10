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
// the useToast hook returns a toast function that you can use to display the 'Toaster' component
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
// useMutation hook is used to create/update/delete data or perform server side-effects
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
// define a router obj to programmatically redirect users to the given route
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { deleteGroup } from "@/data/conversation";

// predefine object structure for given 'props' object
interface DeleteGroupDialogProps {
  conversationId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const DeleteGroupDialog = ({
  conversationId,
  open,
  setOpen,
}: DeleteGroupDialogProps) => {
  const router = useRouter();
  const { toast } = useToast();

  // destructure defined mutation function and the provided 'isPending' var
  const { mutate: deleteGroupConvo, isPending } = useMutation({
    // mutationKey is useful for caching and invalidation
    mutationKey: ["delete-group"],
    // delete the the group conversation and its members and messages
    mutationFn: async () => await deleteGroup(conversationId),
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
          "Group chat has been successfully deleted, no further actions are needed.",
        variant: "default",
      });
      // navigate user to the given route
      router.push("/conversations");
    },
  });

  const handleDeleteGroup = async () => {
    // delete the friendship between the current user and its private convo member
    deleteGroupConvo();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All messages will be deleted and you
            will not be able to message this group.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteGroup()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGroupDialog;
