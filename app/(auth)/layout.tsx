import React from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/actions/auth.action";
const AuthLayout =async ({ children }: { children: React.ReactNode }) => {
   const isUserAuthenticated=await isAuthenticated()
    if(isUserAuthenticated){
      redirect('/')
    } 
  return (
    <div className="auth-layout">
      
        {children}
      
    </div>
  );
}
export default AuthLayout;