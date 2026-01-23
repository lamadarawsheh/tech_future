import { BlogPost, Category } from '../types';

export const getMockArabicContent = () => [
    {
        _type: 'block',
        style: 'normal',
        children: [
            {
                _type: 'span',
                text: 'هذا نص تجريبي للمقال باللغة العربية. بما أن المحتوى الأصلي متوفر باللغة الإنجليزية فقط حالياً، يتم عرض هذا النص كعنصر نائب لتوضيح كيفية ظهور المقالات عند دعم تعدد اللغات في نظام إدارة المحتوى.'
            }
        ]
    },
    {
        _type: 'block',
        style: 'h2',
        children: [
            {
                _type: 'span',
                text: 'مقدمة في الذكاء الاصطناعي'
            }
        ]
    },
    {
        _type: 'block',
        style: 'normal',
        children: [
            {
                _type: 'span',
                text: 'الذكاء الاصطناعي هو فرع من علوم الكمبيوتر يهتم بإنشاء أنظمة قادرة على أداء مهام تتطلب عادةً ذكاءً بشرياً. تشمل هذه المهام التعلم، والاستنتاج، وحل المشكلات، والإدراك، وفهم اللغة.'
            }
        ]
    },
    {
        _type: 'block',
        style: 'blockquote',
        children: [
            {
                _type: 'span',
                text: 'الذكاء الاصطناعي ليس مجرد تقنية جديدة، بل هو ثورة ستغير طريقة عيشنا وعملنا.'
            }
        ]
    }
];

// Helper to translate common technical terms
const translateTechnicalTerm = (term: string): string => {
    const translations: Record<string, string> = {
        'Technology': 'تكنولوجيا',
        'AI': 'الذكاء الاصطناعي',
        'Artificial Intelligence': 'الذكاء الاصطناعي',
        'Development': 'تطوير',
        'Programming': 'برمجة',
        'Design': 'تصميم',
        'Web': 'ويب',
        'Mobile': 'جوال',
        'Cloud': 'سحابة',
        'Data Science': 'علم البيانات',
        'Cybersecurity': 'الأمن السيبراني',
        'Machine Learning': 'تعلم الآلة',
        'React': 'رياكت',
        'JavaScript': 'جافا سكريبت',
        'TypeScript': 'تايب سكريبت',
        'Next.js': 'نكست جس',
        'Software Engineering': 'هندسة البرمجيات',
        'UI/UX': 'واجهة وتجربة المستخدم',
        'Future': 'المستقبل',
        'Tech': 'تقنية'
    };
    return translations[term] || term;
};

export const getTranslatedPost = (post: BlogPost | null, language: string): BlogPost | null => {
    if (!post) return null;

    if (language === 'ar') {
        const translatedCategories = post.categories?.map(cat => ({
            ...cat,
            title: translateTechnicalTerm(cat.title)
        }));

        return {
            ...post,
            title: post.title.split(' ').map(word => translateTechnicalTerm(word)).join(' '),
            excerpt: 'هذا ملخص تجريبي للمقال باللغة العربية. يعرض هذا النص كيف سيبدو الملخص عند توفر الترجمة العربية في قاعدة البيانات.',
            content: getMockArabicContent(),
            readingTime: post.readingTime,
            categories: translatedCategories,
            author: post.author ? {
                ...post.author,
                name: post.author.name === 'Admin' ? 'المدير' : post.author.name,
                bio: [
                    {
                        _type: 'block',
                        style: 'normal',
                        children: [{ _type: 'span', text: 'كاتب متخصص في التقنيات الحديثة والذكاء الاصطناعي.' }]
                    }
                ]
            } : post.author,
            tags: post.tags?.map(tag => translateTechnicalTerm(tag))
        };
    }

    return post;
};

export const getTranslatedCategory = (category: Category | null, language: string): Category | null => {
    if (!category) return null;
    if (language === 'ar') {
        return {
            ...category,
            title: translateTechnicalTerm(category.title),
            description: category.description ? 'استكشف أحدث المقالات والأخبار في هذا القسم.' : undefined
        };
    }
    return category;
};
