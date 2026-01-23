// services/ai.ts - AI Chat Service
import { client } from '../lib/sanity';

// Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  suggestedArticles?: {
    title: string;
    slug: string;
    excerpt: string;
  }[];
}

// Get context from blog posts for the AI
export const getBlogContext = async (query: string): Promise<string> => {
  try {
    // Search for relevant posts
    const posts = await client.fetch(`
      *[_type == "blogPost" && (title match $term || excerpt match $term || $term in tags)][0...5] {
        title,
        excerpt,
        tags,
        "slug": slug.current,
        "category": categories[0]->title
      }
    `, { term: `*${query}*` });

    if (!posts || posts.length === 0) {
      // Get recent posts if no match
      const recentPosts = await client.fetch(`
        *[_type == "blogPost"] | order(publishedDate desc)[0...5] {
          title,
          excerpt,
          tags,
          "slug": slug.current,
          "category": categories[0]->title
        }
      `);

      if (recentPosts && recentPosts.length > 0) {
        return `Recent articles on the blog:\n${recentPosts.map((p: any) =>
          `- "${p.title}" (${p.category || 'General'}): ${p.excerpt?.slice(0, 100) || 'No excerpt'}...`
        ).join('\n')}`;
      }
      return '';
    }

    return `Relevant articles found:\n${posts.map((p: any) =>
      `- "${p.title}" (${p.category || 'General'}): ${p.excerpt?.slice(0, 100) || 'No excerpt'}...`
    ).join('\n')}`;
  } catch (e) {
    console.error('Error fetching blog context:', e);
    return '';
  }
};

// Main AI chat function using Groq (free and fast)
export const sendMessage = async (
  messages: ChatMessage[],
  userQuery: string,
  language: string = 'en'
): Promise<AIResponse> => {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    // Return a helpful fallback response without API
    return getFallbackResponse(userQuery, language);
  }

  try {
    // Get relevant blog context
    const blogContext = await getBlogContext(userQuery);

    const systemPrompt = `You are a friendly and knowledgeable AI assistant for "Bot & Beam", a tech blog focused on AI, coding, design systems, and emerging technology.

Your role:
- Help users find relevant articles on the blog
- Answer questions about programming, AI, and tech
- Be conversational, concise, and helpful
- If you mention an article, provide its title so users can search for it
- Keep responses under 200 words unless detailed explanation is needed
- IMPORTANT: Always respond in ${language === 'ar' ? 'Arabic' : 'English'}.

${blogContext ? `\nBlog Content Context:\n${blogContext}` : ''}

Current blog categories: AI & Machine Learning, Web Development, Design Systems, DevOps, Career & Growth`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast and free
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
          { role: 'user', content: userQuery }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error:', error);
      return getFallbackResponse(userQuery, language);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || (language === 'ar' ? 'أعتذر، لم أتمكن من إنشاء رد.' : 'I apologize, but I could not generate a response.');

    return {
      success: true,
      message: aiMessage,
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    return getFallbackResponse(userQuery, language);
  }
};

// Fallback responses when API is not available
const getFallbackResponse = async (query: string, language: string = 'en'): Promise<AIResponse> => {
  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/);
  const isAr = language === 'ar';

  // Try to find relevant articles using multiple search terms
  let articles: any[] = [];
  try {
    // Extract meaningful words for search (skip common words)
    const stopWords = ['what', 'is', 'the', 'a', 'an', 'how', 'do', 'does', 'can', 'you', 'i', 'me', 'my', 'about', 'to', 'for', 'in', 'on', 'with', 'have', 'any'];
    const searchTerms = words.filter(w => w.length > 2 && !stopWords.includes(w));

    if (searchTerms.length > 0) {
      // Search with the most specific term first
      for (const term of searchTerms) {
        const results = await client.fetch(`
          *[_type == "blogPost" && (
            title match $term || 
            excerpt match $term || 
            $termExact in tags ||
            pt::text(content) match $term
          )] | order(viewCount desc)[0...3] {
            title,
            "slug": slug.current,
            excerpt,
            tags
          }
        `, { term: `*${term}*`, termExact: term });

        if (results && results.length > 0) {
          articles = results;
          break;
        }
      }
    }

    // If no results, get popular articles
    if (articles.length === 0) {
      articles = await client.fetch(`
        *[_type == "blogPost"] | order(viewCount desc)[0...3] {
          title,
          "slug": slug.current,
          excerpt,
          tags
        }
      `);
    }
  } catch (e) {
    console.error('Error fetching articles for fallback:', e);
  }

  // Check for greetings ONLY if it's a short greeting message
  const isGreeting = words.length <= 3 && (
    lowerQuery === 'hi' ||
    lowerQuery === 'hello' ||
    lowerQuery === 'hey' ||
    lowerQuery === 'hi there' ||
    lowerQuery === 'hello there' ||
    lowerQuery.startsWith('hi ') && words.length <= 2 ||
    lowerQuery.startsWith('hello ') && words.length <= 2 ||
    lowerQuery === 'مرحبا' ||
    lowerQuery === 'أهلا' ||
    lowerQuery === 'سلام'
  );

  if (isGreeting) {
    return {
      success: true,
      message: isAr
        ? "أهلاً بك! 👋 يسعدني جداً مساعدتك! يمكنني القيام بما يلي:\n\n• 🔍 البحث عن مقالات في أي موضوع\n• 💡 الإجابة على الأسئلة التقنية\n• 📚 التوصية بمصادر تعليمية\n\nماذا تود أن تستكشف اليوم؟"
        : "Hey there! 👋 Great to see you! I can help you:\n\n• 🔍 Find articles on any topic\n• 💡 Answer tech questions\n• 📚 Recommend learning resources\n\nWhat would you like to explore today?",
    };
  }

  // Help/capabilities questions
  if (lowerQuery.includes('what can you do') || lowerQuery.includes('help me') || lowerQuery === 'help' || lowerQuery.includes('how do you work') || lowerQuery.includes('ماذا تفعل') || lowerQuery.includes('ساعدني')) {
    return {
      success: true,
      message: isAr
        ? "أنا مساعدك التقني! إليك ما يمكنني فعله:\n\n🔍 **البحث عن المقالات** - \"أرني دروس React\"\n💬 **الإجابة على الأسئلة** - \"ما هو تعلم الآلة؟\"\n📚 **التوصيات** - \"أفضل المقالات للمبتدئين\"\n🎯 **المواضيع** - الذكاء الاصطناعي، تطوير الويب، بايثون، أنظمة التصميم\n\nجرب سؤالي عن شيء محدد!"
        : "I'm your tech assistant! Here's what I can do:\n\n🔍 **Find Articles** - \"Show me React tutorials\"\n💬 **Answer Questions** - \"What is machine learning?\"\n📚 **Recommendations** - \"Best articles for beginners\"\n🎯 **Topics** - AI, Web Dev, Python, Design Systems\n\nTry asking me something specific!",
    };
  }

  // React/Frontend questions
  if (lowerQuery.includes('react') || lowerQuery.includes('frontend') || lowerQuery.includes('next.js') || lowerQuery.includes('nextjs')) {
    const message = articles.length > 0
      ? (isAr ? `سؤال رائع عن React! ⚛️\n\nإليك بعض المقالات ذات الصلة:` : `Great question about React/Frontend! ⚛️\n\nHere are some relevant articles:`)
      : (isAr
        ? "React هي مكتبة JavaScript شهيرة لبناء واجهات المستخدم! ⚛️\n\n**المفاهيم الأساسية:**\n• المكونات والخصائص (Components & Props)\n• الحالة والخطافات (State & Hooks)\n• DOM الافتراضي (Virtual DOM)\n• بناء جملة JSX\n\nهل تود أن أجد لك مقالات محددة عن React؟"
        : "React is a popular JavaScript library for building UIs! ⚛️\n\n**Key concepts:**\n• Components & Props\n• State & Hooks\n• Virtual DOM\n• JSX syntax\n\nWould you like me to find specific React articles?");

    return {
      success: true,
      message,
      suggestedArticles: articles.length > 0 ? articles : undefined,
    };
  }

  // Python questions
  if (lowerQuery.includes('python') || lowerQuery.includes('بايثون')) {
    const message = articles.length > 0
      ? (isAr ? `بايثون لغة رائعة! 🐍 إليك ما وجدته:` : `Python is awesome! 🐍 Here's what I found:`)
      : (isAr
        ? "بايثون رائعة للذكاء الاصطناعي والأتمتة وتطوير الويب! 🐍\n\n**الاستخدامات الشائعة:**\n• تعلم الآلة (TensorFlow, PyTorch)\n• تحليل البيانات (Pandas, NumPy)\n• الواجهات الخلفية للويب (Django, FastAPI)\n• الأتمتة والبرمجة النصية\n\nما هو جانب بايثون الذي يهمك؟"
        : "Python is great for AI, automation, and web development! 🐍\n\n**Popular uses:**\n• Machine Learning (TensorFlow, PyTorch)\n• Data Analysis (Pandas, NumPy)\n• Web backends (Django, FastAPI)\n• Automation & scripting\n\nWhat aspect of Python interests you?");

    return {
      success: true,
      message,
      suggestedArticles: articles.length > 0 ? articles : undefined,
    };
  }

  // AI/ML questions
  if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence') || lowerQuery.includes('machine learning') || lowerQuery.includes('ml') || lowerQuery.includes('ذكاء اصطناعي') || lowerQuery.includes('تعلم الآلة')) {
    const message = articles.length > 0
      ? (isAr ? `الذكاء الاصطناعي مجال رائع! 🤖 إليك بعض المقالات:` : `AI is a fascinating field! 🤖 Here are some articles:`)
      : (isAr
        ? "الذكاء الاصطناعي وتعلم الآلة يغيران التكنولوجيا! 🤖\n\n**المواضيع الساخنة:**\n• نماذج اللغات الكبيرة (GPT, Claude, Llama)\n• الشبكات العصبية والتعلم العميق\n• الرؤية الحاسوبية\n• معالجة اللغات الطبيعية\n\nماذا تود أن تتعلم عن هذا المجال؟"
        : "AI & Machine Learning are transforming technology! 🤖\n\n**Hot topics:**\n• Large Language Models (GPT, Claude, Llama)\n• Neural Networks & Deep Learning\n• Computer Vision\n• Natural Language Processing\n\nWhat would you like to learn about?");

    return {
      success: true,
      message,
      suggestedArticles: articles.length > 0 ? articles : undefined,
    };
  }

  // JavaScript/TypeScript
  if (lowerQuery.includes('javascript') || lowerQuery.includes('typescript') || lowerQuery.includes('js') || lowerQuery.includes('ts')) {
    const message = articles.length > 0
      ? (isAr ? `إليك محتوى JavaScript/TypeScript! 💛` : `JavaScript/TypeScript content coming up! 💛`)
      : (isAr
        ? "JavaScript تدير الويب الحديث! 💛\n\n**المجالات الرئيسية:**\n• ميزات ES6+\n• TypeScript لأمان الأنواع\n• Node.js للواجهة الخلفية\n• أطر العمل الحديثة (React, Vue, Svelte)\n\nهل تريدني أن أجد لك دروساً محددة؟"
        : "JavaScript powers the modern web! 💛\n\n**Key areas:**\n• ES6+ features\n• TypeScript for type safety\n• Node.js for backend\n• Modern frameworks (React, Vue, Svelte)\n\nWant me to find specific tutorials?");

    return {
      success: true,
      message,
      suggestedArticles: articles.length > 0 ? articles : undefined,
    };
  }

  // Coding/Programming general
  if (lowerQuery.includes('code') || lowerQuery.includes('coding') || lowerQuery.includes('programming') || lowerQuery.includes('develop') || lowerQuery.includes('tutorial') || lowerQuery.includes('برمجة') || lowerQuery.includes('كود')) {
    const message = articles.length > 0
      ? (isAr ? `إليك بعض الموارد البرمجية التي وجدتها! 💻` : `Here are some coding resources I found! 💻`)
      : (isAr
        ? "يسعدني مساعدتك في البرمجة! 💻\n\n**يمكنني المساعدة في:**\n• دروس اللغات (JS, Python, إلخ)\n• أدلة أطر العمل\n• أفضل الممارسات\n• نصائح حل المشكلات\n\nما هي اللغة أو الموضوع الذي تعمل عليه؟"
        : "Love to help with coding! 💻\n\n**I can help with:**\n• Language tutorials (JS, Python, etc.)\n• Framework guides\n• Best practices\n• Problem-solving tips\n\nWhat language or topic are you working with?");

    return {
      success: true,
      message,
      suggestedArticles: articles.length > 0 ? articles : undefined,
    };
  }

  // Design/CSS questions
  if (lowerQuery.includes('design') || lowerQuery.includes('css') || lowerQuery.includes('tailwind') || lowerQuery.includes('ui') || lowerQuery.includes('ux') || lowerQuery.includes('تصميم')) {
    const message = articles.length > 0
      ? (isAr ? `التصميم مهم جداً! 🎨 تحقق من هذه المقالات:` : `Design is crucial! 🎨 Check these out:`)
      : (isAr
        ? "التصميم و CSS مهارات أساسية! 🎨\n\n**المواضيع التي نغطيها:**\n• أطر عمل CSS (Tailwind, إلخ)\n• مبادئ UI/UX\n• أنظمة التصميم\n• التصميم المتجاوب\n\nما هو موضوع التصميم الذي يهمك؟"
        : "Design & CSS are essential skills! 🎨\n\n**Topics we cover:**\n• CSS frameworks (Tailwind, etc.)\n• UI/UX principles\n• Design systems\n• Responsive design\n\nWhat design topic interests you?");

    return {
      success: true,
      message,
      suggestedArticles: articles.length > 0 ? articles : undefined,
    };
  }

  // Default - always try to show articles if we found any
  if (articles.length > 0) {
    return {
      success: true,
      message: isAr ? `إليك بعض المقالات التي قد تجدها ممتعة: 📖` : `Here are some articles you might find interesting: 📖`,
      suggestedArticles: articles,
    };
  }

  return {
    success: true,
    message: isAr
      ? `لست متأكداً من أنني فهمت ذلك تماماً. 🤔\n\n**حاول السؤال عن:**\n• React، JavaScript، Python\n• الذكاء الاصطناعي وتعلم الآلة\n• تطوير الويب\n• أنظمة التصميم\n\nأو استخدم شريط البحث أعلاه للحصول على نتائج سريعة!`
      : `I'm not sure I understood that completely. 🤔\n\n**Try asking about:**\n• React, JavaScript, Python\n• AI & Machine Learning\n• Web Development\n• Design Systems\n\nOr use the search bar above for quick results!`,
  };
};

// Quick suggestions for the chat
export const getQuickSuggestions = (language: string = 'en'): string[] => {
  if (language === 'ar') {
    return [
      "ما هي المقالات المتوفرة عن الذكاء الاصطناعي؟",
      "ساعدني في تعلم React",
      "أحدث اتجاهات التكنولوجيا",
      "أرني دروساً برمجية",
      "ما هو تعلم الآلة؟",
    ];
  }
  return [
    "What articles do you have about AI?",
    "Help me learn React",
    "Latest tech trends",
    "Show me coding tutorials",
    "What is machine learning?",
  ];
};
