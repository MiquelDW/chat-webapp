import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// 'cn' helper function to merge default classNames with other classNames and to conditionally add classnames
import { cn } from "@/lib/utils";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { CircleArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

// predefine object structure for the given 'props' object
interface HeaderProps {
  imageUrl?: string;
  name: string;
  options?: {
    label: string;
    destructive: boolean;
    onClick: () => void;
  }[];
}

const Header = ({ imageUrl, name, options }: HeaderProps) => {
  return (
    <Card className="flex w-full items-center justify-between rounded-lg p-2">
      <div className="flex items-center gap-3">
        <Link href="/conversations" className="block lg:hidden">
          <CircleArrowLeft />
        </Link>

        <Avatar className="h-8 w-8">
          <AvatarImage src={imageUrl} />
          <AvatarFallback>{name.substring(0, 1)}</AvatarFallback>
        </Avatar>

        <h2 className="font-semibold">{name}</h2>
      </div>

      <div className="flex gap-2">
        {options && (
          <DropdownMenu>
            {/* button that triggers the dropdown menu */}
            <DropdownMenuTrigger
              // change the default rendered element to the one passed as a child, merging their props and behavior
              asChild
            >
              <Button size="icon" variant="secondary">
                <Settings />
              </Button>
            </DropdownMenuTrigger>

            {/* this component pops out when the dropdown menu is triggered */}
            <DropdownMenuContent className="mt-1 rounded-lg border bg-white p-1 shadow-md dark:border-white/15 dark:bg-[#020817]">
              {options.map((option, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={option.onClick}
                  className={cn("justify-center font-semibold", {
                    "text-red-500": option.destructive,
                  })}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
};

export default Header;
