import type { InventoryItem, Room } from '../types';

/**
 * 보미네 집 (세종로대우 52평 기본형).
 * 네이버부동산 평면도를 상하 반전(실제 집 방향, LG ThinQ 3D 홈뷰와 동일)하고
 * 전용 약 109.9㎡에 맞춰 축척. 가구·가전 위치는 ThinQ 화면 기준.
 */
export const HOME_ROOMS: Room[] = [
  {
    "id": "master",
    "name": "안방",
    "color": "#f3e3d3",
    "points": [
      {
        "x": 0,
        "y": 1070
      },
      {
        "x": 470,
        "y": 1070
      },
      {
        "x": 470,
        "y": 815
      },
      {
        "x": 470,
        "y": 700
      },
      {
        "x": 0,
        "y": 700
      }
    ]
  },
  {
    "id": "master-bath",
    "name": "안방화장실",
    "color": "#dbe9f2",
    "points": [
      {
        "x": 470,
        "y": 1070
      },
      {
        "x": 625,
        "y": 1070
      },
      {
        "x": 625,
        "y": 815
      },
      {
        "x": 470,
        "y": 815
      }
    ]
  },
  {
    "id": "kitchen",
    "name": "주방",
    "color": "#f2ead9",
    "points": [
      {
        "x": 675,
        "y": 1070
      },
      {
        "x": 1025,
        "y": 1070
      },
      {
        "x": 1025,
        "y": 695
      },
      {
        "x": 870,
        "y": 695
      },
      {
        "x": 770,
        "y": 695
      },
      {
        "x": 675,
        "y": 695
      },
      {
        "x": 675,
        "y": 815
      }
    ],
    "open": [
      4,
      5
    ]
  },
  {
    "id": "utility",
    "name": "다용도실",
    "color": "#e6e6e6",
    "points": [
      {
        "x": 1025,
        "y": 1070
      },
      {
        "x": 1200,
        "y": 1070
      },
      {
        "x": 1200,
        "y": 695
      },
      {
        "x": 1025,
        "y": 695
      }
    ]
  },
  {
    "id": "entry",
    "name": "현관",
    "color": "#e9e4dc",
    "points": [
      {
        "x": 870,
        "y": 695
      },
      {
        "x": 1025,
        "y": 695
      },
      {
        "x": 1025,
        "y": 565
      },
      {
        "x": 870,
        "y": 565
      }
    ],
    "open": [
      3
    ]
  },
  {
    "id": "dressroom",
    "name": "드레스룸",
    "color": "#f4e1ea",
    "points": [
      {
        "x": 675,
        "y": 565
      },
      {
        "x": 870,
        "y": 565
      },
      {
        "x": 1025,
        "y": 565
      },
      {
        "x": 1025,
        "y": 340
      },
      {
        "x": 675,
        "y": 340
      }
    ],
    "kind": "dressroom"
  },
  {
    "id": "james",
    "name": "제임스방",
    "color": "#e2e8f4",
    "points": [
      {
        "x": 675,
        "y": 340
      },
      {
        "x": 1025,
        "y": 340
      },
      {
        "x": 1025,
        "y": 0
      },
      {
        "x": 675,
        "y": 0
      },
      {
        "x": 675,
        "y": 220
      }
    ]
  },
  {
    "id": "bath",
    "name": "공용화장실",
    "color": "#dbe9f2",
    "points": [
      {
        "x": 470,
        "y": 220
      },
      {
        "x": 675,
        "y": 220
      },
      {
        "x": 675,
        "y": 0
      },
      {
        "x": 470,
        "y": 0
      }
    ]
  },
  {
    "id": "bomi",
    "name": "보미방",
    "color": "#f6e6c8",
    "points": [
      {
        "x": 0,
        "y": 340
      },
      {
        "x": 470,
        "y": 340
      },
      {
        "x": 470,
        "y": 220
      },
      {
        "x": 470,
        "y": 0
      },
      {
        "x": 0,
        "y": 0
      }
    ]
  },
  {
    "id": "living",
    "name": "거실",
    "color": "#efe4d4",
    "points": [
      {
        "x": 0,
        "y": 700
      },
      {
        "x": 470,
        "y": 700
      },
      {
        "x": 470,
        "y": 815
      },
      {
        "x": 625,
        "y": 815
      },
      {
        "x": 675,
        "y": 815
      },
      {
        "x": 675,
        "y": 695
      },
      {
        "x": 770,
        "y": 695
      },
      {
        "x": 870,
        "y": 695
      },
      {
        "x": 870,
        "y": 565
      },
      {
        "x": 675,
        "y": 565
      },
      {
        "x": 675,
        "y": 340
      },
      {
        "x": 675,
        "y": 220
      },
      {
        "x": 470,
        "y": 220
      },
      {
        "x": 470,
        "y": 340
      },
      {
        "x": 0,
        "y": 340
      }
    ],
    "open": [
      4,
      5,
      7
    ]
  }
];

export const HOME_ITEMS: InventoryItem[] = [
  {
    "id": "door-front",
    "name": "현관문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 1025,
      "y": 625,
      "w": 95,
      "d": 16,
      "h": 210,
      "rot": 90
    }
  },
  {
    "id": "door-master",
    "name": "안방 문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 470,
      "y": 750,
      "w": 85,
      "d": 16,
      "h": 210,
      "rot": 90
    }
  },
  {
    "id": "door-master-bath",
    "name": "안방화장실 문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 470,
      "y": 935,
      "w": 75,
      "d": 16,
      "h": 210,
      "rot": 90
    }
  },
  {
    "id": "door-bomi",
    "name": "보미방 문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 470,
      "y": 285,
      "w": 85,
      "d": 16,
      "h": 210,
      "rot": 90
    }
  },
  {
    "id": "door-bath",
    "name": "공용화장실 문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 510,
      "y": 220,
      "w": 75,
      "d": 16,
      "h": 210,
      "rot": 0
    }
  },
  {
    "id": "door-dress",
    "name": "드레스룸 문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 720,
      "y": 565,
      "w": 85,
      "d": 16,
      "h": 210,
      "rot": 0
    }
  },
  {
    "id": "door-james",
    "name": "제임스방 문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 675,
      "y": 275,
      "w": 85,
      "d": 16,
      "h": 210,
      "rot": 90
    }
  },
  {
    "id": "door-utility",
    "name": "다용도실 문",
    "emoji": "🚪",
    "category": "misc",
    "quantity": 1,
    "color": "#d9b48c",
    "placement": {
      "x": 1025,
      "y": 955,
      "w": 80,
      "d": 16,
      "h": 210,
      "rot": 90
    }
  },
  {
    "id": "win-master",
    "name": "안방 창",
    "emoji": "🪟",
    "category": "misc",
    "quantity": 1,
    "color": "#bfe3ff",
    "placement": {
      "x": 0,
      "y": 885,
      "w": 300,
      "d": 16,
      "h": 180,
      "rot": 90,
      "z": 30
    }
  },
  {
    "id": "win-living",
    "name": "거실 창",
    "emoji": "🪟",
    "category": "misc",
    "quantity": 1,
    "color": "#bfe3ff",
    "placement": {
      "x": 0,
      "y": 520,
      "w": 330,
      "d": 16,
      "h": 230,
      "rot": 90
    }
  },
  {
    "id": "win-bomi",
    "name": "보미방 창",
    "emoji": "🪟",
    "category": "misc",
    "quantity": 1,
    "color": "#bfe3ff",
    "placement": {
      "x": 0,
      "y": 175,
      "w": 300,
      "d": 16,
      "h": 180,
      "rot": 90,
      "z": 30
    }
  },
  {
    "id": "win-dress",
    "name": "드레스룸 창",
    "emoji": "🪟",
    "category": "misc",
    "quantity": 1,
    "color": "#bfe3ff",
    "placement": {
      "x": 1025,
      "y": 450,
      "w": 170,
      "d": 16,
      "h": 130,
      "rot": 90,
      "z": 80
    }
  },
  {
    "id": "win-james",
    "name": "제임스방 창",
    "emoji": "🪟",
    "category": "misc",
    "quantity": 1,
    "color": "#bfe3ff",
    "placement": {
      "x": 1025,
      "y": 165,
      "w": 200,
      "d": 16,
      "h": 130,
      "rot": 90,
      "z": 80
    }
  },
  {
    "id": "win-kitchen",
    "name": "주방 창",
    "emoji": "🪟",
    "category": "misc",
    "quantity": 1,
    "color": "#bfe3ff",
    "placement": {
      "x": 845,
      "y": 1070,
      "w": 150,
      "d": 16,
      "h": 100,
      "rot": 0,
      "z": 100
    }
  },
  {
    "id": "win-utility",
    "name": "다용도실 창",
    "emoji": "🪟",
    "category": "misc",
    "quantity": 1,
    "color": "#bfe3ff",
    "placement": {
      "x": 1200,
      "y": 880,
      "w": 250,
      "d": 16,
      "h": 120,
      "rot": 90,
      "z": 90
    }
  },
  {
    "id": "bomi-table",
    "name": "식탁",
    "emoji": "🍽️",
    "category": "furniture",
    "quantity": 1,
    "color": "#e8d2b0",
    "placement": {
      "x": 350,
      "y": 130,
      "w": 140,
      "d": 80,
      "h": 75,
      "rot": 0
    }
  },
  {
    "id": "bomi-desk",
    "name": "책상",
    "emoji": "✏️",
    "category": "furniture",
    "quantity": 1,
    "color": "#e8d2b0",
    "placement": {
      "x": 205,
      "y": 275,
      "w": 120,
      "d": 60,
      "h": 73,
      "rot": 90
    }
  },
  {
    "id": "bomi-chair",
    "name": "의자",
    "emoji": "🪑",
    "category": "furniture",
    "quantity": 1,
    "color": "#e4e4ea",
    "placement": {
      "x": 140,
      "y": 295,
      "w": 50,
      "d": 50,
      "h": 80,
      "rot": 90
    }
  },
  {
    "id": "bomi-vacuum",
    "name": "무선청소기",
    "emoji": "🧹",
    "category": "appliance",
    "quantity": 1,
    "color": "#e4e4ea",
    "placement": {
      "x": 450,
      "y": 230,
      "w": 30,
      "d": 30,
      "h": 110,
      "rot": 0
    }
  },
  {
    "id": "james-desk",
    "name": "책상",
    "emoji": "✏️",
    "category": "furniture",
    "quantity": 1,
    "color": "#efe3d3",
    "placement": {
      "x": 890,
      "y": 270,
      "w": 160,
      "d": 70,
      "h": 73,
      "rot": 180
    }
  },
  {
    "id": "james-chair",
    "name": "의자",
    "emoji": "🪑",
    "category": "furniture",
    "quantity": 1,
    "color": "#e4e4ea",
    "placement": {
      "x": 890,
      "y": 185,
      "w": 50,
      "d": 50,
      "h": 80,
      "rot": 180
    }
  },
  {
    "id": "james-purifier",
    "name": "가습기",
    "emoji": "💧",
    "category": "appliance",
    "quantity": 1,
    "color": "#f7f9fb",
    "placement": {
      "x": 685,
      "y": 245,
      "w": 30,
      "d": 30,
      "h": 40,
      "rot": 0
    }
  },
  {
    "id": "dress-styler",
    "name": "스타일러",
    "emoji": "👔",
    "category": "appliance",
    "quantity": 1,
    "color": "#4a4a55",
    "placement": {
      "x": 975,
      "y": 530,
      "w": 45,
      "d": 60,
      "h": 185,
      "rot": 180
    }
  },
  {
    "id": "dress-robot",
    "name": "로봇청소기",
    "emoji": "🤖",
    "category": "appliance",
    "quantity": 1,
    "color": "#d9dce3",
    "placement": {
      "x": 820,
      "y": 460,
      "w": 35,
      "d": 35,
      "h": 10,
      "rot": 0
    }
  },
  {
    "id": "living-tv",
    "name": "TV",
    "emoji": "📺",
    "category": "electronics",
    "quantity": 1,
    "color": "#2d2d33",
    "placement": {
      "x": 215,
      "y": 390,
      "w": 140,
      "d": 8,
      "h": 80,
      "rot": 0,
      "z": 95
    }
  },
  {
    "id": "living-sofa",
    "name": "소파",
    "emoji": "🛋️",
    "category": "furniture",
    "quantity": 1,
    "color": "#ece5da",
    "placement": {
      "x": 185,
      "y": 640,
      "w": 265,
      "d": 90,
      "h": 80,
      "rot": 180
    }
  },
  {
    "id": "living-couch",
    "name": "소파 카우치",
    "emoji": "🛋️",
    "category": "furniture",
    "quantity": 1,
    "color": "#ece5da",
    "placement": {
      "x": 310,
      "y": 605,
      "w": 75,
      "d": 150,
      "h": 80,
      "rot": 0
    }
  },
  {
    "id": "living-ac",
    "name": "스탠드 에어컨",
    "emoji": "❄️",
    "category": "appliance",
    "quantity": 1,
    "color": "#f7f9fb",
    "placement": {
      "x": 20,
      "y": 375,
      "w": 40,
      "d": 40,
      "h": 180,
      "rot": 0
    }
  },
  {
    "id": "living-purifier",
    "name": "공기청정기",
    "emoji": "🌬️",
    "category": "appliance",
    "quantity": 1,
    "color": "#f7f9fb",
    "placement": {
      "x": 460,
      "y": 645,
      "w": 40,
      "d": 40,
      "h": 70,
      "rot": 0
    }
  },
  {
    "id": "master-bed",
    "name": "침대",
    "emoji": "🛏️",
    "category": "furniture",
    "quantity": 1,
    "color": "#f1ece4",
    "placement": {
      "x": 185,
      "y": 890,
      "w": 160,
      "d": 200,
      "h": 45,
      "rot": 180
    }
  },
  {
    "id": "master-ac",
    "name": "벽걸이 에어컨",
    "emoji": "❄️",
    "category": "appliance",
    "quantity": 1,
    "color": "#f7f9fb",
    "placement": {
      "x": 65,
      "y": 725,
      "w": 90,
      "d": 25,
      "h": 30,
      "rot": 0,
      "z": 200
    }
  },
  {
    "id": "master-vanity",
    "name": "화장대",
    "emoji": "💄",
    "category": "furniture",
    "quantity": 1,
    "color": "#efe3d3",
    "placement": {
      "x": 440,
      "y": 975,
      "w": 80,
      "d": 40,
      "h": 75,
      "rot": 270
    }
  },
  {
    "id": "kitchen-fridge",
    "name": "양문형 냉장고",
    "emoji": "🧊",
    "category": "appliance",
    "quantity": 1,
    "color": "#2d2d33",
    "placement": {
      "x": 710,
      "y": 810,
      "w": 91,
      "d": 92,
      "h": 180,
      "rot": 270
    }
  },
  {
    "id": "kitchen-table",
    "name": "식탁",
    "emoji": "🍽️",
    "category": "furniture",
    "quantity": 1,
    "color": "#efe3d3",
    "placement": {
      "x": 910,
      "y": 795,
      "w": 130,
      "d": 80,
      "h": 75,
      "rot": 0
    }
  },
  {
    "id": "kitchen-counter",
    "name": "싱크대·조리대",
    "emoji": "🚰",
    "category": "furniture",
    "quantity": 1,
    "color": "#f1ece4",
    "placement": {
      "x": 855,
      "y": 1035,
      "w": 330,
      "d": 60,
      "h": 85,
      "rot": 180
    }
  },
  {
    "id": "kitchen-water",
    "name": "정수기",
    "emoji": "💧",
    "category": "appliance",
    "quantity": 1,
    "color": "#f7f9fb",
    "placement": {
      "x": 700,
      "y": 890,
      "w": 30,
      "d": 50,
      "h": 50,
      "rot": 270
    }
  },
  {
    "id": "kitchen-oven",
    "name": "광파오븐",
    "emoji": "🍱",
    "category": "appliance",
    "quantity": 1,
    "color": "#e4e4ea",
    "placement": {
      "x": 960,
      "y": 720,
      "w": 50,
      "d": 40,
      "h": 30,
      "rot": 180,
      "z": 150
    }
  },
  {
    "id": "utility-washer",
    "name": "세탁기·건조기",
    "emoji": "🌀",
    "category": "appliance",
    "quantity": 1,
    "color": "#f1f3f6",
    "placement": {
      "x": 1070,
      "y": 735,
      "w": 70,
      "d": 75,
      "h": 190,
      "rot": 0
    }
  },
  {
    "id": "entry-shoes",
    "name": "신발장",
    "emoji": "👟",
    "category": "furniture",
    "quantity": 1,
    "color": "#efe3d3",
    "placement": {
      "x": 1000,
      "y": 615,
      "w": 120,
      "d": 40,
      "h": 200,
      "rot": 270
    }
  }
];
