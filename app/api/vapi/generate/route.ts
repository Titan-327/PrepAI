import {generateText} from "ai"
import {google} from "@ai-sdk/google"
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
import admin from 'firebase-admin';

export async function GET(){
    return Response.json({
        success:true,
        data:"Thank You"
    },{
        status:200
    })
}
// POST handler function — triggered when a POST request is made to this endpoint
export async function POST(request: Request) {
    // Parse the JSON body of the request to extract the parameters
    const { type, role, level, techstack, amount, userid } = await request.json();
  
    try {
      //
      // Step 1: Generate interview questions using AI
      const { text: questions } = await generateText({
        model: google("gemini-2.0-flash-001"), // Specify the AI model (Gemini in this case)
        prompt: `Prepare questions for a job interview.
          The job role is ${role}.
          The job experience level is ${level}.
          The tech stack used in the job is: ${techstack}.
          The focus between behavioural and technical questions should lean towards: ${type}.
          The amount of questions required is: ${amount}.
          Please return only the questions, without any additional text.
          The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
          Return the questions formatted like this:
          ["Question 1", "Question 2", "Question 3"]
          
          Thank you! <3
        `,
      });
      //
  
      // Step 2: Construct the interview object to store in Firestore
      const interview = {
        role,
        type,
        level,
        techstack: techstack.split(','), // Split tech stack into an array
        questions: JSON.parse(questions), // Parse the generated questions from string to array
        userId: userid, // Associate interview with the user
        finalized: true, // Mark the interview as finalized
        coverImage: getRandomInterviewCover(), // Generate a random cover image for visual appeal
        createdAt: new Date().toISOString(), // Timestamp of creation
      };
  
      // Step 3: Store the interview in Firestore under the "interviews" collection
      await db.collection("interviews").add(interview);
      const userRef = db.collection('users').doc(userid);

  await userRef.update({
    credits: admin.firestore.FieldValue.increment(-1),
  });
      // Step 4: Send success response
      return Response.json(
        {
          success: true,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      // Error handling: log the error and return a failure response
      console.log(error);
      return Response.json(
        {
          success: false,
          error,
        },
        {
          status: 500,
        }
      );
    }
  }
  