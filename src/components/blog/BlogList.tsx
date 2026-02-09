"use client";
import { BlogFrontmatter } from "@/types";
import { BlogCard } from "./BlogCard";
import { SearchBar } from "./SearchBar";
import { motion } from "framer-motion";
import { useState, useMemo, useCallback, useRef } from "react";
import { listVariants, cardVariants } from "@/lib/animations";
import { searchBlogPosts, getSearchResultCount, debounce } from "@/lib/search";
import { PINNED_POSTS_CONFIG } from "@/lib/github";
import { Pin, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BlogListProps {
  posts: BlogFrontmatter[];
  pinnedPosts: BlogFrontmatter[];
}

export const BlogList = ({ posts, pinnedPosts }: BlogListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 8; // 페이지당 10개 글
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const categories = useMemo(() => {
    const categorySet = new Set(posts.map(post => post.category));  
    return ["ALL", ...Array.from(categorySet).sort()];
  }, [posts]);

  // 검색 디바운싱
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

  // 검색 처리
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    debouncedSearch(query);
  }, [debouncedSearch]);

  // 검색 결과
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

  // 페이지네이션
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);

  // 총 페이지 수
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 카테고리 변경 시 첫 페이지로
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 캐러셀 네비게이션
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % pinnedPosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + pinnedPosts.length) % pinnedPosts.length);
  };

  // 터치 스와이프 (ref 사용으로 모바일에서 즉시 반응)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    let end = touchEndX.current;
    if (start === null) return;
    // touchMove가 호출되지 않은 경우 changedTouches에서 끝 위치 사용
    if (end === null && e.changedTouches.length > 0) {
      end = e.changedTouches[0].clientX;
    }
    if (end === null) return;

    const distance = start - end;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && pinnedPosts.length > 1) {
      nextSlide();
    }
    if (isRightSwipe && pinnedPosts.length > 1) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 추천 글 카드
  const PinnedCard = ({ post, isActive }: { post: BlogFrontmatter; isActive: boolean }) => (
    <div
        className={`
          overflow-hidden rounded-2xl transition-all duration-300 h-64 md:h-80 relative
          ${isActive 
            ? 'opacity-100 scale-100' 
            : 'opacity-70 scale-95'
          }
        `}
      style={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* 라이트모드 radial gradient */}
      <div 
        className="absolute inset-0 opacity-100 dark:opacity-0"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.1))'
        }}
      />
      
      {/* 첫 번째 회전 그라데이션 (선명하게) */}
      <div 
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] opacity-100 dark:opacity-0"
        style={{
          background: `conic-gradient(
            from 0deg,
            rgba(255, 154, 162, 0.4),
            rgba(255, 183, 178, 0.4),
            rgba(255, 218, 193, 0.4),
            rgba(226, 240, 203, 0.4),
            rgba(162, 228, 255, 0.4),
            rgba(201, 175, 255, 0.4),
            rgba(255, 183, 178, 0.4),
            rgba(255, 154, 162, 0.4)
          )`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
          opacity: 0.6,
          animation: 'rotate 8s linear infinite'
        }}
      />

      {/* 두 번째 회전 그라데이션 (선명하게) */}
      <div 
        className="absolute top-1/2 left-1/2 w-[180%] h-[180%] opacity-100 dark:opacity-0"
        style={{
          background: `conic-gradient(
            from 0deg,
            rgba(255, 154, 162, 0.3),
            rgba(255, 183, 178, 0.3),
            rgba(255, 218, 193, 0.3),
            rgba(226, 240, 203, 0.3),
            rgba(162, 228, 255, 0.3),
            rgba(201, 175, 255, 0.3),
            rgba(255, 183, 178, 0.3),
            rgba(255, 154, 162, 0.3)
          )`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
          opacity: 0.4,
          animation: 'rotate-reverse 10s linear infinite'
        }}
      />

      {/* 다크모드용 배경 */}
      <div 
        className="absolute inset-0 hidden dark:block"
        style={{
          background: 'rgba(0, 0, 0, 0.1)'
        }}
      />
      
      {/* 다크모드 radial gradient */}
      <div 
        className="absolute inset-0 hidden dark:block"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.2))'
        }}
      />
      
      {/* 다크모드 첫 번째 회전 그라데이션 (톤다운된 파스텔) */}
      <div 
        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] hidden dark:block"
        style={{
          background: `conic-gradient(
            from 0deg,
            rgba(255, 154, 162, 0.3),
            rgba(255, 183, 178, 0.3),
            rgba(255, 218, 193, 0.3),
            rgba(226, 240, 203, 0.3),
            rgba(162, 228, 255, 0.3),
            rgba(201, 175, 255, 0.3),
            rgba(255, 183, 178, 0.3),
            rgba(255, 154, 162, 0.3)
          )`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
          opacity: 0.6,
          animation: 'rotate 8s linear infinite'
        }}
      />

      {/* 다크모드 두 번째 회전 그라데이션 (더 톤다운) */}
      <div 
        className="absolute top-1/2 left-1/2 w-[180%] h-[180%] hidden dark:block"
        style={{
          background: `conic-gradient(
            from 0deg,
            rgba(255, 154, 162, 0.2),
            rgba(255, 183, 178, 0.2),
            rgba(255, 218, 193, 0.2),
            rgba(226, 240, 203, 0.2),
            rgba(162, 228, 255, 0.2),
            rgba(201, 175, 255, 0.2),
            rgba(255, 183, 178, 0.2),
            rgba(255, 154, 162, 0.2)
          )`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(70px)',
          opacity: 0.4,
          animation: 'rotate-reverse 10s linear infinite'
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-8 justify-end">
        <div className="flex flex-col">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 flex gap-2 items-center">
            <span>{post.category}</span>
            <span>·</span>
            <span>{post.date}</span>
          </div>
          <h2 className="font-semibold text-2xl line-clamp-2 mb-3 leading-tight text-gray-800 dark:text-gray-100">
            {post.title}
          </h2>
          {post.summary && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {post.summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );

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

      {/* 추천 글 캐러셀 섹션 */}
      {pinnedPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-orange-300" />
              <h2 className="text-xl font-semibold">{PINNED_POSTS_CONFIG.sectionTitle}</h2>
            </div>
            
            {pinnedPosts.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                  aria-label="이전 추천 글"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                  aria-label="다음 추천 글"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 캐러셀 컨테이너 */}
          <div 
            ref={carouselRef}
            className="relative overflow-hidden rounded-xl"
            style={{ touchAction: "pan-y" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              className="flex"
              animate={{ x: `-${currentSlide * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {pinnedPosts.map((post, index) => (
                <div key={post.slug} className="w-full flex-shrink-0">
                  <Link href={`/blog/${post.slug}`}>
                    <PinnedCard post={post} isActive={index === currentSlide} />
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 캐러셀 인디케이터 */}
          {pinnedPosts.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {pinnedPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${index === currentSlide 
                      ? 'bg-orange-200 w-8' 
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                  aria-label={`${index + 1}번째 추천 글로 이동`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
      
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
        {paginatedPosts.length === 0 ? (
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
          paginatedPosts.map(result => (
            <BlogCard 
              key={result.post.slug} 
              {...result.post} 
              variants={cardVariants}
              searchQuery={debouncedSearchQuery}
            />
          ))
        )}
      </motion.div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* 첫 페이지 */}
              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => handlePageChange(1)}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* 현재 페이지 주변 페이지들 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page >= Math.max(1, currentPage - 2) && 
                         page <= Math.min(totalPages, currentPage + 2);
                })
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* 마지막 페이지 */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => handlePageChange(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </section>
  );
}; 