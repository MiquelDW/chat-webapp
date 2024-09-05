import ConversationContainer from "@/components/conversation/ConversationContainer";
import Body from "./_components/Body";
import Header from "./_components/Header";

const Conversation = () => {
  return (
    <ConversationContainer>
      {/* Header */}
      <Header name="convo" />

      {/* Chat messages and Chat input */}
      <Body />
    </ConversationContainer>
  );
};

export default Conversation;
