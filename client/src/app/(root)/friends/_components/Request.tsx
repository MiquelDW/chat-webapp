"use client";

// import { queryClient } from "@/components/QCProvider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
// import { acceptRequest, denyRequest } from "@/data/requests";
import { AvatarFallback } from "@radix-ui/react-avatar";
// import { useMutation } from "@tanstack/react-query";
import { Check, User, X } from "lucide-react";

interface RequestProps {
  reqId: string;
  imageUrl: string;
  username: string;
  email: string;
}

const Request = ({ reqId, imageUrl, username, email }: RequestProps) => {
  return (
    <Card className="flex w-full items-center justify-between gap-2 p-2">
      <div className="flex items-center gap-4 truncate">
        <Avatar>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col truncate">
          <h4 className="truncate">{username}</h4>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          // disabled={denyPending || acceptPending}
          onClick={() => console.log("accepted")}
          className="h-8 w-8"
        >
          <Check className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          // disabled={denyPending || acceptPending}
          variant="destructive"
          onClick={() => console.log("denied")}
          className="h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};

export default Request;
