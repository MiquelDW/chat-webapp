import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// predefine object structure for the given props object
interface GroupConversationItemProps {
  conversationId: string;
  name?: string;
  lastMessageSender?: string;
  lastMessageContent?: string;
  currentUser?: string;
  unseenMessagesCount?: number;
}

const GroupConversationItem = ({
  conversationId,
  name,
  lastMessageSender,
  lastMessageContent,
  currentUser,
  unseenMessagesCount,
}: GroupConversationItemProps) => {
  return (
    <Link href={`/conversations/${conversationId}`} className="w-full">
      <Card className="flex items-center justify-between p-2">
        <div className="flex items-center gap-4 truncate">
          <Avatar>
            <AvatarFallback>
              {name?.charAt(0).toLocaleUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col truncate">
            <h4 className="truncate">{name}</h4>

            {lastMessageSender && lastMessageContent ? (
              <span className="flex truncate overflow-ellipsis text-sm text-muted-foreground">
                <p className="semibold">
                  {lastMessageSender === currentUser ? "U" : lastMessageSender}
                  {":"}&nbsp;
                </p>
                <p className="truncate overflow-ellipsis">
                  {lastMessageContent}
                </p>
              </span>
            ) : (
              <p className="truncate text-sm text-muted-foreground">
                Start the conversation!
              </p>
            )}
          </div>
        </div>

        {unseenMessagesCount ? <Badge>{unseenMessagesCount}</Badge> : null}
      </Card>
    </Link>
  );
};

export default GroupConversationItem;
