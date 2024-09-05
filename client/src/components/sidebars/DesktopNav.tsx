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

const DesktopNav = () => {
  // retrieve the defined path objects
  const paths = useNavigation();

  return (
    <Card className="hidden lg:flex lg:h-full lg:w-16 lg:flex-col lg:items-center lg:justify-between lg:px-8 lg:py-4">
      <nav aria-label="Desktop Navigation">
        <ul className="flex flex-col items-center gap-4">
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
                    <TooltipContent side="right" align="start">
                      <p>{path.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col items-center gap-4">
        {/* <ThemeToggle /> */}
        <UserButton />
      </div>
    </Card>
  );
};

export default DesktopNav;
