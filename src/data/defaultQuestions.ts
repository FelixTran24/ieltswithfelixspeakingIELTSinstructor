import type { TopicSet } from '../types/ielts';

export const DEFAULT_TOPIC_BANK: TopicSet[] = [
  // ===================== PART 1: INTRODUCTION =====================
  {
    id: 'p1-holiday',
    title: 'Holiday',
    part: 1,
    category: 'Travel & Leisure',
    description: 'Chủ đề quen thuộc về kỳ nghỉ, sở thích du lịch và cách thư giãn sau thời gian làm việc.',
    createdAt: '2026-10-01T08:00:00Z',
    questions: [
      {
        id: 'p1-hol-1',
        text: 'Where did you go for your last holiday, and who did you go with?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-hol-2',
        text: 'Do you prefer relaxing on a beach or exploring a bustling city when you are on holiday?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-hol-3',
        text: 'What kind of activities do you usually enjoy doing during public holidays?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-hol-4',
        text: 'Do you think taking regular holidays is important for people nowadays?',
        recommendedSeconds: 45,
      },
    ],
  },
  {
    id: 'p1-work-study',
    title: 'Work & Study',
    part: 1,
    category: 'Personal Background',
    description: 'Bộ câu hỏi mở đầu phổ biến nhất trong hầu hết các kỳ thi IELTS Speaking thực tế.',
    createdAt: '2026-10-02T08:00:00Z',
    questions: [
      {
        id: 'p1-ws-1',
        text: 'Do you work or are you a student right now?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-ws-2',
        text: 'What do you enjoy most about your current job or major?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-ws-3',
        text: 'Do you prefer working or studying in the morning or late at night?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-ws-4',
        text: 'Is there any skill you would like to improve to help your future career?',
        recommendedSeconds: 45,
      },
    ],
  },
  {
    id: 'p1-hometown',
    title: 'Hometown',
    part: 1,
    category: 'Places',
    description: 'Mô tả nơi bạn sinh sống, nhịp sống địa phương và sự thay đổi theo thời gian.',
    createdAt: '2026-10-03T08:00:00Z',
    questions: [
      {
        id: 'p1-ht-1',
        text: 'Can you tell me a little bit about your hometown?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-ht-2',
        text: 'What is the most interesting part of your town or city for visitors?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-ht-3',
        text: 'Has your hometown changed much since you were a child?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-ht-4',
        text: 'Would you like to continue living there in the future?',
        recommendedSeconds: 45,
      },
    ],
  },
  {
    id: 'p1-technology',
    title: 'Technology & Daily Apps',
    part: 1,
    category: 'Modern Life',
    description: 'Thói quen sử dụng điện thoại, ứng dụng và tác động của công nghệ đến đời sống hàng ngày.',
    createdAt: '2026-10-04T08:00:00Z',
    questions: [
      {
        id: 'p1-tech-1',
        text: 'What kinds of apps do you use most frequently on your smartphone?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-tech-2',
        text: 'Do you think you spend too much time looking at screens every day?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-tech-3',
        text: 'How has technology made your daily routine more convenient?',
        recommendedSeconds: 45,
      },
      {
        id: 'p1-tech-4',
        text: 'Could you live without the internet for an entire week?',
        recommendedSeconds: 45,
      },
    ],
  },

  // ===================== PART 2: LONG-TURN (CUE CARDS) =====================
  {
    id: 'p2-memorable-trip',
    title: 'A Memorable Holiday',
    part: 2,
    category: 'Travel & Experiences',
    description: 'Bài nói độc thoại 2 phút (1 phút chuẩn bị) về một chuyến đi hoặc kỳ nghỉ đáng nhớ.',
    createdAt: '2026-10-05T08:00:00Z',
    questions: [
      {
        id: 'p2-trip-1',
        text: 'Describe a memorable holiday or trip that you took recently.',
        cuePoints: [
          'Where you went and when you took this trip',
          'Who you travelled with',
          'What activities you did there',
          'And explain why this holiday left such a strong impression on you',
        ],
        prepSeconds: 60,
        recommendedSeconds: 120,
      },
    ],
  },
  {
    id: 'p2-inspiring-person',
    title: 'An Inspiring Person',
    part: 2,
    category: 'People',
    description: 'Miêu tả một người đã truyền cảm hứng học tập hoặc thay đổi cách nhìn của bạn.',
    createdAt: '2026-10-06T08:00:00Z',
    questions: [
      {
        id: 'p2-person-1',
        text: 'Describe a person who has inspired you to do something interesting or meaningful.',
        cuePoints: [
          'Who this person is and how you know them',
          'What kind of personality they have',
          'What they inspired you to do',
          'And explain how this experience has influenced your life',
        ],
        prepSeconds: 60,
        recommendedSeconds: 120,
      },
    ],
  },
  {
    id: 'p2-new-skill',
    title: 'A Useful Skill You Learned',
    part: 2,
    category: 'Personal Growth',
    description: 'Chia sẻ quá trình rèn luyện một kỹ năng thực tế và những khó khăn bạn đã vượt qua.',
    createdAt: '2026-10-07T08:00:00Z',
    questions: [
      {
        id: 'p2-skill-1',
        text: 'Describe a practical skill you learned that took a lot of effort to master.',
        cuePoints: [
          'What the skill is',
          'When and how you decided to learn it',
          'What difficulties you faced along the way',
          'And explain why you feel proud of having learned it',
        ],
        prepSeconds: 60,
        recommendedSeconds: 120,
      },
    ],
  },
  {
    id: 'p2-quiet-place',
    title: 'A Peaceful Place to Unwind',
    part: 2,
    category: 'Places',
    description: 'Miêu tả một không gian yên tĩnh nơi bạn thường đến để tập trung hoặc thư giãn.',
    createdAt: '2026-10-08T08:00:00Z',
    questions: [
      {
        id: 'p2-place-1',
        text: 'Describe a quiet place you like to go when you want to relax or focus.',
        cuePoints: [
          'Where this place is located',
          'How often you visit it',
          'What you usually do when you are there',
          'And explain why this place helps you feel calm and refreshed',
        ],
        prepSeconds: 60,
        recommendedSeconds: 120,
      },
    ],
  },

  // ===================== PART 3: DISCUSSION =====================
  {
    id: 'p3-tourism-impact',
    title: 'Tourism & Cultural Preservation',
    part: 3,
    category: 'Society & Travel',
    description: 'Thảo luận chuyên sâu về tác động kinh tế, môi trường và văn hóa của du lịch đại chúng.',
    createdAt: '2026-10-09T08:00:00Z',
    questions: [
      {
        id: 'p3-tour-1',
        text: 'How has international tourism changed the way local communities live and preserve their traditions?',
        recommendedSeconds: 75,
      },
      {
        id: 'p3-tour-2',
        text: 'Do you think governments should limit the number of tourists visiting fragile natural landmarks?',
        recommendedSeconds: 75,
      },
      {
        id: 'p3-tour-3',
        text: 'Why do some people prefer travelling independently while others choose package tours?',
        recommendedSeconds: 75,
      },
      {
        id: 'p3-tour-4',
        text: 'In what ways might virtual reality influence the tourism industry over the next twenty years?',
        recommendedSeconds: 75,
      },
    ],
  },
  {
    id: 'p3-education-future',
    title: 'Education & Lifelong Learning',
    part: 3,
    category: 'Education',
    description: 'Phân tích vai trò của tự học, công nghệ giáo dục và kỹ năng mềm trong tương lai.',
    createdAt: '2026-10-10T08:00:00Z',
    questions: [
      {
        id: 'p3-edu-1',
        text: 'Why is lifelong learning becoming more essential in the modern job market compared to the past?',
        recommendedSeconds: 75,
      },
      {
        id: 'p3-edu-2',
        text: 'Should universities focus more on practical vocational skills or theoretical academic knowledge?',
        recommendedSeconds: 75,
      },
      {
        id: 'p3-edu-3',
        text: 'How effectively can online learning platforms replace traditional face-to-face classrooms?',
        recommendedSeconds: 75,
      },
    ],
  },
  {
    id: 'p3-environment-cities',
    title: 'Urban Life & Environment',
    part: 3,
    category: 'Environment',
    description: 'Bàn luận về phát triển đô thị bền vững, giao thông công cộng và trách nhiệm bảo vệ môi trường.',
    createdAt: '2026-10-11T08:00:00Z',
    questions: [
      {
        id: 'p3-env-1',
        text: 'What are the biggest environmental challenges facing rapidly growing cities today?',
        recommendedSeconds: 75,
      },
      {
        id: 'p3-env-2',
        text: 'Who bears greater responsibility for tackling climate change: individual citizens or large corporations?',
        recommendedSeconds: 75,
      },
      {
        id: 'p3-env-3',
        text: 'How can city planners encourage residents to use public transport instead of private vehicles?',
        recommendedSeconds: 75,
      },
    ],
  },
];
