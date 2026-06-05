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

  useEffect(() => {
    const registerVisit = async () => {
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
        }
      } catch (error) {
        console.error("방문자 수 조회 실패:", error);
      }
    };

    registerVisit();
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
