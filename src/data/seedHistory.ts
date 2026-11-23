import type { PracticeSession } from '../types/ielts';

/**
 * Sample practice sessions preloaded so learners can immediately explore
 * the longitudinal Band Score trend chart, word-level IPA breakdown, and
 * upgraded Band 8.0+ sample feedback before recording their first live session.
 */
export const SEED_HISTORY_SESSIONS: PracticeSession[] = [
  {
    id: 'seed-session-1',
    createdAt: '2026-11-05T09:30:00Z',
    part: 1,
    topicId: 'p1-holiday',
    topicTitle: 'Holiday',
    questionId: 'p1-hol-2',
    questionText:
      'Do you prefer relaxing on a beach or exploring a bustling city when you are on holiday?',
    durationSeconds: 38,
    hasAudio: false,
    isSeed: true,
    analysis: {
      transcript:
        'Honestly, I prefer relaxing on a beach because my work is very stressful and busy. When I go to the beach, I can listen to the sea wave and eat fresh seafood with my family. City trip is also interesting, however it make me feel tired after walking all day.',
      audioEvaluated: true,
      overallBand: 6.0,
      criteria: {
        fluencyCoherence: {
          band: 6,
          summaryVi:
            'Giữ được mạch nói ổn định cho câu hỏi Part 1, ý rõ ràng và có sử dụng từ nối cơ bản (because, however), nhưng đôi chỗ còn ngắn và thiếu mở rộng tự nhiên.',
          strengthsVi: [
            'Trả lời trực tiếp vào trọng tâm câu hỏi ngay câu đầu tiên.',
            'Biết so sánh giữa hai lựa chọn (beach vs city) để tạo độ sâu.',
          ],
          improvementsVi: [
            'Mở rộng thêm một trải nghiệm cụ thể để kéo dài câu trả lời lên 40–50 giây mượt mà hơn.',
            'Dùng discourse markers tự nhiên hơn cho văn nói thay cho "however" hơi mang tính văn viết.',
          ],
        },
        lexicalResource: {
          band: 6,
          summaryVi:
            'Từ vựng đủ để diễn đạt ý rõ ràng nhưng còn phổ thông (very stressful, interesting, tired), chưa có collocations hoặc idioms đắt giá.',
          strengthsVi: [
            'Diễn đạt ý nghĩa rõ ràng, dễ hiểu.',
            'Dùng cụm "fresh seafood" chính xác theo ngữ cảnh.',
          ],
          improvementsVi: [
            'Thay "very stressful" bằng "hectic / demanding schedule" và "relax" bằng "unwind / recharge my batteries".',
            'Sửa lỗi kết hợp từ "sea wave" -> "the sound of ocean waves".',
          ],
        },
        grammaticalRange: {
          band: 6,
          summaryVi:
            'Có sử dụng câu phức với "because" và "when", nhưng vẫn còn lỗi chia động từ số ít/số nhiều cơ bản ("it make", "City trip is").',
          strengthsVi: [
            'Cấu trúc câu cơ bản rõ ràng, không gây cản trở giao tiếp.',
          ],
          improvementsVi: [
            'Kiểm soát sự hòa hợp chủ ngữ - động từ ở thì hiện tại đơn ("it makes me feel...").',
            'Bổ sung cấu trúc điều kiện hoặc mệnh đề quan hệ để nâng range lên Band 7+.',
          ],
        },
        pronunciation: {
          band: 6,
          summaryVi:
            'Nhìn chung dễ hiểu, nhưng hay thiếu âm cuối /s/, /z/ và nhấn trọng âm chưa đều ở các từ đa âm tiết như "relaxing", "interesting".',
          strengthsVi: [
            'Tốc độ nói vừa phải, ngắt cụm ý hợp lý.',
          ],
          improvementsVi: [
            'Chú ý âm đuôi số nhiều ở "waves" /weɪvz/ và động từ ngôi 3 số ít "makes" /meɪks/.',
            'Luyện âm /ʃ/ trong "fresh" và trọng âm âm tiết đầu của "interesting".',
          ],
        },
      },
      pronunciationAnalysis: {
        overallAccuracyPercent: 78,
        summaryVi:
          'Độ rõ âm tổng thể đạt 78%. Cần tập trung khắc phục âm cuối /z/, /s/ và nguyên âm căng /iː/ trong các từ như "beach" để tránh nhầm nghĩa.',
        words: [
          {
            word: 'Honestly',
            ipa: '/ˈɒn.ɪst.li/',
            accuracyPercent: 90,
            status: 'good',
            fixTip: 'Âm /h/ câm được xử lý tốt, giữ nhẹ ngữ điệu mở đầu tự nhiên.',
          },
          {
            word: 'prefer',
            ipa: '/prɪˈfɜːr/',
            accuracyPercent: 86,
            status: 'good',
            fixTip: 'Trọng âm rơi đúng âm tiết thứ 2.',
          },
          {
            word: 'relaxing',
            heardAs: 're-lac-sing',
            ipa: '/rɪˈlæk.sɪŋ/',
            accuracyPercent: 74,
            status: 'fair',
            fixTip: 'Nhấn mạnh âm /læk/, thả lỏng âm đầu /rɪ/ thay vì đọc nặng thành /riː/.',
          },
          {
            word: 'beach',
            heardAs: 'bitch',
            ipa: '/biːtʃ/',
            accuracyPercent: 62,
            status: 'needs_work',
            fixTip: 'Kéo dài nguyên âm /iː/ (cười nhẹ khóe miệng) và bật rõ âm cuối /tʃ/.',
          },
          {
            word: 'stressful',
            heardAs: 'tress-ful',
            ipa: '/ˈstres.fəl/',
            accuracyPercent: 68,
            status: 'fair',
            fixTip: 'Đọc rõ cụm phụ âm đầu /str/ và âm /s/ giữa từ trước khi chuyển sang /fəl/.',
          },
          {
            word: 'waves',
            heardAs: 'wave',
            ipa: '/weɪvz/',
            accuracyPercent: 58,
            status: 'needs_work',
            fixTip: 'Bổ sung âm đuôi hữu thanh /z/ sau âm /v/ để đảm bảo đúng số nhiều.',
          },
          {
            word: 'seafood',
            ipa: '/ˈsiː.fuːd/',
            accuracyPercent: 88,
            status: 'good',
            fixTip: 'Phát âm rõ ràng hai nguyên âm dài /iː/ và /uː/.',
          },
          {
            word: 'interesting',
            heardAs: 'in-te-res-ting',
            ipa: '/ˈɪn.trəs.tɪŋ/',
            accuracyPercent: 72,
            status: 'fair',
            fixTip: 'Nuốt âm giữa để đọc 3 âm tiết /ˈɪn.trəs.tɪŋ/ sẽ tự nhiên như người bản xứ.',
          },
          {
            word: 'exhausting',
            heardAs: 'tired',
            ipa: '/ɪɡˈzɔː.stɪŋ/',
            accuracyPercent: 84,
            status: 'fair',
            fixTip: 'Nếu nâng cấp thay cho "tired", nhớ nhấn âm 2 /ˈzɔː/ và đọc âm /ɡz/.',
          },
        ],
      },
      errorCorrections: [
        {
          original: 'listen to the sea wave',
          corrected: 'listen to the soothing sound of ocean waves',
          category: 'Collocation',
          explanationVi: 'Danh từ "waves" thường dùng ở dạng số nhiều khi nói về sóng biển nói chung, và kết hợp tự nhiên hơn với "ocean waves".',
        },
        {
          original: 'City trip is also interesting, however it make me feel tired',
          corrected: 'City breaks can be exciting too, though they often leave me feeling drained',
          category: 'Grammar',
          explanationVi: 'Sửa "City trip" -> "City breaks" (số nhiều tự nhiên), "it make" -> chia động từ đúng chủ ngữ, và thay "however" bằng "though" cho tự nhiên trong văn nói.',
        },
      ],
      vocabularyUpgrades: [
        {
          expression: 'recharge my batteries',
          type: 'Idiom',
          ipa: '/ˌriːˈtʃɑːdʒ maɪ ˈbæt.ər.iz/',
          meaningVi: 'Nạp lại năng lượng, nghỉ ngơi phục hồi tinh thần',
          usageExample: 'A quiet seaside getaway is the best way for me to recharge my batteries.',
        },
        {
          expression: 'a hectic schedule',
          type: 'Collocation',
          ipa: '/ə ˈhek.tɪk ˈʃed.juːl/',
          meaningVi: 'Lịch trình bận rộn, quay cuồng',
          usageExample: 'After months of juggling a hectic schedule, I crave peace and quiet.',
        },
        {
          expression: 'city break',
          type: 'Topic Vocabulary',
          ipa: '/ˈsɪt.i breɪk/',
          meaningVi: 'Chuyến du lịch ngắn ngày tới một thành phố',
          usageExample: 'While I occasionally enjoy a weekend city break, beaches win every time.',
        },
        {
          expression: 'soak up the sun',
          type: 'Natural Phrase',
          ipa: '/səʊk ʌp ðə sʌn/',
          meaningVi: 'Tận hưởng ánh nắng, tắm nắng thư giãn',
          usageExample: 'Nothing beats lying on the sand and soaking up the sun.',
        },
      ],
      coherenceBoost: {
        ideaExtensions: [
          {
            angleVi: 'Mở rộng bằng lý do cảm xúc & giác quan',
            ideaEn: 'Describe how the slow pace and sea breeze mentally reset your mind compared to city noise.',
            explanationVi: 'Thêm 1 câu mô tả cảm giác thư thái (tiếng sóng, không khí trong lành) giúp câu trả lời liền mạch và có chiều sâu hơn hẳn.',
          },
          {
            angleVi: 'Nhượng bộ nhẹ sang lựa chọn còn lại',
            ideaEn: 'Acknowledge when you might still choose a city trip (e.g., for food tours or museums in cooler weather).',
            explanationVi: 'Cách nói cân bằng 2 chiều ("tuy nhiên nếu chỉ đi cuối tuần ngắn ngày...") tạo mạch lập luận tự nhiên chuẩn Band 7+.',
          },
          {
            angleVi: 'Liên hệ ví dụ cá nhân gần đây',
            ideaEn: 'Briefly mention a recent coastal trip with your family to anchor your preference in real life.',
            explanationVi: 'Một ví dụ thực tế ngắn 1 câu giúp câu trả lời Part 1 không bị cụt và tránh lặp từ.',
          },
        ],
        recommendedConnectors: [
          {
            connector: 'To be honest, ... / Personally, ...',
            functionVi: 'Mở đầu quan điểm cá nhân tự nhiên',
            exampleInContext: 'To be honest, I lean heavily towards a relaxing beach getaway.',
          },
          {
            connector: 'Especially since ...',
            functionVi: 'Đưa nguyên nhân gắn với bối cảnh hiện tại',
            exampleInContext: 'I crave quiet beaches, especially since my work schedule has been quite hectic lately.',
          },
          {
            connector: 'Having said that, ... / Mind you, ...',
            functionVi: 'Chuyển ý tương phản mềm mại cho văn nói (thay cho "however")',
            exampleInContext: 'Having said that, a short city break can still be fun if I am in the mood for street food.',
          },
          {
            connector: 'On top of that, ...',
            functionVi: 'Bổ sung thêm lý do ủng hộ',
            exampleInContext: 'On top of that, sitting by the shore with fresh seafood helps my whole family reconnect.',
          },
        ],
      },
      improvedAnswer: {
        bandTarget: 'Band 8.0',
        text: 'To be honest, I lean heavily towards a relaxing beach getaway, especially since I have been juggling a pretty hectic schedule lately. There is something genuinely therapeutic about listening to the ocean waves, soaking up the sun, and enjoying fresh seafood with my family—it really helps me recharge my batteries. While a bustling city break can be exciting, all the non-stop sightseeing tends to leave me feeling even more drained than before I left.',
        keyTakeawaysVi: [
          'Dùng "lean heavily towards" thay vì "prefer" giúp mở đầu tự nhiên và giàu sắc thái.',
          'Kết hợp idiom "recharge my batteries" và collocation "hectic schedule" đúng ngữ cảnh.',
          'Sử dụng mệnh đề nhượng bộ "While..., ..." để nâng cấp cấu trúc ngữ pháp phức tạp.',
        ],
      },
      generalFeedbackVi:
        'Bài nói đã truyền tải đúng ý và có cấu trúc so sánh rõ ràng. Để bứt phá lên Band 7.0+, bạn chỉ cần chú ý âm cuối /s/-/z/, sửa lỗi hòa hợp chủ-vị và thay một số tính từ cơ bản bằng collocations tự nhiên về du lịch.',
    },
  },
  {
    id: 'seed-session-2',
    createdAt: '2026-11-14T15:10:00Z',
    part: 2,
    topicId: 'p2-memorable-trip',
    topicTitle: 'A Memorable Holiday',
    questionId: 'p2-trip-1',
    questionText: 'Describe a memorable holiday or trip that you took recently.',
    cuePoints: [
      'Where you went and when you took this trip',
      'Who you travelled with',
      'What activities you did there',
      'And explain why this holiday left such a strong impression on you',
    ],
    durationSeconds: 108,
    hasAudio: false,
    isSeed: true,
    analysis: {
      transcript:
        'I would like to talk about a really memorable trip I took to Da Lat last winter with three of my closest university friends. We decided to go there right after finishing our final exams because everyone was completely exhausted. During the three-day trip, we rented motorbikes to explore pine forests, visited cozy local coffee shops overlooking the valley, and tried street food at the night market. What made this holiday truly unforgettable was the peaceful atmosphere and the deep conversations we shared late at night without checking our phones.',
      audioEvaluated: true,
      overallBand: 6.5,
      criteria: {
        fluencyCoherence: {
          band: 6,
          summaryVi:
            'Kể chuyện có trình tự thời gian logic, bám sát đủ 4 gợi ý trong Cue Card và duy trì mạch nói gần 2 phút khá tự tin.',
          strengthsVi: [
            'Mở bài nhanh gọn, chuyển đoạn rõ ràng ("During the three-day trip...", "What made this holiday...").',
            'Tốc độ ổn định, có cảm xúc thật trong câu chuyện.',
          ],
          improvementsVi: [
            'Thêm một tình huống bất ngờ hoặc chi tiết giác quan (thời tiết se lạnh, mùi cà phê rang) để câu chuyện sống động và chạm mốc 1:55–2:00.',
          ],
        },
        lexicalResource: {
          band: 7,
          summaryVi:
            'Sử dụng nhiều cụm từ miêu tả sinh động và tự nhiên như "completely exhausted", "cozy local coffee shops", "overlooking the valley".',
          strengthsVi: [
            'Dùng tốt cụm phân từ miêu tả cảnh quan ("overlooking the valley").',
            'Paraphrase linh hoạt từ "memorable" sang "truly unforgettable".',
          ],
          improvementsVi: [
            'Chèn thêm 1–2 thành ngữ tự nhiên như "off the beaten track" hoặc "disconnect from the hustle and bustle".',
          ],
        },
        grammaticalRange: {
          band: 7,
          summaryVi:
            'Kiểm soát tốt thì quá khứ đơn và câu chẻ nhấn mạnh ("What made this holiday truly unforgettable was...").',
          strengthsVi: [
            'Sử dụng thành công mệnh đề danh từ (cleft sentence) ở phần kết.',
            'Hầu như không có lỗi ngữ pháp cơ bản gây nhiễu nghĩa.',
          ],
          improvementsVi: [
            'Đa dạng hóa thêm thì quá khứ hoàn thành (had been studying...) hoặc câu điều kiện loại 3 để thể hiện độ linh hoạt Band 8.',
          ],
        },
        pronunciation: {
          band: 6,
          summaryVi:
            'Phát âm khá rõ ràng, ngữ điệu tự nhiên khi liệt kê; chỉ cần cải thiện trọng âm ở vài từ dài như "atmosphere" và "unforgettable".',
          strengthsVi: [
            'Ngắt nghỉ cụm danh từ tự nhiên, người nghe hiểu dễ dàng.',
          ],
          improvementsVi: [
            'Nhấn rõ trọng âm âm tiết 1 của "atmosphere" /ˈæt.məs.fɪər/ và âm tiết 3 của "unforgettable".',
          ],
        },
      },
      pronunciationAnalysis: {
        overallAccuracyPercent: 84,
        summaryVi:
          'Độ chính xác đạt 84% — tăng 6% so với bài trước! Trọng âm câu tốt hơn hẳn, chỉ còn vài từ đa âm tiết cần tinh chỉnh.',
        words: [
          {
            word: 'memorable',
            ipa: '/ˈmem.ər.ə.bəl/',
            accuracyPercent: 88,
            status: 'good',
            fixTip: 'Trọng âm rơi đúng âm tiết đầu, đọc gọn gàng.',
          },
          {
            word: 'exhausted',
            heardAs: 'ex-haus-ted',
            ipa: '/ɪɡˈzɔː.stɪd/',
            accuracyPercent: 76,
            status: 'fair',
            fixTip: 'Âm /h/ câm trong "exhausted"; nối thẳng /ɪɡˈzɔː/ thay vì bật âm /h/.',
          },
          {
            word: 'overlooking',
            ipa: '/ˌəʊ.vəˈlʊk.ɪŋ/',
            accuracyPercent: 91,
            status: 'good',
            fixTip: 'Phát âm mượt và giữ đúng nhịp.',
          },
          {
            word: 'atmosphere',
            heardAs: 'at-mos-phear',
            ipa: '/ˈæt.məs.fɪər/',
            accuracyPercent: 69,
            status: 'fair',
            fixTip: 'Nhấn mạnh âm đầu /ˈæt/, giảm nhẹ âm giữa thành /məs/ thay vì đọc rõ /mɒs/.',
          },
          {
            word: 'unforgettable',
            ipa: '/ˌʌn.fəˈɡet.ə.bəl/',
            accuracyPercent: 86,
            status: 'good',
            fixTip: 'Trọng âm chính rơi chuẩn vào /ˈɡet/.',
          },
        ],
      },
      errorCorrections: [
        {
          original: 'tried street food at the night market',
          corrected: 'sampled local street delicacies at the bustling night market',
          category: 'Vocabulary',
          explanationVi: 'Động từ "sample" kết hợp với "local delicacies" mang sắc thái trải nghiệm ẩm thực tinh tế hơn "tried street food".',
        },
      ],
      vocabularyUpgrades: [
        {
          expression: 'off the beaten track',
          type: 'Idiom',
          ipa: '/ˌɒf ðə ˌbiː.tən ˈtræk/',
          meaningVi: 'Nơi hẻo lánh, ít khách du lịch biết đến',
          usageExample: 'We rode our motorbikes off the beaten track to discover hidden pine hills.',
        },
        {
          expression: 'digital detox',
          type: 'Collocation',
          ipa: '/ˌdɪdʒ.ɪ.təl ˈdiː.tɒks/',
          meaningVi: 'Khoảng thời gian tạm rời xa thiết bị điện tử',
          usageExample: 'Leaving our phones aside turned the weekend into a much-needed digital detox.',
        },
        {
          expression: 'unwind in the crisp mountain air',
          type: 'Natural Phrase',
          ipa: '/ʌnˈwaɪnd ɪn ðə krɪsp ˈmaʊn.tɪn eər/',
          meaningVi: 'Thư giãn giữa không khí se lạnh trong lành của miền núi',
          usageExample: 'It felt wonderful to unwind in the crisp mountain air after exam season.',
        },
      ],
      coherenceBoost: {
        ideaExtensions: [
          {
            angleVi: 'Tạo bước ngoặt nhỏ trong câu chuyện (Mini-highlight)',
            ideaEn: 'Mention an unexpected moment—such as getting caught in light highland mist and stumbling upon a hidden café.',
            explanationVi: 'Trong Part 2, kể một tình tiết nhỏ bất ngờ giúp bài nói chuyển từ liệt kê sang kể chuyện cuốn hút và tự nhiên hơn.',
          },
          {
            angleVi: 'Đào sâu cảm xúc trước & sau chuyến đi',
            ideaEn: 'Contrast how burnt out you felt before the trip with how re-energized you felt returning home.',
            explanationVi: 'Đối chiếu trạng thái "trước — sau" tạo khung kết bài chặt chẽ, nhấn mạnh rõ lý do chuyến đi đáng nhớ.',
          },
        ],
        recommendedConnectors: [
          {
            connector: 'Looking back, ...',
            functionVi: 'Mở đầu phần hồi tưởng & tổng kết cảm xúc',
            exampleInContext: 'Looking back, that weekend was exactly the digital detox we all needed.',
          },
          {
            connector: 'At first, ... / Eventually, ...',
            functionVi: 'Dẫn dắt diễn biến thời gian mượt mà trong Part 2',
            exampleInContext: 'At first, we planned a packed itinerary, but eventually we decided to just slow down.',
          },
          {
            connector: 'What stood out the most was ...',
            functionVi: 'Chuyển mượt sang ý cuối "explain why" trong Cue Card',
            exampleInContext: 'What stood out the most was how deeply we reconnected without checking our phones.',
          },
        ],
      },
      improvedAnswer: {
        bandTarget: 'Band 8.0+',
        text: 'One getaway that still stands out vividly in my mind is a three-day trip I took to Da Lat last winter with three of my closest university friends. Having just wrapped up a gruelling exam season, we were all completely burnt out and desperate for a change of scenery. We rented motorbikes to venture off the beaten track through misty pine forests, lingered at cozy hillside cafés overlooking the valley, and sampled local delicacies at the bustling night market. What made the trip truly unforgettable, though, was the unintended digital detox—we spent hours having heartfelt conversations in the crisp mountain air without glancing at our phones once.',
        keyTakeawaysVi: [
          'Sử dụng cụm phân từ hoàn thành "Having just wrapped up..." để nâng độ đa dạng ngữ pháp.',
          'Các từ gợi cảm giác như "vividly", "misty", "lingered", "crisp mountain air" tạo chiều sâu hình ảnh rất cao.',
        ],
      },
      generalFeedbackVi:
        'Một bước tiến rõ rệt lên Band 6.5! Ý tưởng mạch lạc và dùng được câu chẻ tự nhiên. Chỉ cần đẩy độ mượt ở các cụm từ miêu tả chi tiết và chú ý âm câm trong "exhausted" là bạn hoàn toàn chạm ngưỡng Band 7.0+.',
    },
  },
  {
    id: 'seed-session-3',
    createdAt: '2026-11-21T19:45:00Z',
    part: 3,
    topicId: 'p3-tourism-impact',
    topicTitle: 'Tourism & Cultural Preservation',
    questionId: 'p3-tour-2',
    questionText:
      'Do you think governments should limit the number of tourists visiting fragile natural landmarks?',
    durationSeconds: 71,
    hasAudio: false,
    isSeed: true,
    analysis: {
      transcript:
        'Yes, I strongly believe that placing sensible caps on visitor numbers is essential, especially for ecologically sensitive sites. Without proper regulation, mass tourism inevitably leads to soil erosion, littering, and severe disruption to local wildlife. Of course, some people argue that restricting tourists could hurt local businesses that rely on hospitality revenue. Nevertheless, if a landmark is permanently damaged, the economic benefits will disappear anyway, so investing in sustainable tourism and timed entry tickets strikes a much healthier balance.',
      audioEvaluated: true,
      overallBand: 7.0,
      criteria: {
        fluencyCoherence: {
          band: 7,
          summaryVi:
            'Lập luận hai chiều cực kỳ mạch lạc theo chuẩn Part 3 (quan điểm -> hệ quả -> phản biện -> giải pháp cân bằng), liên kết câu tự nhiên.',
          strengthsVi: [
            'Dùng cấu trúc phản biện mượt mà ("Of course, some people argue... Nevertheless...").',
            'Phát triển ý sâu, không bị lặp ý.',
          ],
          improvementsVi: [
            'Duy trì ngữ điệu tự nhiên như đang thảo luận trực tiếp thay vì hơi giống bài viết học thuật.',
          ],
        },
        lexicalResource: {
          band: 7,
          summaryVi:
            'Vốn từ học thuật và collocations chính xác, giàu sức biểu đạt: "ecologically sensitive sites", "soil erosion", "strikes a much healthier balance".',
          strengthsVi: [
            'Dùng chính xác các thuật ngữ về môi trường và kinh tế du lịch.',
            'Collocation "place sensible caps on" và "strike a balance" đạt chuẩn Band 7–8.',
          ],
          improvementsVi: [
            'Có thể thêm một ví dụ thực tế cụ thể (như vịnh Hạ Long hay Venice) để minh họa lập luận sắc nét hơn.',
          ],
        },
        grammaticalRange: {
          band: 7,
          summaryVi:
            'Cấu trúc câu đa dạng gồm mệnh đề quan hệ, câu điều kiện loại 1 và cụm danh động từ chủ ngữ, hầu như không mắc lỗi.',
          strengthsVi: [
            'Sử dụng chuẩn xác mệnh đề quan hệ xác định ("businesses that rely on...").',
            'Câu điều kiện và bị động ("is permanently damaged") tự nhiên.',
          ],
          improvementsVi: [
            'Bổ sung một cấu trúc đảo ngữ nhẹ hoặc câu điều kiện hỗn hợp nếu muốn bứt phá lên Band 8.',
          ],
        },
        pronunciation: {
          band: 7,
          summaryVi:
            'Phát âm rõ ràng, nhấn trọng âm chuẩn trên hầu hết từ học thuật dài; giữ nhịp ổn định trên câu dài.',
          strengthsVi: [
            'Ngắt cụm ý (chunking) và nhấn từ khóa lập luận (essential, inevitably, balance) rất tốt.',
          ],
          improvementsVi: [
            'Chú ý nhịp trọng âm phụ ở "ecologically" /ˌiː.kəˈlɒdʒ.ɪ.kəl.i/ để tránh vấp nhẹ khi nói nhanh.',
          ],
        },
      },
      pronunciationAnalysis: {
        overallAccuracyPercent: 90,
        summaryVi:
          'Độ chính xác phát âm đạt 90% — tiến bộ vượt bậc! Các từ khóa học thuật được phát âm rõ nét và có trọng âm câu tự nhiên.',
        words: [
          {
            word: 'ecologically',
            heardAs: 'eco-lo-gi-cally',
            ipa: '/ˌiː.kəˈlɒdʒ.ɪ.kəl.i/',
            accuracyPercent: 78,
            status: 'fair',
            fixTip: 'Đặt trọng âm chính vào âm tiết thứ 3 /ˈlɒdʒ/ và lướt nhẹ âm /ɪ.kəl.i/.',
          },
          {
            word: 'inevitably',
            ipa: '/ɪˈnev.ɪ.tə.bli/',
            accuracyPercent: 91,
            status: 'good',
            fixTip: 'Nhấn âm 2 /ˈnev/ rõ ràng, nhịp rất mượt.',
          },
          {
            word: 'erosion',
            ipa: '/ɪˈrəʊ.ʒən/',
            accuracyPercent: 89,
            status: 'good',
            fixTip: 'Âm /ʒ/ mềm mại và chính xác.',
          },
          {
            word: 'hospitality',
            ipa: '/ˌhɒs.pɪˈtæl.ə.ti/',
            accuracyPercent: 92,
            status: 'good',
            fixTip: 'Trọng âm rơi chuẩn vào /ˈtæl/.',
          },
          {
            word: 'sustainable',
            ipa: '/səˈsteɪ.nə.bəl/',
            accuracyPercent: 95,
            status: 'good',
            fixTip: 'Phát âm chuẩn xác, nguyên âm đôi /eɪ/ rõ nét.',
          },
        ],
      },
      errorCorrections: [
        {
          original: 'Nevertheless, if a landmark is permanently damaged',
          corrected: 'That being said, once a natural landmark suffers irreversible damage',
          category: 'Fluency',
          explanationVi: 'Trong IELTS Speaking Part 3, cụm "That being said" tự nhiên và mang tính đối thoại hơn "Nevertheless" (vốn phổ biến trong Writing).',
        },
      ],
      vocabularyUpgrades: [
        {
          expression: 'irreversible damage',
          type: 'Collocation',
          ipa: '/ˌɪr.ɪˈvɜː.sə.bəl ˈdæm.ɪdʒ/',
          meaningVi: 'Thiệt hại không thể đảo ngược / không thể khắc phục',
          usageExample: 'Unchecked foot traffic can inflict irreversible damage on fragile ecosystems.',
        },
        {
          expression: 'short-term gain at the expense of long-term viability',
          type: 'Natural Phrase',
          ipa: '/ʃɔːt tɜːm ɡeɪn/',
          meaningVi: 'Lợi ích ngắn hạn đánh đổi bằng tính bền vững lâu dài',
          usageExample: 'Allowing unlimited crowds prioritizes short-term gain at the expense of long-term viability.',
        },
        {
          expression: 'kill the goose that lays the golden eggs',
          type: 'Idiom',
          ipa: '/kɪl ðə ɡuːs/',
          meaningVi: 'Phá hủy chính nguồn lợi lâu dài của mình vì tham lợi trước mắt',
          usageExample: 'Over-commercialising a heritage site is essentially killing the goose that lays the golden eggs.',
        },
      ],
      coherenceBoost: {
        ideaExtensions: [
          {
            angleVi: 'Minh họa bằng ví dụ thực tế toàn cầu',
            ideaEn: 'Cite real-world examples like Venice’s tourist entry fee or daily visitor quotas at Machu Picchu.',
            explanationVi: 'Đưa một ví dụ cụ thể ngay sau luận điểm trừu tượng giúp giám khảo thấy rõ chiều sâu tư duy Part 3.',
          },
          {
            angleVi: 'Phân tách tác động ngắn hạn vs dài hạn',
            ideaEn: 'Distinguish between short-term drops in ticket sales and long-term preservation of the destination’s appeal.',
            explanationVi: 'Khung tư duy "ngắn hạn — dài hạn" giúp câu trả lời Part 3 có cấu trúc logic sắc bén và mạch lạc.',
          },
        ],
        recommendedConnectors: [
          {
            connector: 'That being said, ...',
            functionVi: 'Chuyển hướng phản biện tự nhiên trong văn nói (thay cho "Nevertheless")',
            exampleInContext: 'That being said, letting a natural wonder suffer irreversible damage hurts everyone in the long run.',
          },
          {
            connector: 'Take ... as an example',
            functionVi: 'Dẫn ví dụ thực tế ngắn gọn, trực tiếp',
            exampleInContext: 'Take Venice as an example—introducing entry fees helps ease overcrowding during peak seasons.',
          },
          {
            connector: 'From a long-term perspective, ...',
            functionVi: 'Chuyển sang góc nhìn dài hạn để nâng tầm lập luận Part 3',
            exampleInContext: 'From a long-term perspective, sustainable caps protect both biodiversity and local livelihoods.',
          },
        ],
      },
      improvedAnswer: {
        bandTarget: 'Band 8.5',
        text: 'Absolutely—I think imposing sensible visitor caps is vital, particularly for ecologically fragile landmarks. When mass tourism goes unchecked, it almost inevitably triggers soil erosion, waste buildup, and serious disruption to local wildlife. Of course, local businesses that depend on hospitality revenue often worry about losing income. That being said, letting a natural wonder suffer irreversible damage is essentially killing the goose that lays the golden eggs. Introducing timed entry passes and eco-tourism fees strikes a far healthier balance between economic growth and long-term preservation.',
        keyTakeawaysVi: [
          'Chuyển "Nevertheless" sang "That being said" làm tăng tính tự nhiên của ngôn ngữ nói.',
          'Sử dụng idiom "killing the goose that lays the golden eggs" rất đắt giá cho bối cảnh kinh tế - bảo tồn.',
        ],
      },
      generalFeedbackVi:
        'Câu trả lời đạt chuẩn Band 7.0+ vững chắc! Bạn đã biết cân bằng lập luận đa chiều và dùng collocations tự nhiên. Để tiến tới Band 8.0, hãy thêm ví dụ thực tế ngắn gọn và ưu tiên từ nối mang sắc thái văn nói tự nhiên.',
    },
  },
];
