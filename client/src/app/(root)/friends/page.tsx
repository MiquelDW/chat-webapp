"use client";

import ConversationFallback from "@/components/conversation/ConversationFallback";
import ItemList from "@/components/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";
import { useEffect, useState } from "react";
// this hook is used for fetching and caching data from a server
// use this hook when you want to fetch data that is primarily read-only, such as getting a list of items, details of a single item, etc
import { useQuery } from "@tanstack/react-query";
import { getLoggedInUser } from "@/data/users";
import Request from "./_components/Request";

// define type of the retrieved friend request details
type RequestDetailsType = {
  sender: {
    id: string;
    createdAt: Date;
    email: string;
    updatedAt: Date;
    imageUrl: string;
    username: string;
  };
  request: {
    id: string;
    receiverId: string;
    createdAt: Date;
    senderId: string;
  };
};

const FriendsPage = () => {
  const [requests, setRequests] = useState<RequestDetailsType[]>();
  // retrieve the currently logged in user
  const { data: currentUser } = useQuery({
    // queryKey is useful for caching and invalidation
    queryKey: ["get-current-user"],
    queryFn: async () => await getLoggedInUser(),
  });

  useEffect(() => {
    const url = `http://localhost:8080`;

    async function fetchRequests() {
      // send HTTP GET request to the /requests/:id endpoint on the server
      const responseData = await fetch(`${url}/requests/${currentUser?.id}`);
      // retireve response object and convert it to JSON format and then update state variable 'messageHistory'
      const response = await responseData.json();
      setRequests(response);
    }
    fetchRequests();
  }, []);

  return (
    <>
      <ItemList title="Friends" Action={<AddFriendDialog />}>
        {requests === null || requests?.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            No friend requests found
          </div>
        ) : (
          requests?.map(({ sender, request }) => (
            <Request
              key={request.id}
              reqId={request.id}
              imageUrl={sender.imageUrl}
              username={sender.username}
              email={sender.email}
            />
          ))
        )}
      </ItemList>

      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
