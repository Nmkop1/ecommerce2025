// React, Next.js
import { FC } from "react";

// Clerk
import { currentUser } from "@clerk/nextjs/server";

// Custom Ui Components
import Logo from "@/components/shared/logo";
import UserInfo from "./user-info";
import SidebarNavAdmin from "./nav-admin";
import SidebarNavSeller from "./nav-seller";

// Menu links
import {
  SellerDashboardSidebarOptions,
  adminDashboardSidebarOptions,
} from "@/constants/data";

// Prisma models
import { Store } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/store/ui/button";

interface SidebarProps {
  isAdmin?: boolean;
  stores?: Store[];
}

const Sidebar: FC<SidebarProps> = async ( ) => {
 
  return (
    <div className="w-[300px] border-r h-screen p-4 flex flex-col fixed top-0 left-0 bottom-0">  
       <Button variant="orange-gradient">
            <Link href="/">Sklep</Link>
          </Button>    
         {/* <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />      */}
        <SidebarNavSeller menuLinks={SellerDashboardSidebarOptions} />   
    </div>
  );
};

export default Sidebar;
