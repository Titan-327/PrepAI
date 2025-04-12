import { NextRequest,NextResponse } from "next/server";
import crypto from "crypto"
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";
const generatedSignature=(
    razorpayOrderId:string,
    razorpayPaymentId:string
)=>{
    const keySecret=process.env.RAZORPAY_KEY_SECRET as string;
    const sig=crypto.createHmac("sha256",keySecret).update(razorpayOrderId+"|"+razorpayPaymentId).digest("hex")
    return sig;    
}
export async function POST(request:NextRequest){
    const {orderId,razorpayPaymentId,razorpaySignature}=await request.json();
    const signature=generatedSignature(orderId,razorpayPaymentId);
    const user=await getCurrentUser()
    if(signature!==razorpaySignature){
return NextResponse.json({
    message:"payment verification failed", isOk:false
},{
    status:400
})
    }
    //Change in database here
    const userRef =await  db.collection("users").doc(user?.id as string)
    await userRef.update({
        credits: 3,
      });
    return NextResponse.json({
        message:"payment verified successfully",isOk:true
    },{
        status:200
    })
}