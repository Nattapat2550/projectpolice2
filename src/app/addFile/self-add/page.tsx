import MemoForm from "@/components/self-add/MemoForm";
import styles from "@/components/self-add/SelfAdd.module.css";
import Link from "next/link";

export default function CreateMemoPage() {
  return (
    <main className="h-full p-4 md:p-8">
      <div className={styles.Container}>
        <div className="flex justify-between items-center mb-4">
          <h1 className={styles.Header} style={{ fontSize: '1.5rem', marginBottom: 0 }}>สร้างงานใหม่</h1>

          <Link href="/">
            <button className={styles.SecondaryButton}>
              กลับหน้าหลัก
            </button>
          </Link>
        </div>
        <MemoForm />
      </div>
    </main>
  );
}