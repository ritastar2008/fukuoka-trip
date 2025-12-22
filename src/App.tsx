import React, { useState, useEffect, useMemo } from "react";
import {
  Plane,
  MapPin,
  Coffee,
  Train,
  Camera,
  ShoppingBag,
  Home,
  Info,
  DollarSign,
  Sun,
  CloudRain,
  Cloud,
  Umbrella,
  ChevronRight,
  Phone,
  Wallet,
  Shirt,
  Gift,
  Languages,
  ChevronDown,
  ChevronUp,
  Volume2,
  X,
  ZoomIn,
  Baby,
  Heart,
  Package,
  ClipboardList,
  Ticket,
  Briefcase,
  CheckSquare,
  Plus,
  Trash2,
  Image as ImageIcon,
  Store,
  Link as LinkIcon,
  User,
  Coins,
  Loader,
  Edit,
  Map as MapIcon,
  Bus,
  Bookmark,
  Clock,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Search,
  LayoutGrid,
  List,
  AlertCircle,
  ShieldAlert,
  Bell,
  Car,
  Utensils
} from "lucide-react";

// --- Firebase 導入 ---
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// =================================================================
// ⚠️ Firebase 設定
// =================================================================
const envConfig = typeof window !== 'undefined' && window.__firebase_config 
  ? JSON.parse(window.__firebase_config) 
  : null;

const firebaseConfig = envConfig || {
  apiKey: "AIzaSyAaH9RHb9lqZ7s5FwKvPuE4tyV5-wnysEs",
  authDomain: "family-trip-29416.firebaseapp.com",
  projectId: "family-trip-29416",
  storageBucket: "family-trip-29416.firebasestorage.app",
  messagingSenderId: "238598347730",
  appId: "1:238598347730:web:aabbc8751f76bf0363860b",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 設定 ---
const EXCHANGE_RATE = 0.22; // 日幣匯率設定

// --- 工具函式 ---
const getGoogleDriveImage = (url) => {
  if (!url) return undefined;
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    const idMatch = url.match(/[-\w]{25,}/);
    if (idMatch) {
      return `https://lh3.googleusercontent.com/d/${idMatch[0]}`;
    }
  }
  return url;
};

const openGoogleMap = (query) => {
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`,
    "_blank"
  );
};

// 圖示渲染函式
const renderWeatherIcon = (iconName) => {
  switch (iconName) {
    case "Sun":
      return <Sun className="text-orange-400" size={20} />;
    case "Cloud":
      return <Cloud className="text-gray-400" size={20} />;
    case "CloudRain":
      return <CloudRain className="text-blue-400" size={20} />;
    case "Umbrella":
      return <Umbrella className="text-purple-400" size={20} />;
    default:
      return <Sun className="text-orange-400" size={20} />;
  }
};

// --- Error Display Component ---
const PermissionErrorBanner = () => (
  <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-800 text-sm mb-4 space-y-2 animate-fade-in">
    <div className="flex items-center gap-2 font-bold text-red-700">
      <ShieldAlert size={20} />
      <span>權限不足 (Permission Denied)</span>
    </div>
    <p>無法讀取資料庫。請確認 Firebase Console 的 <strong>Firestore Database &gt; Rules</strong> 設定正確：</p>
    <div className="bg-white p-2 rounded border border-red-100 font-mono text-xs overflow-x-auto">
      allow read, write: if request.auth != null;
    </div>
    <p className="text-xs text-red-600">
      * 另外請確認 Authentication &gt; Sign-in method &gt; <strong>Anonymous</strong> 已啟用。
    </p>
  </div>
);

// --- 資料常數 ---

const TRIP_INFO = {
  dates: "2026/02/22 (日) - 02/26 (四)",
  flight: {
    outbound: {
      code: "BR106",
      airline: "長榮航空 (Boeing 787-10)",
      dep: "08:00 TPE 桃園機場",
      arr: "11:15 FUK 福岡機場",
      duration: "2h 15m",
    },
    inbound: {
      code: "BR101",
      airline: "長榮航空 (Airbus A321)",
      dep: "20:55 FUK 福岡機場",
      arr: "22:40 TPE 桃園機場",
      duration: "2h 45m",
    },
  },
  hotel: {
    name: "博多站前 Richmond 飯店",
    jpName: "リッチモンドホテル博多駅前",
    address: "福岡縣福岡市博多區博多站中央街 6-17",
    access: [
      "JR 博多站築紫口/地鐵東 5 號出口步行 4 分鐘",
      "從地鐵博多站東 5 號出口至地下 1 樓右轉步行 3 分鐘",
    ],
  },
};

const PARENT_GUIDE = {
  mindset: "帶1.5歲小孩，計畫是用來打破的，累了就回飯店。",
  elevator:
    "轉乘時不要急，抬頭找「エレベーター(Elevator)」黃色指標，繞路也沒關係。",
  google_maps:
    "日本很多樓梯，如果帶著大的行李移動，在Google搜尋路線後，在篩選依據裡面，把「設有無障礙設施」打勾，會重新設定路線，就會改成有電梯的出入口。",
  lalaport_storage: {
    ic_card: [
      "1F Kidzania棟巴士總站附近",
      "商場General Information旁的廁所附近",
      "2F 購物中心大樓中央西側廁所附近",
      "4F Mall棟體育公園旁",
    ],
    cash_only: ["4F 購物中心棟男女更衣室內"],
  },
};

const JAPANESE_PHRASES = [
  {
    name: "🚕 交通 & 計程車",
    phrases: [
       {
        c_text: "回 Richmond 飯店 (筑紫口)",
        j_text: "リッチモンドホテル博多駅前（筑紫口側）までお願いします。",
        j_reading: "Ricchimondo Hoteru Hakata Ekimae (Chikushiguchi-gawa) made onegai shimasu.",
      },
      {
        c_text: "去 LaLaport (鋼彈下車)",
        j_text: "ららぽーと福岡までお願いします。\nガンダムの近くで降ろしてください。",
        j_reading: "Rarapōto Fukuoka made onegai shimasu. Gandamu no chikaku de oroshite kudasai.",
      },
      {
        c_text: "去動植物園「正門」",
        j_text: "福岡市動植物園の「正門」までお願いします。",
        j_reading: "Fukuokashi dōshokubutsuen no seimon made onegai shimasu.",
      },
      {
        c_text: "去福岡機場「國內線」",
        j_text: "福岡空港の「国内線」ターミナルまでお願いします。",
        j_reading: "Fukuoka kūkō no kokunaisen tāminaru made onegai shimasu.",
      },
      {
        c_text: "請載我去這裡 (指地圖)",
        j_text: "ここに行ってください。",
        j_reading: "Koko ni itte kudasai.",
      },
    ],
  },
  {
    name: "🍽️ 餐廳需求",
    phrases: [
      {
        c_text: "有剪副食品的剪刀嗎？",
        j_text: "離乳食用のハサミがありますか？",
        j_reading: "Rinyūshoku yō no hasami ga arimasu ka?",
      },
      {
        c_text: "想跟小孩分食(清淡點)",
        j_text: "子どもと分けたいので、薄味のものがいいです。",
        j_reading: "Kodomo to waketai node, usuaji no mono ga ii desu.",
      },
      {
        c_text: "這道菜味道很重(鹹)嗎？",
        j_text: "このおかず、味は濃いですか？",
        j_reading: "Kono okazu, aji wa koi desu ka?",
      },
      {
        c_text: "有兒童椅嗎？",
        j_text: "子供用の椅子はありますか？",
        j_reading: "Kodomo yō no isu wa arimasu ka?",
      },
      {
        c_text: "請給我兒童餐具",
        j_text: "子供用のカトラリーをお願いします。",
        j_reading: "Kodomo yō no katorarī o onegai shimasu.",
      },
      {
        c_text: "幫我微波副食品",
        j_text: "離乳食を温めてもらえますか？",
        j_reading: "Rinyūshoku o atatamete moraemasu ka?",
      },
      {
        c_text: "去冰 (水/飲料)",
        j_text: "氷なしでお願いします。",
        j_reading: "Kōri nashi de onegai shimasu.",
      },
      {
        c_text: "請不要加辣",
        j_text: "辛くしないでください。",
        j_reading: "Karuku shinaide kudasai.",
      },
      {
        c_text: "我要結帳",
        j_text: "お会計をお願いします。",
        j_reading: "Okaikei o onegai shimasu.",
      },
    ],
  },
  {
    name: "🚨 緊急 & 生病",
    phrases: [
      {
        c_text: "小孩發燒了",
        j_text: "子供が熱を出しました。",
        j_reading: "Kodomo ga netsu o dashimashita.",
      },
      {
        c_text: "附近有藥局嗎？",
        j_text: "近くに薬局はありますか？",
        j_reading: "Chikaku ni yakkyoku wa arimasu ka?",
      },
      {
        c_text: "請幫我叫救護車",
        j_text: "救急車を呼んでください。",
        j_reading: "Kyūkyūsha o yonde kudasai.",
      },
    ],
  },
  {
    name: "🛍️ 購物 & 找路",
    phrases: [
      {
        c_text: "可以免稅嗎？",
        j_text: "免税できますか？",
        j_reading: "Menzei dekimasu ka?",
      },
      {
        c_text: "我要買袋子",
        j_text: "袋を購入したいです。",
        j_reading: "Fukuro o kōnyū shitai desu.",
      },
      {
        c_text: "電梯在哪裡？",
        j_text: "エレベーターはどこですか？",
        j_reading: "Erebētā wa doko desu ka?",
      },
      {
        c_text: "廁所在哪裡？",
        j_text: "トイレはどこですか？",
        j_reading: "Toire wa doko desu ka?",
      },
      {
        c_text: "可以試穿嗎？",
        j_text: "試着しても良いですか？",
        j_reading: "Shichaku shitemo ii desu ka?",
      },
      {
        c_text: "我要找這個 (指著圖片)",
        j_text: "これを探しています。\n(この写真のものです)",
        j_reading: "Kore o sagashite imasu.",
      },
      {
        c_text: "這個還有庫存嗎？",
        j_text: "これ、在庫はありますか？",
        j_reading: "Kore, zaiko wa arimasu ka?",
      },
    ],
  },
];

const ITINERARY = [
  {
    day: 1,
    date: "2/22 (日)",
    location: "入境 & 博多車站",
    reminder: "一定要先買好明天中餐、早餐、飲料與零食。若預報明天下雨，至Klook或KKday買teamLab的票",
    activities: [
      {
        time: "12:15",
        type: "transport",
        title: "抵達 & 寄放行李",
        desc: "入境後，搭車直達 Richmond 飯店 (博多站前) 寄放行李。",
        tips: "Richmond Hotel Hakata Ekimae",
        mapQuery: "Richmond Hotel Hakata Ekimae",
      },
      {
        time: "13:30",
        type: "food",
        title: "午餐：敘敘苑 (KITTE博多)",
        desc: "營業時間 11:00-22:00。知名的燒肉午間套餐 (約3000-7000日圓)。",
        tips: "在高樓層可以看風景，午餐時段CP值最高。",
        mapQuery: "Jojoen KITTE Hakata",
      },
      {
        time: "14:30",
        type: "shop",
        title: "博多車站 / Yodobashi",
        desc: "博多阪急 7F (寶寶衣服/玩具/育嬰室)、頂樓 RF 燕子電車 (可親子共乘)。",
        tips: "KITTE 走連通道到 AMU PLAZA，找 AMU 專用電梯(「屋上・つばめの杜ひろば」）坐到RF。",
        mapQuery: "Hakata Station",
        alternatives: [
            {
                title: "博多阪急 7F",
                type: "Shop",
                desc: "買寶寶衣服、玩玩具、換尿布（育嬰設施全福岡數一數二）"
            },
             {
                title: "燕子電車 (Tsubame Train)車站頂樓",
                type: "Shop",
                desc: "這裡有收費的小火車（繞行兩圈約 200-300 日圓），1.5 歲寶寶可以由大人抱著一起坐。"
            },
             {
                title: "Yodobashi 友都八喜",
                type: "Shop",
                desc: "營業時間 09:20-22:00"
            }
        ]
      },
      {
        time: "17:15",
        type: "shop",
        title: "晚餐: Lopia 超市",
        desc: "位於 Yodobashi 4F。\n便宜好買，適合買熟食、優格、福岡草莓（品種建議選：あまおう / Amaou）非常大顆且甜回飯店吃。",
        tips: "注意：Lopia 只收現金！(Yodobashi 其他樓層可刷卡)",
        mapQuery: "Lopia Hakata Yodobashi",
      },
    ],
  },
  {
    day: 2,
    date: "2/23 (一)",
    location: "動植物園 (連假)",
    reminder: "動物園在山上，體感會比博多車站冷。請務必帶上推車防風罩和寶寶的小毛毯",
    activities: [
      {
        time: "09:00",
        type: "food",
        title: "早餐：Dacomecca 麵包店",
        desc: "營業時間: 07:00–19:00。步行前往 (約3-5分鐘)。福岡超人氣麵包店，裝潢像廢墟風，麵包非常精緻。",
        tips: "建議提早排隊，人潮眾多。",
        mapQuery: "Dacomecca",
      },
      {
        time: "09:30",
        type: "transport",
        title: "前往福岡市動植物園",
        desc: "適逢連假，首選計程車 (約1500-2000日圓)。博多口左前方有計程車排班。",
        tips: "備案交通：地鐵七隈線(博多>櫻坂) 或 58號公車。",
        mapQuery: "Fukuoka City Zoo",
        alternatives: [
            {
                title: "交通1.搭計程車約 1,500 - 2,000 日圓。",
                type: "Traffic",
                desc: "乘車位置：博多口 (Hakata-guchi)走出博多口的大門後，往左前方看（靠近西日本銀行或西鐵巴士站方向），您會看到非常整齊的計程車排隊序列。(車程約約 15–20 分鐘)。"
            },
             {
                title: "交通2.搭地下鐵",
                type: "Traffic",
                desc: "步行4分鐘至博多站 >> 【地下鐵七隈線(綠線) 博多 >> 櫻坂(4站)】 >> 步行3分鐘。"
            },
             {
                title: "交通3.搭公車",
                type: "Traffic",
                desc: "從博多車站搭乘 58號公車 直達「動物園前」站（車程約 20 分鐘）。"
            }
        ]
      }, 
	  {
        time: "09:30(備案)",
        type: "spot",
        title: "【備案】teamLab Forest",
        desc: "搭乘 西鐵巴士 (Nishitetsu Bus)。從博多站前巴士站（A月台）搭乘前往「PayPay Dome」或「福岡市博物館」方向的巴士，在 「PayPayドーム (PayPay Dome)」 下車。\n 搭乘地鐵【地下鐵空港線(紅線) 博多 >> 唐人町(6站)】>> 步行15分鐘。",
        tips: "隨身攜帶背巾，因為部分展區地面有起伏（如山丘地形），抱著孩子會比較安全\n穿著褲裝、小孩穿防滑鞋。",
        mapQuery: "teamLab Forest Fukuoka",
      },
      {
        time: "10:00",
        type: "spot",
        title: "動物園放電",
        desc: "從「動物園正門」進。看獅子、大象、長頸鹿。有適合小小孩的「小火車」和「旋轉木馬」，1.5 歲寶寶坐火車通常會很興奮。",
        tips: "山上較冷，請帶推車防風罩和毛毯。風大可去室內的「動物科學館」。",
        mapQuery: "Fukuoka City Zoo",
      },
	 
      {
        time: "12:30",
        type: "food",
        title: "午餐：園內餐廳",
        desc: "在植物園側休息處或動物園餐廳用餐。有兒童餐或烏龍麵 (可剪碎)。",
        tips: "園內吃最方便，減少移動負擔。",
        mapQuery: "Fukuoka City Zoo",
      },
	  
      {
        time: "13:30",
        type: "spot",
        title: "植物園 & 午睡",
        desc: "動物園與植物園有天橋連通。這段時間通常是寶寶在推車上睡覺的好時機，大人可以趁機喝杯咖啡休息。",
        tips: "植物園更安靜，溫室內暖和且漂亮。",
        mapQuery: "Fukuoka City Botanical Garden",
      },
      {
        time: "15:30",
        type: "shop",
        title: "返回博多車站逛街",
        desc: "AMU PLAZA 或 阪急百貨。",
        tips: "建議現在先買好伴手禮 (明太子醬等)。",
        mapQuery: "Hakata Station",
      },
      {
        time: "18:00",
        type: "food",
        title: "晚餐：濱田屋 (水炊鍋)",
        desc: "營業時間:11:00-22:00 AMU PLAZA 10F。",
        tips: "建議 17:15 提早去避開人潮。",
        mapQuery: "Hakata Mizutaki Hamadaya",
        alternatives: [
            {
                title: "古市庵 (阪急B1)",
                type: "food",
                desc: "外帶押壽司或飯糰，米飯水準高，也有很多沒放生魚的小飯糰。",
                mapQuery: "Koichian Hakata Hankyu"
            }
        ]
      },
    ],
  },
  {
    day: 3,
    date: "2/24 (二)",
    location: "麵包超人 & 天神",
    reminder: "博物館內是不能推推車進去，入口處有專門的推車停放區。一定要帶背巾備用。",
    activities: [
      {
        time: "08:00",
        type: "food",
        title: "早餐：客美多咖啡",
        desc: "博多站東店 (步行4分鐘)。",
        tips: "建議 09:30 離開。",
        mapQuery: "Komeda's Coffee Hakata Station East",
      },
      {
        time: "10:00",
        type: "spot",
        title: "福岡麵包超人博物館(Riverain Mall 5-6F)",
        desc: "營業時間: 10:00-17:00。交通：【地下鐵空港線(紅線) 博多 >> 中洲川端(2站)】，步行7分鐘。",
        tips: "剛開館人最少，先衝最受歡迎的「球池」或「沙坑」，並確認早上的表演秀時間（通常 11:00 左右會有一場）。",
        mapQuery: "Fukuoka Anpanman Children's Museum",
      },
      {
        time: "13:30",
        type: "food",
        title: "午餐：焼肉 石原牛",
        desc: "步行2分鐘。A5和牛午間套餐 CP 值高。",
        tips: "平日13:00後上班族午休結束，環境較安靜放鬆。午餐營業時間：11:00 – 15:00，最後加點時間 14:30。 	",
        mapQuery: "Hakata Yakiniku Ishiharanogyu",
      },
	  {
        time: "15:00",
        type: "spot",
        title: "Riverain Mall 採購(午睡)",
        desc: "2F[Small quantity by mammy baby(嬰兒選物)、HAKATA JAPAN(博多織品)] \n 1F [tokineri、Sghr Sugahara]:廚房用品/好物 \n B1F [BorneLund(嬰兒玩具)、IKEUCHI ORGANIC(今治毛巾-有機)] \n B2F [Seria、茅乃舍]",
        tips: "寶寶午睡，爸媽悠閒採購。",
        mapQuery: "",
      },
      {
        time: "16:30",
        type: "spot",
        title: "川端通商店街、櫛田神社",
        desc: "可去附近日本人愛去的PAN DEL SO買麵包喝咖啡。營業時間: 11:00-18:00",
        tips: "寶寶午睡，爸媽悠閒逛櫛田神社、麵包店喝咖啡。",
        mapQuery: "Cafe Pan del Sol",
      },
      {
        time: "18:00",
        type: "food",
        title: "晚餐：Obon de Gohan",
        desc: "KITTE 博多店。均衡營養日式定食，環境親子友善。",
        tips: "很多軟糯豆腐和炊飯，適合 1.5 歲寶寶。",
        mapQuery: "Obon de Gohan KITTE Hakata"
      },
      {
        time: "16:30(備案)",
        type: "shop",
        title: "【備案】天神地下街",
        desc: "交通:【地下鐵空港線(紅線) 中洲川端站 >> 天神站(1站)】",
        tips: "建議先逛 「西側」（靠近地下鐵入口），必逛推薦： * Salut! / 3COINS / Natural Kitchen：精緻的日式百圓雜貨。可在歐風休息區吃點心。",
        mapQuery: "Tenjin Underground Shopping Center",
        alternatives: [
            { title: "BOUL'ANGE", type: "food", desc: "08:30-20:00，推薦開心果捲捲酥、可頌麵包。", mapQuery: "BOUL'ANGE Fukuoka" },
            { title: "RINGO(蘋果派)", type: "food", desc: "09:00-21:00，必吃現烤卡士達蘋果派。", mapQuery: "RINGO Tenjin" },
            { title: "BAKE Cheese Tart（半熟起司塔）", type: "food", desc: "09:00-21:00。"},
            { title: "Blue Bottle", type: "food", desc: "警固神社內", mapQuery: "Blue Bottle Coffee Fukuoka Tenjin" }
        ]
      },
      {
        time: "18:00(備案)",
        type: "food",
        title: "【備案】晚餐：ラーメンと鶏鉄板 チキンマン",
        desc: "天神地下街附近，營業時間:11:00-23:00。",
        tips: "沒排隊可吃，推歐姆蛋飯加點沙拉盤或烤雞蔬菜組合，親子友善。",
        mapQuery: "Chicken Man Hakata"
      },
    ],
  },
  {
    day: 4,
    date: "2/25 (三)",
    location: "海洋世界海之中道",
    reminder: "建議在博多車站先買好寶寶的水、果汁或小零食帶在身上。",
    activities: [
      {
        time: "08:30",
        type: "food",
        title: "早餐：飯糰 & 麵包",
        desc: "「米屋の飯切」或「糸島おむすび ふちがみ」買飯糰，「Trandor」買小餐包給寶寶。",
        tips: "博多車站內購買。",
        mapQuery: "Hakata Station",
      },
      {
        time: "09:30",
        type: "spot",
        title: "海洋世界海之中道",
        desc: "營業時間: 09:30-17:30。交通：【JR鹿兒島本線(紅線) 博多 >> 香椎(4站)】轉乘 >> 【JR香椎線(藍線) 香椎 >> 海之中道(4站)】。",
        tips: "入口記得拍表演時間!",
        mapQuery: "Marine World Uminonakamichi",
      },
      {
        time: "10:30",
        type: "spot",
        title: "看1樓的大水槽、企鵝島 (Penguin Island)、海豹餵食觀察 (Seal Feedback)",
        desc: "",
        tips: "",
        mapQuery: "Marine World Uminonakamichi",
      },
      {
        time: "11:30",
        type: "food",
        title: "午餐：B1 Reilly 餐廳",
        desc: "趁人少先吃，這間餐廳最著名的就是巨大的水槽景觀。邊吃飯邊看海豚和鯊魚游過，寶寶會很愛。",
        tips: "",
        mapQuery: "Marine World Uminonakamichi",
      },
      {
        time: "13:00",
        type: "spot",
        title: "海豚/海獅表演",
        desc: "表演結束後去戶外觸摸區、看海獺，或草地散步。",
        tips: "表演時間依現場公告 (通常 11/13/15 點)。",
        mapQuery: "Marine World Uminonakamichi",
      },
      {
        time: "16:00",
        type: "transport",
        title: "搭車返回博多",
        desc: "",
        tips: "避開 17:00 後下班人潮。",
        mapQuery: "Hakata Station",
      },
      {
        time: "17:30",
        type: "food",
        title: "晚餐：葉隱烏龍麵",
        desc: "必點：肉烏龍麵 (肉うどん)、蝦天婦羅烏龍麵 (えびかき揚げうどん)、雞肉飯 (かしわめし)。",
        tips: "17:00 開門人最少，建議早點去。tablog百大名店。",
        mapQuery: "Hagakure Udon",
      },
    ],
  },
  {
    day: 5,
    date: "2/26 (四)",
    location: "LaLaport & 賦歸",
    reminder: "出關侯機前，記得幫寶寶換好尿布、裝好溫水，在候機室先讓寶寶吃點小點心。",
    activities: [
      {
        time: "08:00",
        type: "food",
        title: "早餐：彌生軒(やよい軒)筑紫口店-日式定食",
        desc: "06:30 開門。",
        tips: "推薦烤鮭魚定食、厚蛋燒。",
        mapQuery: "Yayoiken Hakata Chikushiguchi",
      },
      {
        time: "09:30",
        type: "transport",
        title: "退房 & 前往 LaLaport",
        desc: "搭計程車直達。出門前記得檢查隨身行李。",
        tips: "直接把大行李寄放在 LaLaport的置物櫃。1 樓的置物櫃有分大小，如果大行李箱放不下，可以詢問服務台是否有「人工行李寄存服務」。",
        mapQuery: "LaLaport Fukuoka",
      },
      {
        time: "10:00",
        type: "shop",
        title: "LaLaport 最後衝刺",
        desc: "鋼彈拍照、阿卡將、3coins、Loft、藥妝。",
        tips: "",
        mapQuery: "LaLaport Fukuoka",
      },
      {
        time: "12:00",
        type: "food",
        title: "午餐：3F 美食街",
        desc: "知青豬排、清陽軒拉麵、Umaya 定食。",
        tips: "美食街座位多，適合小孩。",
        mapQuery: "LaLaport Fukuoka",
    alternatives: [
      {
        title: "炸豬排知青 (TONKATSU CHISEI)",
        type: "food",
        desc: "3F美食街座位多，適合帶小孩。"
      }, 
      {
        title: "久留米拉麵清陽軒",
        type: "food",
        desc: "3F可能是 LaLaport 唯一吃得到拉麵的地方。"
      },
      {
        title: "UMAYA うまや",
        type: "food",
        desc: "3F南蠻炸雞、炙燒牛舌，福岡在地定食品牌。"
      }
    ]
      },
      {
        time: "13:30",
        type: "spot",
        title: "福岡玩具美術館",
        desc: "10:00-18:00。木育廣場專為 0-2 歲設計，安全好玩。",
        tips: "備案：4F Moff animal cafe 或 頂樓田徑場。",
        mapQuery: "Fukuoka Toy Museum",
        alternatives: [
            { title: "Moff animal cafe", type: "spot", desc: "觸摸小動物", mapQuery: "Moff animal cafe LaLaport Fukuoka" }
        ]
      },
      {
        time: "15:30",
        type: "shop",
        title: "Lopia 超市 & 離開",
        desc: "最後逛逛。16:30 領行李搭計程車去機場。",
        tips: "",
        mapQuery: "LaLaport Fukuoka",
      },
      {
        time: "15:30 (備案)",
        type: "spot",
        title: "【備案】福岡機場國內線航廈",
        desc: "比國際線更好玩！\n2F 甜點伴手禮區：國內線限定年輪蛋糕、明太子。\n3F 拉麵滑道：九州代表性拉麵店聚集。\n4F 展望台：近距離看飛機起降，寶寶最愛。\n------------\n18:00 搭接駁車往國際線 (約10-15分)。",
        tips: "國內線1F/2F有大量寄物櫃。1F有手荷物預かり所(人工寄存)可暫存行李。",
        mapQuery: "Fukuoka Airport Domestic Terminal",
      },
      {
        time: "17:30",
        type: "shop",
        title: "機場免稅店掃貨",
        desc: "黃金 2 小時！行李已托運，推寶寶輕鬆逛。",
        tips: "",
        mapQuery: "Fukuoka Airport International Terminal",
      },
      {
        time: "20:55",
        type: "transport",
        title: "搭機回台",
        desc: "BR101。記得先幫寶寶換尿布。",
        tips: "平安回家！",
        mapQuery: "Fukuoka Airport",
      },
    ],
  },
];

const TOOLS_INFO = {
  clothing: [
    { title: "氣溫預測", val: "10°C - 15°C" },
    {
      title: "穿著建議",
      val: "洋蔥式穿法。室內暖氣強，建議穿著發熱衣 + 針織衫/衛衣 + 防風大衣。圍巾是好幫手。",
    },
  ],
};

// --- UI 元件 ---

const TabButton = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${
      active ? "text-slate-800" : "text-slate-400"
    }`}
  >
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

const CategoryIcon = ({ type }) => {
  const styles = {
    transport: "bg-blue-100 text-blue-600",
    hotel: "bg-purple-100 text-purple-600",
    food: "bg-orange-100 text-orange-600",
    spot: "bg-teal-100 text-teal-600",
    shop: "bg-pink-100 text-pink-600",
  };

  const icons = {
    transport: <Train size={18} />,
    hotel: <Home size={18} />,
    food: <Coffee size={18} />,
    spot: <Camera size={18} />,
    shop: <ShoppingBag size={18} />,
  };

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        styles[type] || "bg-gray-100"
      }`}
    >
      {icons[type] || <MapPin size={18} />}
    </div>
  );
};

const PhraseModal = ({ phrase, onClose }) => {
  if (!phrase) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/95 backdrop-blur-sm p-4 pt-36 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-slate-500 font-bold text-base mb-6 bg-slate-100 px-4 py-1 rounded-full">
          {phrase.c_text}
        </h3>

        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight break-words w-full">
          {phrase.j_text}
        </p>

        <div className="w-full h-px bg-slate-100 my-4"></div>

        <p className="text-slate-500 font-mono text-base">{phrase.j_reading}</p>

        <p className="mt-6 text-[10px] text-slate-300 uppercase tracking-widest font-semibold flex items-center gap-1">
          <ChevronDown size={10} /> 出示給對方看 <ChevronDown size={10} />
        </p>
      </div>
    </div>
  );
};

const ImagePreviewModal = ({ src, onClose }) => {
  if (!src) return null;
  const displaySrc = getGoogleDriveImage(src);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full transition-colors z-10"
      >
        <X size={32} />
      </button>
      <img
        src={displaySrc}
        alt="Preview"
        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const PhraseCategory = ({ category, onPhraseClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 active:bg-slate-100 transition-colors"
      >
        <span className="font-bold text-slate-800 flex items-center gap-2 text-base">
          {category.name}
        </span>
        {isOpen ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="divide-y divide-slate-100">
          {category.phrases.map((p, idx) => (
            <div
              key={idx}
              onClick={() => onPhraseClick(p)}
              className="p-4 hover:bg-blue-50/50 cursor-pointer transition-all active:scale-[0.98] group"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-base font-bold text-slate-800">{p.c_text}</p>
                <ZoomIn
                  size={16}
                  className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 group-hover:border-blue-200 group-hover:bg-white transition-colors pointer-events-none">
                <p className="text-lg font-bold text-blue-700 mb-1 leading-snug">
                  {p.j_text}
                </p>
                <p className="text-xs text-slate-400 font-mono italic">
                  {p.j_reading}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 檢查表相關元件 ---

const ShoppingListItems = ({
  items,
  onToggle,
  onDelete,
  onEdit,
  setPreviewImage,
  catId,
}) => (
  <div className="space-y-3 mb-4">
    {items.length === 0 && (
      <p className="text-xs text-slate-400 text-center py-4 italic">
        尚無必買項目，請新增
      </p>
    )}
    {items.map((item) => (
      <div
        key={item.id}
        className="flex gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="pt-1">
          <button
            onClick={() => onToggle(item.id, item.checked)}
            className={`w-6 h-6 rounded border transition-all flex items-center justify-center
              ${
                item.checked
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-slate-300 bg-slate-50"
              }`}
          >
            {item.checked && <CheckSquare size={16} />}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {item.priority && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  item.priority === "高"
                    ? "bg-red-100 text-red-600"
                    : item.priority === "中"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.priority}
              </span>
            )}
            <span
              className={`font-bold text-base ${
                item.checked ? "text-slate-400 line-through" : "text-slate-800"
              } truncate`}
            >
              {item.text}
            </span>
          </div>
          {item.location && (
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Store size={12} className="text-blue-500" /> {item.location}
            </div>
          )}
        </div>

        {item.image && (
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => setPreviewImage(item.image)}
          >
            <img
              src={getGoogleDriveImage(item.image)}
              alt={item.text}
              className="w-16 h-16 object-cover rounded-lg border border-slate-100 bg-white"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors">
              <ZoomIn
                size={16}
                className="text-white drop-shadow-md opacity-70 group-hover:opacity-100"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <button
            onClick={() => onEdit(catId, item)}
            className="text-slate-300 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-slate-300 hover:text-red-400 p-1 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ))}
  </div>
);

const ShoppingInputForm = ({
  shoppingInput,
  setShoppingInput,
  onAddShopping,
  isEditing,
  onCancel,
}) => (
  <div
    className={`bg-white p-3 rounded-xl border shadow-sm space-y-2 ${
      isEditing ? "border-orange-200 bg-orange-50" : "border-blue-100"
    }`}
  >
    <div className="flex justify-between items-center">
      <h3
        className={`text-xs font-bold uppercase ${
          isEditing ? "text-orange-500" : "text-slate-400"
        }`}
      >
        {isEditing ? "編輯商品" : "新增商品"}
      </h3>
      {isEditing && (
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          取消
        </button>
      )}
    </div>
    <input
      type="text"
      placeholder="商品名稱 (必填)"
      className="w-full bg-white border-none rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-100"
      value={shoppingInput?.text || ""}
      onChange={(e) => setShoppingInput({ text: e.target.value })}
    />
    <div className="flex gap-2">
      <div className="relative w-24 shrink-0">
        <select
          value={shoppingInput?.priority || "高"}
          onChange={(e) => setShoppingInput({ priority: e.target.value })}
          className={`w-full appearance-none border-none rounded-lg px-2 py-2 text-base focus:ring-2 focus:ring-blue-100 bg-white ${
            shoppingInput?.priority === "高"
              ? "text-red-600 font-bold"
              : shoppingInput?.priority === "中"
              ? "text-orange-600 font-bold"
              : "text-slate-600"
          }`}
        >
          <option value="高">必買(高)</option>
          <option value="中">普通(中)</option>
          <option value="低">隨緣(低)</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2 top-3 text-slate-400 pointer-events-none"
        />
      </div>

      <input
        type="text"
        placeholder="哪裡買 / 備註"
        className="flex-1 bg-white border-none rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-100"
        value={shoppingInput?.location || ""}
        onChange={(e) => setShoppingInput({ location: e.target.value })}
      />
    </div>
    <div className="flex gap-2">
      <div className="relative flex-1">
        <LinkIcon size={14} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="圖片連結 (URL)"
          className="w-full bg-white border-none rounded-lg pl-9 pr-3 py-2 text-base focus:ring-2 focus:ring-blue-100 font-mono text-slate-500"
          value={shoppingInput?.image || ""}
          onChange={(e) => setShoppingInput({ image: e.target.value })}
        />
      </div>
    </div>
    <button
      onClick={onAddShopping}
      disabled={!shoppingInput?.text}
      className={`w-full text-white py-2 rounded-lg text-sm font-bold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
        isEditing
          ? "bg-orange-500 hover:bg-orange-600"
          : "bg-slate-800 hover:bg-slate-700"
      }`}
    >
      {isEditing ? <Edit size={16} /> : <Plus size={16} />}
      {isEditing ? "更新內容" : "新增必買清單"}
    </button>
  </div>
);

const StandardChecklistItems = ({
  items,
  onToggle,
  onDelete,
  onEdit,
  catId,
}) => (
  <div className="p-2">
    {items.length === 0 ? (
      <p className="text-xs text-slate-400 text-center py-4 italic">
        尚無項目，請新增
      </p>
    ) : (
      <ul className="space-y-1 mb-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <button
              onClick={() => onToggle(item.id, item.checked)}
              className={`flex-shrink-0 w-5 h-5 rounded border transition-all flex items-center justify-center
                ${
                  item.checked
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
            >
              {item.checked && <CheckSquare size={14} />}
            </button>
            <span
              className={`flex-1 text-sm transition-all ${
                item.checked ? "text-slate-400 line-through" : "text-slate-700"
              }`}
              onClick={() => onToggle(item.id, item.checked)}
            >
              {item.text}
            </span>
            <button
              onClick={() => onEdit(catId, item)}
              className="text-slate-300 hover:text-blue-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-slate-300 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const StandardInputForm = ({
  inputValue,
  onInputChange,
  onAdd,
  isEditing,
  onCancel,
}) => (
  <div
    className={`flex gap-2 p-2 pt-0 mt-2 ${
      isEditing ? "bg-orange-50 rounded-lg p-2" : ""
    }`}
  >
    <input
      type="text"
      placeholder={isEditing ? "編輯項目..." : "新增項目..."}
      className="flex-1 bg-white border-none rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-100 transition-all"
      value={inputValue || ""}
      onChange={onInputChange}
      onKeyDown={(e) => e.key === "Enter" && onAdd()}
    />
    {isEditing && (
      <button
        onClick={onCancel}
        className="bg-white text-slate-400 border border-slate-200 p-2 rounded-lg hover:text-slate-600 active:scale-95 transition-all"
      >
        <X size={18} />
      </button>
    )}
    <button
      onClick={onAdd}
      className={`text-white p-2 rounded-lg active:scale-95 transition-all ${
        isEditing
          ? "bg-orange-500 hover:bg-orange-600"
          : "bg-slate-800 hover:bg-slate-700"
      }`}
    >
      {isEditing ? <Edit size={18} /> : <Plus size={18} />}
    </button>
  </div>
);

const ChecklistGroup = ({
  cat,
  items = [],
  inputValue,
  onInputChange,
  onAdd,
  onToggle,
  onDelete,
  onEdit,
  onCancel,
  editingId,
  shoppingInput,
  setShoppingInput,
  onAddShopping,
  setPreviewImage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isShopping =
    cat.id === "shopping" ||
    cat.id === "shopping_dessert" ||
    cat.id === "shopping_baby";

  // 檢查此分類下是否有正在編輯的項目
  const isEditingThisCat = items.some((item) => item.id === editingId);

  // 如果正在編輯此分類的項目，自動展開
  useEffect(() => {
    if (isEditingThisCat) setIsOpen(true);
  }, [isEditingThisCat]);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${
        isEditingThisCat
          ? "border-orange-300 ring-2 ring-orange-100"
          : "border-slate-100"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-full shadow-sm text-slate-600">
            {cat.icon}
          </div>
          <h2 className="font-bold text-slate-800">{cat.title}</h2>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-2">
            {items.filter((i) => i.checked).length}/{items.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {isOpen &&
        (isShopping ? (
          <div className="p-3 bg-slate-50/50">
            <ShoppingListItems
              items={items}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              setPreviewImage={setPreviewImage}
              catId={cat.id}
            />
            <ShoppingInputForm
              shoppingInput={shoppingInput}
              setShoppingInput={setShoppingInput}
              onAddShopping={onAddShopping}
              isEditing={isEditingThisCat}
              onCancel={onCancel}
            />
          </div>
        ) : (
          <div>
            <StandardChecklistItems
              items={items}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              catId={cat.id}
            />
            <StandardInputForm
              inputValue={inputValue}
              onInputChange={onInputChange}
              onAdd={() => onAdd(cat.id)}
              isEditing={isEditingThisCat}
              onCancel={onCancel}
            />
          </div>
        ))}
    </div>
  );
};

// --- Pocket List View ---
const PocketListView = ({ user }) => {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("food"); // food, spot, shop
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [hours, setHours] = useState("");
  const [closed, setClosed] = useState("");
  const [station, setStation] = useState("");
  const [tips, setTips] = useState("");
  const [image, setImage] = useState("");
  const [showImage, setShowImage] = useState(true);

  const filters = [
    { id: "food", label: "美食", icon: <Coffee size={16} /> },
    { id: "spot", label: "景點", icon: <Camera size={16} /> },
    { id: "shop", label: "逛街", icon: <ShoppingBag size={16} /> },
  ];

  // Sync from Firebase
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'pocket_items'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setError(null);
        const newItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(newItems);
      },
      (err) => {
        console.error("Snapshot error:", err);
        if (err.code === 'permission-denied') {
          setError("permission-denied");
        } else {
          setError(`讀取失敗: ${err.message}`);
        }
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Sort Items by Station
  const sortedItems = useMemo(() => {
    return items
      .filter((item) => item.type === activeFilter)
      .sort((a, b) =>
        (a.station || "").localeCompare(b.station || "", "zh-TW")
      );
  }, [items, activeFilter]);

  const startEditing = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setHours(item.hours || "");
    setClosed(item.closed || "");
    setStation(item.station || "");
    setTips(item.tips || "");
    setImage(item.image || "");
    setShowImage(item.showImage !== undefined ? item.showImage : true);

    setActiveFilter(item.type);
    setIsExpanded(true);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setName("");
    setHours("");
    setClosed("");
    setStation("");
    setTips("");
    setImage("");
    setShowImage(true);
    setIsExpanded(false);
  };

  const handleAddItem = async () => {
    if (!name || !station) return;

    if (editingId) {
      const itemRef = doc(db, 'pocket_items', editingId);
      await updateDoc(itemRef, {
        name,
        hours,
        closed,
        station,
        tips,
        image,
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'pocket_items'), {
        type: activeFilter,
        name,
        hours,
        closed,
        station,
        tips,
        image,
        showImage,
        createdAt: new Date(),
      });
    }

    setName("");
    setHours("");
    setClosed("");
    setStation("");
    setTips("");
    setImage("");
    setShowImage(true);
    setIsExpanded(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("確定要刪除這個口袋名單嗎？")) {
      await deleteDoc(doc(db, 'pocket_items', id));
    }
  };

  const toggleImageVisibility = async (id, currentStatus) => {
    const itemRef = doc(db, 'pocket_items', id);
    await updateDoc(itemRef, { showImage: !currentStatus });
  };

  const searchGoogleImages = (query) => {
    window.open(
      `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,
      "_blank"
    );
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in h-full flex flex-col">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">口袋名單</h1>

      {error === 'permission-denied' && <PermissionErrorBanner />}
      {error && error !== 'permission-denied' && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm shrink-0">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setActiveFilter(f.id);
              cancelEditing();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
              activeFilter === f.id
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      <div
        className={`bg-white rounded-xl border shadow-sm overflow-hidden shrink-0 ${
          editingId
            ? "border-orange-300 ring-2 ring-orange-100"
            : "border-slate-200"
        }`}
      >
        <button
          onClick={() => {
            if (editingId) return;
            setIsExpanded(!isExpanded);
          }}
          className={`w-full flex items-center justify-between p-3 transition-colors ${
            editingId ? "bg-orange-50" : "bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span
            className={`text-sm font-bold flex items-center gap-2 ${
              editingId ? "text-orange-700" : "text-slate-700"
            }`}
          >
            {editingId ? <Edit size={16} /> : <Plus size={16} />}
            {editingId ? "編輯口袋名單" : "新增口袋名單"}
          </span>
          {!editingId &&
            (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </button>

        {isExpanded && (
          <div className="p-4 space-y-3 bg-white">
            {/* Form Fields ... (truncated for brevity, logic same as before) */}
             <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">
                  名稱 (必填)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-base"
                  placeholder="店名/景點名"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">
                  靠近站點 (排序用)
                </label>
                <input
                  type="text"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-base"
                  placeholder="例如: 博多站"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">
                  營業時間
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-base"
                  placeholder="例如: 10:00-20:00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">
                  公休日
                </label>
                <input
                  type="text"
                  value={closed}
                  onChange={(e) => setClosed(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-base"
                  placeholder="例如: 週一"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400">
                  圖片連結
                </label>
                <button
                  onClick={() => searchGoogleImages(name || station)}
                  className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                >
                  <ImageIcon size={10} /> 搜尋圖片
                </button>
              </div>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-base"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">
                Tips / 備註
              </label>
              <textarea
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-base resize-none h-20"
                placeholder="必吃餐點、注意事項..."
              />
            </div>

            <div className="flex gap-2">
              {editingId && (
                <button
                  onClick={cancelEditing}
                  className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-lg font-bold active:scale-95 transition-all"
                >
                  取消
                </button>
              )}
              <button
                onClick={handleAddItem}
                disabled={!name || !station}
                className={`flex-[2] text-white py-3 rounded-lg font-bold active:scale-95 transition-all disabled:opacity-50 ${
                  editingId ? "bg-orange-500" : "bg-slate-800"
                }`}
              >
                {editingId ? "更新" : "加入清單"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {sortedItems.length === 0 && !error ? (
          <div className="text-center text-slate-400 py-10 flex flex-col items-center">
            <ClipboardList size={48} className="mb-2 opacity-20" />
            <p>
              目前沒有{filters.find((f) => f.id === activeFilter)?.label}名單
            </p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white p-6 rounded-xl border shadow-sm relative group transition-all min-h-[180px] ${
                editingId === item.id
                  ? "border-orange-300 ring-1 ring-orange-200"
                  : "border-slate-100"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-2">
                    <Train size={14} />
                    {item.station}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      openGoogleMap(`${item.name} ${item.station}`)
                    }
                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    <MapIcon size={18} />
                  </button>
                  <button
                    onClick={() => startEditing(item)}
                    className="p-2 bg-orange-50 text-orange-500 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {item.image && (
                <div className="mb-4 relative">
                  {item.showImage && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                  <button
                    onClick={() =>
                      toggleImageVisibility(item.id, item.showImage)
                    }
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                  >
                    {item.showImage ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {(item.hours || item.closed) && (
                  <div className="flex flex-col gap-2 text-sm text-slate-500">
                    {item.hours && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="shrink-0" /> {item.hours}
                      </div>
                    )}
                    {item.closed && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} className="shrink-0" /> 公休:{" "}
                        {item.closed}
                      </div>
                    )}
                  </div>
                )}

                {item.tips && (
                  <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg mt-2 border-l-4 border-slate-200">
                    <span className="font-bold text-xs text-slate-400 block mb-1 uppercase tracking-wider">
                      Tips
                    </span>
                    <p className="leading-relaxed">{item.tips}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Weather Forecast Component ---

const WeatherForecast = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=33.5902&longitude=130.4017&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=5"
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();
        const daily = data.daily;

        const formattedData = daily.time.map((time, index) => ({
          date: time,
          code: daily.weather_code[index],
          max: Math.round(daily.temperature_2m_max[index]),
          min: Math.round(daily.temperature_2m_min[index]),
        }));

        setForecast(formattedData);
      } catch (e) {
        console.error("Weather error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="text-orange-500" size={24} />;
    if (code <= 3) return <Cloud className="text-gray-500" size={24} />;
    if (code <= 48) return <Cloud className="text-slate-400" size={24} />;
    if (code <= 67) return <CloudRain className="text-blue-500" size={24} />;
    if (code <= 77) return <Umbrella className="text-cyan-500" size={24} />;
    if (code <= 82) return <CloudRain className="text-blue-600" size={24} />;
    return <CloudRain className="text-purple-500" size={24} />;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (error)
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-center text-red-400 text-sm">
        <Info size={16} className="mr-2" /> 暫時無法取得天氣資訊
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun size={18} className="text-blue-600" />
          <h2 className="font-bold text-slate-800">福岡即時預報 (5日)</h2>
        </div>
        {loading && <Loader size={16} className="animate-spin text-blue-400" />}
      </div>

      <div className="flex justify-between divide-x divide-slate-100">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-1 p-3 flex flex-col items-center gap-2 animate-pulse"
              >
                <div className="w-8 h-3 bg-slate-200 rounded"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="w-6 h-3 bg-slate-200 rounded"></div>
              </div>
            ))
          : forecast.map((day, idx) => (
              <div
                key={idx}
                className="flex-1 p-2 flex flex-col items-center text-center"
              >
                <span className="text-[10px] text-slate-400 font-medium mb-1">
                  {idx === 0 ? "今日" : formatDate(day.date)}
                </span>
                <div className="mb-1">{getWeatherIcon(day.code)}</div>
                <div className="flex flex-col text-xs">
                  <span className="font-bold text-slate-700">{day.max}°</span>
                  <span className="text-slate-400">{day.min}°</span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

// --- Preparation View ---
const PreparationView = ({ user }) => {
  const [items, setItems] = useState([]);
  const [inputStates, setInputStates] = useState({});
  const [shoppingInputStates, setShoppingInputStates] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'checklist_items'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setError(null);
        const newItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(newItems);
      },
      (err) => {
        console.error("Snapshot error:", err);
        if (err.code === 'permission-denied') {
          setError("permission-denied");
        } else {
          setError("無法讀取資料");
        }
      }
    );
    return () => unsubscribe();
  }, [user]);

  const categories = [
    { id: "tickets", title: "門票預約 (出發前)", icon: <Ticket size={18} /> },
    { id: "luggage", title: "出發前行李檢查", icon: <Briefcase size={18} /> },
    { id: "carry_on", title: "手提行李", icon: <Package size={18} /> },
    { id: "child_bag", title: "托運行李-昕", icon: <Baby size={18} /> },
    { id: "mom_bag", title: "托運行李-楓", icon: <Briefcase size={18} /> },
    { id: "dad_bag", title: "托運行李-豪", icon: <Briefcase size={18} /> },
    {
      id: "shopping_baby",
      title: "必買清單-母嬰用品",
      icon: <Baby size={18} />,
    },
    {
      id: "shopping_dessert",
      title: "必買清單-土產",
      icon: <ShoppingBag size={18} />,
    },
    {
      id: "shopping",
      title: "必買清單 (附圖/備註)",
      icon: <ShoppingBag size={18} />,
    },
  ];

  const toggleItem = async (itemId, currentStatus) => {
    const itemRef = doc(db, 'checklist_items', itemId);
    await updateDoc(itemRef, { checked: !currentStatus });
  };

  const deleteItem = async (itemId) => {
    await deleteDoc(doc(db, 'checklist_items', itemId));
  };

  const startEditing = (catId, item) => {
    setEditingId(item.id);
    if (catId.startsWith("shopping")) {
      setShoppingInputStates((prev) => ({
        ...prev,
        [catId]: {
          text: item.text,
          location: item.location || "",
          image: item.image || "",
          priority: item.priority || "高",
        },
      }));
    } else {
      setInputStates((prev) => ({
        ...prev,
        [catId]: item.text,
      }));
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setInputStates({});
    setShoppingInputStates({});
  };

  const addItem = async (catId) => {
    const text = inputStates[catId]?.trim();
    if (!text) return;

    if (editingId) {
      const itemRef = doc(db, 'checklist_items', editingId);
      await updateDoc(itemRef, { text });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'checklist_items'), {
        catId,
        text,
        checked: false,
      });
    }
    setInputStates((prev) => ({ ...prev, [catId]: "" }));
  };

  const addShoppingItem = async (catId) => {
    const input = shoppingInputStates[catId];
    if (!input || !input.text.trim()) return;

    if (editingId) {
      const itemRef = doc(db, 'checklist_items', editingId);
      await updateDoc(itemRef, {
        text: input.text,
        location: input.location,
        image: input.image,
        priority: input.priority || "高",
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'checklist_items'), {
        catId,
        text: input.text,
        location: input.location,
        image: input.image,
        priority: input.priority || "高",
        checked: false,
      });
    }
    setShoppingInputStates((prev) => ({
      ...prev,
      [catId]: { text: "", location: "", image: "", priority: "高" },
    }));
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in relative">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        行前準備 Checklist
      </h1>
      
      {error === 'permission-denied' && <PermissionErrorBanner />}
      {error && error !== 'permission-denied' && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {previewImage && (
        <ImagePreviewModal
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.catId === cat.id);
        const sortedItems = [...catItems].sort((a, b) => {
          if (cat.id.startsWith("shopping")) {
            const locA = a.location || "";
            const locB = b.location || "";
            return locA.localeCompare(locB, "zh-TW");
          } else {
            const textA = a.text || "";
            const textB = b.text || "";
            return textA.localeCompare(textB, "zh-TW");
          }
        });

        return (
          <ChecklistGroup
            key={cat.id}
            cat={cat}
            items={sortedItems}
            inputValue={inputStates[cat.id]}
            onInputChange={(e) =>
              setInputStates({ ...inputStates, [cat.id]: e.target.value })
            }
            onAdd={addItem}
            onToggle={toggleItem}
            onDelete={deleteItem}
            onEdit={startEditing}
            onCancel={cancelEditing}
            editingId={editingId}
            shoppingInput={
              cat.id.startsWith("shopping") ? shoppingInputStates[cat.id] : null
            }
            setShoppingInput={(newState) =>
              setShoppingInputStates((prev) => ({
                ...prev,
                [cat.id]: { ...prev[cat.id], ...newState },
              }))
            }
            onAddShopping={() => addShoppingItem(cat.id)}
            setPreviewImage={setPreviewImage}
          />
        );
      })}
    </div>
  );
};

// --- Activity Item Component (Extracted for reusability in print mode) ---
const ActivityItem = ({
  item,
  idx,
  totalItems,
  expandedAlternatives,
  toggleAlternative,
}) => (
  <div key={idx} className="flex gap-4 relative">
    {idx !== totalItems - 1 && (
      <div className="absolute left-[19px] top-12 bottom-[-24px] w-[2px] bg-slate-100"></div>
    )}

    <CategoryIcon type={item.type} />

    <div className="flex-1 bg-white rounded-xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-lg leading-tight">
            {item.title}
          </h3>
          {item.mapQuery && (
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.mapQuery
                  )}`,
                  "_blank"
                )
              }
              className="text-blue-500 hover:text-blue-600 p-1 rounded-full bg-blue-50"
            >
              <MapIcon size={16} />
            </button>
          )}
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
          {item.time}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-3 leading-relaxed whitespace-pre-wrap">{item.desc}</p>

      {item.tips && (
        <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 flex gap-2 mb-3">
          <div className="mt-0.5">
            <Sun size={14} className="text-yellow-500" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-yellow-700 mr-1">TIPS:</span>
            {item.tips}
          </p>
        </div>
      )}

      {item.alternatives && item.alternatives.length > 0 && (
        <div className="border-t border-slate-100 pt-2">
          <button
            onClick={() => toggleAlternative(idx)}
            className="flex items-center text-xs font-bold text-purple-600 hover:text-purple-700 w-full py-1"
          >
            {expandedAlternatives[idx] ? (
              <ChevronUp size={14} className="mr-1" />
            ) : (
              <ChevronDown size={14} className="mr-1" />
            )}
            雨備 / 替代方案
          </button>

          {expandedAlternatives[idx] && (
            <div className="mt-2 space-y-2 pl-2 border-l-2 border-purple-100">
              {item.alternatives.map((alt, altIdx) => (
                <div key={altIdx} className="bg-purple-50/50 p-2 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700 text-sm">
                        {alt.title}
                      </span>
                      {alt.mapQuery && (
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                alt.mapQuery
                              )}`,
                              "_blank"
                            )
                          }
                          className="text-purple-500 hover:text-purple-600"
                        >
                          <MapIcon size={14} />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white text-purple-600 rounded border border-purple-100">
                      {alt.type === "food"
                        ? "餐廳"
                        : alt.type === "spot"
                        ? "景點"
                        : "購物"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{alt.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

const ItineraryView = ({ selectedDay, setSelectedDay }) => {
  const dayData = ITINERARY.find((d) => d.day === selectedDay) || ITINERARY[0];
  const [expandedAlternatives, setExpandedAlternatives] = useState({});

  const toggleAlternative = (index) => {
    setExpandedAlternatives((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Sticky Date Selector & Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        {/* Date Tabs */}
        <div className="flex px-2 py-3 gap-2 overflow-x-auto no-scrollbar">
          {ITINERARY.map((d) => (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all min-w-[80px] ${
                selectedDay === d.day
                  ? "bg-slate-800 text-white shadow-md scale-105"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-bold uppercase leading-none mb-1">
                Day {d.day}
              </span>
              <span className="text-xs leading-none">
                {d.date.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Compact Split Header Card */}
        <div className="px-4 pb-2">
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[88px]">
            {/* Left Side: Location & Date (35%) */}
            <div className="w-[35%] bg-indigo-50 p-3 flex flex-col justify-center border-r border-indigo-100 shrink-0">
               <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Day {dayData.day}
               </span>
               <h2 className="text-sm font-bold text-slate-800 leading-tight my-1 line-clamp-2">
                  {dayData.location}
               </h2>
               <p className="text-[10px] text-slate-500 font-mono">
                  {dayData.date}
               </p>
            </div>

            {/* Right Side: Reminder (Rest) */}
            <div className={`flex-1 p-3 flex flex-col justify-center ${dayData.reminder ? 'bg-amber-50/50' : 'bg-white'}`}>
               {dayData.reminder ? (
                 <div className="flex gap-2 h-full">
                   <Bell size={16} className="text-amber-500 shrink-0 mt-0.5" />
                   <div className="min-w-0">
                      <p className="text-[10px] font-bold text-amber-700 mb-0.5">當日提醒</p>
                      <p className="text-xs text-slate-700 leading-snug">
                        {dayData.reminder}
                      </p>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center justify-center text-slate-300 gap-1 h-full">
                    <Sun size={16} />
                    <span className="text-xs">Have a nice trip!</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {dayData.activities.map((item, idx) => (
          <ActivityItem
            key={idx}
            item={item}
            idx={idx}
            totalItems={dayData.activities.length}
            expandedAlternatives={expandedAlternatives}
            toggleAlternative={toggleAlternative}
          />
        ))}
      </div>
    </div>
  );
};

// --- New Reusable Collapsible Component ---
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 transition-colors ${
            isOpen ? "bg-slate-50 border-b border-slate-100" : "bg-white hover:bg-slate-50"
        }`}
      >
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          {Icon && <Icon size={16} className="text-slate-400" />} {title}
        </h2>
        {isOpen ? (
          <ChevronUp size={18} className="text-slate-400" />
        ) : (
          <ChevronDown size={18} className="text-slate-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="animate-fade-in">
           {children}
        </div>
      )}
    </div>
  );
};

const ToolsView = () => {
  const [modalPhrase, setModalPhrase] = useState(null);

  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in relative">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">旅行工具箱</h1>

      {/* Weather Forecast (Always Visible) */}
      <WeatherForecast />

      {modalPhrase && (
        <PhraseModal
          phrase={modalPhrase}
          onClose={() => setModalPhrase(null)}
        />
      )}

      {/* Flight Info */}
      <CollapsibleSection title="航班資訊" icon={Plane} defaultOpen={false}>
        <div className="space-y-4 pt-4 px-4 pb-4">
          {["outbound", "inbound"].map((type) => (
            <div
              key={type}
              className={`p-4 rounded-xl border border-slate-100 bg-white ${
                type === "inbound"
                  ? "border-t border-dashed border-slate-200 mt-2"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    type === "outbound"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {type === "outbound" ? "去程" : "回程"}
                </span>
                <span className="text-xs text-slate-400">
                  {TRIP_INFO.flight[type].duration}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-mono font-bold text-slate-800 mb-1">
                    {TRIP_INFO.flight[type].code}
                  </div>
                  <div className="text-xs text-slate-500">
                    {TRIP_INFO.flight[type].airline}
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-right">
                  <div>
                    <div className="text-base font-bold text-slate-800">
                      {TRIP_INFO.flight[type].dep.split(" ")[0]}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        {TRIP_INFO.flight[type].dep.split(" ")[1]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-800">
                      {TRIP_INFO.flight[type].arr.split(" ")[0]}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        {TRIP_INFO.flight[type].arr.split(" ")[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Transport Info */}
      <CollapsibleSection title="機場交通" icon={Bus} defaultOpen={false}>
         <div className="p-4 space-y-4">
          {/* Day 1 Special */}
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
              前往 LaLaport
            </h3>
            <ul className="text-sm text-orange-900 space-y-2 list-disc pl-4">
              <li>
                <span className="font-semibold">直達巴士：</span>
                大約 15～20 分鐘 即可抵達。
              </li>
              <li>
                <span className="font-semibold">班距：</span>
                大約 30～60 分鐘 一班車（每小時約 1～2 班）。
              </li>
              <li>
                <span className="font-semibold">巴士外觀：</span>
                通常是西鐵巴士（Nishitetsu
                Bus），車頭方向幕會顯示「LaLaport」或「竹下」方向。
              </li>
              <li>
                <span className="font-semibold">乘車處：</span>
                下機後依「市內バス」指標，前往國際線航廈 1 樓巴士停靠區{" "}
                <span className="font-bold bg-orange-200 px-1 rounded">
                  6、7 號
                </span>{" "}
                站牌。
              </li>
              <li>
                <span className="font-semibold">搭乘方式：</span>
                <ul className="list-circle pl-4 mt-1 text-xs text-orange-800">
                  <li>後門上車：刷 IC 卡 (Suica/PASMO/ICOCA)。</li>
                  <li>前門下車：刷 IC 卡或投幣 (330日圓)。</li>
                  <li>若無零錢：請先利用運賃箱旁的兌幣口換錢，再投入。</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Subway */}
          <div>
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
                A
              </span>{" "}
              地鐵 (Subway)
            </h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
              <li>
                <span className="font-semibold text-slate-700">
                  轉乘國內線：
                </span>
                在國際線航廈「5號巴士站」搭乘免費接駁巴士（約10-15分車程，5-6分一班）。
              </li>
              <li>
                <span className="font-semibold text-slate-700">搭乘地鐵：</span>
                於國內線航廈地下二樓搭乘「空港線」：
                <ul className="list-circle pl-4 mt-1 text-xs text-slate-500">
                  <li>福岡機場(K13) → 博多車站(K11) (約5分鐘)</li>
                  <li>福岡機場(K13) → 天神 (約11分鐘)</li>
                  <li>單程 260 日圓</li>
                </ul>
              </li>
            </ul>
            <a
              href="https://www.fukuoka-airport.jp/tw/access/bus2.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 mt-2 hover:underline"
            >
              <LinkIcon size={12} /> 時刻表
            </a>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
                B
              </span>{" "}
              巴士 (Bus)
            </h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
              <li>
                <span className="font-semibold text-slate-700">乘車處：</span>
                國際線航廈 6、7 號站台。
              </li>
              <li>
                <span className="font-semibold text-slate-700">
                  西鐵巴士直達車：
                </span>
                往博多車站，約20-30分鐘一班。
              </li>
              <li>
                <span className="font-semibold text-slate-700">下車點：</span>
                博多站筑紫口。
              </li>
            </ul>
            <div className="flex gap-3 mt-2">
              <a
                href="https://www.fukuoka-airport.jp/tw/access/bus.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
              >
                <LinkIcon size={12} /> 時刻表
              </a>
              <a
                href="https://www.kkday.com/zh-tw/product/285068?cid=2290"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-orange-500 hover:underline"
              >
                <Ticket size={12} /> KKday 購票
              </a>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Hotel Info */}
      <CollapsibleSection title="住宿資訊" icon={Home} defaultOpen={false}>
        <div className="p-4">
          <h3 className="font-bold text-lg text-slate-800">
            {TRIP_INFO.hotel.name}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {TRIP_INFO.hotel.jpName}
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <MapIcon size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                {TRIP_INFO.hotel.address}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-700">交通方式：</p>
              {TRIP_INFO.hotel.access.map((line, i) => (
                <p key={i}>• {line}</p>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Kitchenware Buying Guide */}
      <CollapsibleSection title="購物指南" icon={Utensils} defaultOpen={false}>
        <div className="p-4 space-y-4">
          {/* AMU PLAZA */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center justify-between">
              A. 【AMU PLAZA】              
			  <span className="text-[10px] font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded w-fit">
                TIPS: 退稅：2F/4F 櫃台 (需收1.55%手續費)
              </span>
            </h3>
            
            <div className="space-y-4">
              <div>
                 <h4 className="font-bold text-slate-700 text-sm mb-1 bg-slate-50 inline-block px-2 rounded">1F 中川政七商店</h4>
                 <p className="text-xs text-slate-600 mb-1">專門選自日本各地的職人工藝。</p>
                 <ul className="list-disc list-inside text-xs text-slate-500 pl-1 space-y-0.5">
                   <li>燕三條產不鏽鋼叉匙、奶油刀</li>
                   <li><strong className="text-slate-700">鋁製導熱奶油匙</strong> (利用手溫融化奶油)</li>
                   <li>奈良產花織家事布 (吸水強、不留棉絮)</li>
                 </ul>
              </div>

              <div>
                 <h4 className="font-bold text-slate-700 text-sm mb-1 bg-slate-50 inline-block px-2 rounded">4F Tokyu Hands (東急手創館)</h4>
                 <div className="space-y-2 mt-1">
                   {[
                     { title: "柳宗理", desc: "完整專區 (調理盆、漏盆、刀叉匙)，貨源穩定。" },
                     { title: "富士琺瑯", desc: "款式多 (純白、北歐風、聯名款)。" },
                     { title: "燕三條 (Made in TSUBAME)", desc: "LUCKYWOOD (皇室用)、燕振興工業 (人體工學)、下村企販 (不鏽鋼量杯、炸物濾油盤)。" },
                     { title: "貝印 (KAI)", desc: "日本動植物造型模具 (適合做寶寶餅乾/飯糰)。" },
                     { title: "Aux (Leyeye)", desc: "細緻磨泥器 (蒜/薑)、指尖夾 (炸物/翻面好用)。" },
                     { title: "Lekue / 矽膠系列", desc: "日本限定精緻矽膠烘焙墊、微波調理盒。" },
                     { title: "龜之子刷 (Kamenoko)", desc: "海綿 (Kamenoko Sponge)，排水強、不易發霉、質感色系。" },
                     { title: "倉敷意匠", desc: "雜貨感牙籤盒、調味料罐。" }
                   ].map((item, i) => (
                     <div key={i} className="text-xs text-slate-600 pl-2 border-l-2 border-slate-100">
                       <span className="font-bold text-slate-700">{i+1}. {item.title}：</span>
                       {item.desc}
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Yodobashi */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center justify-between">
              B. 【Yodobashi】              
			  <span className="text-[10px] font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded w-fit">
                TIPS: 退稅：結帳出示護照 (直接扣10%)
              </span>
            </h3>
            <div className="space-y-3">
               <div>
                 <h4 className="font-bold text-slate-700 text-sm mb-1 bg-slate-50 inline-block px-2 rounded">2F 玩具/轉蛋</h4>
                 <ul className="list-disc list-inside text-xs text-slate-500 pl-1 space-y-0.5">
                   <li>各種日系玩具、樂高</li>
                   <li>轉蛋機專區</li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-bold text-slate-700 text-sm mb-1 bg-slate-50 inline-block px-2 rounded">3F 家電百貨區</h4>
                 <ul className="list-disc list-inside text-xs text-slate-500 pl-1 space-y-0.5">
                   <li>燕三條 (Tsubame-Sanjo)</li>
                   <li>富士琺瑯</li>
                 </ul>
               </div>
            </div>
          </div>

          {/* Hakata Hankyu */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2 flex flex-col gap-1">
              <span>C. 【博多阪急】</span>
              <span className="text-[10px] font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded w-fit">
                TIPS: 先去 1F 服務台/M3F 免稅櫃台領「5% 優惠券」+滿額10%退稅
              </span>
            </h3>
            <div className="space-y-3">
              {[
                { floor: "B1F", title: "北野超市 (KITANO ACE)", desc: "調味料天堂、茅乃舍 (Kayanoya)、福岡所有名產" },
                { floor: "7F", title: "Miki House、10mois", desc: "雲朵餐盤、幼兒寢具" }
              ].map((floor, i) => (
                <div key={i}>
                  <span className="font-bold text-slate-700 text-sm bg-slate-50 px-2 rounded mr-2">{floor.floor}</span>
                  <span className="font-bold text-slate-700 text-xs">{floor.title}</span>
                  <p className="text-xs text-slate-500 mt-0.5 pl-2 border-l-2 border-slate-100">{floor.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Riverain Mall */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">D. 【Riverain Mall (中洲川端)】</h3>
            <div className="space-y-2">
              {[
                { floor: "B2F", content: "Seria、茅乃舍" },
                { floor: "B1F", content: "BorneLund(嬰兒玩具)、IKEUCHI ORGANIC(今治毛巾-有機)" },
                { floor: "1F", content: "tokineri(廚房用品)、Sghr Sugahara" },
                { floor: "2F", content: "Small quantity by mammy baby(嬰兒選物)、HAKATA JAPAN(博多織品)" }
              ].map((item, i) => (
                <div key={i} className="text-xs text-slate-600">
                  <span className="font-bold bg-slate-50 px-1.5 rounded mr-1 text-slate-700">{item.floor}</span>
                  {item.content}
                </div>
              ))}
            </div>
          </div>

          {/* LaLaport */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">E. 【LaLaport】</h3>
            <div className="space-y-3">
              {[
                { floor: "1F", title: "212 Kitchen Store", desc: "專業廚房用品選物店。" },
                { floor: "3F", title: "阿卡將本舖、3COINS + plus、petit main", desc: "母嬰用品、平價雜貨、童裝。" },
                { floor: "5F", title: "玩具反斗城", desc: "規模巨大，適合買大型玩具。" }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-0.5">
                     <span className="font-bold text-slate-700 text-sm bg-slate-50 px-2 rounded">{item.floor}</span>
                     <span className="font-bold text-slate-700 text-xs">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 pl-2 border-l-2 border-slate-100">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Strawberry Buying Guide */}
      <CollapsibleSection title="草莓購買指南" icon={ShoppingBag} defaultOpen={false}>
         <div className="p-4 space-y-3">
           {[
             { name: "1.福岡 甘王Amaou(あまおう)", desc: "【酸甜平衡之王】 濃郁的甜中帶微酸，果肉厚實、果汁極多。認明 「紅、圓、大、甜」，挑選整顆深紅、蒂頭下無白的。如果蒂頭下方的果肉出現細微的白色橫向裂紋，日本稱為「身割れ」，果肉糖分過高把皮撐裂了，這盒絕對是極品。記得挑選規格標示為 「DX (Deluxe)」 或 「G (Grande)」 的。(超市)", color: "border-red-100 bg-red-50" },
			 { name: "2.埼玉 Amarin (あまりん)", desc: "【極致甜度】 幾乎沒有酸味，甜度極高且穩定，口感紮實。價格最高，但連續獲得金獎。(博多阪急 B1)", color: "border-pink-100 bg-pink-50" },
			 { name: "3.奈良 古都華 (ことか)", desc: "【濃郁震撼】 甜度與酸度都非常強烈，味道極濃。適合重口味老饕，香氣越重越新鮮。(博多阪急 B1)", color: "border-red-100 bg-red-50" },
			 { name: "4.佐賀 Ichigosan (いちごさん)", desc: "【優雅清甜】 口感清爽順口，皮薄且果肉非常柔軟最適合小孩。", color: "border-pink-100 bg-pink-50" },
			 { name: "5.熊本/佐賀 淡雪 (あわゆき)", desc: "【溫和無酸】 看起來像沒熟，其實甜度適中且完全不酸。粉紅色外觀，香氣帶有一點淡淡奶香。", color: "border-red-100 bg-red-50" },
			 { name: "6.栃木 Tochiaika (とちあいか)", desc: "【高CP值】 酸度低、甜味明顯。價格平實且品質穩定，超市採買首選。「整顆紅透、接近蒂頭處沒有白」就保證好吃", color: "border-pink-100 bg-pink-50" },
           ].map((berry, i) => (
             <div key={i} className={`p-3 rounded-xl border ${berry.color} flex gap-3 items-start`}>
               <div className="bg-white/50 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-red-400">
                 {i+1}
               </div>
               <div>
                 <h4 className="font-bold text-slate-800 text-sm">{berry.name}</h4>
                 <p className="text-xs text-slate-600 mt-1 leading-relaxed">{berry.desc}</p>
               </div>
             </div>
           ))}
         </div>
      </CollapsibleSection>

      {/* Japanese Phrases */}
      <CollapsibleSection title="實用日語手指書 (點擊放大)" icon={Languages} defaultOpen={false}>
         <div className="p-4 space-y-3">
          {JAPANESE_PHRASES.map((cat, idx) => (
            <PhraseCategory
              key={idx}
              category={cat}
              onPhraseClick={setModalPhrase}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Parent Guide */}
      <CollapsibleSection title="新手爸媽防呆指南" icon={Baby} defaultOpen={false}>
        <div className="p-4 space-y-3">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
            <Heart className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="font-bold text-amber-800 text-sm mb-1">
                佛系心態
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                {PARENT_GUIDE.mindset}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-3">
            <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              <ChevronUp size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                電梯攻略
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {PARENT_GUIDE.elevator}
              </p>
            </div>
          </div>

          {/* Google Maps Tips */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-3">
            <div className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              <MapIcon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                Google Maps 無障礙模式
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {PARENT_GUIDE.google_maps}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Package className="text-slate-400" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">
                Lalaport 行李寄放
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded mb-1 inline-block">
                  支持 IC 卡
                </span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 ml-1">
                  {PARENT_GUIDE.lalaport_storage.ic_card.map((loc, i) => (
                    <li key={i}>{loc}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1 inline-block">
                  僅投幣 (不支持 IC 卡)
                </span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 ml-1">
                  {PARENT_GUIDE.lalaport_storage.cash_only.map((loc, i) => (
                    <li key={i}>{loc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Tips & Emergency */}
      <CollapsibleSection title="貼心小叮嚀" icon={Info} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4 p-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-blue-800 font-bold text-sm mb-1 flex items-center gap-1">
                <Shirt size={14} /> 穿著建議
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
                {TOOLS_INFO.clothing[0].val}
            </p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h3 className="text-red-800 font-bold text-sm mb-1 flex items-center gap-1">
                <Phone size={14} /> 緊急聯絡
            </h3>
            <p className="text-xs text-red-700">救護車: 119</p>
            <p className="text-xs text-red-700">警察局: 110</p>
            </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

const BudgetView = ({ user }) => {
  const [items, setItems] = useState([]);
  const [inputTitle, setInputTitle] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [inputType, setInputType] = useState("food");
  const [inputPayer, setInputPayer] = useState("");
  const [inputCurrency, setInputCurrency] = useState("JPY");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [inputDate, setInputDate] = useState("2026/2/22 (日)");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'budget_items'), orderBy("date"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setError(null);
        const newItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(newItems);
      },
      (err) => {
        console.error("Snapshot error:", err);
        if (err.code === 'permission-denied') {
          setError("permission-denied");
        } else {
          setError("無法讀取資料");
        }
      }
    );
    return () => unsubscribe();
  }, [user]);

  const dateOptions = useMemo(
    () => [
      { value: "all", label: "全部行程 (All)" },
      { value: "pre", label: "行前準備 (Pre-trip)" },
      ...ITINERARY.map((day) => ({
        value: day.date,
        label: `${day.date} ${day.location}`,
      })),
    ],
    []
  );

  const filteredItems = items.filter((item) => {
    if (selectedDateFilter === "all") return true;
    return item.date === selectedDateFilter;
  });

  const total = filteredItems.reduce((sum, item) => {
    const amount = Number(item.amount) || 0;
    const finalAmount =
      item.currency === "JPY" ? Math.round(amount * EXCHANGE_RATE) : amount;
    return sum + finalAmount;
  }, 0);

  const addItem = async (e) => {
    e.preventDefault();
    if (!inputTitle || !inputAmount || !inputPayer) return;

    const dateToAdd =
      selectedDateFilter !== "all" ? selectedDateFilter : inputDate;

    await addDoc(collection(db, 'budget_items'), {
      title: inputTitle,
      amount: Number(inputAmount),
      type: inputType,
      payer: inputPayer,
      currency: inputCurrency,
      date: dateToAdd,
    });

    setInputTitle("");
    setInputAmount("");
    setInputPayer("");
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'budget_items', id));
  };

  const typeColors = {
    pre: "bg-gray-100 text-gray-600",
    food: "bg-orange-100 text-orange-600",
    transport: "bg-blue-100 text-blue-600",
    shopping: "bg-pink-100 text-pink-600",
    ticket: "bg-purple-100 text-purple-600",
    other: "bg-slate-100 text-slate-600",
  };

  const typeLabels = {
    pre: "準備",
    food: "飲食",
    transport: "交通",
    shopping: "購物",
    ticket: "門票",
    other: "其他",
  };

  return (
    <div className="p-3 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-slate-800">旅費記帳</h1>

        <div className="relative">
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 py-1 pl-3 pr-8 rounded-lg text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      <div className="bg-slate-800 text-white rounded-xl p-3 shadow-md mb-2 relative overflow-hidden shrink-0">
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-slate-400 text-xs mb-1 flex items-center gap-2">
              總支出 (TWD)
              {selectedDateFilter !== "all" && (
                <span className="bg-slate-700 text-xs px-2 py-0.5 rounded text-white">
                  {selectedDateFilter === "pre"
                    ? "行前"
                    : selectedDateFilter.split(" ")[0]}
                </span>
              )}
            </p>
            <p className="text-2xl font-mono font-bold leading-none">
              NT$ {total.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
          <DollarSign size={64} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1">
        {error === 'permission-denied' && <PermissionErrorBanner />}
        {error && error !== 'permission-denied' && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-600 text-sm mb-4">
            {error}
          </div>
        )}
        {filteredItems.length === 0 && !error && (
          <div className="text-center text-slate-400 mt-10">
            <p className="text-sm">尚無紀錄</p>
            <p className="text-xs mt-1">點擊下方新增一筆支出</p>
          </div>
        )}
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  typeColors[item.type] || typeColors.other
                }`}
              >
                {item.type === "food" ? (
                  <Coffee size={18} />
                ) : item.type === "transport" ? (
                  <Train size={18} />
                ) : item.type === "shopping" ? (
                  <ShoppingBag size={18} />
                ) : item.type === "pre" ? (
                  <ClipboardList size={18} />
                ) : item.type === "ticket" ? (
                  <Ticket size={18} />
                ) : (
                  <Wallet size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-slate-800 font-bold block truncate">
                  {item.title}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  {typeLabels[item.type]}
                  {selectedDateFilter === "all" && (
                    <>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      {item.date === "pre" ? "行前" : item.date.split(" ")[0]}
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono font-bold text-slate-700 whitespace-nowrap">
                {item.currency === "JPY" ? "¥" : "NT$"}{" "}
                {item.amount.toLocaleString()}
              </span>
              {item.payer && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <User size={8} /> {item.payer === "hao" ? "豪" : "楓"}
                </span>
              )}
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-slate-300 hover:text-red-400 p-2 -mr-2"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={addItem}
        className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2 shrink-0"
      >
        <div className="flex gap-2 items-center">
          <div className="relative w-20 shrink-0">
            <select
              value={inputCurrency}
              onChange={(e) => setInputCurrency(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-none rounded-lg px-2 py-2 text-base font-bold text-slate-700 focus:ring-2 focus:ring-slate-200"
            >
              <option value="JPY">日幣</option>
              <option value="TWD">台幣</option>
            </select>
            <Coins
              size={12}
              className="absolute right-2 top-3.5 text-slate-400 pointer-events-none"
            />
          </div>

          <input
            type="number"
            placeholder="金額"
            className="w-24 bg-slate-50 border-none rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-slate-200"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
          />

          {inputCurrency === "JPY" && inputAmount && (
            <span className="text-xs text-slate-400 font-mono shrink-0">
              ≈NT$
              {Math.round(Number(inputAmount) * EXCHANGE_RATE).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="項目名稱"
            className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-slate-200"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
          />

          <div className="relative w-24 shrink-0">
            <select
              value={inputPayer}
              onChange={(e) => setInputPayer(e.target.value)}
              className={`w-full appearance-none border-none rounded-lg px-2 py-2 text-base focus:ring-2 focus:ring-slate-200 ${
                !inputPayer
                  ? "bg-red-50 text-red-400 font-bold"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              <option value="" disabled>
                付款者
              </option>
              <option value="hao">豪</option>
              <option value="feng">楓</option>
            </select>
            <User
              size={14}
              className={`absolute right-2 top-3 pointer-events-none ${
                !inputPayer ? "text-red-300" : "text-slate-400"
              }`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-2 text-base text-slate-600 focus:ring-2 focus:ring-slate-200"
          >
            {Object.keys(typeLabels).map((key) => (
              <option key={key} value={key}>
                {typeLabels[key]}
              </option>
            ))}
          </select>

          {selectedDateFilter === "all" && (
            <select
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-2 text-base text-slate-600 focus:ring-2 focus:ring-slate-200"
            >
              <option value="pre">行前準備</option>
              {ITINERARY.map((d) => (
                <option key={d.date} value={d.date}>
                  {d.date}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center w-12 shrink-0"
          >
            <Plus size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedDay, setSelectedDay] = useState(1);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth failed", err);
        setAuthError(err.message);
      }
    };
    initAuth();

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  if (authError) {
    return (
      <div className="h-[100dvh] bg-slate-50 flex items-center justify-center flex-col gap-3 p-4 text-center">
        <AlertCircle className="text-red-500" size={48} />
        <h2 className="text-slate-800 text-lg font-bold">無法連線到資料庫</h2>
        <p className="text-slate-500 text-sm">請前往 Firebase Console 設定 Authorized Domains</p>
        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 max-w-xs break-all">
          {authError}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[100dvh] bg-slate-50 flex items-center justify-center flex-col gap-3">
        <Loader className="animate-spin text-blue-500" size={32} />
        <p className="text-slate-400 text-sm font-bold">載入行程中...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 h-[100dvh] w-full flex flex-col font-sans selection:bg-slate-200">
      {/* 主要內容區 */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full bg-slate-50 min-h-0 relative shadow-2xl">
        {activeTab === "itinerary" && (
          <ItineraryView
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        )}
        {activeTab === "tools" && <ToolsView />}
        {activeTab === "preparation" && <PreparationView user={user} />}
        {activeTab === "budget" && <BudgetView user={user} />}
        {activeTab === "pocket" && <PocketListView user={user} />}
      </div>

      {/* 底部導航欄 */}
      <div className="bg-white border-t border-slate-100 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around items-center px-2 py-1">
          <TabButton
            active={activeTab === "itinerary"}
            onClick={() => setActiveTab("itinerary")}
            icon={<MapPin />}
            label="行程"
          />
          <TabButton
            active={activeTab === "pocket"}
            onClick={() => setActiveTab("pocket")}
            icon={<Bookmark />}
            label="名單"
          />
          <TabButton
            active={activeTab === "tools"}
            onClick={() => setActiveTab("tools")}
            icon={<Info />}
            label="資訊"
          />
          <TabButton
            active={activeTab === "preparation"}
            onClick={() => setActiveTab("preparation")}
            icon={<ClipboardList />}
            label="準備"
          />
          <TabButton
            active={activeTab === "budget"}
            onClick={() => setActiveTab("budget")}
            icon={<Wallet />}
            label="記帳"
          />
        </div>
      </div>

      {/* Global CSS */}
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;