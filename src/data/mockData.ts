import {
  Pet,
  TrainingCourse,
  TrainingRecord,
  WeightRecord,
  VaccineRecord,
  DewormRecord,
  Reminder,
  Category,
} from '../types';

export const mockPets: Pet[] = [
  {
    id: 'pet-1',
    name: '豆豆',
    type: 'dog',
    breed: '金毛寻回犬',
    ageMonths: 8,
    weightKg: 18.5,
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20golden%20retriever%20puppy%20portrait%20warm%20light&image_size=square',
    gender: 'male',
    createdAt: '2025-01-15',
  },
  {
    id: 'pet-2',
    name: '咪咪',
    type: 'cat',
    breed: '英国短毛猫',
    ageMonths: 12,
    weightKg: 4.2,
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20british%20shorthair%20cat%20portrait%20gray%20fur&image_size=square',
    gender: 'female',
    createdAt: '2024-06-20',
  },
];

export const mockCategories: Category[] = [
  { id: 'basic', name: '基础训练', icon: 'PawPrint', color: 'primary' },
  { id: 'behavior', name: '行为纠正', icon: 'Heart', color: 'secondary' },
  { id: 'health', name: '健康护理', icon: 'Stethoscope', color: 'primary' },
  { id: 'trick', name: '趣味技能', icon: 'Sparkles', color: 'secondary' },
];

export const mockCourses: TrainingCourse[] = [
  {
    id: 'course-1',
    title: '定点排便',
    category: 'basic',
    difficulty: 'easy',
    durationMin: 10,
    description: '训练宠物在指定地点排便，建立良好的如厕习惯。',
    steps: [
      '选择固定的排便地点，铺上尿垫或报纸',
      '饭后15-30分钟带宠物到指定地点',
      '使用口令如"尿尿"或"便便"引导',
      '当宠物正确排便后，立即给予奖励和表扬',
      '逐渐缩小排便区域，最终只保留一个固定点',
    ],
    tips: [
      '要有耐心，不要因为意外而打骂宠物',
      '观察宠物想要排便的信号（如转圈、嗅闻）',
      '定时喂食有助于形成规律的排便时间',
      '清理意外时要彻底去除气味，避免宠物再次在该处排便',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20potty%20training%20puppy%20pad%20illustration%20warm%20cute&image_size=square',
    icon: 'MapPin',
  },
  {
    id: 'course-2',
    title: '等待训练',
    category: 'basic',
    difficulty: 'medium',
    durationMin: 15,
    description: '训练宠物听到"等一下"口令后保持不动，培养耐心和自控力。',
    steps: [
      '让宠物坐下，手掌向前做出停止手势',
      '说出口令"等一下"，保持1-2秒',
      '如果宠物保持不动，给予奖励',
      '逐渐延长等待时间和增加距离',
      '加入干扰因素，如有人经过或有玩具',
    ],
    tips: [
      '从短时间开始，逐步增加难度',
      '如果宠物动了，重新开始，不要责备',
      '每次训练时间不要太长，保持趣味性',
      '可以用"好"或"释放"口令来结束等待',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20waiting%20training%20obedience%20cute%20illustration&image_size=square',
    icon: 'Timer',
  },
  {
    id: 'course-3',
    title: '召回训练',
    category: 'basic',
    difficulty: 'medium',
    durationMin: 15,
    description: '训练宠物听到召唤后立即回到主人身边，保障户外安全。',
    steps: [
      '在室内短距离开始，叫宠物名字加"过来"口令',
      '宠物过来后给予美味零食奖励',
      '逐渐增加距离和环境复杂度',
      '加入 distractions 后进行训练',
      '户外练习时使用长牵引绳确保安全',
    ],
    tips: [
      '召回永远是积极的体验，绝不能用来惩罚',
      '使用高价值奖励，如特别喜欢的零食或玩具',
      '每次成功召回都要热情表扬',
      '不要在宠物不想回来时追着跑',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20recall%20training%20coming%20owner%20cute%20illustration&image_size=square',
    icon: 'Navigation',
  },
  {
    id: 'course-4',
    title: '刷牙护理',
    category: 'health',
    difficulty: 'easy',
    durationMin: 5,
    description: '让宠物习惯刷牙，预防口腔疾病和牙结石。',
    steps: [
      '先让宠物熟悉牙膏的味道，可以让它舔一点',
      '用手指或指套牙刷轻轻按摩牙龈',
      '使用宠物专用牙刷，从门牙开始',
      '逐渐刷到后面的牙齿',
      '每次刷完给予奖励和表扬',
    ],
    tips: [
      '必须使用宠物专用牙膏，人用牙膏对宠物有害',
      '从短时间开始，让宠物慢慢适应',
      '每天刷牙效果最好，每周至少3次',
      '可以配合 dental chews 和饮水添加剂',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20teeth%20brushing%20dental%20care%20cute%20illustration&image_size=square',
    icon: 'Smile',
  },
  {
    id: 'course-5',
    title: '握手技能',
    category: 'trick',
    difficulty: 'easy',
    durationMin: 10,
    description: '教宠物学会握手，增加互动乐趣。',
    steps: [
      '让宠物坐下，手里拿着零食',
      '轻轻抬起它的一只爪子，说"握手"',
      '保持1-2秒后给零食奖励',
      '逐渐减少帮助，等宠物主动伸手',
      '加入换手和左右手区分',
    ],
    tips: [
      '选择宠物比较放松的时候训练',
      '语气要欢快，让宠物觉得是在玩游戏',
      '每次训练不要超过10分钟',
      '可以用响片标记正确动作',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20shake%20hand%20trick%20training%20cute%20illustration&image_size=square',
    icon: 'Hand',
  },
  {
    id: 'course-6',
    title: '不扑人训练',
    category: 'behavior',
    difficulty: 'medium',
    durationMin: 15,
    description: '纠正宠物扑人的坏习惯，学会礼貌地迎接客人。',
    steps: [
      '当宠物扑过来时，转身背对它',
      '不要说话，不要有眼神接触',
      '等宠物四脚落地后，再转身表扬和奖励',
      '可以教宠物"坐"来替代扑人的行为',
      '请朋友配合练习，模拟访客场景',
    ],
    tips: [
      '全家人要保持一致的态度',
      '不要推开宠物，那会被当成游戏',
      '进门时保持冷静，不要太兴奋',
      '可以让宠物去叼一个玩具来分散注意力',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20not%20jumping%20polite%20greeting%20training%20cute&image_size=square',
    icon: 'UserMinus',
  },
  {
    id: 'course-7',
    title: '坐下训练',
    category: 'basic',
    difficulty: 'easy',
    durationMin: 5,
    description: '最基础的服从训练，是其他训练的基础。',
    steps: [
      '手里拿着零食，放在宠物鼻子上方',
      '慢慢将手向后移动，宠物会自然坐下',
      '在宠物坐下的瞬间说"坐"并给奖励',
      '逐渐增加等待时间',
      '在不同环境中练习，加强泛化',
    ],
    tips: [
      '是最基础也最重要的训练',
      '可以在喂食前、出门前都让宠物坐一下',
      '保持训练简短有趣',
      '不要用按屁股的方式强迫坐下',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20sit%20training%20obedience%20cute%20illustration%20warm&image_size=square',
    icon: 'ArrowDown',
  },
  {
    id: 'course-8',
    title: '不乱叫训练',
    category: 'behavior',
    difficulty: 'hard',
    durationMin: 20,
    description: '帮助爱叫的宠物学会安静，减少不必要的吠叫。',
    steps: [
      '先找出宠物吠叫的原因',
      '当宠物叫时，用"安静"口令',
      '宠物停止叫的瞬间给予奖励',
      '逐渐延长安静的时间',
      '针对不同刺激源进行系统脱敏',
    ],
    tips: [
      '不要对着宠物大喊"不要叫"',
      '找出原因比对付症状更重要',
      '确保宠物有足够的运动和刺激',
      '可以用咀嚼玩具转移注意力',
    ],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20quiet%20training%20calm%20cute%20illustration%20peaceful&image_size=square',
    icon: 'VolumeX',
  },
];

const generateMockRecords = (): TrainingRecord[] => {
  const records: TrainingRecord[] = [];
  const today = new Date();
  
  for (let i = 0; i < 20; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const courseIndex = i % mockCourses.length;
    const course = mockCourses[courseIndex];
    const petId = i % 3 === 0 ? 'pet-2' : 'pet-1';
    
    records.push({
      id: `record-${i}`,
      petId,
      courseId: course.id,
      date: dateStr,
      durationSeconds: Math.floor(Math.random() * 600) + 180,
      rating: Math.floor(Math.random() * 2) + 4,
      notes: Math.random() > 0.5 ? '今天表现不错，进步明显' : '还需要多加练习',
      rewards: [
        {
          id: `reward-${i}-1`,
          type: 'treat',
          count: Math.floor(Math.random() * 5) + 2,
          description: '小零食奖励',
        },
      ],
      behaviorNotes: Math.random() > 0.7 ? [
        {
          id: `behavior-${i}`,
          behavior: '分心',
          description: '训练时容易被周围声音吸引',
          isAbnormal: true,
        },
      ] : [],
      photos: [],
      completedBy: 'member-1',
      createdAt: dateStr,
    });
  }
  
  return records;
};

export const mockRecords: TrainingRecord[] = generateMockRecords();

export const mockWeightRecords: WeightRecord[] = [
  { id: 'weight-1', petId: 'pet-1', date: '2025-01-15', weightKg: 8.5, note: '刚到家' },
  { id: 'weight-2', petId: 'pet-1', date: '2025-02-15', weightKg: 10.2 },
  { id: 'weight-3', petId: 'pet-1', date: '2025-03-15', weightKg: 12.8 },
  { id: 'weight-4', petId: 'pet-1', date: '2025-04-15', weightKg: 14.5 },
  { id: 'weight-5', petId: 'pet-1', date: '2025-05-15', weightKg: 16.2 },
  { id: 'weight-6', petId: 'pet-1', date: '2025-06-10', weightKg: 18.5, note: '最近长得很快' },
  { id: 'weight-7', petId: 'pet-2', date: '2024-06-20', weightKg: 2.8, note: '刚到家' },
  { id: 'weight-8', petId: 'pet-2', date: '2024-12-20', weightKg: 4.0 },
  { id: 'weight-9', petId: 'pet-2', date: '2025-06-01', weightKg: 4.2 },
];

export const mockVaccineRecords: VaccineRecord[] = [
  {
    id: 'vaccine-1',
    petId: 'pet-1',
    name: '犬四联疫苗',
    date: '2025-03-10',
    nextDate: '2025-09-10',
    hospital: '爱宠动物医院',
  },
  {
    id: 'vaccine-2',
    petId: 'pet-1',
    name: '狂犬疫苗',
    date: '2025-03-10',
    nextDate: '2026-03-10',
    hospital: '爱宠动物医院',
  },
  {
    id: 'vaccine-3',
    petId: 'pet-2',
    name: '猫三联疫苗',
    date: '2024-09-15',
    nextDate: '2025-09-15',
    hospital: '喵星人宠物医院',
  },
  {
    id: 'vaccine-4',
    petId: 'pet-2',
    name: '狂犬疫苗',
    date: '2024-09-15',
    nextDate: '2025-09-15',
    hospital: '喵星人宠物医院',
  },
];

export const mockDewormRecords: DewormRecord[] = [
  {
    id: 'deworm-1',
    petId: 'pet-1',
    type: 'internal',
    date: '2025-05-01',
    nextDate: '2025-08-01',
    product: '拜宠清',
  },
  {
    id: 'deworm-2',
    petId: 'pet-1',
    type: 'external',
    date: '2025-06-01',
    nextDate: '2025-07-01',
    product: '福来恩',
  },
  {
    id: 'deworm-3',
    petId: 'pet-2',
    type: 'internal',
    date: '2025-04-01',
    nextDate: '2025-07-01',
    product: '海乐妙',
  },
  {
    id: 'deworm-4',
    petId: 'pet-2',
    type: 'external',
    date: '2025-05-01',
    nextDate: '2025-06-01',
    product: '大宠爱',
  },
];

export const mockReminders: Reminder[] = [
  {
    id: 'reminder-1',
    petId: 'pet-1',
    type: 'training',
    title: '每日训练时间',
    time: '19:00',
    repeat: 'daily',
    enabled: true,
  },
  {
    id: 'reminder-2',
    petId: 'pet-1',
    type: 'vaccine',
    title: '狂犬疫苗接种',
    time: '09:00',
    repeat: 'once',
    enabled: true,
    relatedId: 'vaccine-2',
  },
  {
    id: 'reminder-3',
    petId: 'pet-1',
    type: 'deworm',
    title: '体外驱虫',
    time: '20:00',
    repeat: 'monthly',
    enabled: true,
  },
  {
    id: 'reminder-4',
    petId: 'pet-2',
    type: 'training',
    title: '猫咪互动时间',
    time: '20:30',
    repeat: 'daily',
    enabled: true,
  },
  {
    id: 'reminder-5',
    petId: 'pet-2',
    type: 'custom',
    title: '换猫砂',
    time: '21:00',
    repeat: 'weekly',
    enabled: true,
    note: '每周日更换猫砂',
  },
];
