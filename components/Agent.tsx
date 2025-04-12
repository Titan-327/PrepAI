"use client" // Ensures this component is rendered on the client-side (Next.js)

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Utility for conditionally joining classNames
import { useRouter } from 'next/navigation'; // For client-side navigation
import { vapi } from '@/lib/vapi.sdk'; // VAPI SDK instance for handling the call
import { interviewer } from '@/constants'; // Interviewer constant (like ID or workflow)
import { createFeedback } from '@/lib/actions/general.action';
import { db } from '@/firebase/client';
// ENUM: Define call statuses for better readability and to avoid string typos
enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED'
}

// Interface: Structure for saved messages
interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

// Main Component: Agent
export const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();

    // State: Tracks if AI is speaking
    const [isSpeaking, setIsSpeaking] = useState(false);

    // State: Tracks current call status
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

    // State: Array to save all messages (transcripts)
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    // useEffect: Setup event listeners for the VAPI call lifecycle
    useEffect(function () {
        // Event: Call starts
        const onCallStart = function () {
            setCallStatus(CallStatus.ACTIVE);
        };

        // Event: Call ends
        const onCallEnd = function () {
            setCallStatus(CallStatus.FINISHED);
        };

        // Event: Message (transcript) received
        const onMessage = function (message: Message) {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        // Event: AI starts speaking
        const onSpeechStart = function () {
            setIsSpeaking(true);
        };

        // Event: AI finishes speaking
        const onSpeechEnd = function () {
            setIsSpeaking(false);
        };

        // Event: Error handler
        const onError = function (error: Error) {
            console.log('Error', error);
        };

        // Register event listeners
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        // Cleanup: Remove event listeners on unmount
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []); // Empty dependency: runs only once on mount

    // Handler: Generates feedback after the call ends
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log('Generate feedback here.');
        const { success, feedbackId: id } =await createFeedback({
            interviewId:interviewId!,
            userId:userId!,
            transcript:messages
        })
        // TODO: Replace this mock logic with real API call to generate feedback

        if (success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log('Error saving feedback');
            router.push('/');
        }
    };

    // useEffect: React to callStatus changes
    useEffect(function () {
        if (callStatus === CallStatus.FINISHED) {
            if (type === "generate") {
                // If type is "generate", redirect to home                    
                router.push('/');
            } else {
                // If type is "interview", generate feedback first
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId]); // Depend on state changes

    // Handler: Starts the call
    const handleCall = async function () {
        setCallStatus(CallStatus.CONNECTING);

        if (type === "generate") {
            // Start "generate" workflow
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                }
            });
        } else {
            // Start "interview" workflow
            let formattedQuestions = '';
            if (questions) {
                formattedQuestions = questions.map((question) => `- ${question}`).join('\n');
            }
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions
                }
            });
        }
    };

    // Handler: Disconnects the call manually
    const handleDisconnect = async function () {
        setCallStatus(CallStatus.FINISHED);
        await vapi.stop();
    };

    // Helper: Get the latest message (for display)
    const lastMessage = messages[messages.length - 1]?.content;

    // Helper: Check if call is inactive or finished
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    // JSX Rendering
    return (
        <>
            {/* Top Section: Call View */}
            <div className="call-view">
                {/* AI Interviewer Card */}
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="AI avatar" width={65} height={54} className="object-cover" />
                        {/* Visual indicator: AI is speaking */}
                        {isSpeaking && <span className="animate-speak"></span>}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                {/* User Profile Card */}
                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="User avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {/* Middle Section: Transcript (Last message) */}
            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage} // Helps with animation transition
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

            {/* Bottom Section: Control Buttons */}
            <div className="w-full flex justify-center">
                {/* Show Call button if not active */}
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
                    // Show End button if active
                    <button className='btn-disconnect' onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};
