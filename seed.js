const mongoose = require('mongoose');
const Event = require('./models/Event');
const Ticket = require('./models/Ticket');

// 連接資料庫
mongoose.connect('mongodb+srv://icesolution19:jLuZY1Lbi5UQNtyz@cluster0.nky9l.mongodb.net/print_ticketing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleEvents = [
    {
        "title": "2025 魚類放生活動",
        "description": "由尊貴的夏鉑坦真仁波切帶領，殊勝的魚類放生活動。累積利生福田。為自己和一切眾生持誦放生祈請文。長壽祈福放生儀式。",
        "shortDescription": "由尊貴的夏鉑坦真仁波切帶領，為自己和一切眾生累積利生福田的殊勝魚類放生活動。",
        "image": "http://localhost:5001/uploads/events/event_1758649407290_304462923.jpg",
        "date": "2025-11-08T00:00:00.000Z",
        "time": "集合: 9:00, 開船: 9:30, 結束: 11:30",
        "venue": "荃灣碼頭 (地鐵荃灣西站旁)",
        "status": "upcoming",
        "organizer": "文成公主國際基金會",
        "featured": false,
        "price": "建議捐款: 500元, 上不封頂",
        "contact": "姚小姐 WhatsApp +852 9528 8986"
      },
      {
        "title": "道師薈供祈福法會",
        "description": "由尊貴的夏鉑坦真仁波切主法，為大眾舉辦的祈福法會。",
        "shortDescription": "尊貴的夏鉑坦真仁波切主法的道師薈供祈福法會。",
        "image": "http://localhost:5001/uploads/events/event_1758649915436_4243432.jpg",
        "date": "2025-11-09T00:00:00.000Z",
        "time": "12:00-15:00",
        "venue": "普賢道場 (灣仔洛克道175-191號京城大廈2樓)",
        "status": "upcoming",
        "organizer": "文成公主國際基金會",
        "featured": false,
        "price": "388元/人 (附結緣品)",
        "contact": "姚小姐 WhatsApp +852 9528 8986",
        "moreInfoLink": "www.wenchenggongzhu.org"
      },
      {
        "title": "蓮師康健長壽富貴灌頂",
        "description": "由尊貴的夏鉑坦真仁波切主法，蓮師康健長壽富貴灌頂。頂禮蓮師 “心本即遍知，萬法深海藏”。",
        "shortDescription": "尊貴的夏鉑坦真仁波切主法的蓮師康健長壽富貴灌頂。",
        "image": "http://localhost:5001/uploads/events/event_1758649917482_456365850.jpg",
        "date": "2025-11-09T00:00:00.000Z",
        "time": "16:00-19:00",
        "venue": "普賢道場 (灣仔洛克道175-191號京城大廈2樓)",
        "status": "upcoming",
        "organizer": "文成公主國際基金會",
        "featured": false,
        "price": "388元/人 (附結緣品)",
        "contact": "姚小姐 WhatsApp +852 9528 8986",
        "moreInfoLink": "www.wenchenggongzhu.org"
      }
];

const sampleTickets = [
    {
        "name": "2025 魚類放生活動 入場",
        "description": "由尊貴的夏鉑坦真仁波切帶領的殊勝魚類放生活動。累積利生福田，為自己和一切眾生持誦放生祈請文，並舉行長壽祈福放生儀式。此為建議捐款性質的入場。",
        "price": 500,
        "originalPrice": 500,
        "currency": "HKD",
        "type": "standard",
        "restrictions": [
          "席位有限，請儘早報名",
          "建議捐款：港幣500元，上不封頂"
        ],
        "available": 500,
        "total": 500,
        "saleStartDate": new Date('2025-09-30'),
        "saleEndDate": new Date('2025-11-01'),
        "isActive": true
      },
      {
        "name": "道師薈供祈福法會 入場",
        "description": "由尊貴的夏鉑坦真仁波切主法的道師薈供祈福法會。入場費用包含結緣品。",
        "price": 388,
        "originalPrice": null,
        "currency": "HKD",
        "type": "standard",
        "restrictions": [
          "每人入場費港幣388元",
          "入場費用包含結緣品"
        ],
        "available": 388,
        "total": 388,
        "saleStartDate": new Date('2025-09-30'),
        "saleEndDate": new Date('2025-11-01'),
        "isActive": true
      },
      {
        "name": "蓮師康健長壽富貴灌頂 入場",
        "description": "由尊貴的夏鉑坦真仁波切主法的蓮師康健長壽富貴灌頂。頂禮蓮師「心本即遍知，萬法深海藏」。入場費用包含結緣品。",
        "price": 388,
        "originalPrice": 380,
        "currency": "HKD",
        "type": "standard",
        "restrictions": [
          "每人入場費港幣388元",
          "入場費用包含結緣品"
        ],
        "available": 100,
        "total": 100,
        "saleStartDate": new Date('2025-09-30'),
        "saleEndDate": new Date('2025-11-01'),
        "isActive": true
      }
//   {
//     name: 'MIRO優惠價網上直播門票',
//     description: 'MIRO會員專享優惠票價',
//     price: 340,
//     originalPrice: 380,
//     currency: 'HKD',
//     type: 'member',
//     restrictions: [
//       '需持有有效MIRO會員資格',
//       '每名會員限購一張',
//       '每張門票限一裝置收看',
//       '支援MIRROR Official Light Stick（需另購，透過MakeALive app藍牙同步）'
//     ],
//     available: 100,
//     total: 100,
//     saleStartDate: new Date('2024-07-01'),
//     saleEndDate: new Date('2024-07-30'),
//     isActive: true
//   },
//   {
//     name: '網上直播門票',
//     description: '標準網上直播門票',
//     price: 380,
//     currency: 'HKD',
//     type: 'standard',
//     restrictions: [
//       '每張門票限一裝置收看',
//       '支援MIRROR Official Light Stick（需另購，透過MakeALive app藍牙同步）'
//     ],
//     available: 500,
//     total: 500,
//     saleStartDate: new Date('2024-07-01'),
//     saleEndDate: new Date('2024-07-30'),
//     isActive: true
//   }
];

async function seedDatabase() {
  try {
    // 清除現有資料
    await Event.deleteMany({});
    await Ticket.deleteMany({});
    console.log('已清除現有資料');

    // 建立活動
    const events = await Event.insertMany(sampleEvents);
    console.log(`已建立 ${events.length} 個活動`);

    // 為每個活動建立票券
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const tickets = sampleTickets.map(ticketData => ({
        ...ticketData,
        event: event._id
      }));
      
      const createdTickets = await Ticket.insertMany(tickets);
      
      // 更新活動的票券陣列
      await Event.findByIdAndUpdate(event._id, {
        tickets: createdTickets.map(ticket => ticket._id)
      });
      
      console.log(`已為活動 "${event.title}" 建立 ${createdTickets.length} 種票券`);
    }

    console.log('資料庫種子資料建立完成！');
    process.exit(0);
  } catch (error) {
    console.error('建立種子資料時發生錯誤:', error);
    process.exit(1);
  }
}

seedDatabase();
