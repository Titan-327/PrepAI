"use server"

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
const ONE_WEEK=60*60*24*7
//action for signup
export async function signUp(params:SignUpParams){
    const {uid ,name,email}=params
    try{
const userRecord=await db.collection("users").doc(uid).get()
if(userRecord.exists){
    return {
        success:false,
        message:"User already exists"       
    }
}
await db.collection("users").doc(uid).set({
    name:name,
    email:email,
    credits:3
})
return{
    success:true,
    message:"User created successfully"
}
    }catch(error:any){
        console.log("Error creatigna user",error);
        if(error.code==="auth/email-already-exists"){
            return {
                success:false,
                message:"Email already exists"
            }
        }else if(error.code==="auth/invalid-email"){
            return {
                success:false,
                message:"Invalid email"
            }
    }
    return {
        success:"false",
        message:"Failed to create an account"
    }
}
}
export async function signIn(params:SignInParams){
    const {email,idToken}=params
    try{
const userRecord=await auth.getUserByEmail(email)
if(!userRecord){
    return {
        success:false,
        message:"User does not exist"       
    }       
}
await setSessionCookie(idToken)  
    }catch(error:any){
        console.log(error)
        return{
            success:false,
            message:"Failed to sign in"
        }
    }
}
export async function setSessionCookie(idToken:string){
    // Set the session cookie in the response
    // The cookie will be set in the browser and will be used to authenticate the user
    const cookieStore=await cookies()
    const sessionCookie=await auth.createSessionCookie(idToken,{expiresIn:ONE_WEEK*1000})
   // Set the session cookie in cookieStore
    cookieStore.set('session',sessionCookie,{
        maxAge:ONE_WEEK,
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        path:'/',
        sameSite:'lax',
    })
}


//will export User object if everything goes well else null
//this function will be used to get the current user from the session cookie
export async function getCurrentUser():Promise<User | null>{
// Get the session cookie from the request
// The session cookie will be used to authenticate the user 
//cookieStore is an object with all cookies.   
const cookieStore=await cookies()
//Checks if there’s a cookie called "session".
const sessionCookie=cookieStore.get('session')?.value
if(!sessionCookie){
    return null
    }
    try{
        // Now we verify the session cookie with Firebase Admin Auth.
const decodedClaims=await auth.verifySessionCookie(sessionCookie,true)
//Use the UID from decodedClaims to fetch the corresponding user document from Firestore.
const userRecord=await db.collection('users').doc(decodedClaims.uid).get()
if(!userRecord.exists){
    return null
}
return{
    ...userRecord.data(),
    id:userRecord.id,  
} as User;
    }catch(error:any){
        console.log(error)
        return null
    }
}

export  async function isAuthenticated(){
    const user = await getCurrentUser();
    // !!object->true if object is not null or undefined
    // !!null->false
    return !!user
}
 
