"use client";
import { useState, useMemo } from "react";
import { BlogFrontmatter } from "@/types";
import { BlogCard } from "./BlogCard";

interface BlogListProps {
  posts: BlogFrontmatter[];
}

export const BlogList = ({ posts }: BlogListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 카테고리/태그 목록 추출
  const categories = useMemo(() => Array.from(new Set(posts.map(post => post.category))), [posts]);
  const tags = useMemo(() => Array.from(new Set(posts.flatMap(post => post.tags))), [posts]);

  // 필터링
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
      const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value || null);
  };

  const handleTagChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(event.target.value || null);
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory || selectedTag || searchQuery;

  return (
    <section className="w-full">
      <h1 className="text-2xl font-bold mb-6">블로그</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full sm:w-64 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          aria-label="블로그 검색"
        />
        <select
          value={selectedCategory ?? ""}
          onChange={handleCategoryChange}
          className="px-3 py-2 border border-border rounded bg-background text-foreground"
          aria-label="카테고리 필터"
        >
          <option value="">전체 카테고리</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={selectedTag ?? ""}
          onChange={handleTagChange}
          className="px-3 py-2 border border-border rounded bg-background text-foreground"
          aria-label="태그 필터"
        >
          <option value="">전체 태그</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>#{tag}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded bg-muted text-muted-foreground hover:bg-accent transition"
            aria-label="필터 초기화"
          >
            초기화
          </button>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {filteredPosts.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground py-12">검색 결과가 없습니다.</div>
        ) : (
          filteredPosts.map(post => <BlogCard key={post.slug} {...post} />)
        )}
      </div>
    </section>
  );
}; 