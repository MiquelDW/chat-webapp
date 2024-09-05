"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import useNavigation from "@/hooks/useNavigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useConversation } from "@/hooks/useConversation";

const MobileNav = () => {
  // retrieve the defined path objects
  const paths = useNavigation();

  // retrieve variable that keeps track if user is currently on an active conversation
  const { isActive } = useConversation();

  // hide mobile nav if user is currently on an active conversation
  if (isActive) return null;

  return (
    <Card className="fixed bottom-4 flex h-16 w-[calc(100vw-32px)] p-2 lg:hidden">
      <nav className="w-full" aria-label="Mobile Navigation">
        <ul className="flex items-center justify-evenly gap-4 lg:flex-col">
          {paths.map((path, index) => {
            return (
              <li key={index} className="relative">
                <Link href={path.href}>
                  <Tooltip>
                    {/* button that toggles the tooltip when you hover over it */}
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={path.active ? "default" : "outline"}
                      >
                        {path.icon}
                        {/* {path.count ? (
                          <Badge className="absolute bottom-7 left-6 bg-red-500 px-2 hover:bg-red-500">
                            {path.count}
                          </Badge>
                        ) : null} */}
                      </Button>
                    </TooltipTrigger>

                    {/* this component pops out when the tooltip is open */}
                    <TooltipContent side="top" align="center">
                      <p>{path.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
              </li>
            );
          })}
          {/* <li>
            <ThemeToggle />
          </li> */}
          <li>
            <UserButton />
          </li>
        </ul>
      </nav>
    </Card>
  );
};

export default MobileNav;
