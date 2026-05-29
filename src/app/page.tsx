import AllTask from "@/components/TaskDisplayer/AllTask";
import UrgentTask from "@/components/TaskDisplayer/UrgentTask";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row justify-between w-full md:h-full p-16 pt-8 gap-12">
      <div className="flex flex-1">
        <UrgentTask></UrgentTask>
      </div>
      <div className="flex flex-2">
        <AllTask/>
      </div>
    </div>
  );
}
