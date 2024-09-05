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
  return <div></div>;
};

export default Request;
