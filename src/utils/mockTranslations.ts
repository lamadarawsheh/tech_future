import { BlogPost } from '../types';

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
    },
    {
        _type: 'block',
        style: 'normal',
        children: [
            {
                _type: 'span',
                text: 'في السنوات الأخيرة، شهدنا تقدماً هائلاً في مجالات مثل التعلم العميق ومعالجة اللغة الطبيعية، مما أدى إلى ظهور تطبيقات مثل المساعدين الصوتيين والسيارات ذاتية القيادة.'
            }
        ]
    },
    {
        _type: 'block',
        style: 'h3',
        children: [
            {
                _type: 'span',
                text: 'أهمية تعلم الذكاء الاصطناعي'
            }
        ]
    },
    {
        _type: 'block',
        style: 'normal',
        children: [
            {
                _type: 'span',
                text: 'مع تزايد الاعتماد على الأتمتة، يصبح فهم أساسيات الذكاء الاصطناعي مهارة حاسمة للمستقبل. سواء كنت مطوراً أو رائد أعمال، فإن معرفة كيفية الاستفادة من هذه التقنيات يمكن أن تمنحك ميزة تنافسية كبيرة.'
            }
        ]
    }
];

export const getTranslatedPost = (post: BlogPost | null, language: string): BlogPost | null => {
    if (!post) return null;

    if (language === 'ar') {
        return {
            ...post,
            title: `[تجريبي] ${post.title}`, // Prefix title to indicate translation
            excerpt: 'هذا ملخص تجريبي للمقال باللغة العربية. يعرض هذا النص كيف سيبدو الملخص عند توفر الترجمة العربية في قاعدة البيانات.',
            content: getMockArabicContent(),
            readingTime: post.readingTime, // Keep original reading time
        };
    }

    return post;
};
