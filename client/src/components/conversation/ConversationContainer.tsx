import { Card } from "../ui/card";

const ConversationContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    // 'svh' is more stable on mobile devices compared to 'vh'
    <Card className="flex h-[calc(100svh-32px)] w-full flex-col gap-2 p-4 lg:h-full">
      {children}
    </Card>
  );
};

export default ConversationContainer;
