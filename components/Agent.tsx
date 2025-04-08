"use client"
import React, { useState,useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
enum CallStatus{
    INACTIVE='INACTIVE',
    CONNECTING='CONNECTING',
    ACTIVE='ACTIVE',
    FINISHED='FINISHED'
}
interface SavedMessage{
    role: 'user' | 'system' | 'assistant';
    content:string;
}
export const Agent=({userName,userId,type}:AgentProps)=>{
    const router=useRouter()
    //Initially set the call status to INACTIVE
    const [isSpeaking,setIsSpeaking]=useState(false)
    const [callStatus,setCallStatus]=useState<CallStatus>(CallStatus.INACTIVE) // Call status can be INACTIVE, CONNECTING, ACTIVE, or FINISHED
   //Initially savede messages are empty
    const [messages,setMessages]=useState<SavedMessage[]>([])
  useEffect(function(){
const onCallStart=function(){
    setCallStatus(CallStatus.ACTIVE)
}
const onCallEnd=function(){
    setCallStatus(CallStatus.FINISHED)
}
//when message is sent, add it to the messages array
const onMessage=function(message:Message){
    if(message.type==="transcript"&& message.transcriptType==="final"){
const newMessage={ role: message.role, content: message.transcript }
setMessages((prev)=>[...prev, newMessage]);
    }
}
const onSpeechStart=function(){
    setIsSpeaking(true)
}
const onSpeechEnd=function(){
    setIsSpeaking(false)
}
const onError=function(error:Error){
    console.log('Error',error);
}
//listen to the vapi events
vapi.on('call-start',onCallStart)
vapi.on('call-end',onCallEnd)
vapi.on('message',onMessage)
vapi.on('speech-start',onSpeechStart)
vapi.on('speech-end',onSpeechEnd)
vapi.on('error',onError)

return ()=>{
    //clean up the event listeners when the component unmounts
    vapi.off('call-start',onCallStart)
    vapi.off('call-end',onCallEnd)
    vapi.off('message',onMessage)
vapi.off('speech-start',onSpeechStart)
vapi.off('speech-end',onSpeechEnd)
vapi.off('error',onError)
}
  },[])
  useEffect(function(){
   if(callStatus===CallStatus.FINISHED){
    router.push('/');
   }
  },[messages,callStatus,type,userId])
  const handleCall=async function(){
    setCallStatus(CallStatus.CONNECTING)
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,{
        variableValues:{
            username:userName,
            useid:userId,
        }
    })

  }
  const handleDisconnect=async function(){
    setCallStatus(CallStatus.FINISHED)
    await vapi.stop()
  }
    const lastMessage=messages[messages.length-1]?.content;
    const isCallInactiveOrFinished=callStatus===CallStatus.INACTIVE|| callStatus===CallStatus.FINISHED;
 
    return (
       <>
        <div className="call-view">
        <div className="card-interviewer">
      <div className="avatar">
<Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
    {isSpeaking && <span className="animate-speak"></span>}
      </div>
      <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
<div className="card-content">
<Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
<h3>{userName}</h3>
</div>
        </div>
        </div>
        {messages.length>0 && (
            <div className="transcript-border">
               <div className="transcript">
                  <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>
                    {lastMessage}
                  </p>
               </div>
            </div>
        )}
        <div className="w-full flex justify-center">
        {/* @ts-ignore*/}
            {callStatus!='ACTIVE' ?(
               <button className="relative btn-call" onClick={handleCall}>
                {/* @ts-ignore*/}
               <span className={cn("absolute animate-ping rounded-full opacity-75",callStatus!='CONNECTING' && 'hidden')}/>
               
               <span>
               {isCallInactiveOrFinished ? 'Call' : '. . .'}
               </span>
               </button>
            ):(
                <button className='btn-disconnect' onClick={handleDisconnect}>
                End
                </button>
            )}
        </div>
       </>
    )
}