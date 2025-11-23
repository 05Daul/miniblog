'use client';

import { useEffect, useRef } from 'react'; // 💡 useRef 임포트

export default function ProgressBar() {
  // 🟢 1. useRef를 사용하여 DOM 요소를 참조할 레퍼런스를 생성
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (scrolled / height) * 100 : 0;

      if (progressBarRef.current) {
        // document.getElementById() 대신 ref.current 사용
        progressBarRef.current.style.width = `${progress}%`;
      }
    };

    updateProgress();

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50 pointer-events-none">
        <div
            ref={progressBarRef} // 🟢 3. 생성한 ref를 요소에 연결
            id="progress-bar" // ID는 유지해도 무방하지만, useRef가 주 접근 방식이 됩니다.
            className="h-full bg-green-500 transition-all duration-150"
            style={{ width: '0%' }}
        />
      </div>
  );
}