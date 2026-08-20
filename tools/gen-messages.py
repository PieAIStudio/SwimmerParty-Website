# -*- coding: utf-8 -*-
"""Generate messages/zh.json and messages/en.json from one paired source.

Authoring both locales side by side is the only reliable way to keep them
from drifting apart; a missing key in one file is a build-time crash with
next-intl, and a silently stale sentence is worse.
"""
import json, io, os

def P(en, zh):
    return {"en": en, "zh": zh}

M = {
 "common": {
  "skipToContent": P("Skip to content", "跳到正文"),
  "menu": P("MENU", "菜单"),
  "close": P("CLOSE", "关闭"),
  "language": P("LANGUAGE", "语言"),
  "authored": P("AUTHORED", "人工撰写"),
  "machine": P("MACHINE TRANSLATED", "机器翻译"),
  "machineNote": P(
    "These open in Google's translation proxy. We publish two languages we can actually proofread, and we say so rather than shipping nine we cannot.",
    "以下语言由 Google 翻译代理打开。我们只发布两种自己校得动的语言，也把这件事说清楚，而不是硬塞九种校不动的。"),
  "mainNav": P("Main navigation", "主导航"),
  "loading": P("INITIALISING STAGE", "舞台初始化中"),
  "scroll": P("SCROLL", "向下滚"),
  "enquire": P("ENQUIRE", "洽谈"),
  "copy": P("COPY", "复制"),
  "copied": P("COPIED", "已复制"),
  "next": P("NEXT", "下一位"),
  "backToRoster": P("ROSTER", "返回名册"),
  "draft": P("DRAFT — NOT A CONTRACT", "草案 — 不是合同"),
 },
 "nav": {
  "roster": P("ROSTER", "名册"),
  "works": P("WORKS", "作品"),
  "kit": P("KIT", "物料"),
  "studio": P("STUDIO", "工作室"),
  "casting": P("CASTING", "合作"),
  "pact": P("PACT", "共赢契约"),
 },
 "home": {
  "metaTitle": P("Synthetic Talent House", "合成演员工厂"),
  "eyebrow": P("SWIMMER PARTY — SYNTHETIC TALENT HOUSE", "SWIMMER PARTY — 合成演员工厂"),
  "heroLines": {"en": ["WE DO NOT", "CAST ACTORS.", "WE BUILD THEM."],
                "zh": ["我们", "不找演员", "我们自己造"]},
  "heroBody": P(
    "Every one of them carries a serial number, a revision, an expression set and a licensable performance range. Manufactured, not lucky.",
    "每一个都有编号、版本号、表情组和可授权的表演区间——像一件工业制品，不像一次侥幸。"),
  "ctaRoster": P("VIEW ROSTER", "看名册"),
  "ctaBook": P("BOOK TALENT", "找我们合作"),
  "statRoster": P("ON ROSTER", "在册"),
  "statCastable": P("CASTABLE", "可出演"),
  "statVersions": P("VERSIONS BURNED", "推翻过的版本"),
  "statPlates": P("PLATES DELIVERED", "已交付定妆板"),
  "statKitLive": P("KIT ITEMS LIVE", "已开放物料"),
  "marquee": {"en": ["ORIGINAL SYNTHETIC TALENT", "FULL CHARACTER SPECIFICATION",
                     "LICENSABLE PERFORMANCE", "BUILT IN-HOUSE", "OPEN KIT — FREE TO REMIX"],
              "zh": ["原创 AI 演员", "完整人设规格", "可授权表演", "自建，不外购", "开放物料包 — 免费二创"]},
  "rosterLabel": P("ROSTER", "名册"),
  "rosterTitle": P("THE PEOPLE WE MADE", "我们造出来的人"),
  "rosterNote": P(
    "Everyone here has a number and a revision. The revision is not decoration — it counts how many times this character was torn up and rebuilt. Where there is no delivered plate, we say so.",
    "每个人都有编号和版本号。版本号不是装饰——它是这个角色被推翻重做过几次。没有定妆板的，我们就明着说没有。"),
  "rosterMore": P("ALL 12 ON THE ROSTER", "看完整名册 12 人"),
  "methodLabel": P("METHOD", "方法"),
  "methodTitle": P("HOW AN ACTOR GETS BUILT", "一个演员是怎么造出来的"),
  "methodNote": P(
    "This is not 'generate a picture with AI'. It is a production line with rework, reversals and a cull.",
    "这不是「用 AI 生成一张图」。这是一条会返工、会推翻、会淘汰的产线。"),
  "pipeline": {
    "en": [
      {"step": "01", "title": "CASTING BRIEF",
       "body": "Decide how this person thinks before deciding what they look like. Build it the other way round and the character dies by the third film."},
      {"step": "02", "title": "WHITE MODEL",
       "body": "Build, proportion and range of motion are locked on the white model first. Get this layer wrong and every later revision is rework."},
      {"step": "03", "title": "SURFACE",
       "body": "Face, hair, wardrobe, expression set. Multi-reference locks one person down — across ten films he has to be the same face."},
      {"step": "04", "title": "PERFORMANCE",
       "body": "Put them in a scene. The ones who hold stay on the roster; the ones who do not go back in. The revision number is how many times that happened."}],
    "zh": [
      {"step": "01", "title": "立人设",
       "body": "先定这个人怎么想事，再定他长什么样。反过来做出来的角色，第三条片子就演不下去了。"},
      {"step": "02", "title": "造白膜",
       "body": "体型、比例、动作范围先在白膜上定死。这一层定不准，后面每一版都得返工。"},
      {"step": "03", "title": "定妆",
       "body": "脸、发、服装、表情组。多参考图锁死同一个人——十条片子里他必须是同一张脸。"},
      {"step": "04", "title": "开演",
       "body": "把他放进戏里。演得住的留在名册上，演不住的回炉。版本号就是他被推翻过几次。"}]},
  "kitLabel": P("OPEN KIT", "开放物料"),
  "kitTitle": P("TAKE THEM AND MAKE SOMETHING", "把他们领走，做点东西"),
  "kitNote": P(
    "An actor becomes worth something by being used. So we hand you the same character seed we use ourselves — paste it into any model and you get this person, not a lookalike. Free, no permission needed.",
    "一个演员是靠被用起来才值钱的。所以我们把自己在用的那份角色种子直接给你——粘进任何模型，出来的是这个人，不是一个像他的人。免费，不用问。"),
  "kitCta": P("OPEN THE KIT", "打开物料包"),
  "pactLabel": P("THE PACT", "共赢契约"),
  "pactTitle": P("NOBODY HAS TO LOSE", "没有谁必须输"),
  "pactNote": P(
    "Five things we are willing to say in public about who gets paid. Written down so you can hold us to them.",
    "关于「钱怎么分」，我们愿意公开说的五条。写下来，就是让你能拿它压我们。"),
  "pactCta": P("READ THE PACT", "读契约"),
  "stanceLabel": P("THE STANCE", "立场"),
  "stanceTitle": {"en": ["NOT A", "REAL PERSON.", "ON PURPOSE."],
                  "zh": ["他们都", "不是真人", "这是故意的"]},
  "stanceBody": P(
    "Every actor here is animated. CG, drawn, obviously not a person — you can tell in a second, and you are supposed to. Not because photoreal is out of reach. Because we are not going there, and we are not letting anyone take our characters there either.",
    "我们的演员全是动画角色。CG 的、画出来的、一眼就看得出不是真人——你一秒就分得清，这是故意的。不是做不到写实，是我们不做，也不让别人拿我们的角色去做。"),
  "stanceCta": P("WHY WE REFUSE", "为什么"),
  "worksLabel": P("WORKS", "作品"),
  "worksTitle": P("IN PRODUCTION", "在做的东西"),
  "worksNote": P(
    "The first films are still being made. No invented numbers, no invented clients, no invented view counts — one goes live, one goes up.",
    "第一批片子还在做。这里不会摆假数据、假客户和假播放量——上线一条，挂一条。"),
  "worksCta": P("SEE THE SLATE", "看片单"),
  "castingTitle": {"en": ["USE OUR", "ACTORS."], "zh": ["用我们的", "演员"]},
  "castingBody": P(
    "License a roster actor, commission your own, or co-produce. Three doors, all open. Bring a film, a brand, or just an idea.",
    "授权出演、定制专属演员、联合出品——三条路都开着。带上你的片子、你的品牌，或者只带一个想法。"),
  "castingCta": P("START A CONVERSATION", "谈谈"),
 },
 "roster": {
  "metaTitle": P("Roster", "演员名册"),
  "metaDescription": P(
    "The full SWIMMER PARTY roster of original AI actors — codes, revisions, specifications and casting status.",
    "SWIMMER PARTY 全部原创 AI 演员名册，含编号、版本、规格与可出演状态。"),
  "eyebrow": P("ROSTER", "演员名册"),
  "heroLines": {"en": ["THE", "ROSTER."], "zh": ["演员", "名册"]},
  "intro": P(
    "The code is the identity, the revision is the résumé. {castable} castable now, {building} still on the line — we do not call an unfinished one finished.",
    "编号是身份，版本号是履历。{castable} 位可直接出演，{building} 位还在产线上——我们不把在建的说成建好的。"),
  "castableLabel": P("CASTABLE", "可出演"),
  "castableTitle": P("READY TO WORK", "现在就能开工"),
  "buildingLabel": P("IN DEVELOPMENT", "研发中"),
  "buildingTitle": P("ON THE LINE", "在产线上"),
  "buildingNote": P(
    "Character locked, white-model stage. They move to castable the day the plate is delivered.",
    "人设已定，白膜阶段。定妆板交付后自动转入可出演。"),
 },
 "actor": {
  "castable": P("CASTABLE", "可出演"),
  "inDevelopment": P("IN DEVELOPMENT", "研发中"),
  "whiteModelNote": P(
    "What you are looking at is this actor's white model. Proportion and range of motion are locked; the face and the wardrobe are not on yet. This is not a failed render — it is a real station on the line.",
    "你现在看到的是这个演员的白膜。比例和动作范围已经定死，脸和服装还没上。这不是渲染失败，这是产线上的一道真实工序。"),
  "availability": P("AVAILABILITY", "档期"),
  "open": P("OPEN FOR CASTING", "开放洽谈"),
  "notYet": P("NOT YET AVAILABLE", "尚未开放"),
  "openBody": P(
    "Available for licensed performance, brand work and co-production.",
    "可洽谈授权出演、品牌合作与联合出品。"),
  "notYetBody": P(
    "Opens for booking on delivery. You can lock them in early — talk to us now.",
    "交付后开放洽谈。想提前锁定可以先联系我们。"),
  "specification": P("SPECIFICATION", "规格书"),
  "version": P("VERSION", "版本"),
  "note": P("CHARACTER NOTE", "角色笔记"),
  "castFor": P("CAST FOR", "可出演"),
  "sheetFront": P("FRONT", "正视"),
  "noPlate": P("NO PLATE DELIVERED", "尚未交付定妆板"),
  "noPlateBody": P(
    "This actor is still at the white-model stage. The plate, expression set and wardrobe replace this frame on delivery.",
    "这个演员还在白膜阶段。定妆板、表情组和造型交付后此处自动替换。"),
  "noPlateShort": P("NO PLATE", "尚无定妆"),
  "kitLink": P("OPEN KIT", "物料包"),
  "seedEnNote": P(
    "The seed is written in English on purpose: image models follow English far more reliably than Chinese, whoever you are. Paste it as it is.",
    "种子提示词是故意用英文写的：不管你是谁，图像模型对英文的服从度都明显更高。原样粘贴就行。"),
  "cgNote": P(
    "An animated character, built from nothing. Not modelled on, scanned from or blended with any living person.",
    "一个从零造出来的动画角色。不取材于、不扫描、也不融合任何活人。"),
 },
 "works": {
  "metaTitle": P("Works", "作品"),
  "metaDescription": P(
    "The SWIMMER PARTY slate: original comedy shorts and series in production.",
    "SWIMMER PARTY 的片单：正在制作中的原创喜剧短片与系列剧。"),
  "eyebrow": P("WORKS", "作品"),
  "heroLines": {"en": ["THE", "SLATE."], "zh": ["片单", "在做"]},
  "intro": P(
    "This house opened in {year}. Nothing on this slate is invented — one goes live, one goes up; what is in progress says it is in progress.",
    "我们是 {year} 年才开工的厂牌。片单上没有一条是编出来的——上线一条，挂一条；在做的就写在做的。"),
  "slateLabel": P("SLATE", "片单"),
  "slateTitle": P("WHAT WE ARE MAKING", "我们在做什么"),
  "format": P("FORMAT", "形式"),
  "cast": P("CAST", "主演"),
  "outro": P("Want one of our actors in your film?", "想让我们的演员出现在你的片子里？"),
  "outroCta": P("CASTING", "谈合作"),
 },
 "kit": {
  "metaTitle": P("Open Kit", "开放物料包"),
  "metaDescription": P(
    "Free character kits for SWIMMER PARTY's AI actors — the character seed, register notes and reference sheets, handed over so anyone can remix them.",
    "SWIMMER PARTY AI 演员的免费物料包——角色种子提示词、语域说明与参考图，直接交给你去二创。"),
  "eyebrow": P("OPEN KIT", "开放物料包"),
  "heroLines": {"en": ["TAKE", "THEM."], "zh": ["领走", "他们"]},
  "intro": P(
    "A synthetic actor gets valuable the same way a human one does — by being used. So the kit is open. Paste the seed into any image model and you get this person, not a lookalike.",
    "合成演员和真人演员一样，是靠被用起来才值钱的。所以物料包是开放的。把种子提示词粘进任何图像模型，出来的是这个人，不是一个像他的人。"),
  "manifestLabel": P("MANIFEST", "包含什么"),
  "manifestTitle": P("WHAT IS IN A KIT", "一个包里有什么"),
  "manifestNote": P(
    "Status is literal. AVAILABLE means it is on this site right now and you can test it in thirty seconds. Everything else says what it actually is.",
    "状态是字面意思。「已开放」表示它现在就在这个站上，你三十秒就能验证。其他的都写它真实的样子。"),
  "seedsLabel": P("SEEDS", "角色种子"),
  "seedsTitle": P("COPY A CHARACTER", "复制一个人"),
  "seedsNote": P(
    "Only actors whose look is locked have a seed. An actor still on the white model has no face to describe, so that row says so instead of shipping a guess.",
    "只有形象已经定死的演员才有种子。还在白膜阶段的没有脸可以描述，那一行就直说，而不是给你一个猜的。"),
  "seedPending": P("NO SEED YET — STILL ON THE WHITE MODEL", "暂无种子 — 还在白膜阶段"),
  "rulesLabel": P("RULES OF USE", "使用公约"),
  "rulesTitle": P("FIVE LINES, THAT IS ALL", "就五条"),
  "rulesNote": P(
    "Short enough to actually read. Two things you may do freely, three things you must not.",
    "短到你真的会读完。两条随便做，三条别做。"),
  "allowed": P("GO AHEAD", "随便做"),
  "forbidden": P("DO NOT", "别做"),
  "pactCta": P("HOW WE SPLIT THE MONEY", "钱怎么分"),
 },
 "pact": {
  "metaTitle": P("The Pact", "共赢契约"),
  "metaDescription": P(
    "SWIMMER PARTY's public position on who gets paid when a synthetic actor makes money — a draft, published so it can be held to.",
    "SWIMMER PARTY 关于「合成演员赚到钱之后钱怎么分」的公开立场——草案，公开出来就是让人能拿它压我们。"),
  "eyebrow": P("THE PACT", "共赢契约"),
  "heroLines": {"en": ["NOBODY", "HAS TO LOSE."], "zh": ["没有谁", "必须输"]},
  "intro": P(
    "Two things, written down where you can hold us to them: what we refuse to build, and how the money gets split when there finally is some. Both were easier to say now, before anyone is arguing about a number.",
    "两件事，写在你能拿它压我们的地方：我们拒绝造什么，以及真有钱的时候怎么分。趁现在还没人为一个数字吵起来，先说清楚。"),
  "draftNote": P(
    "This is a published position, not an executed contract. The settled lines are settled. The percentages are marked open on purpose — we will not print a number we have not honoured yet.",
    "这是一份公开立场，不是已签的合同。写「已定」的就是已定。百分比是故意留空的——我们不印一个自己还没兑现过的数字。"),
  "partOneLabel": P("PART ONE", "第一部分"),
  "partOneTitle": P("WHAT WE WILL NOT BUILD", "我们不造什么"),
  "partOneNote": P(
    "The first half of this page is a refusal. It comes first because it is the one that costs us money.",
    "这一页的前半是一份拒绝。放在前面，是因为这一半是要我们自己掏钱的。"),
  "refusalsLabel": P("HARD LINES", "死线"),
  "whyLabel": P("WHY", "为什么"),
  "partTwoLabel": P("PART TWO", "第二部分"),
  "partTwoTitle": P("HOW THE MONEY MOVES", "钱怎么走"),
  "partTwoNote": P(
    "The second half is a promise. Work should feed the people who did it. If a character breaks out, that money should not land in one account.",
    "后半是一份承诺。做东西的人该有饭吃。一个角色火了，那笔钱不该只落进一个账户。"),
  "clausesLabel": P("CLAUSES", "条款"),
  "clausesTitle": P("FIVE THINGS WE WILL SAY IN PUBLIC", "五条我们敢公开说的"),
  "termsLabel": P("TERMS", "条目"),
  "termsTitle": P("WHAT IS SETTLED, WHAT IS NOT", "哪些定了，哪些没定"),
  "settled": P("SETTLED", "已定"),
  "openTerm": P("OPEN", "未定"),
  "outro": P(
    "Made something with one of our actors? Send it. That is the whole process.",
    "用我们的演员做了东西？发过来。流程就这样。"),
  "outroCta": P("SEND IT OVER", "发过来"),
 },
 "studio": {
  "metaTitle": P("Studio", "工作室"),
  "metaDescription": P(
    "How SWIMMER PARTY builds an AI actor: the full line from brief to white model to plate to performance.",
    "SWIMMER PARTY 怎么造一个 AI 演员：从人设、白膜、定妆到表演的完整产线。"),
  "eyebrow": P("STUDIO", "工作室"),
  "heroLines": {"en": ["A FACTORY", "FOR PEOPLE."], "zh": ["一间", "造人的厂"]},
  "intro": P(
    "SWIMMER PARTY is the synthetic talent house of PieAI Studio. We do not take outsourced rendering. We build our own actors and then we lend them out.",
    "SWIMMER PARTY 是 PieAI Studio 旗下的合成演员工厂。我们不接外包渲染，我们只造自己的演员，然后把他们租出去。"),
  "beliefsLabel": P("BELIEFS", "我们怎么想"),
  "beliefsTitle": P("FOUR THINGS WE HOLD", "站得住的四条"),
  "beliefsNote": P(
    "These four decide what everyone on the roster looks like, how they talk, and when they get cut.",
    "这四条决定了名册上每一个人长什么样、怎么说话、什么时候被淘汰。"),
  "beliefs": {
    "en": [
      {"n": "01", "title": "A FACE IS NOT A CHARACTER",
       "body": "Plenty of people can generate a good-looking face. Very few can make the same face still be the same person, saying the same kind of thing, in the tenth film. The difference is not the model. It is whether a specification was written down and held to."},
      {"n": "02", "title": "VERSION NUMBERS ARE HONEST",
       "body": "We print how many times a character was torn up right on the roster. VERSION 6 OF 10 means the first five were not good enough. Hiding that is what looks guilty."},
      {"n": "03", "title": "THE WHITE MODEL COMES FIRST",
       "body": "Proportion, build and range of motion get locked before anyone talks about skin or clothes. Reverse the order and the character is just a poster that moves."},
      {"n": "04", "title": "COMEDY IS THE HARDEST TEST",
       "body": "Whether a character holds up is decided in comedy. Tragedy can be papered over with music. If it is not funny, it is not funny."}],
    "zh": [
      {"n": "01", "title": "一张脸不是一个角色",
       "body": "能生成好看的脸的人很多。能让同一张脸在第十条片子里还是同一个人、还讲同一套话的人很少。差别不在模型，在有没有一份写死的规格书。"},
      {"n": "02", "title": "版本号是诚实的",
       "body": "我们把每个角色被推翻过几次直接印在名册上。VERSION 6 OF 10 的意思是前面五版都不够好。藏起来才叫心虚。"},
      {"n": "03", "title": "先有白膜",
       "body": "比例、体型、动作范围先定死，再谈皮肤和衣服。顺序反了，角色就只是一张会动的海报。"},
      {"n": "04", "title": "喜剧是最难的验收",
       "body": "一个角色能不能站住，看他在喜剧里演不演得住。悲情可以靠音乐糊过去，笑不出来就是笑不出来。"}]},
  "stackLabel": P("STACK", "技术栈"),
  "stackTitle": P("BUILT ON OUR OWN RAILS", "跑在自己的轨道上"),
  "stackNote": P(
    "This site and every actor on the roster run on PieAI's own toolchain, not on something bolted together.",
    "这个站和名册上的每一个演员，跑在 PieAI 自己的品牌工具链上，不是拼来的。"),
  "stack": {
    "en": [
      {"name": "SWIMMER UI KIT", "role": "Brand UI", "note": "One source for buttons, panels and tokens"},
      {"name": "REACT THREE FIBER", "role": "Realtime 3D", "note": "The white-model stage and the roster wall"},
      {"name": "NEXT.JS", "role": "Content & SEO", "note": "So the roster can actually be found"},
      {"name": "PGS", "role": "Governance", "note": "Versions, boundaries and delivery discipline"}],
    "zh": [
      {"name": "SWIMMER UI KIT", "role": "品牌 UI 库", "note": "按钮、面板、token 的唯一来源"},
      {"name": "REACT THREE FIBER", "role": "实时 3D", "note": "白膜舞台与名册墙"},
      {"name": "NEXT.JS", "role": "内容与 SEO", "note": "让名册被搜得到"},
      {"name": "PGS", "role": "治理", "note": "版本、边界与交付纪律"}]},
  "outroLines": {"en": ["WANT ONE", "BUILT?"], "zh": ["想造", "一个？"]},
  "outroBody": P(
    "We take commissions too — an actor built for your brand or your film and nobody else's.",
    "我们也接定制——为你的品牌或你的片子造一个只属于你的演员。"),
  "outroCta": P("TALK TO US", "聊聊"),
 },
 "casting": {
  "metaTitle": P("Casting", "合作"),
  "metaDescription": P(
    "License a SWIMMER PARTY AI actor for your film, or commission an original one built only for you.",
    "授权 SWIMMER PARTY 的 AI 演员出演你的片子，或定制一个只属于你的原创演员。"),
  "eyebrow": P("CASTING", "合作"),
  "heroLines": {"en": ["BOOK", "TALENT."], "zh": ["找我们", "合作"]},
  "intro": P(
    "Three routes. Bring nothing but an idea and we will tell you which one you are on.",
    "三条路。你可以只带一个想法过来，我们帮你判断该走哪条。"),
  "routesLabel": P("ROUTES", "三种合作"),
  "routesTitle": P("THREE WAYS IN", "三条路"),
  "routes": {
    "en": [
      {"n": "01", "title": "LICENSE A ROSTER ACTOR", "sub": "Licensed performance",
       "body": "Use someone already on the roster. Character, expression set and performance range exist today — this is the fast route.",
       "good": ["Brand films and ads", "Guest appearances in a series", "A recurring social character"]},
      {"n": "02", "title": "COMMISSION AN ACTOR", "sub": "Built for you",
       "body": "We build a new one for you down the whole line: brief, white model, plate, performance sign-off. Delivered with the full specification sheet.",
       "good": ["A brand-owned spokesperson", "A long-term IP face", "Projects that need exclusivity"]},
      {"n": "03", "title": "CO-PRODUCE", "sub": "Joint production",
       "body": "We bring the actors and the production, you bring the subject, the channel or the money. The film belongs to both of us; the character stays on the roster and keeps working.",
       "good": ["Series and short drama", "Platform-commissioned content", "Long-term content partnership"]}],
    "zh": [
      {"n": "01", "title": "授权出演", "sub": "用现成的人",
       "body": "直接用名册上现有的演员。人设、表情组、表演区间都是现成的，最快的一条路。",
       "good": ["品牌短片 / 广告", "系列内容客串", "社媒常驻角色"]},
      {"n": "02", "title": "定制演员", "sub": "为你造一个",
       "body": "为你造一个新的。走完整条产线：人设 → 白膜 → 定妆 → 表演验收，交付时附完整规格书。",
       "good": ["品牌专属代言角色", "IP 化的长期形象", "需要独占的项目"]},
      {"n": "03", "title": "联合出品", "sub": "一起做",
       "body": "我们出演员和制作，你出题材、渠道或资金。片子归双方，角色留在名册上继续演。",
       "good": ["系列剧 / 短剧", "平台定制内容", "长期内容合作"]}]},
  "goodFor": P("GOOD FOR", "适合"),
  "contact": P("CONTACT", "联系"),
  "contactBody": P(
    "Tell us: what kind of project, roughly when, and which actor you want (or what kind of actor you want). One sentence is fine — we will ask the rest.",
    "来信请带上：项目类型、大致时间、想用哪位演员（或想要什么样的演员）。一句话也行，我们会问清楚。"),
  "availableNow": P("AVAILABLE NOW", "现在可约"),
  "availableNote": P(
    "The ones in development can be discussed too — whoever asks first gets first call on delivery.",
    "研发中的演员也可以先聊，交付后优先给到先约的人。"),
  "remixNote": P(
    "Not a brand, just want to make something? The kit is free and you do not need this page.",
    "不是品牌，只是想做点东西？物料包是免费的，你不需要这一页。"),
 },
 "notFound": {
  "eyebrow": P("404 — NO SUCH TALENT", "404 — 查无此人"),
  "lines": {"en": ["NOT ON", "THE ROSTER."], "zh": ["不在", "名册上"]},
  "body": P("This one is not on the roster. Maybe we have not built them yet.",
            "这个人不在名册上。也许还没造出来。"),
  "cta": P("BACK TO ROSTER", "回名册"),
 },
 "footer": {
  "roster": P("ROSTER", "名册"),
  "index": P("INDEX", "索引"),
  "contact": P("CONTACT", "联系"),
  "contactNote": P("Casting, licensing and commissioned actors", "选角、授权与定制演员"),
  "status": P("STATUS", "状态"),
  "statusLine": P("{castable} CASTABLE · {building} IN DEVELOPMENT",
                  "{castable} 位可出演 · {building} 位研发中"),
  "statusNote": P("The roster updates the day an actor is delivered", "名册每有新演员交付即更新"),
  "rights": P("A PIEAI STUDIO PROJECT", "PIEAI STUDIO 出品"),
  "disclaimer": P("ANIMATED CHARACTERS ONLY — NEVER A HUMAN LIKENESS",
                  "只做动画角色 — 绝不做真人形象"),
  "stanceLink": P("WHY", "为什么"),
 },
}

def pluck(node, lang):
    if isinstance(node, dict):
        if set(node.keys()) == {"en", "zh"}:
            return node[lang]
        return {k: pluck(v, lang) for k, v in node.items()}
    if isinstance(node, list):
        return [pluck(v, lang) for v in node]
    return node

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "messages")
os.makedirs(root, exist_ok=True)
for lang in ("en", "zh"):
    out = pluck(M, lang)
    with io.open(os.path.join(root, lang + ".json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
print("written")
