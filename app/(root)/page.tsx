// "use client";
// import Razorpay from "razorpay";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { InterviewCard } from "@/components/InterviewCard";
// import { getCurrentUser } from "@/lib/actions/auth.action";
// import { toast } from "sonner";
// import {
//   getInterviewsByUserId,
//   getLatestInterviews,
// } from "@/lib/actions/general.action";
// import Script from "next/script";

// export default function Home() {
//   const router=useRouter()
//   const [user, setUser] = useState<any>(null);
//   const [userInterviews, setUserInterviews] = useState<any[]>([]);
//   const [latestInterviews, setLatestInterviews] = useState<any[]>([]);
//   const [showPopup, setShowPopup] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       const currentUser = await getCurrentUser();
//       setUser(currentUser);

//       if (currentUser?.id) {
//         const [userInterviewsData, latestInterviewsData] = await Promise.all([
//           getInterviewsByUserId(currentUser.id),
//           getLatestInterviews({ userId: currentUser.id }),
//         ]);

//         setUserInterviews(userInterviewsData || []);
//         setLatestInterviews(latestInterviewsData || []);
//       }
//     };

//     fetchData();
//   }, []);

//   const handlePurchase = async () => {
//     setShowPopup(true);
//   };

//   const closePopup = () => {
//     setShowPopup(false);
//   };

//   const handlePayment = () => {
//     const createOrder=async()=>{
// const res=await fetch('/api/createOrder',{
//   method:'POST',
//   body:JSON.stringify({amount:1000}),
// })
// const data=await res.json();
// const paymentData={
//   key:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//   order_id: data.id,
//   handler: async function (response:any){
// const res=await fetch("/api/verifyOrder",{
//   method:"POST",
//   body:JSON.stringify({
//     orderId:response.razorpay_order_id,
//     razorpayPaymentId:response.razorpay_payment_id,
//     razorpaySignature:response.razorpay_signature,
//   }),
// });
// const data=await res.json();
// console.log(data);
// if(data.isOk){
//   window.location.reload();
//   toast.success("Payment done successfully")
// }
// else{
//  toast.error("Payment failed")
// }
//   }
// }
// const payment=new (window as any).Razorpay(paymentData) 
// payment.open()
// }
// createOrder();

//     // setShowPopup(false);
//   };

//   const hasPastInterviews = userInterviews.length > 0;
//   const hasUpcomingInterviews = latestInterviews.length > 0;

//   return (
//     <main className="flex flex-col gap-10 relative">
//        <Script type="text/javascript" src="https://checkout.razorpay.com/v1/checkout.js" />
//       {/* Popup */}
//       {showPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
         
//           <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 w-96 relative animate-fadeIn scale-100 transform transition-all duration-300">
//             <button
//               onClick={closePopup}
//               className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
//             >
//               ✕
//             </button>
//             <h3 className="text-2xl font-bold mb-4 text-center text-white">Complete your Payment</h3>
//             <div className="flex flex-col gap-4">
//               <div className="flex flex-col">
//                 <label className="text-sm text-gray-400 mb-1">Currency</label>
//                 <input
//                   type="text"
//                   value="INR"
//                   disabled
//                   className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white cursor-not-allowed"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label className="text-sm text-gray-400 mb-1">Amount</label>
//                 <input
//                   type="text"
//                   value="10"
//                   disabled
//                   className="border border-gray-700 rounded-lg px-3 py-2 bg-gray-800 text-white cursor-not-allowed"
//                 />
//               </div>
//               <Button
//                 className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all"
//                 onClick={handlePayment}
//               >
//                 Pay ₹10
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Hero Section */}
//       <section className="card-cta flex flex-col sm:flex-row items-center justify-between gap-6">
//         <div className="flex flex-col gap-6 max-w-lg">
//           <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
//           <p className="text-lg">
//             Practice on real interview questions & get instant feedback
//           </p>

//           {user?.credits > 0 ? (
//             <Button asChild className="btn-primary max-sm:w-full">
//               <Link href="/interview">Start an Interview</Link>
//             </Button>
//           ) : (
//             <div className="flex flex-col gap-4">
//               <Button className="btn-primary max-sm:w-full" onClick={handlePurchase}>
//                 Buy 3 Credits for ₹10
//               </Button>
//               <p className="text-sm text-gray-500">
//                 After purchase, 3 credits will be added to your account.
//               </p>
//             </div>
//           )}
//         </div>

//         <Image
//           src="/robot.png"
//           alt="robot"
//           width={400}
//           height={400}
//           className="max-sm:hidden"
//         />
//       </section>

//       {/* User Interviews Section */}
//       <section className="flex flex-col gap-6">
//         <h2>Your Interviews</h2>
//         <div className="interviews-section">
//           {hasPastInterviews ? (
//             userInterviews.map((interview) => (
//               <InterviewCard {...interview} key={interview.id} />
//             ))
//           ) : (
//             <p>You haven&apos;t taken any interviews yet</p>
//           )}
//         </div>
//       </section>

//       {/* Latest Interviews Section */}
//       <section className="flex flex-col gap-6">
//         <h2>Take an Interview</h2>
//         <div className="interviews-section">
//           {hasUpcomingInterviews ? (
//             latestInterviews.map((interview) => (
//               <InterviewCard {...interview} key={interview.id} />
//             ))
//           ) : (
//             <p>There are no new interviews available</p>
//           )}
//         </div>
//       </section>
//     </main>
//   );
// }
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InterviewCard } from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";
import ClientContent from "@/components/ClientContent";
// Mark this as Server Component by default (no "use client")

export default async function Home() {
  const user:any = await getCurrentUser();
  const userInterviews:any = user?.id ? await getInterviewsByUserId(user.id) : [];
  const latestInterviews:any = user?.id ? await getLatestInterviews({ userId: user.id }) : [];

  const hasPastInterviews = userInterviews.length > 0;
  const hasUpcomingInterviews = latestInterviews?.length > 0;

  return (
    <main className="flex flex-col gap-10 relative">
      {/* Move interactive part to client component */}
      

      {/* Hero Section */}
      <section className="card-cta flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions & get instant feedback
          </p>

          {user?.credits > 0 ? (
              <div>
           <Button asChild className="btn-primary w-full sm:w-auto m-1">
    <Link href="/interview">Start an Interview</Link>
  </Button>
  <Button className="btn-primary w-full sm:w-auto m-1">
    Credits: {user?.credits}
  </Button>
           
            </div>
          ) : (
            <ClientContent user={user} />
          )}
        </div>

        <Image
          src="/robot.png"
          alt="robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* User Interviews Section */}
      <section className="flex flex-col gap-6">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.map((interview: any) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      {/* Latest Interviews Section */}
      <section className="flex flex-col gap-6">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            latestInterviews.map((interview: any) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>There are no new interviews available</p>
          )}
        </div>
      </section>
    </main>
  );
}
