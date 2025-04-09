import { getInterviewsById } from '@/lib/actions/general.action';
import { getRandomInterviewCover } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import React from 'react';
import { DisplayTechIcons } from '@/components/DisplayTechIcons';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { Agent } from '@/components/Agent';
const Page=async function({params}:RouteParams){
const {id}=await params
const user=await getCurrentUser()
const interview=await getInterviewsById(id)
if(!interview){
    redirect('/')
}

    return (
<>
<div className='flex flex-row gap-4 justify-between'>
<div className="flex flex-row gap-4 items-center max-sm:flex-col">
<div className="flex flex-row gap-4 items-center">
<Image src={getRandomInterviewCover()} alt="cover-image" width={40} height={40} className="rounded-full object-cover size--[40px]"/>
<h3 className='capitalize'>{interview.role} Interview</h3>
</div>
<DisplayTechIcons techStack={interview.techstack} />
</div>
<p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">{interview.type}</p>
</div>
<Agent userName={user?.name as string} userId={user?.id}  interviewId={id} type="interview" questions={interview.questions}/>
</>
)
}
export default Page;