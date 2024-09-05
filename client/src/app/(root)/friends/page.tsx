import ConversationFallback from "@/components/conversation/ConversationFallback";
import ItemList from "@/components/ItemList";
import AddFriendDialog from "./_components/AddFriendDialog";

const FriendsPage = () => {
  return (
    <>
      <ItemList title="Friends" Action={<AddFriendDialog />}>
        <p>Friend #1</p>
        <p>Friend #2</p>
      </ItemList>

      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
