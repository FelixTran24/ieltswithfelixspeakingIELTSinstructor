import type { TopicSet } from '../types/ielts';

const PACK_CATEGORY = 'Focus Speaking (17.11–24.11)';
const PACK_CREATED_AT = '2026-11-17T08:00:00Z';

interface RawPart1Topic {
  num: number;
  title: string;
  questions: string[];
}

interface RawPart2And3Card {
  num: number;
  title: string;
  cuePoints: string[];
  part3Questions: string[];
}

const RAW_PART_1_TOPICS: RawPart1Topic[] = [
  {
    num: 1,
    title: 'Work or study',
    questions: [
      'What is the most interesting thing about your major?',
      'Are you working or are you a student?',
      'What do you dislike, or find boring or difficult, about your work?',
      'What subjects are you studying?',
      'What is your major?',
    ],
  },
  {
    num: 2,
    title: 'Home (accommodation)',
    questions: [
      'Do you live in a house or an apartment?',
      'How long have you lived there?',
      'Would you like to change anything in your home?',
      'What is your favourite room (or part) of your home?',
    ],
  },
  {
    num: 3,
    title: 'The area you live in',
    questions: [
      'Do you live in a noisy or a quiet area?',
      'Do you know any of your neighbours?',
      'Is the area where you live crowded (with people and cars)?',
      'Do you know how many people live in your area?',
    ],
  },
  {
    num: 4,
    title: 'Shoes',
    questions: [
      'How much money do you usually spend on shoes?',
      'Which do you prefer, fashionable shoes or comfortable shoes?',
      'Have you ever bought shoes online?',
      'Do you like buying shoes? How often?',
    ],
  },
  {
    num: 5,
    title: 'Headphones',
    questions: [
      'Do you find headphones comfortable to wear?',
      'When would you not use headphones?',
      'Do you use headphones?',
      'What type of headphones do you use?',
    ],
  },
  {
    num: 6,
    title: 'Cars and driving',
    questions: [
      'Do you prefer being a driver or a passenger?',
      'Would you like to own a good (expensive) car if you had the chance?',
      'Have you ever had a long car journey?',
      'Did you enjoy travelling by car when you were a child?',
    ],
  },
  {
    num: 7,
    title: 'Parks',
    questions: [
      'Do you still like going to parks now?',
      'Are there any parks you want to go to in the future?',
      'Did you like going to parks as a child?',
      'Would you like to see more parks in your city?',
    ],
  },
  {
    num: 8,
    title: 'Paper',
    questions: [
      'Do you prefer writing letters by hand or sending messages?',
      'Do people still keep handwritten letters today?',
      'Did you ever make things out of paper when you were a child?',
      'Do you recycle paper?',
    ],
  },
  {
    num: 9,
    title: 'Advertisement',
    questions: [
      'Do you often see advertisements when you are on your phone or computer?',
      'Do you see a lot of advertising on trains or other transport?',
      'Are you interested in watching TV ads or internet ads?',
      'What kinds of advertisements do you dislike?',
    ],
  },
  {
    num: 10,
    title: 'Watch',
    questions: [
      'Do you think it is important to wear a watch?',
      'Why do some people wear expensive watches?',
      'Would you receive a watch as a gift?',
      'Do you wear a watch?',
    ],
  },
  {
    num: 11,
    title: 'Clothing',
    questions: [
      'Do you prefer comfortable clothes or smart clothes?',
      'Will your style of clothes change in the future?',
      'Do you wear different clothes on weekdays and weekends?',
      'Do you like buying designer (brand-name) clothes?',
    ],
  },
  {
    num: 12,
    title: 'Neatness',
    questions: [
      'Did your parents teach you to be tidy when you were young?',
      'Did you keep things tidy when you were a child?',
      'What do you think of people who do not keep things tidy?',
      'Do you keep your room or workspace tidy?',
    ],
  },
  {
    num: 13,
    title: 'Singing',
    questions: [
      'Is singing popular among people around you?',
      'Do you listen to music while driving?',
      'Do your friends think you are good at singing?',
      'Do you like listening to other people sing?',
    ],
  },
  {
    num: 14,
    title: 'Rubbish and recycling',
    questions: [
      'Did you learn about recycling when you were at school?',
      'Do you think there will be more rubbish in the future?',
      'Do you recycle rubbish?',
      'How is the recycling service in your community?',
    ],
  },
  {
    num: 15,
    title: 'Vegetables',
    questions: [
      'How often do you eat fruit and vegetables?',
      'What kind of fruits and vegetables do you dislike?',
      'Where do people usually buy vegetables?',
      'Did you dislike eating any vegetables when you were little?',
    ],
  },
  {
    num: 16,
    title: 'Outer space and stars',
    questions: [
      'Have you ever learnt about outer space and stars?',
      'Do you like science fiction movies?',
      'Do you want to go into outer space in the future?',
      'Have you watched any sci-fi movies about space?',
    ],
  },
  {
    num: 17,
    title: 'Shopping',
    questions: [
      'Do you like shopping in malls?',
      'What are the advantages of online shopping?',
      'What are the disadvantages of online shopping?',
      'Do you compare prices in different shops before buying something?',
    ],
  },
  {
    num: 18,
    title: 'Politeness',
    questions: [
      'How did you learn about politeness when you were a child?',
      'Do you think being polite is important?',
      'Have you met anyone very polite recently?',
      'When did you learn to be polite?',
    ],
  },
  {
    num: 19,
    title: 'Websites',
    questions: [
      'What are the most popular websites in your country?',
      'Have there been any changes to the websites you often visit?',
      'Do you usually get information from websites or from books?',
      'Would you like to have your own website?',
    ],
  },
  {
    num: 20,
    title: 'Music',
    questions: [
      'Have you learned about music at school?',
      'Do you know how to play any musical instruments?',
      'Do you think all children should have music lessons at school?',
      'Do you think it is easy to learn to play a musical instrument?',
    ],
  },
  {
    num: 21,
    title: 'Science',
    questions: [
      'Why do you think some people enjoy learning science?',
      'Which area of science do you follow (pay most attention to)?',
      'What science subject did you learn at school?',
      'Do you like science?',
    ],
  },
  {
    num: 22,
    title: 'Tiredness',
    questions: [
      'What do you do when you feel tired?',
      'When would you feel tired?',
      'Do you often feel tired?',
    ],
  },
  {
    num: 23,
    title: 'Secondary school',
    questions: [
      'Who did you like the most when you were in high school?',
      'Were there any subjects that you found difficult (or disliked) at secondary school?',
      'Do you remember your first day at secondary school?',
      'Would you recommend your secondary school to others? Why?',
    ],
  },
  {
    num: 24,
    title: 'Remembering names',
    questions: [
      "Do you think it is important to remember people's names?",
      "Is it easy for you to remember people's names?",
      'How do you usually remember new names?',
      'What would you do if someone cannot remember your name?',
    ],
  },
  {
    num: 25,
    title: 'Jokes & Comedies',
    questions: [
      'Do you think laughing is important in daily life?',
      'Why do people enjoy humorous things?',
      'Are you good at telling jokes?',
      'Do you like watching comedy programs or movies?',
    ],
  },
  {
    num: 26,
    title: 'Social media',
    questions: [
      'Do your friends use social media apps?',
      'Do you usually use social media apps?',
      'What social media apps do you usually use?',
      'What do you usually do with social media apps?',
    ],
  },
  {
    num: 27,
    title: 'Morning time',
    questions: [
      'What do you usually do in the morning?',
      'Do you like getting up early in the morning?',
      'What do you usually do on weekend mornings?',
      'Do you spend your mornings doing the same things on both weekends and weekdays?',
    ],
  },
  {
    num: 28,
    title: 'Teachers',
    questions: [
      'Do you think teachers are different now than when your parents were students?',
      'Who was your favourite teacher?',
      'Which do you prefer, primary school teachers or high school teachers?',
      'Do you think teaching is a good job?',
    ],
  },
  {
    num: 29,
    title: 'New opportunities',
    questions: [
      'What new opportunities have you had recently?',
      'Are new opportunities important to people?',
      'Would you like to have more new opportunities?',
    ],
  },
  {
    num: 30,
    title: 'Hometown',
    questions: [
      'Where is your hometown?',
      'How long have you lived there?',
      'What kind of place is it?',
      'Do you know many people who live nearby?',
    ],
  },
  {
    num: 31,
    title: 'Feeling bored',
    questions: [
      'What do you do when you feel bored?',
      'Do you always feel bored?',
      'What things are boring to you?',
      'Do you think schooling was boring to you when you were a child?',
    ],
  },
  {
    num: 32,
    title: 'Daily routine',
    questions: [
      'When do you wake up?',
      'Have you ever changed your routine?',
      'What part of the day do you like most?',
      'What is your daily routine?',
    ],
  },
  {
    num: 33,
    title: 'Colors',
    questions: [
      'What is the most popular color in Uzbekistan?',
      'Do colors affect your mood?',
      'Did color matter to you when you were a child?',
      "What's the color you dislike? Why?",
    ],
  },
  {
    num: 34,
    title: 'Travelling',
    questions: [
      'What do you usually do during a long journey?',
      'Do you prefer travelling alone or with other people?',
      'Do you prefer to sit by the window when travelling?',
      'Did you have a long journey with your family as a child?',
    ],
  },
  {
    num: 35,
    title: 'Sleeping',
    questions: [
      'How many hours do you normally sleep at night?',
      'Do you go to sleep early or stay up late?',
      'How do you feel when you have stayed up late the night before?',
      'How do you feel when you wake up early?',
    ],
  },
  {
    num: 36,
    title: 'Plants',
    questions: [
      'Do you keep plants at home?',
      'What plant did you grow when you were young?',
      'Do you know anything about growing a plant?',
      'Do Uzbek people send plants as gifts?',
    ],
  },
];

const RAW_PART_2_AND_3_CARDS: RawPart2And3Card[] = [
  {
    num: 1,
    title: 'Describe an interview with a famous person that you watched',
    cuePoints: [
      'Who the famous person is',
      'What the interview was about',
      'Where you watched the interview',
      'And explain how you felt about this experience',
    ],
    part3Questions: [
      'Why do some famous people often give interviews? Is it all for entertainment?',
      'What should one prepare before a job interview?',
      'Do you share the interview with your friends after watching it?',
    ],
  },
  {
    num: 2,
    title: 'Describe a tall building you like/dislike',
    cuePoints: [
      'Where the building is',
      'What the building looks like (height, design, function)',
      'Whether you like it or dislike it (and why)',
      'And explain how living/working in such a building might affect people',
    ],
    part3Questions: [
      'Will people still live in tall buildings in the future?',
      'Why do many people prefer to buy land and build their own houses?',
      'Why should historical buildings be protected?',
    ],
  },
  {
    num: 3,
    title: 'Describe a boring place',
    cuePoints: [
      'Where it is',
      'When you went there',
      'Who you went with',
      'And explain what you did (or could do) to avoid boredom',
    ],
    part3Questions: [
      'What do people do when they feel bored?',
      'Why do people sometimes feel bored?',
      'Are big cities more interesting than small towns?',
    ],
  },
  {
    num: 4,
    title: 'Describe an enjoyable evening you spent with your friends',
    cuePoints: [
      'When and where it was',
      'Who you were with',
      'What you did that evening',
      'And explain why it was enjoyable',
    ],
    part3Questions: [
      'Do younger and older people do different things to relax?',
      'What do families usually do to strengthen their relationships?',
      'Should people spend more time with their family than with their friends?',
    ],
  },
  {
    num: 5,
    title: 'Describe a new law (e.g., environmental law) you would like to introduce to your country',
    cuePoints: [
      'What law it is',
      'What changes this law would bring',
      'Whether this new law will be popular',
      'And explain why you would like to introduce this law',
    ],
    part3Questions: [
      'Why do some professions have so many rules, like rules about uniforms?',
      'What rules do children usually have to follow?',
      'Should people be punished for breaking environmental rules?',
    ],
  },
  {
    num: 6,
    title: 'Describe a place you have travelled to that you would like to recommend to others',
    cuePoints: [
      'What it is',
      'Where it is',
      'When you went there',
      'What you saw and did there',
      'And explain why you want to recommend it to others',
    ],
    part3Questions: [
      'When do people usually choose to go on vacation?',
      'What influence does tourism have on local people?',
      'How do you make preparations for your vacation?',
    ],
  },
  {
    num: 7,
    title: 'Describe a natural place that you enjoy spending time in',
    cuePoints: [
      'Where it is',
      'What you do there',
      'Who you go there with',
      'And explain why you enjoy spending time there',
    ],
    part3Questions: [
      'Is it important to have natural places in cities?',
      'Is it necessary to have restricted rules in natural places?',
      'Do children in your country often play outdoors?',
    ],
  },
  {
    num: 8,
    title: 'Describe a person who is very good at learning languages',
    cuePoints: [
      'Who this person is',
      'How you know this person',
      'What languages he/she can learn or speak',
      'And explain why you think he/she is good at learning languages',
    ],
    part3Questions: [
      'In what situations do people need to speak a foreign language (e.g. when travelling)?',
      'Why do children learn languages faster than adults?',
      'What are the best ways for adults to learn a new language?',
    ],
  },
  {
    num: 9,
    title: 'Describe an exciting book you have read',
    cuePoints: [
      'What the book is',
      'What it is about',
      'Why you read it',
      'And explain why you think it is an exciting book',
    ],
    part3Questions: [
      'How are the books young people read different from those older people read?',
      'Do people like to read the novel before watching the film?',
      'What kinds of books do people like to read nowadays?',
    ],
  },
  {
    num: 10,
    title: 'Describe an interesting video',
    cuePoints: [
      'When and where you watched it',
      'What it is about',
      'Why you watched it',
      'And explain how you feel about it',
    ],
    part3Questions: [
      'Which is more helpful, watching videos or reading books?',
      'Are there any differences between videos young and old people like?',
      'Should governments regulate video content online?',
    ],
  },
  {
    num: 11,
    title: 'Describe a person who likes to grow plants',
    cuePoints: [
      'Who the person is',
      'What he or she grows',
      'Where he or she keeps the plants',
      'And explain how you feel about this person',
    ],
    part3Questions: [
      'Do many people in your country grow plants (for food)?',
      'What are the benefits of keeping green plants indoors?',
      'What kinds of plants do people like to grow at home?',
    ],
  },
  {
    num: 12,
    title: 'Describe a movie that disappointed you',
    cuePoints: [
      'What the movie was',
      'When you watched it',
      'Who you watched it with',
      'And explain why it disappointed you',
    ],
    part3Questions: [
      'What kinds of movies do people in Uzbekistan like to watch?',
      'Why do some movies cost a lot to produce?',
      'What changes has technology brought upon film production?',
    ],
  },
  {
    num: 13,
    title: 'Describe a person who has worked hard to improve their fitness',
    cuePoints: [
      'Who this person is',
      'What he or she did to improve their fitness',
      'How long it took',
      'And explain how you feel about what this person did',
    ],
    part3Questions: [
      'Do young people today pay more attention to their health than people did in the past?',
      'What should people do to stay healthy and fit today?',
      'Does the government have a role in building healthy communities?',
    ],
  },
  {
    num: 14,
    title: 'Describe a time when you got up early',
    cuePoints: [
      'When it was',
      'What you did',
      'Why you got up early',
      'And explain how you felt about it',
    ],
    part3Questions: [
      'Why do people get up early?',
      'What are the benefits of arriving on time?',
      'If everyone went to bed early, would everyone get up early?',
    ],
  },
  {
    num: 15,
    title: 'Describe a time when you saved money to buy something special',
    cuePoints: [
      'What the thing was',
      'How you saved the money',
      'How long it took you to save',
      'And explain how you felt after you bought it',
    ],
    part3Questions: [
      'Should schools teach students how to manage money from a young age?',
      'Why is saving money not easy?',
      'Should parents teach children to be generous with money?',
    ],
  },
  {
    num: 16,
    title: 'Describe an ambition you have / a dream you have',
    cuePoints: [
      'What your ambition/dream is',
      'When you first had it',
      'Why it is important to you',
      'And explain what might stop you from achieving it',
    ],
    part3Questions: [
      'Is it good or bad to have ambitious people in a team?',
      'What do most young people in your country dream of?',
      'Is ambition important for young people?',
    ],
  },
  {
    num: 17,
    title: 'Describe an activity you routinely do but that is a waste of time',
    cuePoints: [
      'What the activity is',
      'How often you do it',
      'Where you usually do it',
      'Why you think it is a waste of time',
      'And explain how you feel when you are doing it',
    ],
    part3Questions: [
      'Why do some people dislike following a routine?',
      'Do you think a certain amount of stress is good for people?',
      'Which is more important, money or happiness?',
    ],
  },
  {
    num: 18,
    title: 'Describe a person you know who has a successful business',
    cuePoints: [
      'Who this person is',
      'How you got to know him or her',
      'Why and how he or she started the business',
      'And explain why you think the business is successful',
    ],
    part3Questions: [
      'Are there any new businesses opening around where you live?',
      'Why do some people like shopping at small shops?',
      'What might cause a business to fail?',
    ],
  },
  {
    num: 19,
    title: 'Describe an animal character in a story/film',
    cuePoints: [
      'What the story/film is',
      'What the animal character is',
      'What role it plays in the story',
      'And explain what you learned from the character or the story',
    ],
    part3Questions: [
      'Is it necessary for children to learn about animals at school?',
      'Should children go to the zoo to see animals?',
      'Do people in Uzbekistan usually keep pets? Why?',
    ],
  },
  {
    num: 20,
    title: 'Describe a crowded place you have visited',
    cuePoints: [
      'Where it is',
      'When you went there',
      'With whom you went there',
      'And explain how you felt about being there',
    ],
    part3Questions: [
      'What kinds of places are usually crowded in Uzbek cities?',
      'What are the benefits of traveling when there are fewer people?',
      'Do crowded cities need some quiet places?',
    ],
  },
  {
    num: 21,
    title: 'Describe a special event, such as a party, that you attended',
    cuePoints: [
      'When the event took place',
      'Who attended the event',
      'What happened at the event',
      'And explain how you felt about this event',
    ],
    part3Questions: [
      'Do people prefer parties at home or in public places?',
      'Are there any dress requirements for parties?',
      'Why do people hold family parties in your country?',
    ],
  },
  {
    num: 22,
    title: 'Describe a sportsperson from your country who did well in a sports event',
    cuePoints: [
      'Who this sportsperson is',
      'What the sports event was',
      'What he/she did in the event',
      'And explain why you think he/she did so well in it',
    ],
    part3Questions: [
      'What are the most popular sports in your country?',
      'Should students have physical education and do sports at school?',
      'What skills does a successful sportsperson need?',
    ],
  },
  {
    num: 23,
    title: 'Describe a time when you helped someone to solve a problem',
    cuePoints: [
      'Who you helped',
      'What problem he/she had',
      'How you helped him/her to solve the problem',
      'And explain how you felt about helping this person to solve the problem',
    ],
    part3Questions: [
      'Why are some people unwilling to ask for help? Is that common in Uzbekistan?',
      'Should people help others?',
      'Should parents teach their children to help others?',
    ],
  },
  {
    num: 24,
    title: 'Describe a noisy place you have been to',
    cuePoints: [
      'Where it was',
      'Why you went there',
      'What you did',
      'And explain how you felt about being there',
    ],
    part3Questions: [
      'What places are rather noisy in your country?',
      'What do people usually do when they encounter noisy behaviour?',
      'What effects can noise have on people (for example, on their sleep)?',
    ],
  },
  {
    num: 25,
    title: 'Describe a time when you worked in a team',
    cuePoints: [
      'What the activity or task was',
      'Who you worked with',
      'Whether it was easy or difficult to work together',
      'And explain whether the teamwork was successful',
    ],
    part3Questions: [
      'What makes a good team leader?',
      'Is it good for children to learn teamwork at school?',
      'Why is teamwork important in the workplace?',
    ],
  },
  {
    num: 26,
    title: 'Describe a live sports event you watched and liked',
    cuePoints: [
      'What it was',
      'When and where you watched it',
      'Who you watched it with',
      'And explain why you liked it',
    ],
    part3Questions: [
      'What sports events do people in your country usually like to watch?',
      'What competitions do children usually have at school besides art and music?',
      'Should governments invest in hosting big sports events?',
    ],
  },
  {
    num: 27,
    title: 'Describe a person you know who is good at making things (using technology or by hand)',
    cuePoints: [
      'Who the person is',
      'What the person makes',
      'What materials or technology he/she uses',
      'And explain how you feel about this',
    ],
    part3Questions: [
      'What things do children like to make?',
      'Do creative workers need a quiet environment to work for long periods?',
      'Should all children take courses to learn making things?',
    ],
  },
  {
    num: 28,
    title: 'Describe an advertisement with a famous person in it',
    cuePoints: [
      'Who the person is',
      'Where you can see it',
      'What the advertisement is about',
      'And explain how you feel about the advertisement',
    ],
    part3Questions: [
      'Why do companies use famous people in advertisements?',
      'What kinds of advertisements are most common in your country?',
      'Do you think celebrity advertisements are effective?',
    ],
  },
  {
    num: 29,
    title: 'Describe a person you know who likes learning history',
    cuePoints: [
      'Who this person is',
      'How you know this person',
      'What kind of history he or she likes',
      'And explain why you think he or she likes history',
    ],
    part3Questions: [
      'Would you travel to a foreign country because of its history?',
      'Why do some people find it difficult to learn history?',
      'Do people know more about ancient history or modern history?',
    ],
  },
  {
    num: 30,
    title: 'Describe a person you know who is well organized',
    cuePoints: [
      'Who this person is',
      'When you got to know this person',
      'Why he or she needs to be well organized',
      'And explain how you feel about this person',
    ],
    part3Questions: [
      'Should parents teach their children to be well organized?',
      'And what about managers — do they need to be well organized too?',
      'What can people do to become more organized?',
    ],
  },
  {
    num: 31,
    title: 'Describe a short trip you often take but you do not like',
    cuePoints: [
      'Where you travel to',
      'How often you do this trip',
      'Why you need to do this trip',
      'And explain why you do not like this trip',
    ],
    part3Questions: [
      'What are the common ways that people travel?',
      'What are the benefits of travelling abroad?',
      'What can happen when people travel at crowded times?',
    ],
  },
  {
    num: 32,
    title: 'Describe a time when your friend did not reply to your message for a long time',
    cuePoints: [
      'Who the friend was',
      'When it happened',
      'Why they did not reply to your message',
      'And explain how you felt about this experience',
    ],
    part3Questions: [
      'Why do people sometimes not reply to messages quickly?',
      'How has the way people communicate changed?',
      'How can people be polite when writing letters?',
    ],
  },
  {
    num: 33,
    title: 'Describe a person who did something difficult and succeeded',
    cuePoints: [
      'Who this person is',
      'What difficult thing he or she did',
      'How he or she succeeded',
      'And explain why you think it was difficult',
    ],
    part3Questions: [
      'In which fields do companies succeed more easily?',
      'What qualities do people need to succeed in difficult tasks?',
      'Can you give an example from the entertainment industry?',
    ],
  },
  {
    num: 34,
    title: 'Describe a public building you would like to visit (e.g. a library or a sports center)',
    cuePoints: [
      'Where it is',
      'What it is like',
      'How you knew this place',
      'And explain why you would like to visit it',
    ],
    part3Questions: [
      'Which historical buildings are worth preserving?',
      'Do your friends like this building?',
      'Do people prefer living in flats or in detached houses?',
    ],
  },
  {
    num: 35,
    title: 'Describe a time when you received good service in a shop/store',
    cuePoints: [
      'Where the shop is',
      'When you went to the shop',
      'What service you received from the staff',
      'And explain how you felt about the service',
    ],
    part3Questions: [
      'What are the characteristics of good customer service?',
      'Do staff need to receive training before they serve customers?',
      'How can companies improve their customer service?',
    ],
  },
  {
    num: 36,
    title: 'Describe a person who taught you a new skill when you were a child',
    cuePoints: [
      'Who this person is',
      'What the skill was',
      'Whether it was difficult for you to learn this skill',
      'And explain how you felt about learning this skill',
    ],
    part3Questions: [
      'What skills should children learn before they start school?',
      'Is it easier for adults to learn from others than to learn completely by themselves?',
      'Is it good that many people now turn to the Internet to learn skills?',
    ],
  },
  {
    num: 37,
    title: 'Describe a person in your life who really likes taking photos',
    cuePoints: [
      'Who this person is',
      'When and where he or she takes photos',
      'What kind of photos he or she takes',
      'And explain why you think he or she likes taking photos',
    ],
    part3Questions: [
      'What type of photos do people often take?',
      'Why do people like taking photos?',
      'In what situations should people not take photos?',
    ],
  },
  {
    num: 38,
    title: 'Describe a friend from childhood whom you remember very well',
    cuePoints: [
      'Who he/she is',
      'Where you met each other',
      'What you often did together',
      'And explain what made you like him/her',
    ],
    part3Questions: [
      'Is it easy for children to make friends?',
      'Is it good to make friends with older generations?',
      'Is making friends important?',
    ],
  },
  {
    num: 39,
    title: 'Describe a person you know who you think is very happy',
    cuePoints: [
      'Who this person is',
      'How you know this person',
      'What makes this person happy',
      'And explain why you think this person is very happy',
    ],
    part3Questions: [
      'What things make students happy at school?',
      'Is it more important to like your job?',
      'How can the arts spread positive emotions in society?',
    ],
  },
  {
    num: 40,
    title: 'Describe a time when someone talked to you about something you were not interested in, but you kept listening',
    cuePoints: [
      'Who talked to you',
      'What he or she talked about',
      'Why you kept listening',
      'And explain how you felt about it',
    ],
    part3Questions: [
      'Do children like to chat with elderly people?',
      'What happens if you do not listen carefully when others are talking?',
      'What topics do children usually talk about with each other?',
    ],
  },
  {
    num: 41,
    title: 'Describe a popular person in your country',
    cuePoints: [
      'Who this person is',
      'How you know this person',
      'Why this person is popular',
      'And explain what this person has done recently',
    ],
    part3Questions: [
      'Why are some children popular at school?',
      'Should managers at a company be popular?',
      'What kinds of teachers are popular among students?',
    ],
  },
  {
    num: 42,
    title: 'Describe a home you like to visit but do not want to live in',
    cuePoints: [
      'Whose home it is',
      'How often you visit it',
      'What it is like inside',
      'And explain why you would not like to live there',
    ],
    part3Questions: [
      'What kind of gifts do people bring when they visit others?',
      "Do people in your country like to visit others' homes?",
      'What kind of place do most people in your country like to live in?',
    ],
  },
  {
    num: 43,
    title: 'Describe a plan that you had to change recently',
    cuePoints: [
      'When this happened',
      'What made you change the plan',
      'What the new plan was',
      'And explain how you felt about the change',
    ],
    part3Questions: [
      'Do people often encounter changes at work?',
      'What kinds of plans do people often make?',
      'Do you like it when plans change at the last minute?',
    ],
  },
  {
    num: 44,
    title: 'Describe a type of food eaten on special occasions',
    cuePoints: [
      'What the food is',
      'Which special occasion(s) people eat it on',
      'How it is made / where people get it',
      'Who you usually eat it with',
      'And explain why this food is special to you / to people',
    ],
    part3Questions: [
      'Do people usually cook special-occasion food at home or eat out?',
      'How are eating habits today different from those in the past?',
      "How does food reflect a country's culture?",
    ],
  },
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export const FOCUS_SPEAKING_PART_1: TopicSet[] = RAW_PART_1_TOPICS.map((item) => ({
  id: `focus-p1-${pad2(item.num)}`,
  title: item.title,
  part: 1,
  category: PACK_CATEGORY,
  description: `Bộ đề Focus Speaking (17.11–24.11) · Part 1 #${pad2(item.num)}.`,
  createdAt: PACK_CREATED_AT,
  questions: item.questions.map((text, idx) => ({
    id: `focus-p1-${pad2(item.num)}-q${idx + 1}`,
    text,
    recommendedSeconds: 45,
  })),
}));

export const FOCUS_SPEAKING_PART_2: TopicSet[] = RAW_PART_2_AND_3_CARDS.map((card) => ({
  id: `focus-p2-${pad2(card.num)}`,
  title: card.title,
  part: 2,
  category: PACK_CATEGORY,
  description: `Bộ đề Focus Speaking (17.11–24.11) · Cue Card #${pad2(card.num)} (1 phút chuẩn bị, 2 phút nói).`,
  createdAt: PACK_CREATED_AT,
  questions: [
    {
      id: `focus-p2-${pad2(card.num)}-q1`,
      text: card.title,
      cuePoints: card.cuePoints,
      prepSeconds: 60,
      recommendedSeconds: 120,
    },
  ],
}));

export const FOCUS_SPEAKING_PART_3: TopicSet[] = RAW_PART_2_AND_3_CARDS.map((card) => ({
  id: `focus-p3-${pad2(card.num)}`,
  title: card.title.replace(/^Describe\s+/i, ''),
  part: 3,
  category: PACK_CATEGORY,
  description: `Bộ đề Focus Speaking (17.11–24.11) · Part 3 Discussion đi kèm Cue Card #${pad2(card.num)}.`,
  createdAt: PACK_CREATED_AT,
  questions: card.part3Questions.map((text, idx) => ({
    id: `focus-p3-${pad2(card.num)}-q${idx + 1}`,
    text,
    recommendedSeconds: 75,
  })),
}));

export const FOCUS_SPEAKING_TOPICS: TopicSet[] = [
  ...FOCUS_SPEAKING_PART_1,
  ...FOCUS_SPEAKING_PART_2,
  ...FOCUS_SPEAKING_PART_3,
];
