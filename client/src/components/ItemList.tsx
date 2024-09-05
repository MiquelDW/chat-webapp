"use client";

// 'cn' helper function to merge default classNames with other classNames and to conditionally add classnames
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { useConversation } from "@/hooks/useConversation";

// predefine object structure for the given 'props' object
interface ItemListProps {
  children: React.ReactNode;
  title: string;
  Action?: React.ReactNode;
}

const ItemList = ({ children, title, Action }: ItemListProps) => {
  // retrieve variable that keeps track if user is currently on an active conversation
  const { isActive } = useConversation();

  return (
    // its width is determined by the given values (flex-none)
    <Card
      className={cn("hidden h-full w-full p-4 lg:w-80 lg:flex-none", {
        // display item list in mobile AND desktop view if user is currently NOT having a conversation
        block: !isActive,
        // display item list ONLY in deskptop view if user is currently on an active conversation
        "lg:block": isActive,
      })}
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {Action ? Action : null}
      </div>

      <div className="flex h-full w-full flex-col items-center justify-start gap-2">
        {children}
      </div>
    </Card>
  );
};

export default ItemList;
