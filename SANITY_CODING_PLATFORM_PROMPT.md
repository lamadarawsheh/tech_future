# Sanity CMS Schema Update - Coding Practice Platform

I need to add a coding practice platform to my existing Sanity blog. Please create the following schemas and add them to my Sanity Studio.

---

## Project Info
- **Sanity Project ID**: ka9py84m
- **Dataset**: production
- **Existing Schemas**: blogPost, author, category, subscriber, comment, like

---

## NEW SCHEMAS TO ADD

### 1. Coding Challenge Schema (`codingChallenge.ts`)

```typescript
// schemas/codingChallenge.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'codingChallenge',
  title: 'Coding Challenge',
  type: 'document',
  icon: () => '💻',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'code',
          options: {
            language: 'python',
            languageAlternatives: [
              { title: 'Python', value: 'python' },
              { title: 'JavaScript', value: 'javascript' },
              { title: 'Java', value: 'java' },
              { title: 'C++', value: 'cpp' }
            ]
          }
        },
        { type: 'image' }
      ]
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Easy', value: 'easy' },
          { title: 'Medium', value: 'medium' },
          { title: 'Hard', value: 'hard' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'xpReward',
      title: 'XP Reward',
      type: 'number',
      validation: Rule => Rule.required().min(10).max(500),
      description: 'Easy: 20, Medium: 40, Hard: 80'
    }),
    defineField({
      name: 'timeEstimate',
      title: 'Time Estimate (minutes)',
      type: 'number'
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Arrays', value: 'Arrays' },
          { title: 'Strings', value: 'Strings' },
          { title: 'Linked Lists', value: 'Linked Lists' },
          { title: 'Trees', value: 'Trees' },
          { title: 'Graphs', value: 'Graphs' },
          { title: 'Dynamic Programming', value: 'Dynamic Programming' },
          { title: 'Sorting', value: 'Sorting' },
          { title: 'Searching', value: 'Searching' },
          { title: 'Hash Table', value: 'Hash Table' },
          { title: 'Two Pointers', value: 'Two Pointers' },
          { title: 'Stack', value: 'Stack' },
          { title: 'Queue', value: 'Queue' },
          { title: 'Heap', value: 'Heap' },
          { title: 'Recursion', value: 'Recursion' },
          { title: 'Backtracking', value: 'Backtracking' },
          { title: 'Math', value: 'Math' },
          { title: 'Bit Manipulation', value: 'Bit Manipulation' }
        ]
      }
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'hints',
      title: 'Hints',
      type: 'array',
      of: [{ type: 'text' }],
      description: 'Progressive hints for users who are stuck'
    }),
    defineField({
      name: 'starterCode',
      title: 'Starter Code',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'language',
            title: 'Language',
            type: 'string',
            options: {
              list: [
                { title: 'Python', value: 'python' },
                { title: 'JavaScript', value: 'javascript' },
                { title: 'Java', value: 'java' },
                { title: 'C++', value: 'cpp' }
              ]
            }
          },
          {
            name: 'code',
            title: 'Code',
            type: 'text'
          }
        ]
      }]
    }),
    defineField({
      name: 'testCases',
      title: 'Test Cases',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'input', title: 'Input', type: 'text' },
          { name: 'expectedOutput', title: 'Expected Output', type: 'text' },
          { name: 'isHidden', title: 'Hidden Test Case', type: 'boolean', initialValue: false }
        ]
      }]
    }),
    defineField({
      name: 'solution',
      title: 'Solution',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'language', title: 'Language', type: 'string' },
          { name: 'code', title: 'Code', type: 'text' },
          { name: 'explanation', title: 'Explanation', type: 'array', of: [{ type: 'block' }] }
        ]
      }]
    }),
    defineField({
      name: 'acceptanceRate',
      title: 'Acceptance Rate (%)',
      type: 'number',
      initialValue: 50
    }),
    defineField({
      name: 'totalSubmissions',
      title: 'Total Submissions',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'totalSolved',
      title: 'Total Solved',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'isBossChallenge',
      title: 'Boss Challenge (for Daily Challenge)',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number'
    })
  ],
  preview: {
    select: {
      title: 'title',
      difficulty: 'difficulty',
      xp: 'xpReward'
    },
    prepare({ title, difficulty, xp }) {
      const emoji = difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴'
      return {
        title: `${emoji} ${title}`,
        subtitle: `${difficulty} • ${xp} XP`
      }
    }
  }
})
```

---

### 2. Submission Schema (`submission.ts`)

```typescript
// schemas/submission.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'submission',
  title: 'Submission',
  type: 'document',
  icon: () => '📝',
  fields: [
    defineField({
      name: 'challenge',
      title: 'Challenge',
      type: 'reference',
      to: [{ type: 'codingChallenge' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'subscriber' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'code',
      title: 'Submitted Code',
      type: 'text'
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'Python', value: 'python' },
          { title: 'JavaScript', value: 'javascript' },
          { title: 'Java', value: 'java' },
          { title: 'C++', value: 'cpp' }
        ]
      }
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Accepted', value: 'accepted' },
          { title: 'Wrong Answer', value: 'wrong_answer' },
          { title: 'Runtime Error', value: 'runtime_error' },
          { title: 'Time Limit Exceeded', value: 'time_limit' },
          { title: 'Compile Error', value: 'compile_error' }
        ]
      }
    }),
    defineField({ name: 'runtime', title: 'Runtime (ms)', type: 'number' }),
    defineField({ name: 'memory', title: 'Memory (MB)', type: 'number' }),
    defineField({ name: 'runtimePercentile', title: 'Runtime Percentile', type: 'number' }),
    defineField({ name: 'memoryPercentile', title: 'Memory Percentile', type: 'number' }),
    defineField({ name: 'errorMessage', title: 'Error Message', type: 'text' }),
    defineField({ name: 'testCasesPassed', title: 'Test Cases Passed', type: 'number' }),
    defineField({ name: 'totalTestCases', title: 'Total Test Cases', type: 'number' }),
    defineField({ name: 'notes', title: 'User Notes', type: 'text' }),
    defineField({
      name: 'createdAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ]
})
```

---

### 3. User Coding Profile Schema (`userCodingProfile.ts`)

```typescript
// schemas/userCodingProfile.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'userCodingProfile',
  title: 'User Coding Profile',
  type: 'document',
  icon: () => '👤',
  fields: [
    defineField({
      name: 'subscriber',
      title: 'Subscriber',
      type: 'reference',
      to: [{ type: 'subscriber' }],
      validation: Rule => Rule.required()
    }),
    defineField({ name: 'displayName', title: 'Display Name', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'username', title: 'Username', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'xp', title: 'Total XP', type: 'number', initialValue: 0 }),
    defineField({ name: 'level', title: 'Level', type: 'number', initialValue: 1 }),
    defineField({ name: 'rank', title: 'Global Rank', type: 'number' }),
    defineField({
      name: 'tier',
      title: 'Tier',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'Expert', value: 'expert' },
          { title: 'Master', value: 'master' },
          { title: 'Grandmaster', value: 'grandmaster' },
          { title: 'Legendary', value: 'legendary' }
        ]
      },
      initialValue: 'beginner'
    }),
    defineField({ name: 'currentStreak', title: 'Current Streak', type: 'number', initialValue: 0 }),
    defineField({ name: 'longestStreak', title: 'Longest Streak', type: 'number', initialValue: 0 }),
    defineField({ name: 'lastActiveDate', title: 'Last Active', type: 'datetime' }),
    defineField({ name: 'totalSolved', title: 'Total Solved', type: 'number', initialValue: 0 }),
    defineField({ name: 'easySolved', title: 'Easy Solved', type: 'number', initialValue: 0 }),
    defineField({ name: 'mediumSolved', title: 'Medium Solved', type: 'number', initialValue: 0 }),
    defineField({ name: 'hardSolved', title: 'Hard Solved', type: 'number', initialValue: 0 }),
    defineField({ name: 'totalSubmissions', title: 'Total Submissions', type: 'number', initialValue: 0 }),
    defineField({ name: 'acceptedSubmissions', title: 'Accepted Submissions', type: 'number', initialValue: 0 }),
    defineField({ name: 'badges', title: 'Badges', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'weeklyXp', title: 'Weekly XP', type: 'number', initialValue: 0 }),
    defineField({ name: 'monthlyXp', title: 'Monthly XP', type: 'number', initialValue: 0 }),
    defineField({ name: 'country', title: 'Country', type: 'string' }),
    defineField({ name: 'joinedAt', title: 'Joined At', type: 'datetime', initialValue: () => new Date().toISOString() })
  ],
  preview: {
    select: { title: 'displayName', username: 'username', xp: 'xp', tier: 'tier' },
    prepare({ title, username, xp, tier }) {
      return { title, subtitle: `@${username} • ${xp} XP • ${tier}` }
    }
  }
})
```

---

### 4. Learning Path Schema (`learningPath.ts`)

```typescript
// schemas/learningPath.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'learningPath',
  title: 'Learning Path',
  type: 'document',
  icon: () => '📚',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'icon', title: 'Icon (Material Symbol)', type: 'string', description: 'e.g., account_tree, functions' }),
    defineField({ name: 'color', title: 'Gradient Color', type: 'string', description: 'e.g., from-cyan-500 to-teal-500' }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: { list: ['easy', 'medium', 'hard'] }
    }),
    defineField({ name: 'totalXp', title: 'Total XP', type: 'number' }),
    defineField({ name: 'estimatedHours', title: 'Estimated Hours', type: 'number' }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'chapter' }] }]
    }),
    defineField({ name: 'prerequisites', title: 'Prerequisites', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'enrolledCount', title: 'Enrolled Count', type: 'number', initialValue: 0 }),
    defineField({ name: 'completedCount', title: 'Completed Count', type: 'number', initialValue: 0 }),
    defineField({ name: 'order', title: 'Display Order', type: 'number' })
  ]
})
```

---

### 5. Chapter Schema (`chapter.ts`)

```typescript
// schemas/chapter.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'chapter',
  title: 'Chapter',
  type: 'document',
  icon: () => '📖',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'order', title: 'Order', type: 'number', validation: Rule => Rule.required() }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'lesson' }] }]
    }),
    defineField({ name: 'xpReward', title: 'XP Reward', type: 'number', initialValue: 100 })
  ],
  preview: {
    select: { title: 'title', order: 'order' },
    prepare({ title, order }) {
      return { title: `${order}. ${title}` }
    }
  }
})
```

---

### 6. Lesson Schema (`lesson.ts`)

```typescript
// schemas/lesson.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: () => '📝',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'order', title: 'Order', type: 'number', validation: Rule => Rule.required() }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Concept (Theory)', value: 'concept' },
          { title: 'Exercise (Code)', value: 'exercise' },
          { title: 'Quiz', value: 'quiz' },
          { title: 'Challenge (Boss)', value: 'challenge' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'code' },
        { type: 'image' }
      ]
    }),
    defineField({ name: 'xpReward', title: 'XP Reward', type: 'number', initialValue: 50 }),
    defineField({ name: 'estimatedMinutes', title: 'Estimated Minutes', type: 'number', initialValue: 10 }),
    defineField({
      name: 'challenge',
      title: 'Linked Challenge',
      type: 'reference',
      to: [{ type: 'codingChallenge' }],
      hidden: ({ parent }) => !['exercise', 'challenge'].includes(parent?.type)
    }),
    defineField({
      name: 'quiz',
      title: 'Quiz Questions',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'question', title: 'Question', type: 'text' },
          { name: 'options', title: 'Options', type: 'array', of: [{ type: 'string' }] },
          { name: 'correctIndex', title: 'Correct Answer Index (0-based)', type: 'number' },
          { name: 'explanation', title: 'Explanation', type: 'text' }
        ]
      }],
      hidden: ({ parent }) => parent?.type !== 'quiz'
    })
  ],
  preview: {
    select: { title: 'title', type: 'type', xp: 'xpReward' },
    prepare({ title, type, xp }) {
      const emoji = type === 'concept' ? '🧠' : type === 'exercise' ? '💻' : type === 'quiz' ? '❓' : '⚔️'
      return { title: `${emoji} ${title}`, subtitle: `${type} • ${xp} XP` }
    }
  }
})
```

---

### 7. User Progress Schema (`userProgress.ts`)

```typescript
// schemas/userProgress.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'userProgress',
  title: 'User Progress',
  type: 'document',
  icon: () => '📊',
  fields: [
    defineField({ name: 'user', title: 'User', type: 'reference', to: [{ type: 'subscriber' }], validation: Rule => Rule.required() }),
    defineField({ name: 'learningPath', title: 'Learning Path', type: 'reference', to: [{ type: 'learningPath' }], validation: Rule => Rule.required() }),
    defineField({ name: 'completedLessons', title: 'Completed Lesson IDs', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'currentLesson', title: 'Current Lesson ID', type: 'string' }),
    defineField({ name: 'startedAt', title: 'Started At', type: 'datetime' }),
    defineField({ name: 'completedAt', title: 'Completed At', type: 'datetime' }),
    defineField({ name: 'xpEarned', title: 'XP Earned', type: 'number', initialValue: 0 })
  ]
})
```

---

## REGISTER SCHEMAS IN INDEX

Add to your `schemas/index.ts`:

```typescript
import codingChallenge from './codingChallenge'
import submission from './submission'
import userCodingProfile from './userCodingProfile'
import learningPath from './learningPath'
import chapter from './chapter'
import lesson from './lesson'
import userProgress from './userProgress'

export const schemaTypes = [
  // ... your existing schemas (blogPost, author, category, subscriber, comment, like)
  codingChallenge,
  submission,
  userCodingProfile,
  learningPath,
  chapter,
  lesson,
  userProgress,
]
```

---

## SAMPLE DATA TO CREATE

After adding schemas, create this sample data:

### Sample Challenges

| Title | Difficulty | XP | Category | isBossChallenge |
|-------|------------|-----|----------|-----------------|
| Two Sum | easy | 20 | Arrays | false |
| Reverse Linked List | easy | 20 | Linked Lists | true |
| Valid Parentheses | easy | 20 | Stack | false |
| Merge Two Sorted Lists | easy | 20 | Linked Lists | false |
| Maximum Subarray | medium | 40 | Dynamic Programming | false |
| Binary Tree Level Order | medium | 40 | Trees | true |
| LRU Cache | hard | 80 | Design | true |
| Trapping Rain Water | hard | 80 | Two Pointers | false |

### Sample Learning Path

**Title**: Data Structures Mastery  
**Slug**: data-structures-mastery  
**Icon**: account_tree  
**Color**: from-cyan-500 to-teal-500  
**Difficulty**: medium  
**Total XP**: 2000  
**Estimated Hours**: 20  

**Chapters**:
1. Chapter: "Basics" (Order: 1)
   - Lesson: "Introduction to Memory" (concept, 50 XP)
   - Lesson: "Arrays & Strings" (concept, 50 XP)
   - Lesson: "Two Sum Practice" (exercise, linked to Two Sum challenge)

2. Chapter: "Hierarchies" (Order: 2)
   - Lesson: "Trees & Graphs" (concept, 75 XP)
   - Lesson: "Binary Search Trees" (concept, 75 XP)
   - Lesson: "BST Quiz" (quiz)

3. Chapter: "Sorting" (Order: 3)
   - Lesson: "Sorting Algorithms" (concept, 100 XP)
   - Lesson: "Final Challenge" (challenge, linked to hard challenge)

---

## RELATIONSHIPS DIAGRAM

```
┌─────────────────┐
│   SUBSCRIBER    │◄─────────────────────────────────┐
│   (existing)    │                                   │
└────────┬────────┘                                   │
         │ references                                 │
         ▼                                            │
┌─────────────────┐     ┌─────────────────┐          │
│ userCodingProfile│     │   SUBMISSION    │──────────┤
│  (stats, XP)    │     │  (code, status) │          │
└─────────────────┘     └────────┬────────┘          │
                                 │                    │
                                 ▼                    │
                        ┌─────────────────┐          │
                        │ codingChallenge │◄─────────┤
                        │ (problems)      │          │
                        └─────────────────┘          │
                                 ▲                    │
                                 │                    │
┌─────────────────┐     ┌────────┴────────┐          │
│  learningPath   │────►│     LESSON      │          │
│   (courses)     │     │(concept/quiz)   │          │
└────────┬────────┘     └─────────────────┘          │
         │                                            │
         ▼                                            │
┌─────────────────┐     ┌─────────────────┐          │
│    CHAPTER      │────►│  userProgress   │──────────┘
│  (sections)     │     │(tracks learning)│
└─────────────────┘     └─────────────────┘
```

---

## GROQ QUERIES (Already implemented in frontend)

```groq
// Get all challenges
*[_type == "codingChallenge"] | order(order asc) {
  _id, title, slug, difficulty, xpReward, tags, category, 
  acceptanceRate, totalSolved, isBossChallenge
}

// Get single challenge
*[_type == "codingChallenge" && slug.current == $slug][0] {
  _id, title, slug, description, difficulty, xpReward,
  hints, starterCode, testCases[!isHidden], tags
}

// Get leaderboard
*[_type == "userCodingProfile"] | order(xp desc)[0...50] {
  _id, displayName, username, xp, level, tier, totalSolved
}

// Get learning paths
*[_type == "learningPath"] | order(order asc) {
  _id, title, slug, description, icon, color, difficulty,
  totalXp, estimatedHours,
  "chapters": chapters[]-> {
    _id, title, order, xpReward,
    "lessons": lessons[]-> { _id, title, slug, type, xpReward }
  }
}
```

---

## AFTER ADDING SCHEMAS

1. Deploy Sanity Studio: `sanity deploy`
2. Create sample coding challenges
3. Create a learning path with chapters and lessons
4. Test by visiting `/practice` on your website

