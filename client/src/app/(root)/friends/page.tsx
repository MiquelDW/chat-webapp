"use client";

import { useAuth } from "@clerk/nextjs";
import ConversationFallback from "@/components/conversation/ConversationFallback";
import ItemList from "@/components/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";
import { useEffect } from "react";
import Request from "./_components/Request";
import useStateContext from "@/hooks/useStateContext";

const FriendsPage = () => {
  // state variable keeps track of all requests sent to the current user
  const { requestsHistory, setRequestsHistory } = useStateContext();
  // retrieve the currently logged in user's id
  const { userId } = useAuth();

  useEffect(() => {
    const url = `http://localhost:8080`;

    async function fetchRequests() {
      // send HTTP GET request to the /requests/:id endpoint on the server
      const responseData = await fetch(`${url}/requests/${userId}`);
      // retrieve response object and convert it to JSON format and then update state variable 'messageHistory'
      const response = await responseData.json();
      setRequestsHistory(response);
    }
    fetchRequests();
  }, []);

  return (
    <>
      <ItemList title="Friends" Action={<AddFriendDialog />}>
        {requestsHistory === null || requestsHistory?.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            No friend requests found
          </div>
        ) : (
          requestsHistory?.map(({ sender, request }) => (
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
