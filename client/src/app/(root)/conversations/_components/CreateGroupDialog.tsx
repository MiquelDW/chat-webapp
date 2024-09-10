import * as z from "zod";
// hook that handles form state and validation
import { useForm } from "react-hook-form";
// resolver function validates the form data against the defined schema whenever the form is submitted or its values change
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupFormSchema } from "@/schemas/zod-schemas";
// useMutation hook is used to create/update/delete data or perform server side-effects
// this hook is used for fetching and caching data from a server
// use this hook when you want to fetch data that is primarily read-only, such as getting a list of items, details of a single item, etc
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/components/QCProvider";
import { getAllFriends } from "@/data/friends";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CirclePlus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Card } from "@/components/ui/card";
// the useToast hook returns a toast function that you can use to display the 'Toaster' component
import { useToast } from "@/hooks/use-toast";
import { createGroup } from "@/data/conversation";
// define a router obj to programmatically redirect users to the given route
import { useRouter } from "next/navigation";

const CreateGroupDialog = () => {
  const router = useRouter();
  const { toast } = useToast();

  // destructure all retrieved friends of current user from the query function
  const { data: friends } = useQuery({
    // queryKey is useful for caching and invalidation
    queryKey: ["get-all-friends"],
    // query function retrieves all friends of the current user
    queryFn: async () => await getAllFriends(),
  });

  // set up the form with type inference and validation (using zod)
  // zod uses TS to infer the type of the form data based on the 'createGroupFormSchema'
  const form = useForm<z.infer<typeof createGroupFormSchema>>({
    // validate submitted or changed form data against 'createGroupFormSchema'
    resolver: zodResolver(createGroupFormSchema),
    // specify initial values for form fields
    defaultValues: {
      name: "",
      members: [],
    },
  });

  // keep track of the state of the "members" form field (selected friends)
  const members = form.watch("members", []);

  // keep track of unselected members/friends
  const unselectedFriends = useMemo(() => {
    // only keep the friends that are NOT selected in the "members" form field
    return friends
      ? friends.filter((friend) => !members.includes(friend.id))
      : [];
  }, [members.length, friends?.length]);

  // destructure defined mutation function and the provided 'isPending' var
  const { mutate: createGroupConvo, isPending } = useMutation({
    // mutationKey is useful for caching and invalidation
    mutationKey: ["create-group-conversation"],
    // function creates a group convo with the selected friends by the current user
    mutationFn: async (values: z.infer<typeof createGroupFormSchema>) =>
      await createGroup(values),
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
        title: "Group created!",
        description:
          "Group conversation successfully created, have fun chatting!",
        variant: "default",
      });
    },
  });

  // callback function to handle onSubmit event of form
  const handleSubmit = async (
    values: z.infer<typeof createGroupFormSchema>
  ) => {
    // return toast error if current user didn't select friends yet
    if (!members || members.length === 0)
      toast({
        title: "Something went wrong",
        description: "Add friends to create a group conversation",
        variant: "destructive",
      });
    // create a group convo with the selected friends by the current user
    else createGroupConvo(values);
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
              <CirclePlus />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>

        {/* this component pops out when the tooltip is open */}
        <TooltipContent
          side="bottom"
          className="z-40 rounded-lg bg-white p-1 text-[15px] text-black shadow-sm ring-1 ring-black/10"
          sideOffset={4}
          align="center"
        >
          <p>Create Group</p>
        </TooltipContent>
      </Tooltip>

      {/* this component pops out when the Dialog is open */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-1">Create group</DialogTitle>
          <DialogDescription>
            Add your friends to get started!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 overflow-x-auto p-1"
          >
            <FormField
              // manage the state and validation of this form field
              control={form.control}
              // specify which field from the schema it's dealing with
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Name</FormLabel>
                  <FormControl>
                    <Input
                      // 'field' object contains the necessary props and methods to connect the input field with react-hook-form's state management
                      {...field}
                      disabled={isPending}
                      placeholder="Group name..."
                      className="text-[15px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              // manage the state and validation of this form field
              control={form.control}
              // specify which field from the schema it's dealing with
              name="members"
              // you can't use "field" object on this custom component
              render={() => {
                return (
                  <FormItem>
                    <FormLabel className="text-base">Friends</FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        {/* button that triggers the dropdown menu */}
                        <DropdownMenuTrigger
                          // change the default rendered element to the one passed as a child, merging their props and behavior
                          asChild
                          // if all friends are selected, disable trigger
                          disabled={unselectedFriends.length === 0}
                        >
                          <Button className="w-full" variant="outline">
                            Select friends
                          </Button>
                        </DropdownMenuTrigger>

                        {/* this component pops out when the dropdown menu is triggered */}
                        <DropdownMenuContent align="center" className="w-full">
                          {unselectedFriends.map((unselectedFriend) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={unselectedFriend.id}
                                className="flex w-full items-center gap-2 p-2"
                                // update the state of "members" form field with the current selected friends + clicked friend
                                onCheckedChange={(checked) => {
                                  // console.log(checked);
                                  if (checked)
                                    form.setValue("members", [
                                      ...members,
                                      unselectedFriend.id,
                                    ]);
                                }}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={unselectedFriend.imageUrl}
                                  />
                                  <AvatarFallback>
                                    {unselectedFriend.username.substring(0, 1)}
                                  </AvatarFallback>
                                </Avatar>

                                <h4 className="truncate">
                                  {unselectedFriend.username}
                                </h4>
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* render out the friends that have been selected by the user */}
            {members && members.length ? (
              <Card className="scrollbar scrollbar-thumb scrollbar-hidden flex h-24 w-full items-center gap-3 overflow-x-auto p-2">
                {friends
                  ?.filter((friend) => members.includes(friend.id))
                  .map((selectedFriend) => {
                    return (
                      <div
                        key={selectedFriend.id}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="relative flex flex-col items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedFriend.imageUrl} />
                            <AvatarFallback>
                              {selectedFriend.username.substring(0, 1)}
                            </AvatarFallback>
                          </Avatar>

                          <X
                            className="absolute bottom-11 left-12 h-4 w-4 cursor-pointer rounded-full bg-muted text-muted-foreground"
                            // remove clicked friend from selected "members" array
                            onClick={() =>
                              form.setValue(
                                "members",
                                members.filter(
                                  (currentMemberId) =>
                                    currentMemberId !== selectedFriend.id
                                )
                              )
                            }
                          />

                          <p className="truncate text-sm">
                            {/* take the first element of the splitted string */}
                            {selectedFriend.username.split(" ")[0]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </Card>
            ) : null}

            <DialogFooter className="mt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating group..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
