# Sanity Schemas for Coding Platform

Add these schemas to your Sanity Studio's `schemas/` folder.

---

## 1. codingChallenge.ts

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
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Java', value: 'java' },
              { title: 'C++', value: 'cpp' },
              { title: 'Go', value: 'go' },
              { title: 'Rust', value: 'rust' }
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
      validation: Rule => Rule.required().min(10).max(500)
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
          { title: 'Math', value: 'Math' },
          { title: 'Bit Manipulation', value: 'Bit Manipulation' },
          { title: 'Hash Table', value: 'Hash Table' },
          { title: 'Two Pointers', value: 'Two Pointers' },
          { title: 'Sliding Window', value: 'Sliding Window' },
          { title: 'Stack', value: 'Stack' },
          { title: 'Queue', value: 'Queue' },
          { title: 'Heap', value: 'Heap' },
          { title: 'Recursion', value: 'Recursion' },
          { title: 'Backtracking', value: 'Backtracking' }
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
      of: [{ type: 'text' }]
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
                { title: 'TypeScript', value: 'typescript' },
                { title: 'Java', value: 'java' },
                { title: 'C++', value: 'cpp' },
                { title: 'Go', value: 'go' },
                { title: 'Rust', value: 'rust' }
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
      title: 'Boss Challenge (Daily)',
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

## 2. submission.ts

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
      title: 'Programming Language',
      type: 'string',
      options: {
        list: [
          { title: 'Python', value: 'python' },
          { title: 'JavaScript', value: 'javascript' },
          { title: 'TypeScript', value: 'typescript' },
          { title: 'Java', value: 'java' },
          { title: 'C++', value: 'cpp' },
          { title: 'Go', value: 'go' },
          { title: 'Rust', value: 'rust' }
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
    defineField({
      name: 'runtime',
      title: 'Runtime (ms)',
      type: 'number'
    }),
    defineField({
      name: 'memory',
      title: 'Memory (MB)',
      type: 'number'
    }),
    defineField({
      name: 'runtimePercentile',
      title: 'Runtime Percentile',
      type: 'number'
    }),
    defineField({
      name: 'memoryPercentile',
      title: 'Memory Percentile',
      type: 'number'
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error Message',
      type: 'text'
    }),
    defineField({
      name: 'testCasesPassed',
      title: 'Test Cases Passed',
      type: 'number'
    }),
    defineField({
      name: 'totalTestCases',
      title: 'Total Test Cases',
      type: 'number'
    }),
    defineField({
      name: 'notes',
      title: 'User Notes',
      type: 'text'
    }),
    defineField({
      name: 'createdAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ],
  preview: {
    select: {
      challengeTitle: 'challenge.title',
      status: 'status',
      language: 'language',
      createdAt: 'createdAt'
    },
    prepare({ challengeTitle, status, language, createdAt }) {
      const statusEmoji = status === 'accepted' ? '✅' : '❌'
      return {
        title: `${statusEmoji} ${challengeTitle}`,
        subtitle: `${language} • ${new Date(createdAt).toLocaleDateString()}`
      }
    }
  }
})
```

---

## 3. userCodingProfile.ts

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
    defineField({
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'xp',
      title: 'Total XP',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'number',
      initialValue: 1
    }),
    defineField({
      name: 'rank',
      title: 'Global Rank',
      type: 'number'
    }),
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
    defineField({
      name: 'currentStreak',
      title: 'Current Streak (Days)',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'longestStreak',
      title: 'Longest Streak (Days)',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'lastActiveDate',
      title: 'Last Active Date',
      type: 'datetime'
    }),
    defineField({
      name: 'totalSolved',
      title: 'Total Problems Solved',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'easySolved',
      title: 'Easy Problems Solved',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'mediumSolved',
      title: 'Medium Problems Solved',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'hardSolved',
      title: 'Hard Problems Solved',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'totalSubmissions',
      title: 'Total Submissions',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'acceptedSubmissions',
      title: 'Accepted Submissions',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'badges',
      title: 'Badges',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'weeklyXp',
      title: 'Weekly XP',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'monthlyXp',
      title: 'Monthly XP',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string'
    }),
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ],
  preview: {
    select: {
      title: 'displayName',
      username: 'username',
      xp: 'xp',
      tier: 'tier'
    },
    prepare({ title, username, xp, tier }) {
      return {
        title: title,
        subtitle: `@${username} • ${xp} XP • ${tier}`
      }
    }
  }
})
```

---

## 4. learningPath.ts

```typescript
// schemas/learningPath.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'learningPath',
  title: 'Learning Path',
  type: 'document',
  icon: () => '📚',
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
      type: 'text'
    }),
    defineField({
      name: 'icon',
      title: 'Icon (Material Symbol name)',
      type: 'string',
      description: 'e.g., account_tree, functions, grid_4x4'
    }),
    defineField({
      name: 'color',
      title: 'Gradient Color Class',
      type: 'string',
      description: 'e.g., from-cyan-500 to-teal-500'
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
      }
    }),
    defineField({
      name: 'totalXp',
      title: 'Total XP Reward',
      type: 'number'
    }),
    defineField({
      name: 'estimatedHours',
      title: 'Estimated Hours',
      type: 'number'
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'chapter' }] }]
    }),
    defineField({
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'enrolledCount',
      title: 'Enrolled Count',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'completedCount',
      title: 'Completed Count',
      type: 'number',
      initialValue: 0
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
      hours: 'estimatedHours'
    },
    prepare({ title, difficulty, hours }) {
      return {
        title: title,
        subtitle: `${difficulty} • ${hours}h`
      }
    }
  }
})
```

---

## 5. chapter.ts

```typescript
// schemas/chapter.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'chapter',
  title: 'Chapter',
  type: 'document',
  icon: () => '📖',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'lesson' }] }]
    }),
    defineField({
      name: 'xpReward',
      title: 'XP Reward for Completion',
      type: 'number',
      initialValue: 100
    })
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order'
    },
    prepare({ title, order }) {
      return {
        title: `${order}. ${title}`,
        subtitle: `Chapter ${order}`
      }
    }
  }
})
```

---

## 6. lesson.ts

```typescript
// schemas/lesson.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: () => '📝',
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
      name: 'order',
      title: 'Order within Chapter',
      type: 'number',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'type',
      title: 'Lesson Type',
      type: 'string',
      options: {
        list: [
          { title: 'Concept (Theory)', value: 'concept' },
          { title: 'Exercise (Practice)', value: 'exercise' },
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
        {
          type: 'code',
          options: {
            language: 'python',
            languageAlternatives: [
              { title: 'Python', value: 'python' },
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Java', value: 'java' },
              { title: 'C++', value: 'cpp' }
            ]
          }
        },
        { type: 'image' },
        {
          type: 'object',
          name: 'callout',
          title: 'Callout',
          fields: [
            { name: 'type', type: 'string', options: { list: ['info', 'warning', 'tip', 'note'] } },
            { name: 'content', type: 'text' }
          ]
        }
      ]
    }),
    defineField({
      name: 'xpReward',
      title: 'XP Reward',
      type: 'number',
      initialValue: 50
    }),
    defineField({
      name: 'estimatedMinutes',
      title: 'Estimated Minutes',
      type: 'number',
      initialValue: 10
    }),
    defineField({
      name: 'challenge',
      title: 'Linked Challenge (for exercise/challenge types)',
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
          {
            name: 'options',
            title: 'Options',
            type: 'array',
            of: [{ type: 'string' }],
            validation: Rule => Rule.min(2).max(6)
          },
          { name: 'correctIndex', title: 'Correct Option Index (0-based)', type: 'number' },
          { name: 'explanation', title: 'Explanation', type: 'text' }
        ]
      }],
      hidden: ({ parent }) => parent?.type !== 'quiz'
    })
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      xp: 'xpReward'
    },
    prepare({ title, type, xp }) {
      const emoji = type === 'concept' ? '🧠' : type === 'exercise' ? '💻' : type === 'quiz' ? '❓' : '⚔️'
      return {
        title: `${emoji} ${title}`,
        subtitle: `${type} • ${xp} XP`
      }
    }
  }
})
```

---

## 7. userProgress.ts

```typescript
// schemas/userProgress.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'userProgress',
  title: 'User Progress',
  type: 'document',
  icon: () => '📊',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'subscriber' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'learningPath',
      title: 'Learning Path',
      type: 'reference',
      to: [{ type: 'learningPath' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'completedLessons',
      title: 'Completed Lesson IDs',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'currentLesson',
      title: 'Current Lesson ID',
      type: 'string'
    }),
    defineField({
      name: 'startedAt',
      title: 'Started At',
      type: 'datetime'
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime'
    }),
    defineField({
      name: 'xpEarned',
      title: 'XP Earned',
      type: 'number',
      initialValue: 0
    })
  ],
  preview: {
    select: {
      user: 'user.name',
      path: 'learningPath.title',
      lessons: 'completedLessons'
    },
    prepare({ user, path, lessons }) {
      return {
        title: `${user} - ${path}`,
        subtitle: `${lessons?.length || 0} lessons completed`
      }
    }
  }
})
```

---

## 8. Update your schema index

In your `schemas/index.ts` (or wherever you export schemas), add:

```typescript
// schemas/index.ts
import codingChallenge from './codingChallenge'
import submission from './submission'
import userCodingProfile from './userCodingProfile'
import learningPath from './learningPath'
import chapter from './chapter'
import lesson from './lesson'
import userProgress from './userProgress'

// ... your existing schemas

export const schemaTypes = [
  // ... your existing types
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

## Summary of Schemas

| Schema | Purpose |
|--------|---------|
| `codingChallenge` | Coding problems with test cases, hints, starter code |
| `submission` | User code submissions with status, runtime, memory |
| `userCodingProfile` | User stats: XP, level, tier, streak, solved counts |
| `learningPath` | Structured courses (Data Structures, Algorithms, etc.) |
| `chapter` | Sections within a learning path |
| `lesson` | Individual lessons (concept/exercise/quiz/challenge) |
| `userProgress` | Tracks user progress through learning paths |

---

## Sample Data to Get Started

After adding the schemas, create some sample content:

### Sample Coding Challenge (Two Sum)
```json
{
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "easy",
  "xpReward": 20,
  "timeEstimate": 15,
  "category": "Arrays",
  "tags": ["array", "hash-table"],
  "isBossChallenge": false,
  "order": 1,
  "acceptanceRate": 49.8
}
```

### Sample Learning Path
```json
{
  "title": "Data Structures Mastery",
  "slug": "data-structures-mastery",
  "description": "Master arrays, linked lists, trees, graphs, and more",
  "icon": "account_tree",
  "color": "from-cyan-500 to-teal-500",
  "difficulty": "medium",
  "totalXp": 2000,
  "estimatedHours": 20,
  "order": 1
}
```

