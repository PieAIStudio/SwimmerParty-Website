/**
 * Paired authored UI messages; generate catalogs with pnpm messages:generate.
 * Bounded authored-body exceptions: src/content/legal.ts and src/content/license.ts
 * retain their long legal text, credit lines, examples and rule/FAQ tables verbatim.
 * Actor/content field locale selectors remain data. ZIP README/legacy delivery
 * copy is outside this UI catalog; do not change its legal wording in this block.
 */
export const messages = {
  "settings.title": { en: "Scene backgrounds", zh: "场景背景" },
  "settings.intro": {
    en: "Pick a place, edit the line, and copy it to your AI tool.",
    zh: "选个场景，改改描述词，复制到你的画图工具。",
  },
  "settings.separate": {
    en: "References, not 3D backgrounds. Use them with your layout PNG and actor references. No image generation here.",
    zh: "这是参考，不是三维布景。请搭配站位 PNG 和演员参考图使用。本站不生成图片。",
  },
  "settings.name.studio": { en: "Studio", zh: "摄影棚" },
  "settings.name.cafe": { en: "Café", zh: "咖啡馆" },
  "settings.name.street": { en: "Street", zh: "街道" },
  "settings.name.garden": { en: "Garden", zh: "花园" },
  "settings.name.livingRoom": { en: "Living room", zh: "客厅" },
  "settings.name.gym": { en: "Gym", zh: "健身房" },
  "settings.sentence.studio": {
    en: "A quiet photo studio with a light background and soft light.",
    zh: "安静的摄影棚，浅色背景，光线柔和。",
  },
  "settings.sentence.cafe": {
    en: "A small café with wooden tables and warm window light.",
    zh: "小咖啡馆里摆着木桌，暖光从窗边照进来。",
  },
  "settings.sentence.street": {
    en: "A quiet city street during the day, with shops on the side.",
    zh: "白天安静的街道，路边有商店。",
  },
  "settings.sentence.garden": {
    en: "A green garden with a stone path in soft morning light.",
    zh: "长满花草的花园，石板路上有柔和的晨光。",
  },
  "settings.sentence.livingRoom": {
    en: "A simple living room with a sofa and soft daylight.",
    zh: "干净的客厅里放着沙发，阳光柔和。",
  },
  "settings.sentence.gym": {
    en: "A bright gym with exercise equipment and clear floor space.",
    zh: "明亮的健身房，器械旁留有空地。",
  },
  "settings.group": { en: "Place type", zh: "场景分类" },
  "settings.group.indoor": { en: "Indoor", zh: "室内" },
  "settings.group.outdoor": { en: "Outdoor", zh: "户外" },
  "settings.group.night": { en: "Night", zh: "傍晚 / 夜晚" },
  "settings.name.parkPathDay": { en: "Park path", zh: "公园小路" },
  "settings.name.forestClearing": { en: "Forest clearing", zh: "林间空地" },
  "settings.name.beachBoardwalk": { en: "Beach boardwalk", zh: "海边栈道" },
  "settings.name.rooftopSunset": { en: "Rooftop sunset", zh: "屋顶夕阳" },
  "settings.name.cityStreetNight": { en: "City street at night", zh: "城市夜街" },
  "settings.name.alleyRainNight": { en: "Rainy night alley", zh: "雨后夜巷" },
  "settings.name.campfireNight": { en: "Campfire at night", zh: "夜间营地" },
  "settings.name.schoolClassroom": { en: "Classroom", zh: "教室" },
  "settings.name.library": { en: "Library", zh: "图书馆" },
  "settings.name.office": { en: "Office", zh: "办公室" },
  "settings.name.kitchen": { en: "Kitchen", zh: "厨房" },
  "settings.name.bedroom": { en: "Bedroom", zh: "卧室" },
  "settings.name.trainPlatform": { en: "Train platform", zh: "火车站台" },
  "settings.name.busStopDusk": { en: "Sunset bus stop", zh: "傍晚公交站" },
  "settings.name.shopFrontStreet": { en: "Shop street", zh: "商店门前" },
  "settings.name.marketStreet": { en: "Market street", zh: "市场街道" },
  "settings.name.mountainLookout": { en: "Mountain lookout", zh: "山间观景台" },
  "settings.name.lakesideDock": { en: "Lakeside dock", zh: "湖畔码头" },
  "settings.name.snowyStreet": { en: "Snowy evening street", zh: "雪后傍晚街道" },
  "settings.name.stageConcertNight": { en: "Concert stage at night", zh: "夜间音乐舞台" },
  "settings.sentence.parkPathDay": {
    en: "Using actor images for style/light only, make a warm 16:9 empty park path with natural old trees, varied grass and an edge bench, sunlight from upper left, rich real materials, a level eye-height 35mm view and clear central ground for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为白天的安静公园石板路，中央拓宽，边缘有自然老树、参差草地和旧木长椅，阳光从左上方照入，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.forestClearing": {
    en: "Using actor images for style/light only, make a warm 16:9 forest clearing with flat earth, irregular trees, ferns and grasses at the edges, morning sun from upper left, rich real materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为晨光从左上方穿过自然树冠的林间空地，四周有不规则树干、蕨类和草丛，中央为平整夯土地面，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.beachBoardwalk": {
    en: "Using actor images for style/light only, make a warm 16:9 beach boardwalk with weathered timber, side railings, dune grasses and sea behind in soft afternoon sun, rich real materials and a level eye-height 35mm view, clear central deck for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为午后海边的宽阔旧木栈道，两侧有连贯栏杆和沙丘草，后方可见海滩与海面，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.rooftopSunset": {
    en: "Using actor images for style/light only, make a warm 16:9 rooftop terrace with concrete floor, rear parapet and skyline, side timber seats and cushions, sunset from the right, rich real materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为日落时的屋顶露台，中央为平整混凝土地面，后方有护墙与天际线，木座椅和布垫放在边缘，夕阳从右侧照入，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.cityStreetNight": {
    en: "Using actor images for style/light only, make a warm 16:9 city street at night with rich brick, stucco and stone, side trees, readable paving under warm lamps, empty lit windows and moonlight, a level eye-height 35mm view and clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为夜晚的安静城市街道，砖墙、灰泥和石材表面更细致，自然街树位于两侧，暖色路灯、无人窗光与月光让铺装地面清晰可见，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.alleyRainNight": {
    en: "Using actor images for style/light only, make a warm 16:9 brick alley after rain at night, wet stone reflecting warm wall lamps and empty lit windows, moonlit fill, rich real materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为雨后的整洁砖墙夜巷，中央为平整湿石路面，暖色壁灯和无人窗光形成自然倒影，月光补足暗部，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.campfireNight": {
    en: "Using actor images for style/light only, make a warm 16:9 woodland campsite at night, fire at far left, tent and wood at rear right, natural trees, readable firelight and moonlight, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为夜晚的林间营地，小篝火放在最左侧，帆布帐篷和木柴放在右后方，自然树木围住中央平整空地，火光与月光保持地面可读，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.schoolClassroom": {
    en: "Using actor images for style/light only, make a warm 16:9 classroom with worn timber desks at the sides, blank green chalkboard and unmarked books, soft left window light, rich real materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为有柔和左侧窗光的温暖教室，旧木课桌椅靠两侧摆放，后方为完全空白的绿黑板和无字书本，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.library": {
    en: "Using actor images for style/light only, make a warm 16:9 library with oak wall shelves, unmarked book spines and fabric chairs at the edges, left window light and shaded lamps, rich real materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为有柔和左侧窗光与暖灯的温馨图书馆，橡木书架和无字书脊靠墙摆放，布艺阅读椅放在边缘，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.office": {
    en: "Using actor images for style/light only, make a warm 16:9 office with side wood desks, fabric chairs, blank paper and plain pencil pots, no electronics, natural window light and warm lamps, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为有自然窗光和暖台灯的安静办公室，木写字桌与布艺办公椅靠两侧摆放，桌上仅有白纸和无标识笔筒，不出现电子设备，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.kitchen": {
    en: "Using actor images for style/light only, make a warm 16:9 kitchen with perimeter oak cabinets, stone, ceramics and linen, concealed appliances, no island, left daylight and cabinet lights, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为有左侧窗光与暖色橱柜灯的温馨厨房，橡木柜、石台面、陶器和亚麻布位于周边，所有电器藏在无标识柜门后且没有中岛，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.bedroom": {
    en: "Using actor style/light only, make a warm 16:9 bedroom with a linen bed at far left, timber wardrobe, bedside lamp and woven curtains, no central rug or bench, soft right morning light, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为有右侧柔和晨光的温暖卧室，亚麻床铺位于最左侧，木衣柜、床头灯和织物窗帘放在周边，中央没有地毯或长凳，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.trainPlatform": {
    en: "Using actor style/light only, make a warm 16:9 covered train platform with side timber benches and canopy columns, tracks at far right, no train, soft afternoon light, rich materials and a level eye-height 35mm view, clear centre away from tracks for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为午后柔光下的安静有顶火车站台，木长椅和连贯顶棚立柱靠边，轨道在最右侧，中央混凝土区域远离轨道边缘且没有列车，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.busStopDusk": {
    en: "Using actor style/light only, make a warm 16:9 bus stop at dusk with a glass shelter and timber bench at far left, brick homes and natural trees, warm lamps and window light, no vehicles, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为黄昏的安静公交候车处，玻璃棚与木长椅位于最左侧，后方有砖房与自然树木，暖路灯和窗光照亮中央混凝土空地且没有车辆，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.shopFrontStreet": {
    en: "Using actor images for style/light only, make a warm 16:9 shopfront street with rich brick, stucco, timber window frames and plain woven awnings, unmarked pottery inside, soft daylight and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为柔和日光下的安静商店门前街道，细致砖墙、灰泥、木窗框与无字帆布遮阳篷位于两侧，窗内只有无标识陶器，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.marketStreet": {
    en: "Using actor images for style/light only, make a warm 16:9 market street with timber stalls, woven awnings and a few produce baskets at the sides, broad stone paving in soft afternoon sun, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为柔和午后阳光下的整洁市场街道，木摊位、帆布篷和少量果蔬篮沿两侧摆放，中央石板路宽阔畅通，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.mountainLookout": {
    en: "Using actor images for style/light only, make a warm 16:9 mountain lookout with stone terrace, rear timber rail, layered mountains and hazy valley, side pines and grasses in morning sun, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为温暖晨光下的山间观景台，中央为平整石质平台，后方有连贯木护栏、层叠山脉和薄雾山谷，自然松枝与参差草丛只在两侧，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.lakesideDock": {
    en: "Using actor style/light only, make a warm 16:9 lakeside timber dock with side railings, natural branches and reeds, calm water and soft reflections in afternoon sun, no ropes or boats in the centre, rich materials and a level eye-height 35mm view, room for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为温暖午后阳光下的宽阔湖畔木码头，两侧有连贯栏杆、自然树枝与芦苇，后方为带柔和倒影的平静湖面，中央没有绳索或船只，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.snowyStreet": {
    en: "Using actor style/light only, make a warm 16:9 snowy street at dusk with snow on roofs and sides, thin even snow on level paving, bare branches, readable blue twilight and warm lamps/windows, rich materials and a level eye-height 35mm view, clear centre for two actors, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为降雪后黄昏的安静街道，屋顶与两侧积雪，中央平整铺装仅留薄薄均匀雪粉，自然裸枝、暖路灯和无人窗光让蓝色暮光中的地面清晰可见，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence.stageConcertNight": {
    en: "Using actor style/light only, make a warm 16:9 outdoor stage at night with timber floor, side curtains, plain backdrop and overhead truss, readable tungsten light and moonlit edges, no audio equipment, rich materials and a level eye-height 35mm view, clear centre, no people or text.",
    zh: "仅参考所附两位演员的风格与灯光，生成一张16:9且至少1536×864的空景，场景为夜晚的空旷户外音乐舞台，真实木地板、侧翼布帘、后方纯色幕布和连贯上方灯架构成整洁舞台，暖钨丝舞台灯照亮中央，边缘可见月色且没有音箱或其他音响器材，真实材质与自然植物细节比run-1更丰富但保留适合3D动画演员的整洁温暖电影布景感，使用约1.6米眼高的35mm镜头、水平地平线和笔直垂线，中央三分之一保留供两位全身演员站立的平整开阔地面，无杂物、人物、人形、脸、动物、雕像、人体模型、文字、标牌、标志、数字或水印。",
  },
  "settings.sentence": { en: "Description", zh: "场景描述" },
  "settings.copyPrompt": { en: "Copy prompt", zh: "复制提示词" },
  "settings.promptCopied": { en: "Prompt copied", zh: "提示词已复制" },
  "settings.saveImage": { en: "Save image", zh: "保存图片" },
  "settings.imagePending": { en: "Coming soon", zh: "图片准备中" },
  "settings.notSupplied": {
    en: "This picture isn't ready yet, so you can't save it.",
    zh: "这张图还没准备好，暂时不能保存。",
  },
  "settings.downloadFailed": {
    en: "Could not save the image. Try again.",
    zh: "图片没保存成功，请重试。",
  },
  "settings.imageSaved": { en: "Image saved.", zh: "图片已保存。" },
  "scene.title": { en: "Build a scene", zh: "摆个场面" },
  "scene.intro": {
    en: "Place and pose the figures, save the picture, and send it to your AI tool with the actor pictures.",
    zh: "摆好小人位置存成图，再和演员图一起发给 AI 工具。",
  },
  "scene.open": { en: "Build a scene", zh: "摆个场面" },
  "scene.loading": { en: "Loading the stage…", zh: "正在打开舞台…" },
  "scene.layouts": { en: "Pick a layout", zh: "先选个站位" },
  "scene.layout.talk": { en: "2 · Conversation", zh: "2 人 · 聊一聊" },
  "scene.layout.triangle": { en: "3 · Triangle", zh: "3 人 · 三角站位" },
  "scene.layout.group": { en: "5 · Group", zh: "5 人 · 聚在一起" },
  "scene.layout.lineup": { en: "8 · Lineup", zh: "8 人 · 排成一行" },
  "scene.layout.shoulder": { en: "2 · Over shoulder", zh: "2 人 · 过肩聊" },
  "scene.limbs": { en: "Pose by hand", zh: "动手摆姿势" },
  "scene.limbHint": {
    en: "Turn this on, then drag the dots to move arms and legs.",
    zh: "打开后，拖圆点就能摆手脚。",
  },
  "scene.fineTune": { en: "Adjust", zh: "微调位置" },
  "scene.gesturesTitle": { en: "How to move figures", zh: "怎么移动小人" },
  "scene.handle.leftWrist": { en: "Left hand", zh: "左手" },
  "scene.handle.rightWrist": { en: "Right hand", zh: "右手" },
  "scene.handle.leftAnkle": { en: "Left foot", zh: "左脚" },
  "scene.handle.rightAnkle": { en: "Right foot", zh: "右脚" },
  "scene.handle.head": { en: "Head", zh: "头部" },
  "scene.performance": {
    en: "If a big scene feels slow, make the preview window smaller.",
    zh: "人多如果卡，把预览窗口调小一点。",
  },
  "scene.savePng": { en: "Save PNG", zh: "保存 PNG" },
  "scene.saveScene": { en: "Save scene", zh: "保存场面" },
  "scene.shot": { en: "Zoom", zh: "远近" },
  "scene.shot.full": { en: "Full", zh: "全身" },
  "scene.shot.medium": { en: "Half", zh: "半身" },
  "scene.shot.close": { en: "Close-up", zh: "特写" },
  "scene.subject": { en: "Who to see", zh: "镜头看谁" },
  "scene.everyone": { en: "Everyone", zh: "所有人" },
  "scene.selected": { en: "Selected person", zh: "选中的人" },
  "scene.lens": { en: "Lens", zh: "镜头" },
  "scene.undo": { en: "Undo", zh: "撤销" },
  "scene.redo": { en: "Redo", zh: "重做" },
  "scene.reset": { en: "Reset stage", zh: "重置舞台" },
  "scene.saved": { en: "Draft saved on this device.", zh: "草稿已保存在这台设备。" },
  "scene.unavailable": {
    en: "3D stage could not load. You can still use actor pictures and the guide.",
    zh: "3D 舞台打不开，但演员图和使用说明还能照常用。",
  },
  "scene.storageUnavailable": {
    en: "Can't save a draft in this browser. Keep this page open or save a PNG.",
    zh: "草稿没法存在浏览器里。请别关本页，或先保存 PNG。",
  },
  "scene.exported": { en: "PNG saved.", zh: "PNG 已保存。" },
  "scene.failed": { en: "Could not save the PNG. Try again.", zh: "PNG 没保存成功，请重试。" },
  "scene.frame": { en: "Shape", zh: "比例" },
  "scene.camera": { en: "Angle", zh: "角度" },
  "scene.view.eye": { en: "Eye level", zh: "平视" },
  "scene.view.low": { en: "Low", zh: "从下看" },
  "scene.view.high": { en: "High", zh: "从上看" },
  "scene.view.shoulder": { en: "Over shoulder · 1 → 2", zh: "过肩 · 1 → 2" },
  "scene.fit": { en: "Center", zh: "对准人" },
  "scene.line": { en: "Line up", zh: "排成一行" },
  "scene.faceOff": { en: "Face in", zh: "面对面" },
  "scene.gestures": {
    en: "Drag a figure to move it. Drag empty space to look around. Pinch or scroll to zoom, or type numbers.",
    zh: "拖小人改位置，拖空白处转视角，滚轮或双指缩放，也能填数字。",
  },
  "scene.figures": { en: "Figures", zh: "小人" },
  "scene.figure": { en: "Figure {count}", zh: "小人 {count}" },
  "scene.add": { en: "Add figure", zh: "加个小人" },
  "scene.remove": { en: "Remove", zh: "移除" },
  "scene.pose": { en: "Pose", zh: "姿势" },
  "scene.pose.stand": { en: "Stand", zh: "站立" },
  "scene.pose.walk": { en: "Walk", zh: "迈步" },
  "scene.pose.point": { en: "Point", zh: "指向" },
  "scene.pose.wave": { en: "Wave", zh: "挥手" },
  "scene.pose.sit": { en: "Sit", zh: "坐下" },
  "scene.pose.arms-crossed": { en: "Arms crossed", zh: "抱臂" },
  "scene.pose.lean-in": { en: "Lean in", zh: "往前倾" },
  "scene.pose.hand-on-hip": { en: "Hand on hip", zh: "单手叉腰" },
  "scene.pose.hands-on-table": { en: "Hands on table", zh: "双手扶桌" },
  "scene.pose.look-over-shoulder": { en: "Look back", zh: "回头看看" },
  "scene.pose.hug-ready": { en: "Open arms", zh: "张开双臂" },
  "scene.pose.kneel": { en: "Kneel", zh: "单膝跪地" },
  "scene.build": { en: "Body", zh: "体型" },
  "scene.build.slim": { en: "Male · slim", zh: "男 · 偏瘦" },
  "scene.build.average": { en: "Male · average", zh: "男 · 中等" },
  "scene.build.broad": { en: "Male · broad", zh: "男 · 宽壮" },
  "scene.build.slim-f": { en: "Female · slim", zh: "女 · 偏瘦" },
  "scene.build.average-f": { en: "Female · average", zh: "女 · 中等" },
  "scene.build.broad-f": { en: "Female · broad", zh: "女 · 宽壮" },
  "scene.height": { en: "Height", zh: "身高" },
  "scene.turn": { en: "Facing", zh: "朝向" },
  "scene.axis.x": { en: "Left / right (m)", zh: "左右（米）" },
  "scene.axis.z": { en: "Front / back (m)", zh: "前后（米）" },
  "scene.actorReferences": { en: "Actor pictures", zh: "演员参考图" },
  "scene.prompt": { en: "Actor prompt", zh: "演员对应提示词" },
  "scene.copyPrompt": { en: "Copy prompt", zh: "复制提示词" },
  "scene.promptCopied": { en: "Prompt copied", zh: "提示词已复制" },
  "scene.promptIntro": {
    en: "Upload the scene picture and each actor's reference picture. Match each person by number, name, and color band below. Draw their face and clothes from their actor picture, not the gray figure.",
    zh: "把站位图和每位演员的参考图一起传给 AI。按下面的编号、名字和颜色条对应人物。脸和衣服照演员参考图画，不要画成灰色小人。",
  },
  "scene.promptActor": {
    en: "{label} ({colour} band) → actor picture: {url}",
    zh: "{label}（{colour}色）→ 演员参考图：{url}",
  },
  "scene.promptUnassigned": {
    en: "{label} ({colour} band) → no actor picture chosen.",
    zh: "{label}（{colour}色）→ 还没选演员参考图。",
  },
  "scene.colour.blue": { en: "blue", zh: "蓝" },
  "scene.colour.amber": { en: "amber", zh: "琥珀" },
  "scene.colour.magenta": { en: "magenta", zh: "紫红" },
  "scene.colour.teal": { en: "teal", zh: "青绿" },
  "scene.colour.purple": { en: "purple", zh: "紫" },
  "scene.colour.red": { en: "red", zh: "红" },
  "scene.colour.green": { en: "green", zh: "绿" },
  "scene.colour.slate": { en: "slate", zh: "灰蓝" },
  "scene.approximate": {
    en: "These figures just mark the spot. Move them any way you like.",
    zh: "小人只是定位置的，随便摆。",
  },
  "nav.community": {
    en: "Swimmers",
    zh: "泳者们",
  },
  "c3.creatorWorks": {
    en: "User works",
    zh: "大家的作品",
  },
  "c3.withActor": {
    en: "Made with {name}",
    zh: "大家用 {name} 做的",
  },
  "c3.nextGraduation": {
    en: "Vote for the next actor!",
    zh: "投票决定新增演员！",
  },
  "c3.voteNotPromise": {
    en: "More votes mean we make their full pack sooner.",
    zh: "谁的票多，就先做谁的完整包。",
  },
  "c3.votes": {
    en: "{count} votes",
    zh: "{count} 票",
  },
  "c3.tied": {
    en: "Tied for first",
    zh: "票数相同",
  },
  "c3.noVotes": {
    en: "No votes yet. Be the first to vote!",
    zh: "还没有人投票，来投第一票吧。",
  },
  "c3.voteRoster": {
    en: "See new actors and vote",
    zh: "看新演员并投票",
  },
  "c3.official": {
    en: "Official clip",
    zh: "官方短片",
  },
  "c3.creator": {
    en: "User work",
    zh: "大家做的",
  },
  "c3.officialExamples": {
    en: "See official clips",
    zh: "看官方短片",
  },
  "c3.separation": {
    en: "Official clips and user posts are labeled separately.",
    zh: "官方短片和大家的作品会分开标明。",
  },
  "c3.sort": {
    en: "Sort by",
    zh: "排序方式",
  },
  "c3.latest": {
    en: "Latest",
    zh: "最新",
  },
  "c3.featured": {
    en: "Featured",
    zh: "精选",
  },
  "c3.kind": {
    en: "Work type",
    zh: "作品类型",
  },
  "c3.allKinds": {
    en: "All types",
    zh: "全部类型",
  },
  "c3.actor": {
    en: "Actor used",
    zh: "使用的演员",
  },
  "c3.allActors": {
    en: "All actors",
    zh: "全部演员",
  },
  "c3.imageCount": {
    en: "{count, plural, one {# image} other {# images}}",
    zh: "{count, plural, other {# 张图片}}",
  },
  "c3.openWork": {
    en: "Open work: {title}",
    zh: "查看作品：{title}",
  },
  "c3.restartUpload": {
    en: "Upload file again",
    zh: "文件过期，重新上传",
  },
  "c2.ownerOnly": {
    en: "Owner review desk. Every action checks your Owner permission.",
    zh: "管理员专用审核台，每次操作都会检查权限。",
  },
  "c2.saved": {
    en: "Saved. Refreshing now.",
    zh: "已保存，正在刷新。",
  },
  "c2.submissionControl": {
    en: "Submission safety switch",
    zh: "投稿安全开关",
  },
  "c2.open": {
    en: "Submissions open",
    zh: "投稿开放",
  },
  "c2.paused": {
    en: "Submissions paused",
    zh: "投稿已暂停",
  },
  "c2.pauseScope": {
    en: "When paused, no one can upload or post new works. Viewing, reporting, reviewing, and deleting still work.",
    zh: "暂停后不能发新作品或传新文件。看作品、举报、审核和删除照常。",
  },
  "c2.pauseReason": {
    en: "Why change this",
    zh: "为什么要改投稿开关",
  },
  "c2.pause": {
    en: "Pause submissions",
    zh: "紧急暂停投稿",
  },
  "c2.resume": {
    en: "Resume submissions",
    zh: "恢复投稿",
  },
  "c2.confirmPause": {
    en: "Pause new posts now? Published works stay visible.",
    zh: "现在暂停新投稿？已发布的作品还能看。",
  },
  "c2.confirmResume": {
    en: "Open submissions again with current limits?",
    zh: "现在重新开放投稿吗？",
  },
  "c2.confirm": {
    en: "Confirm change",
    zh: "确认变更",
  },
  "c2.queueStatus": {
    en: "Review queue status",
    zh: "审核列表状态",
  },
  "c2.reportCount": {
    en: "{count} reports",
    zh: "{count} 条举报",
  },
  "c2.inspect": {
    en: "See files and history",
    zh: "看文件和记录",
  },
  "c2.revision": {
    en: "Version {revision}",
    zh: "第 {revision} 版",
  },
  "c2.reports": {
    en: "Report reasons",
    zh: "举报原因",
  },
  "c2.round": {
    en: "Round {round}",
    zh: "第 {round} 轮",
  },
  "c2.noReports": {
    en: "No reports for this post.",
    zh: "没有收到举报。",
  },
  "c2.history": {
    en: "Review history",
    zh: "审核历史",
  },
  "c2.noHistory": {
    en: "No review history yet.",
    zh: "还没有审核记录。",
  },
  "c2.decision": {
    en: "Review decision",
    zh: "审核决定",
  },
  "c2.action": {
    en: "Action for this version",
    zh: "审核操作",
  },
  "c2.reason": {
    en: "Reason shown to the author",
    zh: "给作者看的原因",
  },
  "c2.approvalNotTrust": {
    en: "Approves this version only.",
    zh: "只通过这一版。",
  },
  "c2.approve": {
    en: "Approve",
    zh: "通过",
  },
  "c2.return": {
    en: "Return for changes",
    zh: "退回修改",
  },
  "c2.hide": {
    en: "Hide published work",
    zh: "隐藏公开作品",
  },
  "c2.restore": {
    en: "Restore hidden work",
    zh: "恢复隐藏作品",
  },
  "c2.apply": {
    en: "Save review decision",
    zh: "保存审核决定",
  },
  "c2.trust": {
    en: "Author trust",
    zh: "作者信任",
  },
  "c2.revokeHelp": {
    en: "If you remove trust, this author's future posts need review. Older posts stay up.",
    zh: "取消信任后，这位作者以后发作品都要先审核，以前发过的不受影响。",
  },
  "c2.revokeReason": {
    en: "Reason for revoking trust",
    zh: "撤销信任的原因",
  },
  "c2.revoke": {
    en: "Revoke author trust",
    zh: "撤销作者信任",
  },
  "c2.notTrusted": {
    en: "This author is not on the trusted list.",
    zh: "这位作者每次投稿都要审核。",
  },
  "c2.confirmed": {
    en: "Confirmed",
    zh: "已确认",
  },
  "c2.notConfirmed": {
    en: "Not confirmed",
    zh: "未确认",
  },
  "c.resumePendingDraft": {
    en: "Back to unfinished draft",
    zh: "回到未完成的草稿",
  },
  "c.pendingDraftHint": {
    en: "Another draft is still saving. Finish it first.",
    zh: "另一份草稿还在保存，先处理完它。",
  },
  "c.resumeUpload": { en: "Resume upload", zh: "继续上传所选文件" },
  "c.transcript": {
    en: "Spoken words (optional, from the creator)",
    zh: "台词文字（可选，由作者填写）",
  },
  "c.noTranscript": {
    en: "The creator did not add the spoken words.",
    zh: "作者没有写台词。",
  },
  "c.loading": { en: "Loading…", zh: "加载中…" },
  "c.title": { en: "Swimmers' works", zh: "泳者们的作品" },
  "c.new": { en: "Share a work", zh: "投稿作品" },
  "c.mine": { en: "My works", zh: "我的作品" },
  "c.noPosts": { en: "No works here yet.", zh: "这里还没有作品。" },
  "c.loadMore": { en: "Load more", zh: "加载更多" },
  "c.retry": { en: "Try again", zh: "刷新重试" },
  "c.retryWrite": { en: "Retry last action", zh: "重试刚才的操作" },
  "c.draftInvalidHint": {
    en: "Could not save yet. Check the title and actor version. If both look right, send us the number below. Your files are still here.",
    zh: "没保存成功。请先看标题和演员版本对不对。都没问题，就把下面的编号发给我们。你选的文件还在。",
  },
  "c.requestReference": { en: "Request reference: {id}", zh: "请求编号：{id}" },
  "c.uncertain": {
    en: "Connection dropped. Tap Retry, no need to start over.",
    zh: "网络断了一下，点重试就行，不用新建。",
  },
  "c.type": { en: "1 · Choose a type", zh: "1 · 选类型" },
  "c.media": { en: "2 · Add files", zh: "2 · 传文件" },
  "c.preview": { en: "3 · Preview and submit", zh: "3 · 预览并发布" },
  "c.next": { en: "Continue", zh: "下一步" },
  "c.back": { en: "Back", zh: "上一步" },
  "c.save": { en: "Save draft", zh: "保存草稿" },
  "c.saved": { en: "Draft saved.", zh: "草稿已保存。" },
  "c.edit": { en: "Edit this work", zh: "编辑作品" },
  "c.actorSearch": { en: "Find an actor", zh: "查找演员" },
  "c.actors": { en: "Actors and versions used", zh: "用到的演员和版本" },
  "c.actorLimit": {
    en: "Pick 1–16 actors. Their version is saved with your work.",
    zh: "选 1–16 位演员，版本号会一起保存。",
  },
  "c.videoLink": { en: "Video link", zh: "视频链接" },
  "c.videoHelp": {
    en: "Paste a link from one of the sites below. No video file uploads.",
    zh: "只收下面这几个网站的链接，不直接传视频文件。",
  },
  "c.files": { en: "Choose files", zh: "选择文件" },
  "c.fileLimits": {
    en: "Up to {count} files · {mib} MiB each",
    zh: "最多 {count} 个文件，每个 {mib} MiB",
  },
  "c.audioLimit": {
    en: "Up to {seconds} seconds.",
    zh: "最长 {seconds} 秒。",
  },
  "c.dailyLimits": {
    en: "{posts} posts and {mib} MiB a day.",
    zh: "每天可投 {posts} 次，共 {mib} MiB。",
  },
  "c.metadata": {
    en: "We remove private info from your pictures when you upload.",
    zh: "上传时会自动删掉图片里的定位等隐私信息。",
  },
  "c.preparing": { en: "Preparing files…", zh: "正在处理文件…" },
  "c.upload": { en: "Upload selected files", zh: "上传所选文件" },
  "c.cancel": { en: "Cancel", zh: "取消" },
  "c.checkStatus": { en: "Check processing status", zh: "查看处理状态" },
  "c.transfer": {
    en: "Uploaded {loaded} / {total} bytes",
    zh: "已传 {loaded} / {total} 字节",
  },
  "c.reserving": { en: "Preparing upload…", zh: "正在准备上传…" },
  "c.uploading": { en: "Uploading", zh: "上传中" },
  "c.validating": {
    en: "Uploaded. Checking now.",
    zh: "上传好了，正在检查。",
  },
  "c.ready": { en: "Files ready", zh: "文件检查通过" },
  "c.mediaLocked": {
    en: "You can't change the files in this draft. To use new files, start a new draft.",
    zh: "这份草稿的文件不能直接换。想换文件请新建一份。",
  },
  "c.publish": { en: "Submit post", zh: "提交发布" },
  "c.submitHelp": {
    en: "Your first post goes live after review.",
    zh: "第一次投稿，审核通过就公开。",
  },
  "c.submitted": {
    en: "Submitted! Check the current status below.",
    zh: "已提交！你可以在下方查看最新状态。",
  },
  "c.returnReason": { en: "Reason for return", zh: "退回原因" },
  "c.openMedia": { en: "Show preview", zh: "打开预览" },
  "c.openVideo": { en: "Play video", zh: "打开视频" },
  "c.externalFallback": {
    en: "Won't play here? Watch it on the original site. Private, deleted, or region-locked videos can't play here.",
    zh: "这里播不了？去原网站看吧。私密、已删除或限制地区的视频在这儿放不出来。",
  },
  "c.original": { en: "Open on {platform}", zh: "在 {platform} 打开" },
  "c.playerTitle": { en: "Video for {title}", zh: "{title}的视频" },
  "c.mediaUnavailable": {
    en: "Still processing the file. You can view it soon.",
    zh: "文件还在处理，等一下就能看。",
  },
  "c.likes": { en: "Like · {count}", zh: "点赞 · {count}" },
  "c.reportReason": { en: "Reason for reporting", zh: "举报原因" },
  "c.reportNote": { en: "Details (optional)", zh: "补充说明（可选）" },
  "c.confirmDelete": {
    en: "Delete this work?",
    zh: "删除这件作品？",
  },
  "c.deleted": {
    en: "Your post is removed and its files are being deleted.",
    zh: "作品已删除，正在清理文件。",
  },
  "c.state.draft": { en: "Draft", zh: "草稿" },
  "c.state.processing": { en: "Processing", zh: "处理中" },
  "c.state.pending": { en: "In review", zh: "待审" },
  "c.state.returned": { en: "Returned", zh: "退回" },
  "c.state.published": { en: "Published", zh: "已发布" },
  "c.state.hidden": { en: "Hidden", zh: "已隐藏" },
  "c.state.deleted": { en: "Deleting", zh: "清理中" },
  "c.reason.real_person": { en: "Looks like a real person", zh: "像真实人物" },
  "c.reason.sexual_violent": { en: "Sexual or violent content", zh: "色情或暴力内容" },
  "c.reason.hate_harassment": { en: "Hate or harassment", zh: "仇恨或骚扰" },
  "c.reason.not_site_actors": { en: "Not made with our actors", zh: "没有使用本站演员" },
  "c.reason.stolen_work": { en: "Stolen work", zh: "盗用作品" },
  "c.reason.other": { en: "Another reason", zh: "其他原因" },
  "c.error.INVALID_INPUT": { en: "Check the fields and try again.", zh: "请检查所填内容。" },
  "c.error.INVALID_CURSOR": {
    en: "This list is out of date. Refresh the page.",
    zh: "页面放太久了，刷新一下再看。",
  },
  "c.error.AUTH_REQUIRED": {
    en: "Sign in with your Swimmer account.",
    zh: "请用泳者账号登录。",
  },
  "c.error.OWNER_REQUIRED": {
    en: "Only the Owner can use this review desk.",
    zh: "只有 Owner 能使用审核台。",
  },
  "c.error.ORIGIN_NOT_ALLOWED": {
    en: "The Swimmers community isn't available on this address.",
    zh: "这个网址用不了泳者社区。",
  },
  "c.error.METHOD_NOT_ALLOWED": {
    en: "That didn't work. Refresh the page and try again.",
    zh: "操作没成功，请刷新页面再试。",
  },
  "c.error.SCOPE_NOT_ALLOWED": {
    en: "You don't have permission to do this.",
    zh: "你没有权限做这件事。",
  },
  "c.error.POST_UNAVAILABLE": {
    en: "This work isn't available right now.",
    zh: "找不到这件作品，或者它还没公开。",
  },
  "c.error.MEDIA_UNAVAILABLE": {
    en: "This file isn't available right now.",
    zh: "这个文件现在打不开。",
  },
  "c.error.OPERATION_UNAVAILABLE": {
    en: "Can't find that post yet. Try again.",
    zh: "暂时查不到刚才的提交，请再试一次。",
  },
  "c.error.REVISION_CONFLICT": {
    en: "This work just changed. Reload, then edit.",
    zh: "作品刚更新过，刷新后再改。",
  },
  "c.error.IDEMPOTENCY_CONFLICT": {
    en: "This doesn't match what's saved. Reload to check.",
    zh: "和已保存的内容对不上，刷新看看。",
  },
  "c.error.INVALID_STATE": {
    en: "You can't do that right now. Refresh to see the latest status.",
    zh: "现在不能这么做，请刷新看看最新状态。",
  },
  "c.error.UPLOAD_EXPIRED": {
    en: "Upload timed out. Upload it again.",
    zh: "上传超时了，请再传一次。",
  },
  "c.error.FILE_TOO_LARGE": {
    en: "This file is too big.",
    zh: "文件太大了，换个小一点的。",
  },
  "c.error.POST_MEDIA_LIMIT": {
    en: "Too many files for one post.",
    zh: "文件数量超过了限制。",
  },
  "c.error.UNSUPPORTED_MEDIA": {
    en: "This file type is not supported.",
    zh: "不支持这种文件格式。",
  },
  "c.error.MEDIA_INVALID": {
    en: "We can't read this file. Try another one.",
    zh: "这个文件打不开，换一个试试。",
  },
  "c.error.AUDIO_TOO_LONG": {
    en: "This audio file is too long.",
    zh: "音频太长了，请剪短一点。",
  },
  "c.error.VIDEO_URL_UNSUPPORTED": {
    en: "Paste a regular https video link, not embed code.",
    zh: "请直接粘贴 https 开头的视频网址，不要贴分享代码。",
  },
  "c.error.RIGHTS_CONFIRMATION_REQUIRED": {
    en: "Please check both boxes below before submitting.",
    zh: "发布前请先勾选下面的两项确认。",
  },
  "c.error.POST_QUOTA_EXCEEDED": {
    en: "You reached today's post limit. Try again tomorrow.",
    zh: "今天发作品的次数用完了，明天再来吧。",
  },
  "c.error.UPLOAD_QUOTA_EXCEEDED": {
    en: "You reached today's upload limit. Try again tomorrow.",
    zh: "今天传文件的大小用完了，明天再来吧。",
  },
  "c.error.RATE_LIMITED": {
    en: "Too many tries at once. Wait a moment and try again.",
    zh: "点得太快了，等一会儿再试。",
  },
  "c.error.SUBMISSIONS_PAUSED": {
    en: "New posts are paused right now. You can still view and report posts.",
    zh: "现在暂停发新作品，看作品和举报照常。",
  },
  "c.error.COMMUNITY_UNAVAILABLE": {
    en: "Community is not working right now. Try again later.",
    zh: "社区暂时打不开，过会儿再试。",
  },
  "c.error.PROCESSING_UNAVAILABLE": {
    en: "The file could not upload yet. Your work is not published.",
    zh: "文件暂时传不上去。作品还没发布。",
  },
  "common.themeLight": {
    en: "Light",
    zh: "浅色",
  },
  "common.themeDark": {
    en: "Dark",
    zh: "深色",
  },
  "common.themeToggle": {
    en: "Switch theme",
    zh: "切换深浅色",
  },
  "common.skipToContent": {
    en: "Skip to content",
    zh: "跳到正文",
  },
  "common.menu": {
    en: "Menu",
    zh: "菜单",
  },
  "common.close": {
    en: "Close",
    zh: "关闭",
  },
  "common.language": {
    en: "Language",
    zh: "语言",
  },
  "downloads.accountRequired": {
    en: "Sign in for free to download the full pack.",
    zh: "免费登录泳者账号，就能一次下载整包。",
  },
  "common.machine": { en: "Auto-translated · new tab", zh: "自动翻译 · 新标签页" },
  "common.mainNav": {
    en: "Main navigation",
    zh: "主导航",
  },
  "common.copy": {
    en: "Copy",
    zh: "复制",
  },
  "common.copied": {
    en: "Copied",
    zh: "已复制",
  },
  "common.next": {
    en: "Next: {name}",
    zh: "下一位：{name}",
  },
  "nav.samples": { en: "Clips", zh: "短片" },
  "nav.learn": { en: "How to use", zh: "怎么用" },
  "nav.cast": { en: "My cast", zh: "选角单" },
  "nav.works": {
    en: "Works",
    zh: "作品",
  },
  "nav.studio": {
    en: "Studio",
    zh: "工作室",
  },
  "home.metaTitle": {
    en: "SWIMMER PARTY — Original AI Animated Actors",
    zh: "SWIMMER PARTY · 原创 AI 动画演员",
  },
  "home.heroLines.0": { en: "Free AI animated actors.", zh: "免费 AI 动画演员。" },
  "home.heroLines.1": {
    en: "Same look in any AI tool.",
    zh: "换工具也长一样。",
  },
  "home.heroBody": {
    en: "Free pictures, voices, and prompts, even for paid work. Clips below: one actor made in two tools.",
    zh: "图片、声音、提示词免费，赚钱也行。下面短片用两个工具拍同一演员。",
  },
  "home.ctaAssets": { en: "See actors", zh: "去挑演员" },
  "home.readyCount": { en: "{count} ready", zh: "{count} 位能用" },
  "home.newFaceCount": {
    en: "{count, plural, one {# new face} other {# new faces}}",
    zh: "{count, plural, other {# 位新面孔}}",
  },
  "home.samplesTitle": { en: "Official clips", zh: "官方短片" },
  "home.rosterTitle": { en: "Ready to use", zh: "现在能用的演员" },
  "home.rosterMore": { en: "See all actors", zh: "看全部演员" },
  "home.newFacesNote": {
    en: "Vote for who gets a full pack next.",
    zh: "投票选先做谁的完整包。",
  },
  "roster.metaTitle": {
    en: "Actors",
    zh: "演员",
  },
  "roster.metaDescription": {
    en: "All original AI animated actors from SWIMMER PARTY. Free for personal and paid work—just credit SwimInAI.",
    zh: "SWIMMER PARTY 全部原创 AI 动画演员。免费使用，赚钱也行，署名 SwimInAI 就好。",
  },
  "roster.appearance": { en: "Look", zh: "长相特点" },
  "roster.origin": { en: "From", zh: "地区" },
  "roster.role": { en: "Role type", zh: "适合演什么" },
  "roster.role.comedy": { en: "Comedy", zh: "喜剧" },
  "roster.role.boss": { en: "Boss", zh: "老板 / 总裁" },
  "roster.role.villain": { en: "Villain", zh: "反派" },
  "roster.role.crew": { en: "Film crew", zh: "剧组" },
  "roster.height": { en: "Height", zh: "身高" },
  "roster.hasVoice": { en: "With voice", zh: "有声音" },
  "roster.hasVideo": { en: "With video", zh: "有视频" },
  "roster.resultCount": { en: "{count} found", zh: "找到 {count} 位" },
  "roster.intro": {
    en: "{castable} ready now. {newFaces} new actors waiting for your vote.",
    zh: "{castable} 位现在能用，{newFaces} 位新演员等你投票。",
  },
  "roster.castableTitle": {
    en: "Ready to use",
    zh: "现在能用的演员",
  },
  "roster.buildingTitle": {
    en: "Coming soon",
    zh: "制作中",
  },
  "works.metaTitle": { en: "Clips and studio projects", zh: "短片与工作室项目" },
  "works.metaDescription": {
    en: "Watch short clips made with our AI actors, and see what our studio is making.",
    zh: "看 AI 演员拍出的短片，以及工作室正在做的项目。",
  },
  "works.eyebrow": { en: "Clips", zh: "短片" },
  "works.heroLines.0": { en: "Watch these short clips.", zh: "先看看这些短片。" },
  "works.heroLines.1": { en: "See how the actors perform.", zh: "看看演员演得怎么样。" },
  "works.intro": {
    en: "See what people made. Like an actor? Download their files.",
    zh: "看看大家拍的短片，喜欢哪位演员就下载去用。",
  },
  "studio.projectsTitle": { en: "Studio projects", zh: "工作室项目" },
  "studio.viewProject": { en: "View project", zh: "查看项目" },
  "roster.readiness": { en: "Status", zh: "能不能用" },
  "roster.filters.ready": { en: "Ready", zh: "现在能用" },
  "roster.filters.newFaces": { en: "Vote next", zh: "新演员" },
  "roster.toolsLegend": {
    en: "The tool name on each card shows what made that clip.",
    zh: "卡片上的工具名，就是做这段短片用的工具。",
  },
  "license.browseActors": { en: "See actors", zh: "去挑演员" },
  "studio.metaTitle": {
    en: "Studio",
    zh: "工作室",
  },
  "studio.metaDescription": {
    en: "How SWIMMER PARTY makes AI actors who stay the same in every tool.",
    zh: "SWIMMER PARTY 怎么做 AI 演员，让他们在每个工具里都是同一个人。",
  },
  "studio.eyebrow": {
    en: "Studio",
    zh: "工作室",
  },
  "studio.heroLines.0": {
    en: "We are a small studio.",
    zh: "我们是一家小工作室。",
  },
  "studio.heroLines.1": {
    en: "We make original animated actors.",
    zh: "我们设计原创动画演员。",
  },
  "studio.intro": {
    en: "We design original animated actors and share their pictures and voices for free.",
    zh: "我们设计原创动画演员，把他们的图片和声音免费给大家用。",
  },
  "studio.beliefsLabel": { en: "How we work", zh: "怎么做的" },
  "studio.beliefsTitle": { en: "Made for your stories", zh: "方便你拿去拍故事" },
  "studio.beliefs.0.n": {
    en: "01",
    zh: "01",
  },
  "studio.beliefs.0.title": { en: "More than one photo", zh: "不止一张正脸照" },
  "studio.beliefs.0.body": {
    en: "Full-body angles, faces, voices, and prompts are ready to use.",
    zh: "全身各角度、表情、声音和提示词都备好，拿来就能用。",
  },
  "studio.beliefs.1.n": {
    en: "02",
    zh: "02",
  },
  "studio.beliefs.1.title": {
    en: "Animated, never real people",
    zh: "只做动画角色，不用真人",
  },
  "studio.beliefs.1.body": {
    en: "Original cartoon characters, never copies of real people.",
    zh: "每个演员都是原创动画形象，绝不照抄真人。",
  },
  "studio.beliefs.2.n": {
    en: "03",
    zh: "03",
  },
  "studio.beliefs.2.title": {
    en: "Free for any work",
    zh: "免费给大家用",
  },
  "studio.beliefs.2.body": {
    en: "Free for personal and paid work. Just credit SwimInAI and follow our simple rules.",
    zh: "自己用、赚钱用都免费，只要署名 SwimInAI 并遵守简单规则。",
  },
  "studio.beliefs.3.n": {
    en: "04",
    zh: "04",
  },
  "studio.beliefs.3.title": {
    en: "Made to really act",
    zh: "表情动作都能演戏",
  },
  "studio.beliefs.3.body": {
    en: "Watch our short clips to see their faces, voices, and personality.",
    zh: "去短片里看看他们的表情、动作和说话的样子。",
  },
  "studio.missionLabel": {
    en: "Why we do this",
    zh: "我们为什么做这件事",
  },
  "studio.missionTitle": {
    en: "Helpful AI for everyone",
    zh: "让人人都能用好 AI",
  },
  "studio.missionBody": {
    en: "We share ready-made actors for free so anyone can tell their own stories.",
    zh: "把做好的人物免费开放，普通人也能拍出自己的故事。",
  },
  "studio.missionLine": { en: "Bring your story and start making.", zh: "你有故事，就能开拍。" },
  "studio.missionLink": {
    en: "See what we’ve released at SwimInAI.com",
    zh: "去 SwimInAI.com 看我们已经发布的作品",
  },
  "casting.routes.1.title": {
    en: "Custom actor",
    zh: "定制演员",
  },
  "casting.routes.1.body": {
    en: "We design a new actor just for your brand or film. Only you can use them.",
    zh: "专门为你的品牌或片子设计一位新演员，只给你用。",
  },
  "casting.routes.2.title": {
    en: "Co-produce",
    zh: "一起拍片",
  },
  "casting.routes.2.body": {
    en: "We bring the actors and production; you bring the idea, the channel or the money. We own the film together.",
    zh: "我们出演员和制作，你出点子、渠道或资金，片子一起拥有。",
  },
  "notFound.eyebrow": { en: "404 · Page not found", zh: "404 · 找不到页面" },
  "notFound.lines.0": {
    en: "We can't find this page.",
    zh: "找不到这一页。",
  },
  "notFound.lines.1": {
    en: "Go meet our actors instead.",
    zh: "去看看我们的演员吧。",
  },
  "notFound.cta": {
    en: "See all actors",
    zh: "去看全部演员",
  },
  "footer.contact": {
    en: "Contact",
    zh: "联系",
  },
  "footer.contactNote": {
    en: "Custom actors and co-productions",
    zh: "定制演员和一起拍片",
  },
  "footer.rights": {
    en: "© {year} SwimInAI",
    zh: "© {year} SwimInAI",
  },
  "footer.project": {
    en: "A SwimInAI project, made by PieAI.",
    zh: "SwimInAI 旗下项目，由 PieAI 制作。",
  },
  "assets.series.turnaround": {
    en: "All angles",
    zh: "各角度",
  },
  "assets.series.face": {
    en: "Faces",
    zh: "面部",
  },
  "assets.series.expression": {
    en: "Expressions",
    zh: "表情",
  },
  "assets.series.wardrobe": {
    en: "Clothes",
    zh: "衣服",
  },
  "assets.series.pose": {
    en: "Poses",
    zh: "动作",
  },
  "assets.series.detail": {
    en: "Details",
    zh: "细节",
  },
  "actor.appearances": {
    en: "Videos",
    zh: "出演",
  },
  "actor.appearanceRole": {
    en: "as {role}",
    zh: "饰 {role}",
  },
  "assets.extended": {
    en: "More expressions",
    zh: "更多表情",
  },
  "assets.pending": {
    en: "Coming soon",
    zh: "还在制作",
  },
  "assets.legacy": {
    en: "Older",
    zh: "旧版",
  },
  "assets.slot.face.threeQuarterLeft": { en: "Other three-quarter", zh: "另一侧 3/4" },
  "assets.slot.face.sideRight": { en: "Other side", zh: "另一边侧面" },
  "assets.slot.face.up": { en: "Look up", zh: "仰头" },
  "assets.slot.face.down": { en: "Look down", zh: "低头" },
  "assets.slot.turnaround.backThreeQuarterLeft": {
    en: "Back 3/4 L",
    zh: "左后侧",
  },
  "assets.slot.turnaround.backThreeQuarterRight": {
    en: "Back 3/4 R",
    zh: "右后侧",
  },
  "assets.selectSeries": {
    en: "Select this group",
    zh: "全选这一组",
  },
  "assets.clear": {
    en: "Clear",
    zh: "清除",
  },
  "assets.selected": {
    en: "Selected {count} images",
    zh: "已选 {count} 张",
  },
  "assets.select": {
    en: "Select",
    zh: "选中",
  },
  "assets.downloadSelected": {
    en: "Download selected",
    zh: "下载所选",
  },
  "assets.download": { en: "Download all", zh: "下载全部" },
  "assets.audioState.idle": { en: "Press play to listen", zh: "点播放试听" },
  "assets.audioState.loading": { en: "Loading sound…", zh: "正在加载声音…" },
  "assets.audioState.ready": { en: "Ready to play", zh: "可以播放了" },
  "assets.audioState.failed": {
    en: "Audio failed to load. Try again.",
    zh: "声音加载失败，请重试。",
  },
  "assets.imageLoading": { en: "Loading image…", zh: "正在加载图片…" },
  "assets.imageFailed": { en: "Image failed to load.", zh: "图片加载失败。" },
  "assets.selectFirst": {
    en: "Select at least one image first.",
    zh: "请先勾选要下载的图片。",
  },
  "assets.downloadJson": {
    en: "Download actor info (JSON)",
    zh: "下载角色资料（JSON）",
  },
  "assets.noSeed": {
    en: "Not ready yet.",
    zh: "还没做好。",
  },
  "assets.guestCooldown": {
    en: "Wait {seconds}s, or sign in free to skip it",
    zh: "等 {seconds} 秒，或免费登录不用等",
  },
  "assets.signIn": {
    en: "Sign in (free)",
    zh: "免费登录",
  },
  "assets.signingIn": { en: "Opening…", zh: "正在前往…" },
  "assets.signInBenefits.0": {
    en: "Download all of an actor’s photos and voices at once",
    zh: "一键打包下载演员的全部图片和声音",
  },
  "assets.signInBenefits.1": { en: "Post your work, like and vote", zh: "发作品、点赞、投票" },
  "assets.signInBenefits.2": {
    en: "Combine pictures into one 4K reference sheet",
    zh: "自选图片拼成 4K 参考大图",
  },
  "assets.signInBenefits.3": {
    en: "No 30-second wait between downloads",
    zh: "连续下载不用等 30 秒",
  },
  "assets.signInConsent": {
    en: "By signing in, you agree to our Terms of Use and Privacy Policy.",
    zh: "登录代表你同意《使用条款》和《隐私政策》。",
  },
  "assets.signInTitle": { en: "Sign in free to download packs", zh: "免费登录，一键打包下载" },
  "assets.signInBody": {
    en: "Download single pictures anytime. Sign in free for full packs and reference sheets.",
    zh: "单张图片随便下；要下整包或拼参考图，免费登录就行。",
  },
  "assets.notNow": {
    en: "Not now",
    zh: "以后再说",
  },
  "account.menuLabel": {
    en: "Account: {name}",
    zh: "账号：{name}",
  },
  "account.siteTab": {
    en: "Site",
    zh: "本站",
  },
  "account.productsTab": {
    en: "Products",
    zh: "全部产品",
  },
  "account.accountTab": {
    en: "Account",
    zh: "账号",
  },
  "account.current": {
    en: "Current",
    zh: "当前",
  },
  "account.manage": {
    en: "Account settings",
    zh: "账号与安全设置",
  },
  "account.signOut": {
    en: "Sign out",
    zh: "退出登录",
  },
  "account.cast": {
    en: "My cast",
    zh: "选角单",
  },
  "account.castCount": {
    en: "Actors in cast: {count}",
    zh: "已选 {count} 位演员",
  },
  "assets.dialogTitle": {
    en: "Download selected",
    zh: "下载所选",
  },
  "assets.format.zip": {
    en: "Originals",
    zh: "原图",
  },
  "assets.format.zipNote": {
    en: "Separate transparent PNG pictures, plus actor info and rules.",
    zh: "每张都是透明背景 PNG 图，带角色资料和使用说明。",
  },
  "assets.format.model": {
    en: "By tool",
    zh: "按工具",
  },
  "assets.format.modelNote": {
    en: "Picks the best pictures for this tool and includes a prompt.",
    zh: "按你选的工具自动挑好图，并附上提示词。",
  },
  "assets.labels": {
    en: "Labels on the sheet",
    zh: "图上标签",
  },
  "assets.labels.none": {
    en: "None",
    zh: "不加",
  },
  "assets.background": {
    en: "Background",
    zh: "底色",
  },
  "assets.background.light": {
    en: "Light grey",
    zh: "浅灰",
  },
  "assets.background.white": {
    en: "White",
    zh: "白",
  },
  "assets.background.dark": {
    en: "Dark grey",
    zh: "深灰",
  },
  "assets.model": {
    en: "Model",
    zh: "模型",
  },
  "assets.overLimit": {
    en: "You picked {count}. This tool takes {limit}, so we'll keep the best.",
    zh: "已选 {count} 张，这个工具最多收 {limit} 张，帮你挑最合适的。",
  },
  "assets.start": {
    en: "Start download",
    zh: "开始下载",
  },
  "assets.preparing": {
    en: "Preparing…",
    zh: "准备中…",
  },
  "assets.started": {
    en: "Download started.",
    zh: "已开始下载。",
  },
  "assets.cancel": {
    en: "Cancel",
    zh: "取消",
  },
  "assets.navigation": {
    en: "Sections",
    zh: "页面目录",
  },
  "assets.failed": {
    en: "Something went wrong. Try again.",
    zh: "出了点问题，请再试一次。",
  },
  "assets.exportFormat": {
    en: "Download format",
    zh: "下载格式",
  },
  "assets.preview": {
    en: "Sheet preview",
    zh: "拼图预览",
  },
  "assets.originalsSource": {
    en: "Original full-size PNG pictures, plus actor info and rules.",
    zh: "原尺寸的 PNG 图片，带角色资料和使用说明。",
  },
  "assets.originalsLegacy": {
    en: "Original picture files (including older WebP), plus actor info and rules.",
    zh: "原始图片文件（含旧版 WebP），带角色资料和使用说明。",
  },
  "assets.veoMissing": {
    en: "Expressions are still being made. The Veo pack comes after.",
    zh: "表情图还在做，做好就能下 Veo 包。",
  },
  "assets.seedanceUnverified": {
    en: "Packs the best 9 pictures.",
    zh: "打包 9 张最合适的图。",
  },
  "assets.slot.turnaround.front": {
    en: "Front",
    zh: "正面",
  },
  "assets.slot.turnaround.threeQuarter": {
    en: "Front-side",
    zh: "斜正面",
  },
  "assets.slot.turnaround.side": {
    en: "Side",
    zh: "侧面",
  },
  "assets.slot.turnaround.back": {
    en: "Back",
    zh: "背面",
  },
  "assets.slot.face.front": {
    en: "Front",
    zh: "正面",
  },
  "assets.slot.face.threeQuarter": {
    en: "Front-side",
    zh: "斜正面",
  },
  "assets.slot.face.side": {
    en: "Side",
    zh: "侧面",
  },
  "assets.slot.expression.neutral": {
    en: "Calm",
    zh: "平静",
  },
  "assets.slot.expression.smile": {
    en: "Smile",
    zh: "浅笑",
  },
  "assets.slot.expression.laugh": {
    en: "Laugh",
    zh: "大笑",
  },
  "assets.slot.expression.sad": {
    en: "Sad",
    zh: "难过",
  },
  "assets.slot.expression.cry": {
    en: "Cry",
    zh: "哭泣",
  },
  "assets.slot.expression.annoyed": {
    en: "Annoyed",
    zh: "烦躁",
  },
  "assets.slot.expression.angry": {
    en: "Angry",
    zh: "发怒",
  },
  "assets.slot.expression.surprised": {
    en: "Surprised",
    zh: "惊讶",
  },
  "assets.slot.expression.scared": {
    en: "Scared",
    zh: "害怕",
  },
  "assets.slot.expression.disgusted": {
    en: "Disgusted",
    zh: "嫌弃",
  },
  "assets.slot.expression.embarrassed": {
    en: "Embarrassed",
    zh: "尴尬",
  },
  "assets.slot.expression.tired": {
    en: "Tired",
    zh: "疲惫",
  },
  "assets.slot.expression.speaking": {
    en: "Talk",
    zh: "说话",
  },
  "assets.slot.expression.eyesClosed": {
    en: "Eyes closed",
    zh: "闭眼",
  },
  "assets.slot.expression.worried": {
    en: "Worry",
    zh: "发愁",
  },
  "assets.slot.expression.skeptical": {
    en: "Doubt",
    zh: "怀疑",
  },
  "assets.slot.expression.smug": {
    en: "Smug",
    zh: "得意",
  },
  "assets.slot.expression.contempt": {
    en: "Scorn",
    zh: "不屑",
  },
  "assets.slot.expression.confused": {
    en: "Puzzled",
    zh: "困惑",
  },
  "assets.slot.expression.thinking": {
    en: "Think",
    zh: "思考",
  },
  "assets.slot.expression.determined": {
    en: "Determined",
    zh: "坚定",
  },
  "assets.slot.expression.shy": {
    en: "Shy",
    zh: "害羞",
  },
  "assets.slot.expression.pain": {
    en: "In pain",
    zh: "吃痛",
  },
  "assets.slot.expression.sleepy": {
    en: "Sleepy",
    zh: "犯困",
  },
  "assets.slot.expression.awkwardSmile": {
    en: "Fake grin",
    zh: "假笑",
  },
  "assets.slot.expression.deadpan": {
    en: "Blank",
    zh: "面无表情",
  },
  "assets.slot.wardrobe.front": {
    en: "Front",
    zh: "正面",
  },
  "assets.slot.wardrobe.threeQuarter": {
    en: "Front-side",
    zh: "斜正面",
  },
  "assets.slot.wardrobe.side": {
    en: "Side",
    zh: "侧面",
  },
  "assets.slot.wardrobe.back": {
    en: "Back",
    zh: "背面",
  },
  "assets.slot.pose.walk": {
    en: "Walk",
    zh: "走路",
  },
  "assets.slot.pose.run": {
    en: "Run",
    zh: "跑步",
  },
  "assets.slot.pose.sit": {
    en: "Sit",
    zh: "坐着",
  },
  "assets.slot.pose.point": {
    en: "Point",
    zh: "指向",
  },
  "assets.slot.pose.armsCrossed": {
    en: "Arms crossed",
    zh: "抱臂",
  },
  "assets.slot.pose.phone": {
    en: "On the phone",
    zh: "打电话",
  },
  "assets.slot.detail.hands": {
    en: "Hands",
    zh: "手部",
  },
  "assets.slot.detail.hairBack": {
    en: "Back of head",
    zh: "后脑",
  },
  "assets.slot.detail.prop": {
    en: "Special item",
    zh: "随身物品",
  },
  "common.share": {
    en: "Share",
    zh: "分享",
  },
  "nav.license": {
    en: "Free to use",
    zh: "免费使用",
  },
  "nav.privacy": {
    en: "Privacy",
    zh: "隐私",
  },
  "nav.terms": {
    en: "Terms",
    zh: "条款",
  },
  "nav.actors": {
    en: "Actors",
    zh: "演员",
  },
  "home.updatesTitle": {
    en: "Recently added",
    zh: "最近更新",
  },
  "roster.newFacesTitle": {
    en: "Vote next",
    zh: "新演员",
  },
  "roster.search": {
    en: "Search by name",
    zh: "按名字搜索",
  },
  "roster.filters": {
    en: "Filters",
    zh: "筛选",
  },
  "roster.moreFilters": { en: "More filters", zh: "更多筛选" },
  "roster.lessFilters": { en: "Fewer filters", zh: "收起筛选" },
  "roster.filtersApplied": {
    en: "{count} more active",
    zh: "已选另外 {count} 项",
  },
  "roster.gender": {
    en: "Gender",
    zh: "性别",
  },
  "roster.age": {
    en: "Age",
    zh: "年龄",
  },
  "roster.language": {
    en: "Language",
    zh: "语言",
  },
  "roster.clear": {
    en: "Clear filters",
    zh: "清除筛选",
  },
  "roster.noResults": {
    en: "No match. Try fewer filters.",
    zh: "没找到，少选几个条件试试。",
  },
  "actor.openLibrary": {
    en: "Download starter pack",
    zh: "下载起步包",
  },
  "actor.freeFrontDownload": { en: "Download front photo (free)", zh: "免费下这张正面图" },
  "actor.fullPack": { en: "Download all files", zh: "下载全部文件" },
  "actor.starterFacts": {
    en: "Starter pack: {count} images + prompt, about {size} MB.",
    zh: "起步包：{count} 张图 + 提示词，约 {size} MB。",
  },
  "actor.fullPackFacts": {
    en: "Full pack: {images} images and {voices} voice clips, about {size} MB.",
    zh: "完整包：{images} 张图、{voices} 段声音，约 {size} MB。",
  },
  "actor.guestNote": {
    en: "Download single pictures now. Sign in free to skip the wait.",
    zh: "单张免登录直接下；免费登录不用等。",
  },
  "actor.workWithUs": {
    en: "How to credit",
    zh: "怎么署名",
  },
  "actor.roleTbd": {
    en: "Role coming soon",
    zh: "角色未定",
  },
  "actor.noCredits": {
    en: "{name} hasn't starred in anything yet. Make it your film!",
    zh: "{name}还没演过戏，让 TA 在你的片子里当主角吧！",
  },
  "actor.voiceTitle": {
    en: "Hear {name}",
    zh: "听听{name}的声音",
  },
  "actor.versionHistory": {
    en: "Version history",
    zh: "版本记录",
  },
  "actor.versionNote": {
    en: "1st number: new look · 2nd: new pictures or voices · 3rd: small fixes",
    zh: "第 1 位：换新形象 · 第 2 位：加新图片或声音 · 第 3 位：小修改",
  },
  "assets.series.voice": {
    en: "Voice",
    zh: "声音",
  },
  "assets.series.video": {
    en: "Video",
    zh: "视频",
  },
  "assets.series.howTo": {
    en: "How to use",
    zh: "怎么用",
  },
  "assets.series.rules": {
    en: "Rules of use",
    zh: "使用规则",
  },
  "assets.videoNote": {
    en: "Short clips for reference and editing.",
    zh: "用于参考和剪辑的短片。",
  },
  "assets.voicePlaceholder": {
    en: "Test voice",
    zh: "临时试音",
  },
  "assets.voicePlaceholderNote": {
    en: "Temporary test voice",
    zh: "临时试音",
  },
  "assets.voiceReference": {
    en: "Reference",
    zh: "参考音",
  },
  "assets.showLines": {
    en: "Show lines",
    zh: "看台词",
  },
  "assets.hideLines": {
    en: "Hide lines",
    zh: "收起台词",
  },
  "assets.downloadWav": {
    en: "Download audio",
    zh: "下载音频",
  },
  "assets.viewLarger": {
    en: "View larger: {name}",
    zh: "查看大图：{name}",
  },
  "assets.imageViewer": {
    en: "Image viewer",
    zh: "图片查看器",
  },
  "assets.previous": {
    en: "Previous image",
    zh: "上一张",
  },
  "assets.next": {
    en: "Next image",
    zh: "下一张",
  },
  "assets.zoomIn": {
    en: "Zoom in",
    zh: "放大",
  },
  "assets.zoomOut": {
    en: "Zoom out",
    zh: "缩小",
  },
  "assets.downloadThis": {
    en: "Download this image",
    zh: "下载这一张",
  },
  "assets.downloadNamed": {
    en: "Download {name}",
    zh: "下载：{name}",
  },
  "assets.loading": {
    en: "Loading…",
    zh: "加载中…",
  },
  "assets.howTo.1": {
    en: "Download the full-body front and the front face.",
    zh: "下载正面全身和正面头像这两张。",
  },
  "assets.howTo.2": {
    en: "Copy the character prompt below.",
    zh: "复制下面的角色提示词。",
  },
  "assets.howTo.3": {
    en: "Open your AI tool, upload both images, paste the prompt, describe your scene.",
    zh: "打开你的 AI 工具，传这两张图，贴上提示词，写下你想要的场景。",
  },
  "assets.howTo.newFace1": {
    en: "Download this full-body photo.",
    zh: "下载这张全身照。",
  },
  "assets.howTo.newFace3": {
    en: "Open your AI tool, upload the photo, paste the prompt, describe your scene.",
    zh: "打开你的 AI 工具，传这张图，贴上提示词，写下你想要的场景。",
  },
  "assets.characterPrompt": {
    en: "{name} · Character prompt",
    zh: "{name} · 角色提示词",
  },
  "assets.characterPromptNote": {
    en: "Copy and paste as is.",
    zh: "直接复制粘贴就行。",
  },
  "assets.rulesTitle": {
    en: "Just one rule: credit SwimInAI.",
    zh: "只有一个要求：写上 SwimInAI。",
  },
  "assets.rulesBody": {
    en: "Use {name} anywhere, even for paid work. Add a small “SwimInAI” at the start and end of a video, or in an image corner.",
    zh: "{name}随便用，赚钱也行。视频片头和片尾、图片角落，写一行小字“SwimInAI”。",
  },
  "assets.copyCredit": {
    en: "Copy credit: {name} · SwimInAI",
    zh: "复制署名：{name} · SwimInAI",
  },
  "assets.castingPhoto": {
    en: "Casting photo",
    zh: "试镜照",
  },
  "assets.rulesPact": {
    en: "Free to use · Privacy · Terms",
    zh: "免费使用 · 隐私 · 条款",
  },
  "assets.voice.intro": {
    en: "Self-introduction",
    zh: "自我介绍",
  },
  "assets.voice.introAlt": {
    en: "Second-language intro",
    zh: "第二语言自我介绍",
  },
  "assets.voice.chat": {
    en: "Casual talk",
    zh: "日常聊天",
  },
  "assets.voice.happy": {
    en: "Happy",
    zh: "开心",
  },
  "assets.voice.angry": {
    en: "Angry",
    zh: "生气",
  },
  "assets.voice.sad": {
    en: "Sad",
    zh: "难过",
  },
  "assets.video.turntable": {
    en: "360° turn",
    zh: "一圈转身",
  },
  "assets.video.intro": {
    en: "Self-introduction",
    zh: "自我介绍",
  },
  "assets.video.walk": {
    en: "Walking clip",
    zh: "走路片段",
  },
  "assets.video.expressions": {
    en: "Expressions clip",
    zh: "表情合集",
  },
  "works.ourProductions": {
    en: "Made by us",
    zh: "我们拍的",
  },
  "works.starring": {
    en: "Starring",
    zh: "主演",
  },
  "works.castTitle": {
    en: "Cast",
    zh: "演员表",
  },
  "works.playedBy": {
    en: "played by {actor}",
    zh: "{actor} 饰",
  },
  "works.roleTbd": {
    en: "Role coming soon",
    zh: "角色未定",
  },
  "works.episodes": {
    en: "Episodes",
    zh: "分集",
  },
  "footer.claim": {
    en: "Original animated AI actors, free for everyone to use.",
    zh: "谁都能免费用的原创 AI 动画演员库。",
  },
  "common.breadcrumb": {
    en: "Page path",
    zh: "当前位置",
  },
  "assets.versionLabel": {
    en: "Version {version}. Show history",
    zh: "版本 {version}，查看版本记录",
  },
  "assets.current": {
    en: "Current",
    zh: "当前",
  },
  "assets.close": {
    en: "Close",
    zh: "关闭",
  },
  "assets.cooldownBadge": {
    en: "{seconds}s",
    zh: "{seconds} 秒",
  },
  "assets.voice.roleMaid": { en: "Role: maid", zh: "角色：女佣" },
  "assets.voice.roleCeo": { en: "Role: boss", zh: "角色：总裁" },
  "community.reviewTitle": { en: "Review queue", zh: "审核队列" },
  "community.reviewEmpty": { en: "Nothing to review.", zh: "没有待审核的。" },
  "samples.play": { en: "Play clip", zh: "播放短片" },
  "samples.loading": { en: "Loading the video…", zh: "正在加载视频…" },
  "samples.closePreview": { en: "Close video", zh: "关闭视频" },
  "samples.playFailed": {
    en: "Could not load this video. Try again later.",
    zh: "视频打不开，过会儿再试。",
  },
  "samples.label.solo": { en: "Solo", zh: "单人" },
  "samples.label.action": { en: "Action", zh: "动作" },
  "samples.label.two-actors": { en: "Two actors", zh: "双人" },
  "samples.worksTitle": { en: "Same actor, different tools", zh: "同一个演员，不同工具" },
  "samples.actorTitle": { en: "Same {name}, different tools", zh: "同一个{name}，不同工具" },
  "samples.official": { en: "By SWIMMER PARTY", zh: "SWIMMER PARTY 出品" },
  "samples.seeAll": { en: "See all clips", zh: "看全部短片" },
  "samples.videoLabel": {
    en: "{name} · {tool} video clip",
    zh: "{name} · {tool} 短片",
  },
  "home.keywords.aiActor": { en: "AI actor", zh: "AI 演员" },
  "home.keywords.animatedCharacter": { en: "animated character", zh: "动画角色" },
  "home.keywords.syntheticTalent": { en: "animated AI actor", zh: "AI 动画演员" },
  "home.keywords.cgCharacter": { en: "CG character", zh: "CG 角色" },
  "home.keywords.characterLicensing": { en: "character licensing", zh: "角色授权" },
  "home.keywords.virtualTalent": { en: "virtual character", zh: "虚拟角色" },
  "home.keywords.brand": { en: "SWIMMER PARTY", zh: "SWIMMER PARTY" },
  "home.ogTitle": { en: "Original AI animated actors", zh: "原创 AI 动画演员" },
  "home.ogSubtitle": {
    en: "Same look in every tool · Free to use",
    zh: "换工具也长一个样 · 免费使用",
  },
  "home.licenseBadge": {
    en: "Free, paid OK · Credit SwimInAI",
    zh: "免费可赚钱 · 署名 SwimInAI",
  },
  "home.licenseCta": { en: "How to credit", zh: "怎么署名" },
  "cast.title": { en: "My cast", zh: "选角单" },
  "cast.eyebrow": { en: "Cast", zh: "选角单" },
  "cast.intro": {
    en: "Pick your actors. Take them all at once.",
    zh: "选好演员，一次打包带走。",
  },
  "license.badge": { en: "Free to use · v1.0", zh: "免费使用 · v1.0" },
  "license.creditTitle": { en: "How to credit", zh: "怎么署名" },
  "license.creditNote": {
    en: "Any one of these counts. “SwimInAI” always stays in English; the words around it can be in any language.",
    zh: "下面任选一种都算。“SwimInAI”这几个字始终写英文，前后的话用什么语言都行。",
  },
  "license.creditFavourite": {
    en: "We love it when you name the actor. If your work makes them famous, we'll contact you first.",
    zh: "我们最推荐写上演员名字。要是这位演员被你拍火了，以后有合作先找你。",
  },
  "license.copyCredit": { en: "Copy credit", zh: "复制署名" },
  "license.whereTitle": { en: "Where to put the credit", zh: "署名放哪里" },
  "license.whereMade": { en: "Your work", zh: "你做什么" },
  "license.wherePlacement": { en: "Where it goes", zh: "写在哪里" },
  "license.whereSize": { en: "Text size", zh: "字写多大" },
  "license.markTitle": { en: "Credit logo", zh: "署名图" },
  "license.markNote": {
    en: "Pure white or pure black, on a transparent background. Drop it into any editor.",
    zh: "纯白和纯黑两种，透明背景，直接拖进剪辑或修图软件就能用。",
  },
  "license.downloadWhite": { en: "Download white", zh: "下载纯白" },
  "license.downloadBlack": { en: "Download black", zh: "下载纯黑" },
  "license.canTitle": { en: "You can", zh: "可以" },
  "license.cannotTitle": { en: "You can’t", zh: "不可以" },
  "license.faqTitle": { en: "Questions people ask", zh: "常见问题" },
  "license.promisesTitle": { en: "Our promises", zh: "我们的承诺" },
  "license.effectiveNote": {
    en: "License v1.0 · Starts 8 October 2026 · Part of our Terms of Use",
    zh: "免费规则 v1.0 · 2026 年 10 月 8 日生效 · 属于《使用条款》的一部分",
  },
  "legal.lastUpdated": { en: "Last updated 8 October 2026", zh: "最后更新：2026 年 10 月 8 日" },
  "studio.workWithUs": { en: "Work with us", zh: "找我们合作" },
  "studio.cooperationTitle": { en: "Two ways to work together", zh: "两种合作方式" },
  "studio.cooperationNote": {
    en: "All actors on the site are free. Need something custom?",
    zh: "网上的演员全都免费。想要定制或合作？",
  },
  "works.rolePrefix": { en: "as", zh: "饰" },
  "actor.newFaceDescription": {
    en: "Hear the voice. Like them? Vote.",
    zh: "先听听声音，喜欢就投一票。",
  },
  "community.postTitle": { en: "Works", zh: "作品" },
  "roster.filters.all": { en: "All", zh: "全部" },
  "roster.filters.women": { en: "Women", zh: "女" },
  "roster.filters.men": { en: "Men", zh: "男" },
  "roster.filters.under30": { en: "Under 30", zh: "30 岁以下" },
  "roster.filters.over45": { en: "Over 45", zh: "45 岁以上" },
  "roster.filters.english": { en: "English", zh: "英语" },
  "roster.filters.chinese": { en: "Chinese", zh: "中文" },
  "cast.empty": {
    en: "Your cast is empty. Go pick some actors.",
    zh: "选角单还空着，去演员页挑几位吧。",
  },
  "cast.pickActors": { en: "Pick actors", zh: "去挑演员" },
  "cast.count": { en: "{count} actors", zh: "{count} 位演员" },
  "cast.downloading": { en: "Downloading…", zh: "下载中…" },
  "cast.downloadPack": { en: "Download all in cast", zh: "打包下载全组" },
  "cast.share": { en: "Share cast", zh: "分享选角单" },
  "cast.creditPrefix": { en: "Credit: ", zh: "署名：" },
  "cast.copyCredit": { en: "Copy credit", zh: "复制署名" },
  "cast.clear": { en: "Clear cast", zh: "清空" },
  "cast.failed": { en: "Something went wrong. Try again.", zh: "出了点问题，请再试一次。" },
  "cast.remove": { en: "Remove", zh: "移出" },
  "cast.added": { en: "In your cast", zh: "已在选角单" },
  "cast.add": { en: "Add to cast", zh: "加入选角单" },
  "community.intro": {
    en: "Works made by creators using our actors.",
    zh: "大家用本站演员做出的作品。",
  },
  "community.openForm": { en: "Post your work", zh: "发布作品" },
  "community.titleLabel": { en: "Title", zh: "标题" },
  "community.descriptionPlaceholder": { en: "Description (optional)", zh: "简介（可选）" },
  "community.recipePlaceholder": {
    en: "How you made it: prompt or steps (optional)",
    zh: "怎么做的：提示词或步骤（可选）",
  },
  "community.toolPlaceholder": {
    en: "What did you make it with? (optional)",
    zh: "用什么做的？（可选）",
  },
  "community.creditConfirmation": {
    en: "My work credits SwimInAI.",
    zh: "我的作品里署了 SwimInAI。",
  },
  "community.rightsConfirmation": {
    en: "I made this myself and followed the site rules.",
    zh: "这是我自己做的，并遵守了本站的使用规则。",
  },
  "community.author": { en: "by {author}", zh: "作者：{author}" },
  "community.reported": { en: "Thanks. We’ll take a look.", zh: "谢谢，我们会看一下。" },
  "community.report": { en: "Report this post", zh: "举报这个作品" },
  "community.starring": { en: "Starring {actors}", zh: "出演：{actors}" },
  "community.delete": { en: "Delete", zh: "删除" },
  "community.voteLabel": { en: "Vote for {name}", zh: "投给{name}" },
  "license.heroLines.0": {
    en: "Free for personal and paid work.",
    zh: "自己用、赚钱用都免费。",
  },
  "license.metaDescription": {
    en: "Use SWIMMER PARTY’s animated actors for free in personal and paid work. Credit SwimInAI and follow the rules below.",
    zh: "SWIMMER PARTY 的动画演员可免费用于个人和赚钱项目。写上 SwimInAI，并遵守下面的简单规则。",
  },
  "license.intro": {
    en: "Use our actors free in films, ads, games, comics, music and merch. No need to ask. Just credit SwimInAI.",
    zh: "电影、广告、游戏、漫画、音乐、周边，都能免费用，不用申请。记得署名 SwimInAI。",
  },
  "license.heroLines.1": { en: "Just credit SwimInAI.", zh: "只要写上 SwimInAI 就行。" },
  "common.languageName.zh": { en: "中文", zh: "中文" },
  "common.languageName.en": { en: "English", zh: "English" },
  "community.kind.image": { en: "Image", zh: "图片" },
  "community.kind.video": { en: "Video", zh: "视频" },
  "community.kind.audio": { en: "Audio", zh: "声音" },
  "common.breadcrumbFallback": { en: "Page path", zh: "当前位置" },
  "sheet.action": {
    en: "Make reference sheet",
    zh: "拼参考图",
  },
  "sheet.crumb": {
    en: "Reference sheet",
    zh: "参考图",
  },
  "sheet.title": {
    en: "{name} · Reference sheet",
    zh: "{name} · 参考拼图",
  },
  "sheet.metaTitle": {
    en: "{name} reference sheet",
    zh: "{name}的参考拼图",
  },
  "sheet.lead": {
    en: "Pick pictures of {name} to make one 4K reference sheet.",
    zh: "挑几张{name}的图，拼成一张 4K 参考大图。",
  },
  "sheet.pick": {
    en: "Images",
    zh: "选图",
  },
  "sheet.preset.recommended": {
    en: "Recommended",
    zh: "推荐",
  },
  "sheet.preset.turnaround": {
    en: "All angles",
    zh: "角度",
  },
  "sheet.preset.expressions": {
    en: "Expressions",
    zh: "表情",
  },
  "sheet.preset.wardrobe": {
    en: "Clothes",
    zh: "衣服",
  },
  "sheet.preset.custom": {
    en: "Custom",
    zh: "自选",
  },
  "sheet.count": {
    en: "{count} selected, up to {max}",
    zh: "已选 {count} 张，最多 {max} 张",
  },
  "sheet.limit": {
    en: "Up to 16 images, 8 full-body.",
    zh: "最多 16 张，全身最多 8 张。",
  },
  "sheet.style": {
    en: "Style",
    zh: "样式",
  },
  "sheet.extras": {
    en: "Include",
    zh: "一起打包",
  },
  "sheet.withVoice": {
    en: "Voice ({count} clips)",
    zh: "声音（{count} 段）",
  },
  "sheet.withVideo": {
    en: "Video ({count} clips)",
    zh: "视频（{count} 段）",
  },
  "sheet.withPrompt": {
    en: "Prompt and info",
    zh: "提示词和资料",
  },
  "sheet.download": {
    en: "Download sheet",
    zh: "下载参考图",
  },
  "sheet.downloadZip": {
    en: "Download sheet + extras (ZIP)",
    zh: "下载参考图和附件（ZIP）",
  },
  "assets.makeSheet": {
    en: "Combine these into one sheet",
    zh: "用所选拼参考图",
  },
  "guide.helpLabel": {
    en: "How it works",
    zh: "怎么用",
  },
  "help.fullGuide": {
    en: "Full guide",
    zh: "看完整说明",
  },
  "help.starter.label": {
    en: "Starter pack",
    zh: "起步包",
  },
  "help.starter.title": {
    en: "Two pictures and a prompt, ready to use",
    zh: "两张图加提示词，马上就能用",
  },
  "help.starter.body": {
    en: "Full-body front, face front and the character prompt.\nUpload them to your AI tool and go.",
    zh: "全身正面、脸部正面和角色提示词。\n下载后上传到你的 AI 工具就能用。",
  },
  "help.starter.alt": {
    en: "Click Download starter pack to download",
    zh: "点「下载起步包」开始下载",
  },
  "help.sheet.label": {
    en: "Sheet",
    zh: "参考图",
  },
  "help.sheet.title": {
    en: "Pick a few pictures to make one reference sheet",
    zh: "挑几张图，拼成一张参考大图",
  },
  "help.sheet.body": {
    en: "Pick angles, faces, and clothes for one 4K picture.\nYou can also add voice and video.",
    zh: "选角度、表情和衣服，拼成一张 4K 图。\n还能带上声音和视频。",
  },
  "help.sheet.alt": {
    en: "Ticking pictures on the sheet page updates the preview",
    zh: "在拼图页勾选图片，预览会跟着更新",
  },
  "help.cast.label": {
    en: "Cast",
    zh: "选角单",
  },
  "help.cast.title": {
    en: "Several actors, one download",
    zh: "好几位演员，一次下载",
  },
  "help.cast.body": {
    en: "Add actors to your cast,\nthen download them all at once.",
    zh: "把演员加进选角单，\n一次打包下载。",
  },
  "help.cast.alt": {
    en: "After clicking Add to cast, the actor appears in My cast",
    zh: "加入选角单后，可在「选角单」里查看和下载",
  },
  "guide.metaTitle": {
    en: "How it works",
    zh: "怎么用",
  },
  "guide.footer": {
    en: "How it works",
    zh: "怎么用",
  },
  "firstUse.label": { en: "Quick tip", zh: "新手提示" },
  "firstUse.dismiss": { en: "Got it", zh: "知道了" },
  "firstUse.download.title": { en: "First download tips", zh: "第一次下载，接下来怎么用" },
  "firstUse.download.body": {
    en: "Keep the pictures and prompt together.\nSee 'How to use' for three ways to download.",
    zh: "把参考图和提示词保存在一起。\n「怎么用」里有三种下载方式。",
  },
  "firstUse.cast.title": { en: "Using My cast", zh: "第一次用选角单" },
  "firstUse.cast.body": {
    en: "Your cast lives in this browser.\nOpen it to share or download in one go.",
    zh: "选角单存在这个浏览器里。\n随时打开，分享或一次下载。",
  },
  "firstUse.post.title": { en: "Before you submit", zh: "投稿前的小提示" },
  "firstUse.post.body": {
    en: "Tick only the actors in your work.\nYour first post goes live after review.",
    zh: "只勾作品里用到的演员。\n第一次投稿，审核通过就公开。",
  },
  "firstUse.vote.title": { en: "First vote tips", zh: "第一次投票，看看规则" },
  "firstUse.vote.body": {
    en: "Cast your vote.\nMore votes mean we make their full pack sooner.",
    zh: "投一票吧。\n谁的票多，就先做谁的完整包。",
  },
  "firstUse.vote.condition": {
    en: "Sign in free with Swimmer to vote.",
    zh: "登录免费泳者账号就能投票。",
  },
  "downloads.authorizing": { en: "Preparing download…", zh: "正在准备下载…" },
  "downloads.fetching": { en: "Loading files…", zh: "正在读取文件…" },
  "downloads.filesProgress": {
    en: "{completed} / {total} files",
    zh: "{completed} / {total} 个文件",
  },
  "downloads.assembling": {
    en: "Packing your files…",
    zh: "文件读好了，正在打包…",
  },
  "learn.workflowPreview": { en: "How it works here", zh: "怎么操作" },
  "learn.start.starter": { en: "Start with one actor", zh: "从一位演员开始" },
  "learn.start.sheet": { en: "Make a reference sheet", zh: "拼一张参考图" },
  "learn.start.cast": { en: "Open My cast", zh: "打开选角单" },
  "learn.toolsTitle": { en: "Next: choose your tool", zh: "下一步，选你的工具" },
  "learn.toolIntro": {
    en: "Pick a tool. Upload your actor picture. Follow the steps and check what you get.",
    zh: "选一个工具，上传演员图，照着步骤试试。记得检查结果。",
  },
  "learn.readSteps": { en: "See the steps", zh: "看看怎么做" },
  "learn.before": { en: "Before you start", zh: "开始前要知道" },
  "learn.steps": { en: "Step-by-step", zh: "具体步骤" },
  "learn.inputPreview": {
    en: "Upload this reference image.",
    zh: "上传这张参考图。",
  },
  "learn.getReference": { en: "Download this picture", zh: "下载参考图" },
  "learn.prompt": { en: "Prompt to try", zh: "可尝试的提示词" },
  "learn.checkResult": { en: "Check the result", zh: "检查结果" },
  "learn.resultPreview": { en: "The actual result", zh: "实际做出的结果" },
  "learn.testedOn": { en: "Tested on {date}", zh: "实测日期：{date}" },
  "learn.noOutput": {
    en: "Results can look different each time. Check the face, hair, hands and outfit before using one.",
    zh: "每次做出的结果可能不一样。用之前先看清脸、头发、手和衣服。",
  },
  "learn.openTool": { en: "Open the tool ↗", zh: "打开工具 ↗" },
  "learn.externalCost": {
    en: "Opens another website.",
    zh: "会打开别的网站。",
  },
  "learn.sources": { en: "Tool guides", zh: "工具官方说明" },
  "guide.title": {
    en: "Three ways to download",
    zh: "三种下载方式",
  },
  "guide.lead": {
    en: "Download one actor, make a reference sheet, or get several actors at once for your AI tool.",
    zh: "下载一位演员、拼一张参考图，或一次打包几位演员，放进你的 AI 工具就能用。",
  },
  "guide.starter.title": {
    en: "Starter pack · fastest start",
    zh: "起步包 · 最快上手",
  },
  "guide.starter.for": {
    en: "For: your first try, when you want a result now.",
    zh: "适合：第一次用，想马上做出东西。",
  },
  "guide.starter.has": {
    en: "Inside: full-body front, face front, the character prompt and a short guide.",
    zh: "里面有：全身正面、脸部正面、角色提示词和使用说明。",
  },
  "guide.starter.where": {
    en: 'Where: "Download starter pack" on any actor page.',
    zh: "在哪找：演员页点「下载起步包」。",
  },
  "guide.sheet.title": {
    en: "Reference sheet · many pictures in one",
    zh: "参考拼图 · 多张合一张",
  },
  "guide.sheet.for": {
    en: "For: tools that take one picture, or when you want to pick angles, faces, and clothes.",
    zh: "适合：工具只能传一张图，或者你想自己挑角度、表情和衣服。",
  },
  "guide.sheet.has": {
    en: "Inside: one big 4K picture made from the images you picked.",
    zh: "里面有：把你选的图片拼成一张大的 4K 图。",
  },
  "guide.sheet.where": {
    en: 'Where: "Make reference sheet" on any actor page.',
    zh: "在哪找：演员页点「拼参考图」。",
  },
  "guide.cast.title": {
    en: "My cast · several actors at once",
    zh: "选角单 · 一次下好几位",
  },
  "guide.cast.for": {
    en: "For: stories that need more than one actor.",
    zh: "适合：一个故事里要用好几位演员。",
  },
  "guide.cast.has": {
    en: "Inside: each actor's starter pack in one ZIP, with the credit line.",
    zh: "里面有：每位演员的起步包，一个压缩包，附署名。",
  },
  "guide.cast.where": {
    en: 'Where: "Add to cast" on actor pages, then download from "My cast".',
    zh: "在哪找：演员页点「加入选角单」，再到「选角单」一键下载。",
  },
  "guide.more.title": {
    en: "Need something else",
    zh: "还想要别的",
  },
  "guide.more.single": {
    en: "One image: open any image and download it. No account needed; wait 30 seconds between images.",
    zh: "单张：点开任意一张图就能下载。不登录也能下，每两张之间等 30 秒。",
  },
  "guide.more.selected": {
    en: 'Pick your own: select pictures on an actor\'s page and click "Download selected" for originals, or packed for GPT Image, Veo, or Seedance.',
    zh: "自己挑图：在演员页勾选想要的图片，点「下载所选」，可以下原图，也能按 GPT Image、Veo、Seedance 的要求打包。",
  },
  "guide.after.title": {
    en: "After you download",
    zh: "下载以后",
  },
  "guide.after.1": {
    en: "Upload the pictures to your image or video tool.",
    zh: "把图片传到你常用的画图或视频工具。",
  },
  "guide.after.2": {
    en: "Paste the character prompt.",
    zh: "粘贴角色提示词。",
  },
  "guide.after.3": {
    en: "Describe your scene.",
    zh: "写你想要的场景。",
  },
  "guide.account.title": {
    en: "Do I need an account",
    zh: "要登录吗",
  },
  "guide.account.body": {
    en: "No account needed to browse or download single pictures. Packs need a free Swimmer account: email sign-in, no waiting.",
    zh: "看网页和下单张图都不用登录。下整包用免费泳者账号，邮箱就能登，不用等。",
  },
  "guide.license.title": {
    en: "Can I use it for paid work",
    zh: "能赚钱用吗",
  },
  "guide.license.body": {
    en: 'Free for personal and paid work under our rules. Credit "Actor name · SwimInAI" and check the rules page before publishing.',
    zh: "遵守规则就能免费用，赚钱也行。请写上「演员名 · SwimInAI」，发布前看一眼规则页。",
  },
  "guide.browse": {
    en: "See actors",
    zh: "去挑演员",
  },
} as const;
