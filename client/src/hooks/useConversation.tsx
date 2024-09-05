"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

export const useConversation = () => {
  // return an object containing the dynamic query parameters from the current URL
  const params = useParams();
  // retrieve the current value of the dynamic query parameter 'conversationId'
  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;

  // variable that keeps track if the user is currently on an active conversation
  const isActive = useMemo(() => !!conversationId, [conversationId]);

  return { isActive, conversationId };
};
