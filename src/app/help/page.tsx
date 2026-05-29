"use client"

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // 💡 1. นำปลั๊กอินเข้ามาเพิ่ม
import styles from "./help.module.css"

export default function Home() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/help.mdx') 
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <div className="flex flex-col justify-between w-full md:h-full p-16 pt-8 gap-12">
      <div className={styles.MarkDownStyling}>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}