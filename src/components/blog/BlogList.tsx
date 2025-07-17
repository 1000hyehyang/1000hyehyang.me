"use client";
import { useState, useMemo } from "react";
import { BlogFrontmatter } from "@/types";
import { BlogCard } from "./BlogCard";

export const BlogList = ({ posts }: { posts: BlogFrontmatter[] }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  // 카테고리/태그 목록 추출
  const categories = useMemo(() => Array.from(new Set(posts.map(p => p.category))), [posts]);
  const tags = useMemo(() => Array.from(new Set(posts.flatMap(p => p.tags))), [posts]);

  // 필터링
  const filtered = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.summary?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        post.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
        post.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category ? post.category === category : true;
      const matchesTag = tag ? post.tags.includes(tag) : true;
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [posts, search, category, tag]);

  return (
    <section className="w-full">
      <h1 className="text-2xl font-bold mb-6">블로그</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          aria-label="블로그 검색"
        />
        <select
          value={category ?? ""}
          onChange={e => setCategory(e.target.value || null)}
          className="px-3 py-2 border border-border rounded bg-background text-foreground"
          aria-label="카테고리 필터"
        >
          <option value="">전체 카테고리</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={tag ?? ""}
          onChange={e => setTag(e.target.value || null)}
          className="px-3 py-2 border border-border rounded bg-background text-foreground"
          aria-label="태그 필터"
        >
          <option value="">전체 태그</option>
          {tags.map(t => (
            <option key={t} value={t}>#{t}</option>
          ))}
        </select>
        {(category || tag || search) && (
          <button
            type="button"
            onClick={() => { setCategory(null); setTag(null); setSearch(""); }}
            className="px-3 py-2 rounded bg-muted text-muted-foreground hover:bg-accent transition"
            aria-label="필터 초기화"
          >
            초기화
          </button>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground py-12">검색 결과가 없습니다.</div>
        ) : (
          filtered.map(post => <BlogCard key={post.slug} {...post} />)
        )}
      </div>
    </section>
  );
}; 