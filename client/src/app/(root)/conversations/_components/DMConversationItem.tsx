import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import Link from "next/link";

// predefine object structure for the given props object
interface DMConversationItemProps {
  conversationId: string;
  imageUrl?: string;
  username?: string;
  lastMessageSender?: string;
  lastMessageContent?: string;
  currentUser?: string;
  unseenMessagesCount?: number;
}

const DMConversationItem = ({
  conversationId,
  imageUrl,
  username,
  lastMessageSender,
  lastMessageContent,
  currentUser,
  unseenMessagesCount,
}: DMConversationItemProps) => {
  return (
    <Link href={`/conversations/${conversationId}`} className="w-full">
      <Card className="flex items-center justify-between p-2">
        <div className="flex items-center gap-4 truncate">
          <Avatar>
            <AvatarImage src={imageUrl} />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col truncate">
            <h4 className="truncate">{username}</h4>

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

export default DMConversationItem;
