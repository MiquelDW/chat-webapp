"use client";

import { MessageSquare, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const useNavigation = () => {
  // retrieve the current pathname
  const pathname = usePathname();

  // determine array of (up-to-date) path objects
  const paths = useMemo(
    () => [
      {
        name: "Conversations",
        href: "/conversations",
        icon: <MessageSquare />,
        active: pathname.startsWith("/conversations"),
        // count: unseenMessagesCount,
      },
      {
        name: "Friends",
        href: "/friends",
        icon: <Users />,
        active: pathname === "/friends",
        // count: requestsCount,
      },
    ],
    // requestsCount, unseenMessagesCount
    [pathname]
  );

  return paths;
};

export default useNavigation;
