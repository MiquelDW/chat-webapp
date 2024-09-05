"use client";

import * as z from "zod";
// hook that handles form state and validation
import { useForm } from "react-hook-form";
// resolver function validates the form data against the defined schema whenever the form is submitted or its values change
import { zodResolver } from "@hookform/resolvers/zod";
import { addFriendFormSchema } from "@/schemas/zod-schemas";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// the useToast hook returns a toast function that you can use to display the 'Toaster' component
import { useToast } from "@/hooks/use-toast";
// useMutation hook is used to create/update/delete data or perform server side-effects
// import { useMutation } from "@tanstack/react-query";
// import { createRequest } from "@/data/requests";
// import { queryClient } from "@/components/QCProvider";

const AddFriendDialog = () => {
  const { toast } = useToast();

  // set up the form with type inference and validation (using zod)
  // zod uses TS to infer the type of the form data based on the 'addFriendFormSchema'
  const form = useForm<z.infer<typeof addFriendFormSchema>>({
    // validate submitted or changed form data against 'addFriendFormSchema'
    resolver: zodResolver(addFriendFormSchema),
    // specify initial values for form fields
    defaultValues: {
      email: "",
    },
  });

  // callback function that handles the onSubmit event of form
  const handleSubmit = (values: z.infer<typeof addFriendFormSchema>) => {
    // create and sent friend request to the given 'email'
    // createFriendRequest(values);
    form.reset();
  };

  return (
    <Dialog>
      <Tooltip>
        {/* button that toggles the tooltip when you hover over it */}
        <TooltipTrigger
          // change the default rendered element to the one passed as a child, merging their props and behavior (prevents Hydration Error in this case)
          asChild
        >
          <DialogTrigger
            // same here
            asChild
          >
            <Button size="icon" variant="outline">
              <UserPlus />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>

        {/* this component pops out when the tooltip is open */}
        <TooltipContent side="bottom" align="center">
          <p>Add Friend</p>
        </TooltipContent>
      </Tooltip>

      {/* this component pops out when the Dialog is open */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-1">Add Friend</DialogTitle>
          <DialogDescription>
            Send a request to connect with your friends!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              // manage the state and validation of this form field
              control={form.control}
              // specify which field from the schema it's dealing with
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      // 'field' object contains the necessary props and methods to connect the input field with react-hook-form's state management
                      {...field}
                      // disabled={isPending}
                      placeholder="john.doe@example.com"
                      className="text-[15px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-2">
              <Button
                type="submit"
                // disabled={isPending}
              >
                {/* {isPending ? "Sending..." : "Send"} */}
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
