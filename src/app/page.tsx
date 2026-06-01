import AllTask from "@/components/TaskDisplayer/AllTask";
import UrgentTask from "@/components/TaskDisplayer/UrgentTask";

export default function Home() {
  return (
    // ปรับลด padding ให้กระชับขึ้นในจอมือถือ และเอา min-h-screen ออกเพื่อป้องกัน Scrollbar ซ้อน
    <div className="flex flex-col lg:flex-row w-full h-full p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 overflow-x-hidden">
      {/* เพิ่ม min-w-0 เพื่อบังคับให้ flex item หดตัวได้ ไม่ดันจนจอทะลุ */}
      <div className="flex flex-col w-full lg:w-1/3 min-w-0">
        <UrgentTask />
      </div>
      <div className="flex flex-col w-full lg:w-2/3 min-w-0">
        <AllTask />
      </div>
    </div>
  );
}