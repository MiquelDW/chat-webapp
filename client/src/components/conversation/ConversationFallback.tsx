import { Card } from "../ui/card";

const ConversationFallback = () => {
  return (
    <Card className="hidden h-full w-full items-center justify-center bg-secondary p-4 text-secondary-foreground lg:flex">
      Select/Start a conversation to get started!
    </Card>
  );
};

export default ConversationFallback;
