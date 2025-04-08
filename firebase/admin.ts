import { initializeApp, getApps, cert } from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
const initFirebaseAdmin=()=>{
    //To initialize firebase admin SDK only once
    //Check if any apps are already initialized
    const apps=getApps()
    if(!apps.length){
        initializeApp({
            credential:cert({
                projectId:process.env.FIREBASE_PROJECT_ID,
                clientEmail:process.env.FIREBASE_CLIENT_EMAIL,
                privateKey:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,'\n')
            })
        })
    }
    return {
        auth:getAuth(),
        db:getFirestore()
    }
}
export const {auth,db}=initFirebaseAdmin()