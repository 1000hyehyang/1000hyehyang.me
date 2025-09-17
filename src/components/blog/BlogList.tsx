"use client";
import { BlogFrontmatter } from "@/types";
import { BlogCard } from "./BlogCard";
import { SearchBar } from "./SearchBar";
import { motion } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { listVariants, cardVariants } from "@/lib/animations";
import { searchBlogPosts, getSearchResultCount, debounce } from "@/lib/search";

interface BlogListProps {
  posts: BlogFrontmatter[];
}

export const BlogList = ({ posts }: BlogListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const categories = useMemo(() => {
    const categorySet = new Set(posts.map(post => post.category));  
    return ["ALL", ...Array.from(categorySet).sort()];
  }, [posts]);

  // 디바운싱된 검색 쿼리 업데이트
  const debouncedSearch = useCallback(
    (query: string) => {
      const debouncedFn = debounce((q: string) => {
        setDebouncedSearchQuery(q);
        setIsSearching(false);
      }, 300);
      debouncedFn(query);
    },
    [setDebouncedSearchQuery, setIsSearching]
  );

  // 검색 쿼리 변경 시 디바운싱 적용
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    debouncedSearch(query);
  }, [debouncedSearch]);

  // 디바운싱된 검색 결과
  const searchResults = useMemo(() => {
    return searchBlogPosts(posts, debouncedSearchQuery);
  }, [posts, debouncedSearchQuery]);

  // 카테고리 필터링
  const filteredPosts = useMemo(() => {
    let filtered = searchResults;
    
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter(result => result.post.category === selectedCategory);
    }
    
    return filtered;
  }, [searchResults, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <section className="w-full">
      {/* 카테고리 필터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
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

      {/* 검색창 */}
      <SearchBar onSearch={handleSearch} />
      
      {/* 검색 결과 개수 표시 */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm text-muted-foreground"
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border border-orange-200 border-t-transparent rounded-full animate-spin"></div>
              검색 중...
            </span>
          ) : (
            getSearchResultCount(filteredPosts, debouncedSearchQuery)
          )}
        </motion.div>
      )}
      <motion.div
        className="grid gap-6 sm:grid-cols-2"
        variants={listVariants}
        initial="hidden"
        animate="show"
        key={selectedCategory}
      >
        {filteredPosts.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground py-12">
            {debouncedSearchQuery ? (
              `"${debouncedSearchQuery}"에 대한 검색 결과가 없습니다.`
            ) : selectedCategory === "ALL" ? (
              "등록된 블로그 글이 없습니다."
            ) : (
              `${selectedCategory} 카테고리의 글이 없습니다.`
            )}
          </div>
        ) : (
          filteredPosts.map(result => (
            <BlogCard 
              key={result.post.slug} 
              {...result.post} 
              variants={cardVariants}
              searchQuery={debouncedSearchQuery}
            />
          ))
        )}
      </motion.div>
    </section>
  );
}; 