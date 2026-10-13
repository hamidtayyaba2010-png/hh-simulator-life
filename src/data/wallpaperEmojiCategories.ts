export interface WallpaperImageCategory {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  emojis: string[];
  keywords: string[];
}

export const parseEmojiGraphemes = (raw: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' });
    const list: string[] = [];
    for (const seg of segmenter.segment(raw)) {
      const g = seg.segment.trim();
      if (g) {
        list.push(g);
      }
    }
    return list;
  }
  // Fallback for environments without Intl.Segmenter
  return Array.from(raw).map((s) => s.trim()).filter(Boolean);
};

export const RAW_EMOJI_DATA: {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  raw: string;
}[] = [
  {
    id: 'emotions',
    name: 'Emotions',
    icon: '😀',
    keywords: [
      'emotions', 'faces', 'face', 'smile', 'smiling', 'happy', 'sad', 'cry', 'crying',
      'laugh', 'laughing', 'joy', 'love', 'cool', 'sunglasses', 'neutral', 'angry',
      'devil', 'ghost', 'skull', 'clown', 'robot', 'alien', 'sick', 'sleepy', 'wink',
      'kiss', 'thinking', 'nervous', 'scared', 'surprised', 'confused'
    ],
    raw: '😀😃😄😁😆😅😂🤣😭😉😗😙😚😘🥰😍🤩🥳🙃🙂🥲😊☺️😌😏🤤😋😛😝😜🤪😔🥺😬😑😐😶😶‍🌫️🤐🤔🤫🤭🥱🤗😱🤨🧐😒🙄😮‍💨😤😠😡🤬😞😓😟😥😢☹️🙁😕😰😨😧😦😮😯😲😳🤯😖😣😩😫😵😵‍💫🥴🥵🥶🤢🤮😴😪🤧🤒🤕😷🤥😇🤠🤑🤓😎🥸🤡💩😈👿👻💀☠️🤖👹👺☃️⛄👽👾',
  },
  {
    id: 'characters',
    name: 'Characters',
    icon: '🧑‍🤝‍🧑',
    keywords: [
      'characters', 'people', 'person', 'human', 'humans', 'man', 'woman', 'girl',
      'boy', 'baby', 'family', 'couple', 'dancer', 'dance', 'doctor', 'cop', 'police',
      'worker', 'ninja', 'queen', 'king', 'prince', 'princess', 'hero', 'superhero',
      'teacher', 'student', 'artist', 'chef', 'pilot', 'astronaut', 'firefighter'
    ],
    raw: '🙇🙋💁🙆🙅🤷🤦🙍🙎🧏💆💇🧖🛀🛌🧘🧍🤸🧎🧑🦼🧑🦽🧑🦯🚶🏃⛹️🤾🚴🚵🧗🏋️🤼🤼‍♂️🤼‍♀️🤹🏌️🏇🤺⛷️🏂🪂🏄🚣🏊🤽🧜🧚🧞🧝🧙🧛🧟🦸🦹🧑🎄🥷💂👸🤵👰🧑🚀👷👮🕵️🧑✈️🧑🔬🧑⚕️🧑🔧🧑🏭🧑🚒🧑🌾🧑🏫🧑🎓🧑💼🧑⚖️🧑💻🧑🎤🧑🎨🧑🍳👳🧕👲👼👶🧒🧑🧓🧑🦳🧑🦰👱🧑🦱🧑🦲🧔🕴️💃🕺👯👯‍♂️👯‍♀️🧑🤝🧑👭👬👫💏👩❤️💋👨👨❤️💋👨👩❤️💋👩💑👩❤️👨👨❤️👨👩❤️👩🤰🤱🧑🍼🫂👥👤🗣️🎎',
  },
  {
    id: 'body_parts',
    name: 'Body Parts',
    icon: '🧠',
    keywords: [
      'body parts', 'body', 'hand', 'hands', 'eye', 'eyes', 'mouth', 'lips', 'brain',
      'heart', 'lungs', 'blood', 'teeth', 'tooth', 'tongue', 'nose', 'ear', 'ears',
      'foot', 'feet', 'leg', 'legs', 'finger', 'fingers', 'nails', 'microbe', 'cell'
    ],
    raw: '💋🧠🫀🫁🩸🦠🦷👀👁️👄👅👃👂🦻🦶🦵🤚✋🙌💅♥️',
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    keywords: [
      'animals', 'pets', 'animal', 'pet', 'dog', 'puppy', 'cat', 'kitten', 'lion',
      'tiger', 'bear', 'polar bear', 'panda', 'koala', 'fox', 'wolf', 'rabbit',
      'bunny', 'horse', 'unicorn', 'cow', 'pig', 'monkey', 'gorilla', 'elephant',
      'mammoth', 'rhino', 'hippo', 'giraffe', 'leopard', 'zebra', 'camel', 'kangaroo',
      'sloth', 'llama', 'deer', 'goat', 'sheep', 'dinosaur', 'snake', 'frog', 'lizard'
    ],
    raw: '🦁🐯🐵🐱🐶🐺🐻🐻❄️🐨🐼🐹🐭🐰🦊🐮🐷🐗🦄🐴🐲🦎🐉🦖🦕🐍🐸🐇🐁🐀🐈🐈⬛🐩🐕🦮🐕‍🦺🐖🐎🐄🐂🐃🦬🐏🐑🐐🦌🦙🦥🦘🦓🐘🦣🦏🦛🦒🐆🐅🐒🦍🦧🐪🐫🐿️🦫🦝🦨🦡🦔',
  },
  {
    id: 'birds',
    name: 'Birds',
    icon: '🦅',
    keywords: [
      'birds', 'bird', 'eagle', 'owl', 'parrot', 'dove', 'pigeon', 'duck', 'swan',
      'flamingo', 'peacock', 'turkey', 'penguin', 'chicken', 'rooster', 'chick', 'bat',
      'dodo', 'feather', 'fly', 'flying', 'wings'
    ],
    raw: '🦇🐦🐓🐔🐣🐤🐥🦅🦉🦜🕊️🦤🦢🦆🦩🦚🦃🐧',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    keywords: [
      'sports', 'games', 'sport', 'game', 'ball', 'soccer', 'football', 'basketball',
      'baseball', 'tennis', 'volleyball', 'rugby', 'cricket', 'hockey', 'ice hockey',
      'bowling', 'boxing', 'martial arts', 'ski', 'snowboard', 'skate', 'golf',
      'archery', 'darts', 'controller', 'video game', 'joystick', 'dice', 'cards',
      'trophy', 'ping pong', 'table tennis', 'badminton'
    ],
    raw: '⚽⚾🥎🏀🏐🏈🏉🥅🎾🏸🥍🏏🏑🏒🎿🛷⛸️🛼🩰🛹⛳🎯🏹🥏🪃🪁🎣🤿🥊🥋🏓🎱🎳🎮🕹️🎲🔫👾🃏🀄🎴🎰',
  },
  {
    id: 'clothes',
    name: 'Clothes',
    icon: '👕',
    keywords: [
      'clothes', 'clothing', 'fashion', 'outfit', 'shirt', 't-shirt', 'pants', 'jeans',
      'dress', 'skirt', 'jacket', 'coat', 'shoes', 'boots', 'sneakers', 'heels', 'hat',
      'cap', 'crown', 'glasses', 'sunglasses', 'watch', 'bag', 'purse', 'ring',
      'swimsuit', 'bikini', 'socks', 'gloves', 'scarf', 'tie', 'kimono', 'sari'
    ],
    raw: '🩱🎽🥋🥊🧦🧤🧣👖👕🎽👚👔👗👘🥻🩱👙🩳🩲🧥🥼🦺⛑️🪖🎓🎩👒🧢👑🥾👢👠🩴👟👞🥿👡🕶️👓💄💍🎒👝👛👜💼🧳☂️🌂🪢🛍️',
  },
  {
    id: 'sky',
    name: 'Sky',
    icon: '☀️',
    keywords: [
      'sky', 'natural', 'nature', 'sun', 'sunny', 'moon', 'moonlight', 'stars',
      'star', 'weather', 'clouds', 'cloud', 'cloudy', 'rain', 'rainbow', 'snow',
      'snowflake', 'lightning', 'thunder', 'storm', 'earth', 'world', 'globe',
      'planet', 'galaxy', 'space', 'universe', 'comet', 'meteor', 'day', 'night'
    ],
    raw: '🌚🌝🌞🌛🌜💫⭐🌟✨⚡☁️🌨️❄️💧🌈🌧️🌩️⛈️🌦️🌥️⛅☀️🌤️🪐🌍🌎🌏🌫️🌠🌌☄️🌑🌒🌓🌔🌕🌖🌗🌘',
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍓',
    keywords: [
      'food', 'drinks', 'drink', 'beverage', 'eat', 'fruit', 'fruits', 'vegetable',
      'apple', 'strawberry', 'banana', 'watermelon', 'orange', 'mango', 'pineapple',
      'peach', 'cherry', 'grape', 'lemon', 'lime', 'avocado', 'tomato', 'potato',
      'carrot', 'corn', 'pizza', 'burger', 'hamburger', 'hotdog', 'fries', 'sandwich',
      'taco', 'bread', 'cake', 'cupcake', 'ice cream', 'donut', 'cookie', 'chocolate',
      'candy', 'coffee', 'tea', 'beer', 'wine', 'cocktail', 'sushi', 'rice', 'noodles',
      'pasta', 'soup', 'meat', 'chicken', 'egg', 'cheese'
    ],
    raw: '🍓🍒🍎🍅🌶️🍉🍑🍊🥕🥭🍍🍌🌽🍋🥑🍈🍋🟩🫒🥝🍏🫑🥬🍐🥦🫐🥒🍇🍆🍠🥥🥜🌰🧄🧅🍄🟫🥔🍞🫓🥐🥖🥯🧇🥞🍳🌭🍔🍖🍗🥩🥓🧀🥚🥪🥨🍟🍕🫔🌮🌯🥙🍲🥗🫕🥣🥫🍝🥘🧆🍛🍜🦪🦞🍣🍤🥡🍚🥮🍱🥟🍧🍢🍨🍙🍦🍘🥧🍥🍰🍡🍮🥠🎂🧂🍯🍪🍩🍫🍬🍭🧁🧈🍿🧊🥤🧋🧃🥛🍼🥂🍻🍺🧉🫖☕🍵🍾🍷🥃🍸🍹🍶🥢🍴🥄🔪🍽️',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    keywords: [
      'transport', 'transportation', 'vehicle', 'vehicles', 'car', 'cars', 'automobile',
      'truck', 'bus', 'van', 'taxi', 'police car', 'ambulance', 'fire truck',
      'motorcycle', 'bike', 'bicycle', 'scooter', 'train', 'bullet train', 'metro',
      'subway', 'airplane', 'plane', 'flight', 'helicopter', 'rocket', 'spaceship',
      'boat', 'ship', 'yacht', 'ferry', 'cruise'
    ],
    raw: '🛴🦽🦼🚲🛵🏍️🚙🚗🛻🚐🚚🚛🚜🏎️🚒🚑🚓🚕🛺🚌🚈🚝🚅🚄🚂🚃🚋🚎🚞🚊🚉🚍🚔🚘🚖🚆🚢🛳️🛥️🚤⛴️⛵🛶🚟🚠🚡🚁🛸🚀✈️🛫🛬🛩️',
  },
  {
    id: 'places',
    name: 'Places',
    icon: '🏰',
    keywords: [
      'places', 'buildings', 'travel', 'location', 'house', 'home', 'building',
      'skyscraper', 'city', 'hospital', 'school', 'bank', 'hotel', 'castle', 'palace',
      'church', 'mosque', 'temple', 'shrine', 'mountain', 'mountains', 'volcano',
      'beach', 'island', 'desert', 'park', 'ferris wheel', 'roller coaster', 'circus',
      'eiffel tower', 'statue of liberty', 'fountain', 'stadium', 'map'
    ],
    raw: '⛰️🏔️🌋🏜️🏞️🌅🌄🏝️🏖️🎢🎡🎠🎪🗼🗽🗿🗻🏛️💈⛲⛩️🕍🕌🕋🛕⛪💒🏩🏯🏰🏗️🏢🏭🏬🏪🏟️🏦🏫🏨🏣🏤🏥🏚️🏠🏡🏘️🛖⛺🏕️⛱️🏙️🌆🌇🌃🌉🌁🛤️🛣️🗾🗺️🌐💺🧳',
  },
  {
    id: 'celebration',
    name: 'Celebration',
    icon: '🎉',
    keywords: [
      'celebration', 'party', 'birthday', 'festival', 'holiday', 'event', 'gift',
      'present', 'balloon', 'balloons', 'confetti', 'fireworks', 'firework', 'firecracker',
      'cake', 'ribbon', 'medal', 'trophy', 'award', 'first place', 'halloween',
      'christmas tree', 'lantern', 'sparkler'
    ],
    raw: '💥🎉🎊🎈🎂🎀🎁🎇🎆🧨🧧🪔🪅🎐🎏🎎🎑🎍🎋🎄🎃🎗️🥇🥈🥉🏅🎖️🏆',
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: '🏁',
    keywords: [
      'flags', 'flag', 'country', 'countries', 'nation', 'nations', 'world', 'pakistan',
      'pk', 'usa', 'united states', 'america', 'uk', 'united kingdom', 'britain',
      'india', 'canada', 'australia', 'japan', 'france', 'germany', 'turkey', 'saudi',
      'arabia', 'brazil', 'argentina', 'china', 'russia', 'italy', 'spain', 'mexico',
      'korea', 'south korea', 'uae', 'rainbow flag', 'pride', 'pirate flag'
    ],
    raw: '🏁🚩🎌🏴🏳️🏳️🌈🏳️⚧️🏴☠️🇦🇨🇦🇩🇦🇪🇦🇫🇦🇬🇦🇮🇦🇱🇦🇲🇦🇴🇦🇶🇦🇷🇦🇸🇦🇹🇦🇺🇦🇼🇦🇽🇦🇿🇧🇦🇧🇧🇧🇩🇧🇪🇧🇫🇧🇬🇧🇭🇧🇮🇧🇯🇧🇱🇧🇲🇧🇳🇧🇴🇧🇶🇧🇷🇧🇸🇧🇹🇧🇻🇧🇼🇧🇾🇧🇿🇨🇦🇨🇨🇨🇩🇨🇫🇨🇬🇨🇭🇨🇮🇨🇰🇨🇱🇨🇲🇨🇳🇨🇴🇨🇵🇨🇶🇨🇷🇨🇺🇨🇻🇨🇼🇨🇽🇨🇾🇨🇿🇩🇪🇩🇬🇩🇯🇩🇰🇩🇲🇩🇴🇩🇿🇪🇦🇪🇨🇪🇪🇪🇬🇪🇭🇪🇷🇪🇸🇪🇹🇪🇺🇫🇮🇫🇯🇫🇰🇫🇲🇫🇴🇬🇭🇬🇬🇬🇫🇬🇪🇬🇩🇬🇧🇬🇦🇫🇷🇬🇮🇬🇱🇬🇲🇬🇳🇬🇵🇬🇶🇬🇷🇬🇸🇬🇹🇬🇺🇬🇼🇬🇾🇭🇰🇭🇲🇭🇳🇭🇷🇭🇹🇭🇺🇮🇨🇮🇩🇮🇪🇮🇱🇮🇲🇮🇳🇮🇴🇮🇶🇮🇷🇮🇸🇮🇹🇯🇪🇯🇲🇯🇴🇰🇵🇰🇳🇰🇲🇰🇮🇰🇭🇰🇬🇰🇪🇯🇵🇰🇷🇰🇼🇰🇾🇰🇿🇱🇦🇱🇧🇱🇨🇱🇮🇱🇰🇱🇷🇱🇸🇱🇹🇱🇺🇱🇻🇱🇾🇲🇦🇲🇨🇲🇩🇲🇪🇲🇫🇲🇬🇲🇭🇲🇰🇲🇱🇲🇲🇲🇳🇲🇴🇲🇵🇲🇶🇲🇷🇲🇹🇲🇸🇳🇨🇳🇦🇲🇿🇲🇾🇲🇽🇲🇼🇲🇻🇲🇺🇳🇪🇳🇫🇳🇬🇳🇮🇳🇱🇳🇴🇳🇵🇳🇷🇵🇭🇵🇬🇵🇫🇵🇪🇵🇦🇴🇲🇳🇿🇳🇺🇵🇰🇵🇱🇵🇲🇵🇳🇵🇷🇵🇸🇵🇹🇵🇼🇵🇾🇶🇦🇷🇪🇷🇴🇷🇸🇷🇺🇷🇼🇸🇦🇸🇧🇸🇨🇸🇩🇸🇪🇸🇬🇸🇭🇸🇮🇸🇯🇸🇹🇸🇸🇸🇷🇸🇴🇸🇳🇸🇲🇸🇱🇸🇰🇸🇻🇸🇽🇸🇾🇸🇿🇹🇦🇹🇨🇹🇩🇹🇫🇹🇬🇹🇭🇹🇯🇹🇰🇹🇱🇹🇲🇹🇳🇹🇴🇺🇲🇺🇬🇺🇦🇹🇿🇹🇼🇹🇻🇹🇹🇹🇷🇺🇳🇺🇸🇺🇾🇺🇿🇻🇦🇻🇨🇻🇪🇻🇬🇾🇹🇾🇪🇽🇰🇼🇸🇼🇫🇻🇺🇻🇳🇻🇮🇿🇦🇿🇲🇿🇼🏴🏴🏴',
  },
  {
    id: 'weapons',
    name: 'Weapons',
    icon: '⚔️',
    keywords: [
      'weapons', 'weapon', 'tools', 'sword', 'swords', 'knife', 'dagger', 'axe',
      'bow', 'arrow', 'shield', 'hammer', 'pickaxe', 'wrench', 'saw', 'fight', 'battle'
    ],
    raw: '🔪🔧🔨🪓🪚🔨⛏️⚒️🗡️⚔️🏹🛡️',
  },
  {
    id: 'devices',
    name: 'Devices',
    icon: '📱',
    keywords: [
      'devices', 'technology', 'tech', 'electronics', 'gadgets', 'phone', 'mobile',
      'smartphone', 'computer', 'laptop', 'tablet', 'tv', 'television', 'camera',
      'video', 'radio', 'clock', 'alarm', 'watch', 'timer', 'stopwatch', 'keyboard',
      'mouse', 'printer', 'headphones', 'mic', 'microphone', 'speaker', 'flashlight',
      'bulb', 'light'
    ],
    raw: '🧭🎮📷📸🎥🎤📺📹📽️📱☎️📞📟📠🔌🖲️💽💾🖥️💻⌨️🖨️🖱️🔦💡🔉🔊📢📣⌚⏲️⏱️⏰🕰️🕘💿📀📺📻🎹🎤🎧',
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '⭐',
    keywords: [
      'symbols', 'symbol', 'signs', 'sign', 'arrows', 'arrow', 'shapes', 'math',
      'numbers', 'number', 'zodiac', 'check', 'checkmark', 'cross', 'warning',
      'stop', 'radioactive', 'peace', 'yin yang', 'infinity', 'recycle', 'question',
      'exclamation', 'star', 'diamond', 'spade', 'club', 'heart sign'
    ],
    raw: '♦️♣️♠️♈♉♊♋♌♍♎♏♐♑♒♓⛎♀️♂️⚧️💭🗯️💬🗨️❕❔❗❓⁉️‼️⭕❌🚫🚳🚭🚯🚱🚷📵🔞🔕🔇🅰️🆎🅱️🅾️🆑🆘🛑⛔📛♨️🔻🔺🉐㊙️㊗️🈴🈵🈹🈲🉑🈶🈚🈸🈺🈷️✴️🔶🔸🔆🔅🆚🎦📶🔁🔂🔀▶️⏩⏭️⏯️◀️⏪⏮️🔼⏫🔽⏬⏸️⏹️⏺️⏏️📴🛜📳📲☢️☣️⚠️🚸⚜️🔱〽️🔰✳️❇️♻️💱💲💹🈯❎✅✔️☑️⬆️↗️➡️↘️⬇️↙️⬅️↖️↕️↔️↩️↪️⤴️⤵️🔃🔄🔙🔛🔝🔚🔜🆕🆓🆙🆗🆒🆖ℹ️🅿️🈁🈂️🈳🔣🔤🔠🔡🔢#️⃣*️⃣0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟🌐💠🔷🔹🏧Ⓜ️🚾🚻🚹🚺♿🚼🛗🚮🚰🛂🛃🛄🛅⚕️💟⚛️🛐🕉️☸️☮️☯️☪️✝️☦️✡️🔯🕎♾️🆔👁️🗨️🎼🎵🎶✖️➕➖➗➰➿〰️©️®️™️🔘🔳◼️◾▪️🔲◻️◽▫️',
  },
  {
    id: 'trees_plants',
    name: 'Trees & Plants',
    icon: '🌲',
    keywords: [
      'trees & plants', 'trees', 'plants', 'nature', 'flora', 'flowers', 'flower',
      'rose', 'tulip', 'sunflower', 'blossom', 'cherry blossom', 'tree', 'palm tree',
      'pine tree', 'evergreen', 'cactus', 'leaf', 'leaves', 'clover', 'four leaf clover',
      'herb', 'seedling', 'mushroom', 'wood'
    ],
    raw: '💐🌹🥀🌺🌷🌸💮🏵️🌻🌼🍂🍁🍄🌾🌿🌱🍃☘️🍀🪴🌵🌴🌳🌲🪵🎋🎄🎍',
  },
  {
    id: 'stationary',
    name: 'Stationary',
    icon: '📎',
    keywords: [
      'stationary', 'stationery', 'office', 'school', 'supplies', 'paper', 'book',
      'books', 'notebook', 'pencil', 'pen', 'fountain pen', 'marker', 'crayon',
      'scissors', 'ruler', 'clip', 'paperclip', 'folder', 'calendar', 'memo',
      'clipboard', 'pin', 'pushpin'
    ],
    raw: '🧾📎🖇️✂️📏📐🎨🖌️🖍️🖊️🖋️✒️✏️📝🗒️📄📃📑📋🗃️🗄️📒📔📕📓📗📘📙📚📖🔖📌📍',
  },
  {
    id: 'hand_signs',
    name: 'Hand signs',
    icon: '👍',
    keywords: [
      'hand signs', 'hands', 'hand', 'gestures', 'gesture', 'thumbs up', 'thumbs down',
      'peace', 'victory', 'fist', 'punch', 'wave', 'waving', 'clap', 'clapping',
      'praying', 'pray', 'point', 'pointing', 'finger', 'ok sign', 'rock on', 'call me',
      'pinching', 'open hands', 'handshake'
    ],
    raw: '💪👏👍👎🙌👐🤲🤜🤛✊👊👋🤚🖐️✋🖖🤟🤘✌️🤞🤙🤌🤏👌👉👈☝️👆👇🖕✍️🤳🙏💅🤝',
  },
  {
    id: 'instruments',
    name: 'Instruments',
    icon: '🧰',
    keywords: [
      'instruments', 'tools', 'equipment', 'hardware', 'science', 'toolbox',
      'microscope', 'telescope', 'magnet', 'scale', 'balance', 'flashlight',
      'lightbulb', 'gear', 'wrench', 'screwdriver', 'pliers', 'chain', 'satellite',
      'extinguisher', 'cart', 'ladder', 'bucket'
    ],
    raw: '🔌🗜️🧰🧲🔩🪛🪝🪣🪜🪚🔧🔨🛠️⚒️⛏️⚙️🔗⛓️📎🖇️✂️🩺🧬🔭🔬📡🛰️🧯⚖️🛒🕯️💡🔦🧷🦯',
  },
  {
    id: 'insects',
    name: 'Insects',
    icon: '🦋',
    keywords: [
      'insects', 'bugs', 'bug', 'insect', 'butterfly', 'bee', 'honeybee', 'spider',
      'ant', 'ladybug', 'beetle', 'caterpillar', 'snail', 'worm', 'mosquito',
      'cockroach', 'cricket', 'fly', 'shrimp', 'lobster', 'crab', 'scorpion'
    ],
    raw: '🦐🦞🦀🦂🕷️🕸️🐚🐜🦗🪲🦟🪳🪰🐌🐝🐞🦋🐛🪱🦠',
  },
  {
    id: 'sea_animals',
    name: 'Sea animals',
    icon: '🐬',
    keywords: [
      'sea animals', 'marine', 'ocean', 'water', 'aquatic', 'fish', 'shark',
      'dolphin', 'whale', 'octopus', 'squid', 'crab', 'lobster', 'shrimp', 'turtle',
      'sea turtle', 'seal', 'blowfish', 'crocodile', 'alligator', 'swan', 'duck', 'penguin'
    ],
    raw: '🦢🦆🐧🦭🦈🐬🐋🐳🐟🐠🐡🦑🐙🦪🦀🦞🦐🦂🐊🐢',
  },
  {
    id: 'hearts',
    name: 'Hearts',
    icon: '❤️',
    keywords: [
      'hearts', 'heart', 'love', 'romance', 'valentine', 'valentines', 'red heart',
      'pink heart', 'orange heart', 'yellow heart', 'green heart', 'blue heart',
      'purple heart', 'black heart', 'white heart', 'broken heart', 'sparkling heart',
      'growing heart', 'beating heart', 'kiss', 'couple'
    ],
    raw: '❤️🧡💛💚💙💜🤎🖤🤍💘💝💖💗💓💞💕💌💟♥️❣️❤️🩹💔❤️🔥💋🫀💏👩❤️💋👨👨❤️💋👨👩❤️💋👩💑👩❤️👨👨❤️👨👩❤️👩🥰😍',
  },
  {
    id: 'non_human_faces',
    name: 'Non-Human Faces',
    icon: '👻',
    keywords: [
      'non-human faces', 'creatures', 'monsters', 'monster', 'ghost', 'skull',
      'skeleton', 'alien', 'extraterrestrial', 'robot', 'demon', 'devil', 'ogre',
      'goblin', 'pumpkin', 'jack-o-lantern', 'cat faces', 'snowman', 'mask', 'theatre'
    ],
    raw: '😈👿👻💀☠️🤖👹💩👺☃️⛄👽👾🌚🌝🌞🌛🌜😺😸😹😻😼😽🙀😿😾🙈🙉🙊🎃🎭',
  },
  {
    id: 'money',
    name: 'Money',
    icon: '💰',
    keywords: [
      'money', 'cash', 'currency', 'dollar', 'euro', 'pound', 'yen', 'coins',
      'coin', 'wealth', 'rich', 'wealthy', 'bank', 'credit card', 'atm', 'diamond',
      'gem', 'gold', 'wallet', 'purse', 'chart', 'profit', 'crown'
    ],
    raw: '💱💵💶💴🪙💷💲💸💰🤑💳💹🏦🈹👛💎💹💳🏧🏦💍👑',
  },
  {
    id: 'files',
    name: 'Files',
    icon: '📁',
    keywords: [
      'files', 'documents', 'document', 'folder', 'folders', 'mail', 'email',
      'letter', 'envelope', 'message', 'inbox', 'outbox', 'box', 'package',
      'parcel', 'calendar', 'newspaper', 'chart', 'graph', 'ballot', 'scroll'
    ],
    raw: '📂📁🗂️📊📈📉📇📰🗞️🏷️📤📥📩📨✉️💌📧📫📪📬📭📦📮🗳️📅📆🗓️🪧📜',
  },
  {
    id: 'medical_science',
    name: 'Medical & Science',
    icon: '🔬',
    keywords: [
      'medical & science', 'medical', 'science', 'health', 'healthcare', 'medicine',
      'doctor', 'nurse', 'hospital', 'ambulance', 'pill', 'pills', 'capsule',
      'syringe', 'injection', 'dna', 'thermometer', 'bandage', 'mask', 'first aid',
      'stethoscope', 'microscope', 'telescope', 'test tube'
    ],
    raw: '❤️🩹⚖️🩹🦿🩸🚑🥼🧑🔬🦾🤒🧪🤕🫀⛑️😷💊💉🏥🧑⚕️🩺⚕️🥽⚗️🔭🌡️🧬🔭🔬📡🛰️',
  },
  {
    id: 'home_items',
    name: 'Home items',
    icon: '🛋️',
    keywords: [
      'home items', 'home', 'house', 'furniture', 'household', 'bed', 'chair',
      'couch', 'sofa', 'door', 'window', 'mirror', 'toilet', 'bath', 'bathtub',
      'shower', 'tv', 'brick', 'luggage', 'suitcase'
    ],
    raw: '📺🧱🪟🪞🚪🪑🛏️🛋️🚿🛁🚽🧳',
  },
  {
    id: 'musical',
    name: 'Musical',
    icon: '🎸',
    keywords: [
      'musical', 'music', 'instruments', 'instrument', 'guitar', 'piano',
      'keyboard', 'violin', 'drum', 'drums', 'trumpet', 'saxophone', 'accordion',
      'banjo', 'microphone', 'headphones', 'cassette', 'radio', 'sound', 'song'
    ],
    raw: '🎹🎷🎺🎸🪕🎻🪘🥁🪗🎤🎧🎛️🎙️📼📻',
  },
  {
    id: 'washroom_bath',
    name: 'Washroom & Bath',
    icon: '🚿',
    keywords: [
      'washroom & bath', 'washroom', 'bath', 'bathroom', 'restroom', 'toilet',
      'shower', 'bathtub', 'soap', 'sponge', 'lotion', 'towel', 'toothbrush',
      'toothpaste', 'razor', 'shave', 'mirror', 'clean', 'hygiene', 'bathrobes'
    ],
    raw: '🪞🚿🛁🚽🧻🪠🧹🧴🧽🧼🪥🪒🚮🗑️💩🚺🚹🚻🧖🛀🩲🪥🩱♨️🩳👙🪣',
  },
  {
    id: 'voice',
    name: 'Voice',
    icon: '📢',
    keywords: [
      'voice', 'audio', 'sound', 'speaker', 'megaphone', 'bell', 'alarm',
      'loudspeaker', 'announcement', 'noise', 'ring', 'doorbell', 'volume'
    ],
    raw: '🛎️🔔🔈🔉🔊📢📣',
  },
  {
    id: 'religious',
    name: 'Religious',
    icon: '⛩️',
    keywords: [
      'religious', 'religion', 'faith', 'spiritual', 'prayer', 'pray', 'church',
      'mosque', 'temple', 'shrine', 'synagogue', 'cross', 'crescent', 'kaaba',
      'beads', 'om', 'menorah', 'hands praying', 'torah', 'holy'
    ],
    raw: '📿🏺⚱️⚰️🪦☦️☪️☯️☸️✡️✝️🔯🕉️🕎🛐👳👳♀️👳♂️📿⛩️🛕⛪🕋🕌🕍🙌🙏🤲',
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🛡️',
    keywords: [
      'security', 'safe', 'safety', 'protection', 'lock', 'padlock', 'locked',
      'unlocked', 'key', 'keys', 'shield', 'defense', 'secure', 'guard', 'password'
    ],
    raw: '🛡️🗝️🔑🔐🔏🔒🔓',
  },
  {
    id: 'toys',
    name: 'Toys',
    icon: '🧸',
    keywords: [
      'toys', 'toy', 'games', 'play', 'kids', 'children', 'teddy bear', 'bear',
      'doll', 'matryoshka', 'nesting doll', 'abacus', 'yo-yo', 'poodle', 'otter'
    ],
    raw: '🧸🪆🧮🪀🐩🦦',
  },
];

export const WALLPAPER_IMAGE_CATEGORIES: WallpaperImageCategory[] = RAW_EMOJI_DATA.map((cat) => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
  active: true,
  keywords: cat.keywords,
  emojis: parseEmojiGraphemes(cat.raw),
}));

export const DEFAULT_WALLPAPER_CATEGORY_ID = 'emotions';

export const WALLPAPER_FACES_EMOJIS =
  WALLPAPER_IMAGE_CATEGORIES.find((c) => c.id === 'emotions')?.emojis || [];

export interface EmojiSearchMatch {
  emoji: string;
  categoryName: string;
  categoryId: string;
}

export const searchWallpaperEmojis = (query: string): {
  matchedCategories: WallpaperImageCategory[];
  matchedEmojis: EmojiSearchMatch[];
} => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      matchedCategories: WALLPAPER_IMAGE_CATEGORIES,
      matchedEmojis: [],
    };
  }

  // Find matching categories by name, keywords, or exact emoji containment
  const matchedCategories = WALLPAPER_IMAGE_CATEGORIES.filter((cat) => {
    if (cat.name.toLowerCase().includes(q)) return true;
    if (cat.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
    if (cat.emojis.includes(query.trim())) return true;
    return false;
  });

  const emojiSet = new Set<string>();
  const matchedEmojis: EmojiSearchMatch[] = [];

  // 1. Exact emoji matches (if user pasted an emoji)
  for (const cat of WALLPAPER_IMAGE_CATEGORIES) {
    for (const em of cat.emojis) {
      if (em === query.trim() && !emojiSet.has(em)) {
        emojiSet.add(em);
        matchedEmojis.push({ emoji: em, categoryName: cat.name, categoryId: cat.id });
      }
    }
  }

  // 2. Emojis from matched categories (cap at 72 for silky-smooth performance)
  for (const cat of matchedCategories) {
    for (const em of cat.emojis) {
      if (!emojiSet.has(em)) {
        emojiSet.add(em);
        matchedEmojis.push({ emoji: em, categoryName: cat.name, categoryId: cat.id });
        if (matchedEmojis.length >= 72) break;
      }
    }
    if (matchedEmojis.length >= 72) break;
  }

  return { matchedCategories, matchedEmojis };
};
