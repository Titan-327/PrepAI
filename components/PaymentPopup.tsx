"use client";

import { useState } from "react";
import { toast } from "sonner";
import Script from "next/script";
import { Button } from "@/components/ui/button";

export default function PaymentPopup({ showPopup, setShowPopup }: { showPopup: boolean; setShowPopup: (value: boolean) => void }) {
  const closePopup = () => setShowPopup(false);

  const handlePayment = () => {
    const createOrder = async () => {
      const res = await fetch("/api/createOrder", {
        method: "POST",
        body: JSON.stringify({ amount: 1000 }),
      });
      const data = await res.json();

      const paymentData = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.id,
        handler: async function (response: any) {
          const res = await fetch("/api/verifyOrder", {
            method: "POST",
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const data = await res.json();

          if (data.isOk) {
            window.location.reload();
            toast.success("Payment done successfully");
          } else {
            toast.error("Payment failed");
          }
        },
      };

      const payment = new (window as any).Razorpay(paymentData);
      payment.open();
    };

    createOrder();
  };

  if (!showPopup) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 w-96 relative animate-fadeIn scale-100 transform transition-all duration-300">
          <button
            onClick={closePopup}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold mb-4 text-center text-white">Complete your Payment</h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Currency</label>
              <input
                type="text"
                value="INR"
                disabled
                className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-1">Amount</label>
              <input
                type="text"
                value="10"
                disabled
                className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white cursor-not-allowed"
              />
            </div>
            <Button
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all"
              onClick={handlePayment}
            >
              Pay ₹10
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
