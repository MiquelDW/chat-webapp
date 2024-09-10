import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatTime } from "@/lib/utils";
import { AvatarImage } from "@radix-ui/react-avatar";

// predefine object structure of given 'props' object
interface MessageProps {
  fromCurrentUser: boolean;
  senderImage?: string;
  senderName?: string;
  lastByUser: boolean;
  content: string[];
  createdAt: number | Date;
  type: string;
  seen?: React.ReactNode;
}

const Message = ({
  fromCurrentUser,
  senderImage,
  senderName,
  lastByUser,
  content,
  createdAt,
  type,
  seen,
}: MessageProps) => {
  return (
    <div
      className={cn("flex items-end", {
        // show child div on the left or right
        "justify-end": fromCurrentUser,
      })}
    >
      <div
        className={cn("mx-2 flex w-full flex-col", {
          // show child div on the left or right
          "order-1 items-end": fromCurrentUser,
          "order-2 items-start": !fromCurrentUser,
        })}
      >
        <div
          className={cn(
            "flex max-w-[70%] items-end gap-2 rounded-lg px-4 py-2",
            {
              "bg-primary text-primary-foreground": fromCurrentUser,
              "bg-secondary text-secondary-foreground": !fromCurrentUser,
              "rounded-br-none": lastByUser && fromCurrentUser,
              "rounded-bl-none": lastByUser && !fromCurrentUser,
            }
          )}
        >
          {type === "text" ? (
            <p className="whitespace-pre-wrap text-wrap break-words break-all">
              {content}
            </p>
          ) : null}
          <p
            className={cn("mb-0.5 flex text-xs font-medium opacity-70", {
              "justify-end text-primary-foreground": fromCurrentUser,
              "justify-start text-secondary-foreground": !fromCurrentUser,
            })}
          >
            {createdAt instanceof Date
              ? formatTime(createdAt.getTime())
              : formatTime(createdAt)}
          </p>
        </div>

        {/* render out the message that has been seen by other convo member(s) */}
        {seen}
      </div>

      <Avatar
        className={cn("relative h-8 w-8", {
          "order-2": fromCurrentUser,
          "order-1": !fromCurrentUser,
          invisible: !lastByUser,
        })}
      >
        <AvatarImage src={senderImage} />
        <AvatarFallback>{senderName?.substring(0, 1)}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default Message;
