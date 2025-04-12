"use client";

import { useState } from "react";
import PaymentPopup from "./PaymentPopup";
import { Button } from "@/components/ui/button";

export default function ClientContent({ user }: { user: any }) {
  const [showPopup, setShowPopup] = useState(false);

  if (user?.credits > 0) return null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button className="btn-primary max-sm:w-full" onClick={() => setShowPopup(true)}>
          Buy 3 Credits for ₹10
        </Button>
        <p className="text-sm text-gray-500">
          After purchase, 3 credits will be added to your account.
        </p>
      </div>

      <PaymentPopup showPopup={showPopup} setShowPopup={setShowPopup} />
    </>
  );
}
