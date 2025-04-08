"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';

// Define call statuses for better readability and state management
enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED'
}

// Define message interface to structure saved messages
interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

// Main Agent component
export const Agent = ({ userName, userId, type }: AgentProps) => {
    const router = useRouter();

    // State: whether AI is currently speaking
    const [isSpeaking, setIsSpeaking] = useState(false);

    // State: current call status (INACTIVE, CONNECTING, ACTIVE, FINISHED)
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

    // State: stores all the messages exchanged during the call
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    // Effect: Sets up event listeners when the component mounts
    useEffect(function () {
        // Handler: when call starts
        const onCallStart = function () {
            setCallStatus(CallStatus.ACTIVE);
        };

        // Handler: when call ends
        const onCallEnd = function () {
            setCallStatus(CallStatus.FINISHED);
        };

        // Handler: when a new message is received
        const onMessage = function (message: Message) {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        // Handler: when AI starts speaking
        const onSpeechStart = function () {
            setIsSpeaking(true);
        };

        // Handler: when AI finishes speaking
        const onSpeechEnd = function () {
            setIsSpeaking(false);
        };

        // Handler: logs any error during the call
        const onError = function (error: Error) {
            console.log('Error', error);
        };

        // Register Vapi event listeners
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        // Cleanup: remove listeners when component unmounts
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    // Effect: If the call is finished, navigate back to home page
    useEffect(function () {
        if (callStatus === CallStatus.FINISHED) {
            router.push('/');
        }
    }, [messages, callStatus, type, userId]);

    // Function: handles starting the call
    const handleCall = async function () {
        setCallStatus(CallStatus.CONNECTING);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
                username: userName,
                userid: userId, 
            }
        });
    };

    // Function: handles disconnecting the call
    const handleDisconnect = async function () {
        setCallStatus(CallStatus.FINISHED);
        await vapi.stop();
    };

    // Get the latest message content for display
    const lastMessage = messages[messages.length - 1]?.content;

    // Check if call is inactive or finished to control UI state
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            {/* Call View UI */}
            <div className="call-view">
                <div className="card-interviewer">
                    {/* AI Interviewer Avatar */}
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
                        {/* Visual indicator when AI is speaking */}
                        {isSpeaking && <span className="animate-speak"></span>}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                {/* User Profile Card */}
                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="user avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {/* Transcript Display */}
            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage}
                            className={cn(
                                'transition-opacity duration-500 opacity-0',
                                'animate-fadeIn opacity-100'
                            )}
                        >
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* Call Control Buttons */}
            <div className="w-full flex justify-center">
                {/* If call is not active, show Call button */}
                {callStatus !== 'ACTIVE' ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span className={cn(
                            "absolute animate-ping rounded-full opacity-75",
                            callStatus !== 'CONNECTING' && 'hidden'
                        )} />
                        <span>
                            {isCallInactiveOrFinished ? 'Call' : '. . .'}
                        </span>
                    </button>
                ) : (
                    // If call is active, show End button
                    <button className='btn-disconnect' onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};
