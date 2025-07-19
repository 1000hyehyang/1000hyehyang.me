"use client";
import { BlogFrontmatter } from "@/types";
import { BlogCard } from "./BlogCard";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface BlogListProps {
  posts: BlogFrontmatter[];
}

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: -25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export const BlogList = ({ posts }: BlogListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = useMemo(() => {
    const categorySet = new Set(posts.map(post => post.category));  
    return ["ALL", ...Array.from(categorySet).sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "ALL") {
      return posts;
    }
    return posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <section className="w-full">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-muted/50 text-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
              aria-label={`${category} 카테고리 필터`}
              tabIndex={0}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <motion.div
        className="grid gap-6 sm:grid-cols-2"
        variants={listVariants}
        initial="hidden"
        animate="show"
        key={selectedCategory}
      >
        {filteredPosts.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground py-12">
            {selectedCategory === "전체" 
              ? "등록된 블로그 글이 없습니다." 
              : `${selectedCategory} 카테고리의 글이 없습니다.`
            }
          </div>
        ) : (
          filteredPosts.map(post => <BlogCard key={post.slug} {...post} variants={cardVariants} />)
        )}
      </motion.div>
    </section>
  );
}; 