"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

interface VisitorsData {
  today: number;
  total: number;
  lastUpdated: string;
}

export const VisitorCounter = () => {
  const [visitors, setVisitors] = useState<VisitorsData | null>(null);

  const incrementVisitors = async () => {
    // 세션 스토리지를 확인하여 이미 방문했는지 체크
    const hasVisitedToday = sessionStorage.getItem("visitedToday");
    const today = new Date().toDateString();
    
    if (hasVisitedToday === today) {
      // 오늘 이미 방문한 경우 카운트 증가하지 않음
      return;
    }

    try {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
        // 세션 스토리지에 오늘 방문 기록 저장
        sessionStorage.setItem("visitedToday", today);
      }
    } catch (error) {
      console.error("방문자 수 증가 실패:", error);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch("/api/visitors");
      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
      }
    } catch (error) {
      console.error("방문자 수 조회 실패:", error);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 방문자 수 증가 및 조회
    incrementVisitors();
    fetchVisitors();
  }, []);

  return (
    <motion.div 
      variants={itemVariants}
      className="text-sm text-muted-foreground whitespace-pre"
    >
      Today {visitors?.today?.toLocaleString() || "0"}   •   Total {visitors?.total?.toLocaleString() || "0"}
    </motion.div>
  );
}; 