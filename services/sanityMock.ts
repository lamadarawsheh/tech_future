import { BlogPost, Category, Author } from '../types';

// Mock Authors
const authorAlex: Author = {
  _id: 'author-1',
  _type: 'author',
  name: 'Alex Morgan',
  slug: { _type: 'slug', current: 'alex-morgan' },
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjllJML9YoKgdu1e_WKcPYg22gIijN1SJmraE_A41i21iQslXaGncdx3h31US_sCZf3-I9jbZCeaqTeq_E9iQ8HZVSmOFTm22sv-7lYy4y02X_9p9y07oeCpRz-bPe_ks0mpzAn__PGIuoNPkWw8jEeIo-c4fogkTyzvekVXY6XD21leWY4jeRLN-WAVDQOJNxXxgeOMzJz6N3_D2vmfDtzRW9xJdDT94ZQAMDCTCye_ElCYwspiBQrbznrFj4e7eZUm-bIVUUwUk',
  bio: [
    { _type: 'block', children: [{ _type: 'span', text: 'Alex is a Lead Frontend Engineer passionate about React, Design Systems, and the future of web rendering. When not coding, he is probably hiking.' }] }
  ],
  socialLinks: [{ platform: 'twitter', url: '#' }, { platform: 'github', url: '#' }]
};

const authorSarah: Author = {
  _id: 'author-2',
  _type: 'author',
  name: 'Sarah Chen',
  slug: { _type: 'slug', current: 'sarah-chen' },
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbbd4146vsWc2_MGC4ylIxA5b2PPLSGaR8q7cif5cWMjweq12OaMEguOX9c7x9wroaL4xrrW1fBHxlMpGHq6WWKKQ1PPLq-85oyU_18r-Ocj8BuXtDvogcOiNoSo5wIQuXCe__liQ3Py5wwDSRXkNSpYdh_aYqvmP2OTTq27kBGUhs5VuRgnYhdxDR3EF2jWa215Zaot9jz-eCXtVgjXpALkbIAD8MndGY_VYaVvbr-aZRBT5Bkr3RDJzywCxh55fnGoCYfq-eOlw',
  bio: [
     { _type: 'block', children: [{ _type: 'span', text: 'Sarah is a Creative Technologist exploring the intersection of AI and Art. She writes about generative design and UX patterns.' }] }
  ],
  socialLinks: [{ platform: 'github', url: '#' }, { platform: 'linkedin', url: '#' }]
};

const authorMarcus: Author = {
  _id: 'author-3',
  _type: 'author',
  name: 'Marcus Johnson',
  slug: { _type: 'slug', current: 'marcus-johnson' },
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjlINQEFNxPiOyRNgwXHkWmAIon_cZwDEDCfgT3oLoUo2eYHT0szyRdDN9lltkYJu3ySeZxtnAxz272l6fr5yHM3t0IHBbrXe3ir64wCZBbcENpXK03rboStw6ZBGWU7Y-6FqySxfh8lQtO8VDRadt8Q7sGDurknr2ZDCurlxsdwcyeVFUOVg4GsDIhei5BjtzbNcqOvkJ3Gd_FMlHhNNRTI7jg8NtrqeyfYVwMayg4wJFlpgtoy8QbS808FRFSHagqP9csoJ5HHE',
  bio: [
     { _type: 'block', children: [{ _type: 'span', text: 'Marcus specializes in Cloud Security and Zero Trust architectures. He helps companies build resilient infrastructure.' }] }
  ],
  socialLinks: [{ platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }]
};

// Mock Categories
const catDev: Category = { _id: 'cat-1', _type: 'category', title: 'Development', slug: { _type: 'slug', current: 'development' }, color: 'blue' };
const catDesign: Category = { _id: 'cat-2', _type: 'category', title: 'Design', slug: { _type: 'slug', current: 'design' }, color: 'purple' };
const catAI: Category = { _id: 'cat-3', _type: 'category', title: 'AI & Future', slug: { _type: 'slug', current: 'ai-future' }, color: 'green' };
const catSecurity: Category = { _id: 'cat-4', _type: 'category', title: 'Security', slug: { _type: 'slug', current: 'security' }, color: 'orange' };

// Common Content Block
const commonContent = [
    {
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: 'This is a fully functional blog application using React, Zustand, and Sanity. Below you will see how we handle rich text content natively.' }]
    },
    {
        _type: 'block',
        style: 'h3',
        children: [{ _type: 'span', text: 'Why this tech stack?' }]
    },
    {
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: 'Using Next.js patterns within a standard React SPA allows for rapid development. Coupled with Tailwind CSS for styling and Sanity for content management, we achieve a high-performance, maintainable architecture.' }]
    },
    {
        _type: 'block',
        style: 'blockquote',
        children: [{ _type: 'span', text: '“Simplicity is the ultimate sophistication.” — Leonardo da Vinci' }]
    },
    {
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: 'Here is a list of key benefits:' }]
    },
    {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [{ _type: 'span', text: 'Fast content delivery via CDN' }]
    },
    {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [{ _type: 'span', text: 'Type-safe content using TypeScript' }]
    },
    {
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [{ _type: 'span', text: 'Modern UI with Dark Mode support' }]
    },
    {
        _type: 'image',
        asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }, 
        alt: 'A placeholder for a content image'
    }
];

// Mock Posts
export const mockPosts: BlogPost[] = [
  {
    _id: 'post-1',
    _type: 'blogPost',
    title: 'The Future of AI in Design',
    slug: { _type: 'slug', current: 'future-of-ai-in-design' },
    excerpt: 'Explore how artificial intelligence is reshaping the creative landscape, automating redundant tasks, and what it means for designers in the next decade.',
    content: commonContent,
    categories: [catDesign, catAI],
    readingTime: 8,
    author: authorAlex,
    publishedDate: '2023-10-24T10:00:00Z',
    featured: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSlG50GFwJeloW_9HT7ueYeKS8DKFDzTjOut-OfBbTYPP1dkbpf1KrDNAxITsmzYAGUo9nkG0-Q5n6VeNQ7XS2p-Bsgp9z0ik1300AD6rPcTt376zLTRFA2PxMbX1V4ou9-ZcHcOUbGgvvqP5AqIUL-URha7cBVhYT_ggXff5J8mHvMnY32HNd8_DmUTeHYworDMZWc3eQO2M0hKwWCy-LY7PhhbQ6ociXKz1WTyupW1ncKZrnzc0M8MBJZ4T4NCI0v7Mr11Os9HY',
    views: 12450,
    tags: ['AI', 'Design', 'Future', 'UX']
  },
  {
    _id: 'post-2',
    _type: 'blogPost',
    title: 'How to master React Hooks',
    slug: { _type: 'slug', current: 'master-react-hooks' },
    excerpt: 'A deep dive into useEffect and useMemo for better state management. Learn patterns that will prevent infinite loops and improve performance.',
    content: commonContent,
    categories: [catDev],
    readingTime: 5,
    author: authorAlex,
    publishedDate: '2023-10-24T09:00:00Z',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcjwY56PWKIggA9bQfIccvXun_kqKFsa1ecnT1eJU6z5BbqtwGzLqMSTfqxSCi8OtvmAbmkCLtHx3KQS-3Avl1W7xjOiogJzXTYeOKKLb_JOOq_INm65uVPiZ_kfFMASI-NJTWND3HQCefVusQZgUcajDwHOmyZixRCO2MJma5RzFI3wLzowMCp4t2qMhMtcEhv-K03x_s1lIPArlmRvGtRAg5yMvWIv6jU_j1o6tVCBAqcAb7Uh6rps4N_3WjlGsaN5lytcnLtjM',
    views: 8900,
    tags: ['React', 'JavaScript', 'Web Development']
  },
  {
    _id: 'post-3',
    _type: 'blogPost',
    title: 'The State of CSS 2024',
    slug: { _type: 'slug', current: 'state-of-css-2024' },
    excerpt: 'New features coming to CSS including subgrid, container queries, and new color spaces that will change how we layout pages forever.',
    content: commonContent,
    categories: [catDesign, catDev],
    readingTime: 4,
    author: authorSarah,
    publishedDate: '2023-10-22T14:30:00Z',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYC-HKktPnie7Lunzdol4Eu5LKE6J1UiisrCDZorsNFqO2_ko3QdD25qNFt7veaY1wl8F_gux4AQSUMiPXWGgts2yxm_dqO256q-o1wjEVnuZiKTZSJBJEw8SIGacncIvR99ySWccBLpcf2QtRUG93m4-3llmuNXElpeItJkUx-QouUGBiHrzB7kMeBebv-g7Wi_minL0tzLBZZ3gsXYngBnR-Um3G8fewwakEREinhl05BgZRZdyUeP7GkfFEOQ9H4eZD6kRLO34',
    views: 6500,
    tags: ['CSS', 'Design', 'Frontend']
  },
  {
    _id: 'post-4',
    _type: 'blogPost',
    title: 'Optimizing Web Performance',
    slug: { _type: 'slug', current: 'optimizing-web-performance' },
    excerpt: 'Techniques to improve your Core Web Vitals scores. From lazy loading images to deferring non-essential JavaScript.',
    content: commonContent,
    categories: [catDev],
    readingTime: 7,
    author: authorMarcus,
    publishedDate: '2023-10-20T11:15:00Z',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI8CBWtGodvafD73Crd-8yoSp4D0SL8WqiQvaQyjJ8Ybvc61xfmRLGumgIMaK_tgSGBZ_C2_mMy6Vl-ByI49nxm0L9Zw47qu3zxD9dshg_oDiqydcq0HybUepx1sxqkXLauFGEuN9v3jObxtaEnHXOGaxEGC6EtWx5MStwQr1Gi86P46tARUsGXC8FwnW96KdsednPITKQvB5iYu7O4f_daTazvGDcfTU_uuHtkn0RpHrbtzddxCB2hy3kcPa574vvDMZPeGuW7D4',
    views: 5200,
    tags: ['Performance', 'Web', 'JavaScript']
  },
   {
    _id: 'post-5',
    _type: 'blogPost',
    title: 'Zero Trust Security Architecture',
    slug: { _type: 'slug', current: 'zero-trust-security' },
    excerpt: 'Why perimeter-based security is failing and how to implement zero trust today.',
    content: commonContent,
    categories: [catSecurity],
    readingTime: 6,
    author: authorMarcus,
    publishedDate: '2023-10-18T08:00:00Z',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpfoAOYIRpszSPVfuLUOo2DVjjBXWglhB7021PbRTYeFeC6H10UKAx1Cyug9iUwZklX_-baEMAY5EcoYRECTOv6qxpaLjD52gUhJxMJlrOoNt1Xz14OwKWTOesbJ5_d9Lq2JMW7qR_eQD5EhEn67WBqZh1gdzmwM8OufhfIbjf8evNM9uvOns-cGIoAzI77uRrAnA0JfagsBOY7Vx86s5yRCqMP-J3q6QHA7iTXemBgUIQhxVXiVFr3r48vii1AiFNOep-bQ5DiXM',
    views: 4100,
    tags: ['Security', 'Cloud', 'Architecture']
  }
];

export const getFeaturedPost = () => mockPosts.find(p => p.featured) || mockPosts[0];
export const getRecentPosts = () => mockPosts.filter(p => !p.featured);
export const getCategories = () => [catDev, catDesign, catAI, catSecurity];
export const getAuthors = () => [authorAlex, authorSarah, authorMarcus];

export const getAuthorBySlug = (slug: string): Author | undefined => {
  return [authorAlex, authorSarah, authorMarcus].find(a => a.slug.current === slug);
};

export const getPostsByAuthorId = (authorId: string): BlogPost[] => {
  return mockPosts.filter(p => p.author._id === authorId);
};

export const getPostsByCategory = (categorySlug: string): BlogPost[] => {
  return mockPosts.filter(p => p.categories.some(c => c.slug.current === categorySlug));
};

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return mockPosts.find(p => p.slug.current === slug);
};

export const searchPosts = (term: string): BlogPost[] => {
  const lowerTerm = term.toLowerCase();
  return mockPosts.filter(p => 
    p.title.toLowerCase().includes(lowerTerm) || 
    p.excerpt.toLowerCase().includes(lowerTerm)
  );
};