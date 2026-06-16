'use client';

import ReactMarkdown from 'react-markdown';

interface BlogPostContentProps {
  content: string;
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
  return (
    <div className="prose prose-lg prose-[#1A1A1A] max-w-none
      prose-headings:font-[family-name:var(--font-playfair)] prose-headings:text-[#1A1A1A]
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-[#1A1A1A]/80 prose-p:leading-relaxed
      prose-a:text-[#C8956C] prose-a:no-underline hover:prose-a:underline
      prose-strong:text-[#1A1A1A]
      prose-ul:my-4 prose-ol:my-4
      prose-li:text-[#1A1A1A]/80
      prose-blockquote:border-l-[#C8956C] prose-blockquote:bg-[#C8956C]/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
      prose-img:rounded-xl prose-img:my-8
      prose-hr:border-[#E8E6E1] prose-hr:my-8
      prose-code:text-[#C8956C] prose-code:bg-[#C8956C]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
      prose-pre:bg-[#1A1A1A] prose-pre:rounded-xl"
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
