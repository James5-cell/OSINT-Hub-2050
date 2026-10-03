import { Suspense } from "react";
import ResearchTasks from "@/components/ResearchTasks";
import {buildPageMetadata} from "@/lib/seo";
export const metadata=buildPageMetadata({title:"Practical research tasks",path:"/tasks",description:"Work through everyday public-information questions with sources, fallback paths, evidence exercises and a research note."});
export default function TasksPage(){return <Suspense fallback={<p className="p-5">Loading tasks…</p>}><ResearchTasks/></Suspense>;}
