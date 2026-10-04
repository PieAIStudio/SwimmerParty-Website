# -*- coding: utf-8 -*-
"""Generate messages/<locale>/messages.json from one paired source.

Authoring both locales side by side is the only reliable way to keep them
from drifting apart; a missing key is caught by the shared ICU catalog check, and a silently stale sentence is worse.
"""
import json, io, os

def P(en, zh):
    return {"en": en, "zh": zh}

M = {
 "common": {
  "themeLight": P("Light", "浅色"),
  "themeDark": P("Dark", "深色"),
  "themeToggle": P("Switch light and dark", "切换明暗"),
  "skipToContent": P("Skip to content", "跳到正文"),
  "menu": P("Menu", "菜单"),
  "close": P("Close", "关闭"),
  "language": P("Language", "语言"),
  "authored": P("Authored", "人工撰写"),
  "machine": P("Machine translated", "机器翻译"),
  "machineNote": P(
    "These open in Google's translation proxy. We publish two languages we can actually proofread, and we say so rather than shipping nine we cannot.",
    "以下语言由 Google 翻译代理打开。我们只发布两种自己校得动的语言，也把这件事说清楚，而不是硬塞九种校不动的。"),
  "mainNav": P("Main navigation", "主导航"),
  "enquire": P("Enquire", "洽谈"),
  "copy": P("Copy", "复制"),
  "copied": P("Copied", "已复制"),
  "next": P("Next", "下一位"),
  "backToRoster": P("Roster", "返回名册"),
  "draft": P("Draft — not a contract", "草案 — 不是合同"),
 },
 "nav": {
  "roster": P("Roster", "名册"),
  "works": P("Works", "作品"),
  "kit": P("Kit", "物料"),
  "studio": P("Studio", "工作室"),
  "casting": P("Casting", "合作"),
  "pact": P("Pact", "共赢契约"),
 },
 "home": {
  "metaTitle": P("Synthetic Talent House", "合成演员工厂"),
  "eyebrow": P("SWIMMER PARTY — Synthetic talent house", "SWIMMER PARTY — 合成演员工厂"),
  "heroLines": {"en": ["We do not", "Cast actors.", "We build them."],
                "zh": ["我们", "不找演员", "我们自己造"]},
  "heroBody": P(
    "Every one of them carries a serial number, a revision, an expression set and a licensable performance range. Manufactured, not lucky.",
    "每一个都有编号、版本号、表情组和可授权的表演区间——像一件工业制品，不像一次侥幸。"),
  "ctaRoster": P("View roster", "看名册"),
  "ctaAssets": P("Get free actor assets", "免费领取演员资产"),
  "ctaBook": P("Book talent", "找我们合作"),
  "statRoster": P("On roster", "在册"),
  "statCastable": P("Castable", "可出演"),
  "statVersions": P("Versions burned", "推翻过的版本"),
  "statPlates": P("Plates delivered", "已交付定妆板"),
  "statKitLive": P("Kit items live", "已开放物料"),
  "rosterLabel": P("Roster", "名册"),
  "rosterTitle": P("The people we made", "我们造出来的人"),
  "rosterNote": P(
    "Everyone here has a number and a revision. The revision is not decoration — it counts how many times this character was torn up and rebuilt. Where there is no delivered plate, we say so.",
    "每个人都有编号和版本号。版本号不是装饰——它是这个角色被推翻重做过几次。没有定妆板的，我们就明着说没有。"),
  "rosterMore": P("All {count} on the roster", "看完整名册 {count} 人"),
  "methodLabel": P("Method", "方法"),
  "methodTitle": P("How an actor gets built", "一个演员是怎么造出来的"),
  "methodNote": P(
    "This is not 'generate a picture with AI'. It is a production line with rework, reversals and a cull.",
    "这不是「用 AI 生成一张图」。这是一条会返工、会推翻、会淘汰的产线。"),
  "pipeline": {
    "en": [
      {"step": "01", "title": "Casting brief",
       "body": "Decide how this person thinks before deciding what they look like. Build it the other way round and the character dies by the third film."},
      {"step": "02", "title": "White model",
       "body": "Build, proportion and range of motion are locked on the white model first. Get this layer wrong and every later revision is rework."},
      {"step": "03", "title": "Surface",
       "body": "Face, hair, wardrobe, expression set. Multi-reference locks one person down — across ten films he has to be the same face."},
      {"step": "04", "title": "Performance",
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
  "kitLabel": P("Open kit", "开放物料"),
  "kitTitle": P("Take them and make something", "把他们领走，做点东西"),
  "kitNote": P(
    "An actor becomes worth something by being used. So we hand you the same character seed we use ourselves — paste it into any model and you get this person, not a lookalike. Free, no permission needed.",
    "一个演员是靠被用起来才值钱的。所以我们把自己在用的那份角色种子直接给你——粘进任何模型，出来的是这个人，不是一个像他的人。免费，不用问。"),
  "kitCta": P("Open the kit", "打开物料包"),
  "pactLabel": P("The pact", "共赢契约"),
  "pactTitle": P("Nobody has to lose", "没有谁必须输"),
  "pactNote": P(
    "Five things we are willing to say in public about who gets paid. Written down so you can hold us to them.",
    "关于「钱怎么分」，我们愿意公开说的五条。写下来，就是让你能拿它压我们。"),
  "pactCta": P("Read the pact", "读契约"),
  "stanceLabel": P("The stance", "立场"),
  "stanceTitle": {"en": ["Not a", "Real person.", "On purpose."],
                  "zh": ["他们都", "不是真人", "这是故意的"]},
  "stanceBody": P(
    "Every actor here is animated. CG, drawn, obviously not a person — you can tell in a second, and you are supposed to. Not because photoreal is out of reach. Because we are not going there, and we are not letting anyone take our characters there either.",
    "我们的演员全是动画角色。CG 的、画出来的、一眼就看得出不是真人——你一秒就分得清，这是故意的。不是做不到写实，是我们不做，也不让别人拿我们的角色去做。"),
  "stanceCta": P("Why we refuse", "为什么"),
  "worksLabel": P("Works", "作品"),
  "worksTitle": P("In production", "在做的东西"),
  "worksNote": P(
    "The first films are still being made. No invented numbers, no invented clients, no invented view counts — one goes live, one goes up.",
    "第一批片子还在做。这里不会摆假数据、假客户和假播放量——上线一条，挂一条。"),
  "worksCta": P("See the slate", "看片单"),
  "castingTitle": {"en": ["Use our", "Actors."], "zh": ["用我们的", "演员"]},
  "castingBody": P(
    "License a roster actor, commission your own, or co-produce. Three doors, all open. Bring a film, a brand, or just an idea.",
    "授权出演、定制专属演员、联合出品——三条路都开着。带上你的片子、你的品牌，或者只带一个想法。"),
  "castingCta": P("Start a conversation", "谈谈"),
 },
 "roster": {
  "metaTitle": P("Roster", "演员名册"),
  "metaDescription": P(
    "The full SWIMMER PARTY roster of original AI actors — codes, revisions, specifications and casting status.",
    "SWIMMER PARTY 全部原创 AI 演员名册，含编号、版本、规格与可出演状态。"),
  "eyebrow": P("Roster", "演员名册"),
  "heroLines": {"en": ["The", "Roster."], "zh": ["演员", "名册"]},
  "intro": P(
    "The code is the identity, the revision is the résumé. {castable} castable now, {building} still on the line — we do not call an unfinished one finished.",
    "编号是身份，版本号是履历。{castable} 位可直接出演，{building} 位还在产线上——我们不把在建的说成建好的。"),
  "castableLabel": P("Castable", "可出演"),
  "castableTitle": P("Ready to work", "现在就能开工"),
  "buildingLabel": P("In development", "研发中"),
  "buildingTitle": P("On the line", "在产线上"),
  "buildingNote": P(
    "Character locked, white-model stage. They move to castable the day the plate is delivered.",
    "人设已定，白膜阶段。定妆板交付后自动转入可出演。"),
 },
 "actor": {
  "inDevelopment": P("In development", "研发中"),
  "castFor": P("Cast for", "可出演"),
  "sheetFront": P("FRONT", "正视"),
  "noPlate": P("No plate delivered", "尚未交付定妆板"),
  "noPlateBody": P(
    "This actor is still at the white-model stage. The plate, expression set and wardrobe replace this frame on delivery.",
    "这个演员还在白膜阶段。定妆板、表情组和造型交付后此处自动替换。"),
  "seedEnNote": P(
    "The seed is written in English on purpose: image models follow English far more reliably than Chinese, whoever you are. Paste it as it is.",
    "种子提示词是故意用英文写的：不管你是谁，图像模型对英文的服从度都明显更高。原样粘贴就行。"),
 },
 "works": {
  "metaTitle": P("Works", "作品"),
  "metaDescription": P(
    "The SWIMMER PARTY slate: original comedy shorts and series in production.",
    "SWIMMER PARTY 的片单：正在制作中的原创喜剧短片与系列剧。"),
  "eyebrow": P("Works", "作品"),
  "heroLines": {"en": ["The", "Slate."], "zh": ["片单", "在做"]},
  "intro": P(
    "This house opened in {year}. Nothing on this slate is invented — one goes live, one goes up; what is in progress says it is in progress.",
    "我们是 {year} 年才开工的厂牌。片单上没有一条是编出来的——上线一条，挂一条；在做的就写在做的。"),
  "slateTitle": P("What we are making", "我们在做什么"),
  "cast": P("Cast", "主演"),
  "outro": P("Want one of our actors in your film?", "想让我们的演员出现在你的片子里？"),
  "outroCta": P("Casting", "谈合作"),
 },
 "kit": {
  "metaTitle": P("Open Kit", "开放物料包"),
  "metaDescription": P(
    "Free character kits for SWIMMER PARTY's AI actors — the character seed, register notes and reference sheets, handed over so anyone can remix them.",
    "SWIMMER PARTY AI 演员的免费物料包——角色种子提示词、语域说明与参考图，直接交给你去二创。"),
  "eyebrow": P("Open kit", "开放物料包"),
  "heroLines": {"en": ["Take", "Them."], "zh": ["领走", "他们"]},
  "intro": P(
    "A synthetic actor gets valuable the same way a human one does — by being used. So the kit is open. Paste the seed into any image model and you get this person, not a lookalike.",
    "合成演员和真人演员一样，是靠被用起来才值钱的。所以物料包是开放的。把种子提示词粘进任何图像模型，出来的是这个人，不是一个像他的人。"),
  "manifestLabel": P("Manifest", "包含什么"),
  "manifestTitle": P("What is in a kit", "一个包里有什么"),
  "manifestNote": P(
    "Status is literal. AVAILABLE means it is on this site right now and you can test it in thirty seconds. Everything else says what it actually is.",
    "状态是字面意思。「已开放」表示它现在就在这个站上，你三十秒就能验证。其他的都写它真实的样子。"),
  "seedsLabel": P("Seeds", "角色种子"),
  "seedsTitle": P("Copy a character", "复制一个人"),
  "seedsNote": P(
    "Only actors whose look is locked have a seed. An actor still on the white model has no face to describe, so that row says so instead of shipping a guess.",
    "只有形象已经定死的演员才有种子。还在白膜阶段的没有脸可以描述，那一行就直说，而不是给你一个猜的。"),
  "seedPending": P("No seed yet — still on the white model", "暂无种子 — 还在白膜阶段"),
  "platesLabel": P("Reference plates", "参考图组"),
  "platesNone": P("Front plate only so far", "目前只有正面"),
  "rulesLabel": P("Rules of use", "使用公约"),
  "rulesTitle": P("Five lines, that is all", "就五条"),
  "rulesNote": P(
    "Short enough to actually read. Two things you may do freely, three things you must not.",
    "短到你真的会读完。两条随便做，三条别做。"),
  "allowed": P("Go ahead", "随便做"),
  "forbidden": P("Do not", "别做"),
  "pactCta": P("How we split the money", "钱怎么分"),
 },
 "pact": {
  "metaTitle": P("The Pact", "共赢契约"),
  "metaDescription": P(
    "SWIMMER PARTY's public position on who gets paid when a synthetic actor makes money — a draft, published so it can be held to.",
    "SWIMMER PARTY 关于「合成演员赚到钱之后钱怎么分」的公开立场——草案，公开出来就是让人能拿它压我们。"),
  "eyebrow": P("The pact", "共赢契约"),
  "heroLines": {"en": ["Nobody", "Has to lose."], "zh": ["没有谁", "必须输"]},
  "intro": P(
    "Two things, written down where you can hold us to them: what we refuse to build, and how the money gets split when there finally is some. Both were easier to say now, before anyone is arguing about a number.",
    "两件事，写在你能拿它压我们的地方：我们拒绝造什么，以及真有钱的时候怎么分。趁现在还没人为一个数字吵起来，先说清楚。"),
  "draftNote": P(
    "This is a published position, not an executed contract. The settled lines are settled. The percentages are marked open on purpose — we will not print a number we have not honoured yet.",
    "这是一份公开立场，不是已签的合同。写「已定」的就是已定。百分比是故意留空的——我们不印一个自己还没兑现过的数字。"),
  "partOneLabel": P("Part one", "第一部分"),
  "partOneTitle": P("What we will not build", "我们不造什么"),
  "partOneNote": P(
    "The first half of this page is a refusal. It comes first because it is the one that costs us money.",
    "这一页的前半是一份拒绝。放在前面，是因为这一半是要我们自己掏钱的。"),
  "whyLabel": P("Why", "为什么"),
  "partTwoLabel": P("Part two", "第二部分"),
  "partTwoTitle": P("How the money moves", "钱怎么走"),
  "partTwoNote": P(
    "The second half is a promise. Work should feed the people who did it. If a character breaks out, that money should not land in one account.",
    "后半是一份承诺。做东西的人该有饭吃。一个角色火了，那笔钱不该只落进一个账户。"),
  "termsLabel": P("Terms", "条目"),
  "termsTitle": P("What is settled, what is not", "哪些定了，哪些没定"),
  "settled": P("Settled", "已定"),
  "openTerm": P("Open", "未定"),
  "outro": P(
    "Made something with one of our actors? Send it. That is the whole process.",
    "用我们的演员做了东西？发过来。流程就这样。"),
  "outroCta": P("Send it over", "发过来"),
 },
 "studio": {
  "metaTitle": P("Studio", "工作室"),
  "metaDescription": P(
    "How SWIMMER PARTY builds an AI actor: the full line from brief to white model to plate to performance.",
    "SWIMMER PARTY 怎么造一个 AI 演员：从人设、白膜、定妆到表演的完整产线。"),
  "eyebrow": P("Studio", "工作室"),
  "heroLines": {"en": ["A factory", "For people."], "zh": ["一间", "造人的厂"]},
  "intro": P(
    "SWIMMER PARTY is the synthetic talent house of PieAI Studio. We do not take outsourced rendering. We build our own actors and then we lend them out.",
    "SWIMMER PARTY 是 PieAI Studio 旗下的合成演员工厂。我们不接外包渲染，我们只造自己的演员，然后把他们租出去。"),
  "beliefsLabel": P("Beliefs", "我们怎么想"),
  "beliefsTitle": P("Four things we hold", "站得住的四条"),
  "beliefsNote": P(
    "These four decide what everyone on the roster looks like, how they talk, and when they get cut.",
    "这四条决定了名册上每一个人长什么样、怎么说话、什么时候被淘汰。"),
  "beliefs": {
    "en": [
      {"n": "01", "title": "A face is not a character",
       "body": "Plenty of people can generate a good-looking face. Very few can make the same face still be the same person, saying the same kind of thing, in the tenth film. The difference is not the model. It is whether a specification was written down and held to."},
      {"n": "02", "title": "Version numbers are honest",
       "body": "We print how many times a character was torn up right on the roster. VERSION 6 OF 10 means the first five were not good enough. Hiding that is what looks guilty."},
      {"n": "03", "title": "The white model comes first",
       "body": "Proportion, build and range of motion get locked before anyone talks about skin or clothes. Reverse the order and the character is just a poster that moves."},
      {"n": "04", "title": "Comedy is the hardest test",
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
  "stackLabel": P("Stack", "技术栈"),
  "stackTitle": P("Built on our own rails", "跑在自己的轨道上"),
  "stackNote": P(
    "This site and every actor on the roster run on PieAI's own toolchain, not on something bolted together.",
    "这个站和名册上的每一个演员，跑在 PieAI 自己的品牌工具链上，不是拼来的。"),
  "stack": {
    "en": [
      {"name": "Swimmer UI Kit", "role": "Brand UI", "note": "One source for buttons, panels and tokens"},
      {"name": "React Three Fiber", "role": "Realtime 3D", "note": "The white-model stage"},
      {"name": "Next.js", "role": "Content & SEO", "note": "So the roster can actually be found"},
      {"name": "PGS", "role": "Governance", "note": "Versions, boundaries and delivery discipline"}],
    "zh": [
      {"name": "Swimmer UI Kit", "role": "品牌 UI 库", "note": "按钮、面板、token 的唯一来源"},
      {"name": "React Three Fiber", "role": "实时 3D", "note": "白膜舞台"},
      {"name": "Next.js", "role": "内容与 SEO", "note": "让名册被搜得到"},
      {"name": "PGS", "role": "治理", "note": "版本、边界与交付纪律"}]},
  "outroLines": {"en": ["Want one", "Built?"], "zh": ["想造", "一个？"]},
  "outroBody": P(
    "We take commissions too — an actor built for your brand or your film and nobody else's.",
    "我们也接定制——为你的品牌或你的片子造一个只属于你的演员。"),
  "outroCta": P("Talk to us", "聊聊"),
 },
 "casting": {
  "metaTitle": P("Casting", "合作"),
  "metaDescription": P(
    "License a SWIMMER PARTY AI actor for your film, or commission an original one built only for you.",
    "授权 SWIMMER PARTY 的 AI 演员出演你的片子，或定制一个只属于你的原创演员。"),
  "eyebrow": P("Casting", "合作"),
  "heroLines": {"en": ["Book", "Talent."], "zh": ["找我们", "合作"]},
  "intro": P(
    "Three routes. Bring nothing but an idea and we will tell you which one you are on.",
    "三条路。你可以只带一个想法过来，我们帮你判断该走哪条。"),
  "routesLabel": P("Routes", "三种合作"),
  "routesTitle": P("Three ways in", "三条路"),
  "routes": {
    "en": [
      {"n": "01", "title": "License a roster actor", "sub": "Licensed performance",
       "body": "Use someone already on the roster. Character, expression set and performance range exist today — this is the fast route.",
       "good": ["Brand films and ads", "Guest appearances in a series", "A recurring social character"]},
      {"n": "02", "title": "Commission an actor", "sub": "Built for you",
       "body": "We build a new one for you down the whole line: brief, white model, plate, performance sign-off. Delivered with the full specification sheet.",
       "good": ["A brand-owned spokesperson", "A long-term IP face", "Projects that need exclusivity"]},
      {"n": "03", "title": "Co-produce", "sub": "Joint production",
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
  "goodFor": P("Good for", "适合"),
  "contact": P("Contact", "联系"),
  "contactBody": P(
    "Tell us: what kind of project, roughly when, and which actor you want (or what kind of actor you want). One sentence is fine — we will ask the rest.",
    "来信请带上：项目类型、大致时间、想用哪位演员（或想要什么样的演员）。一句话也行，我们会问清楚。"),
  "availableNow": P("Available now", "现在可约"),
  "availableNote": P(
    "The ones in development can be discussed too — whoever asks first gets first call on delivery.",
    "研发中的演员也可以先聊，交付后优先给到先约的人。"),
  "remixNote": P(
    "Not a brand, just want to make something? The kit is free and you do not need this page.",
    "不是品牌，只是想做点东西？物料包是免费的，你不需要这一页。"),
 },
 "notFound": {
  "eyebrow": P("404 — no such talent", "404 — 查无此人"),
  "lines": {"en": ["Not on", "The roster."], "zh": ["不在", "名册上"]},
  "body": P("This one is not on the roster. Maybe we have not built them yet.",
            "这个人不在名册上。也许还没造出来。"),
  "cta": P("Back to roster", "回名册"),
 },
 "footer": {
  "roster": P("Roster", "名册"),
  "index": P("Index", "索引"),
  "contact": P("Contact", "联系"),
  "contactNote": P("Casting, licensing and commissioned actors", "选角、授权与定制演员"),
  "rights": P("A PieAI Studio project", "PIEAI STUDIO 出品"),
  "stanceLink": P("Why", "为什么"),
 },
}

# Asset-library labels: the paired source follows the approved plan, appendix C.
M["assets"] = {
 "metaTitle": P("{name} · Asset library", "{name} · 资产库"),
 "back": P("Open kit", "物料包"),
 "intro": P("Every image of {name} is a separate full-size original with no text on it. Pick what you need and download one at a time, or sign in to take the whole set.", "{name}的每一张图都是单独的高清原图，图上没有字。挑你需要的，单张下载，或者登录后整包带走。"),
 "progress": P("Core set {done}/{total}", "基础包 {done}/{total}"),
 "series.turnaround": P("Turnaround", "转面"),
 "series.face": P("Face", "面部"),
 "series.expression": P("Expressions", "表情"),
 "series.wardrobe": P("Wardrobe", "服装"),
 "series.pose": P("Poses", "动作"),
 "series.detail": P("Details", "细节"),
 "series.text": P("Text", "文字资料"),
 "note.turnaround": P("Front, three-quarter, side and back. Full body, transparent background.", "正面、四分之三侧、正侧、背面，全身，透明背景。"),
 "note.face": P("Close-ups that lock the face. The most important references you can give a model.", "锁脸用的特写，给模型的参考里最重要的一组。"),
 "note.expression": P("Twelve core emotions, plus speaking and eyes closed.", "12 种基础情绪，加说话和闭眼。"),
 "note.wardrobe": P("Same person, another outfit, four angles.", "同一个人，换一套衣服，四个角度。"),
 "note.pose": P("Common actions, full body.", "常用动作，全身。"),
 "note.detail": P("Hands, the back of the head, signature props.", "手、后脑、招牌道具。"),
 "extended": P("Extended", "扩展"),
 "pending": P("Not delivered yet", "待交付"),
 "legacy": P("Legacy", "旧规格"),
 "legacyNote": P("An older black-background image, to be replaced by the new set.", "黑底旧图，新规格交付后替换。"),
 "none": P("This actor's assets are still being made.", "这位演员的资产还在制作中。"),
 "selectSeries": P("Select all", "全选本组"),
 "clear": P("Clear", "清空"),
 "selected": P("{count} selected", "已选 {count} 张"),
 "select": P("Select {label}", "选择 {label}"),
 "downloadSelected": P("Download selected", "下载所选"),
 "selectFirst": P("Select the images you want first.", "先勾选要下载的图。"),
 "downloadOne": P("Download this image", "下载这张"),
 "downloadJson": P("Download profile (JSON)", "下载角色资料（JSON）"),
 "noSeed": P("The look is not locked yet, so there is no seed.", "形象尚未锁定，暂无种子。"),
 "guestCooldown": P("Guests can download one full-size image every {seconds} seconds. {remaining} seconds to go.", "游客每 {seconds} 秒可以下载一张高清图，还要等 {remaining} 秒。"),
 "guestHint": P("Sign in with Swimmer to select several, download a pack or build a sheet.", "登录 Swimmer 账号，就能多选、打包和拼图。"),
 "signIn": P("Sign in with Swimmer", "用 Swimmer 账号登录"),
 "signInTitle": P("Take the whole set with a Swimmer account", "整包带走，需要一个 Swimmer 账号"),
 "signInBody": P("It's free. The same account also works in:", "免费注册。同一个账号还能直接用："),
 "notNow": P("Not now", "先不用"),
 "signedIn": P("Signed in", "已登录"),
 "signOut": P("Sign out", "退出"),
 "dialogTitle": P("Download {count} images", "下载 {count} 张"),
 "format.zip": P("Originals", "原图打包"),
 "format.zipNote": P("One transparent PNG per image, with the profile and terms of use.", "每张一个透明背景 PNG，附角色资料和使用说明。"),
 "format.sheet": P("One sheet", "拼成一张"),
 "format.sheetNote": P("For tools that take a single reference image.", "给只收一张参考图的工具。"),
 "format.model": P("For a model", "按模型打包"),
 "format.modelNote": P("Picks and combines images to fit the model's reference limit, with an English note.", "按模型的参考图上限自动挑选和拼合，附一段英文说明。"),
 "labels": P("Labels on the sheet", "图上标签"),
 "labels.none": P("None", "不加"),
 "background": P("Background", "底色"),
 "background.light": P("Light grey", "浅灰"),
 "background.white": P("White", "白"),
 "background.dark": P("Dark grey", "深灰"),
 "model": P("Model", "模型"),
 "overLimit": P("{count} selected. This model takes {limit}, so the {limit} most important will be kept.", "已选 {count} 张，这个模型最多收 {limit} 张，将保留最重要的 {limit} 张。"),
 "start": P("Start download", "开始下载"),
 "preparing": P("Preparing…", "准备中…"),
 "started": P("Download started", "已开始下载"),
 "cancel": P("Cancel", "取消"),
 "openLibrary": P("Open asset library", "打开资产库"),
 "navigation": P("Asset series", "资产系列"),
 "close": P("Close", "关闭"),
 "failed": P("That could not be completed. Please try again.", "操作未完成，请重试。"),
 "exportFormat": P("Download format", "下载格式"),
 "preview": P("Sheet preview", "拼图预览"),
 "mockAccount": P("Local test account", "本地模拟账号"),
 "originalsLegacy": P("The original files, including older WebP images, with the profile and terms of use.", "保留原始文件，包括旧规格 WebP，附角色资料和使用说明。"),
 "veoMissing": P("This pack needs a front view, turnaround views and at least one expression. The expression set is not delivered yet.", "此包需要正面、转面和至少一张表情。目前表情尚未交付。"),
 "seedanceUnverified": P("The nine-image limit follows the production plan; official confirmation is pending.", "9 张上限沿用制作计划，待官方核实。"),
}
# Stable protocol keys, authored labels; directions remain English production data.
angles = {"front": P("Front", "正面"), "threeQuarter": P("Three-quarter", "四分之三侧"), "side": P("Side", "正侧"), "back": P("Back", "背面")}
M["assets"]["slot"] = {
 "turnaround": angles,
 "face": {key: value for key, value in angles.items() if key != "back"},
 "expression": {
  "neutral": P("Neutral", "平静"), "smile": P("Smile", "浅笑"), "laugh": P("Laugh", "大笑"),
  "sad": P("Sad", "难过"), "cry": P("Crying", "哭"), "annoyed": P("Annoyed", "烦躁"),
  "angry": P("Angry", "发怒"), "surprised": P("Surprised", "惊讶"), "scared": P("Scared", "害怕"),
  "disgusted": P("Disgusted", "嫌弃"), "embarrassed": P("Embarrassed", "窘迫"), "tired": P("Tired", "疲惫"),
  "speaking": P("Speaking", "说话中"), "eyesClosed": P("Eyes closed", "闭眼"),
  "worried": P("Worried", "发愁"), "skeptical": P("Skeptical", "怀疑"), "smug": P("Smug", "得意"),
  "contempt": P("Contempt", "不屑"), "confused": P("Confused", "困惑"), "thinking": P("Thinking", "思考"),
  "determined": P("Determined", "坚定"), "shy": P("Shy", "害羞"), "pain": P("In pain", "吃痛"),
  "sleepy": P("Sleepy", "犯困"), "awkwardSmile": P("Awkward smile", "尴尬笑"), "deadpan": P("Deadpan", "面无表情"),
 },
 "wardrobe": angles,
 "pose": {"walk": P("Walking", "走路"), "run": P("Running", "跑步"), "sit": P("Sitting", "坐着"), "point": P("Pointing", "指向"), "armsCrossed": P("Arms crossed", "抱臂"), "phone": P("On the phone", "打电话")},
 "detail": {"hands": P("Hands", "手部"), "hairBack": P("Back of head", "后脑"), "prop": P("Signature prop", "招牌道具")},
}
M["casting"]["aboutActor"] = P("About: {name}", "关于：{name}")
M["casting"]["copyEmail"] = P("Copy email", "复制邮箱")

def pluck(node, lang):
    if isinstance(node, dict):
        if set(node.keys()) == {"en", "zh"}:
            return node[lang]
        return {k: pluck(v, lang) for k, v in node.items()}
    if isinstance(node, list):
        return [pluck(v, lang) for v in node]
    return node

def flatten(node, prefix="", result=None):
    if result is None:
        result = {}
    if isinstance(node, (dict, list)):
        items = node.items() if isinstance(node, dict) else enumerate(node)
        for key, value in items:
            flatten(value, f"{prefix}.{key}" if prefix else str(key), result)
    else:
        result[prefix] = node
    return result

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "messages")
os.makedirs(root, exist_ok=True)
for lang, code in (("en", "en"), ("zh", "zh-CN")):
    os.makedirs(os.path.join(root, code), exist_ok=True)
    with io.open(os.path.join(root, code, "messages.json"), "w", encoding="utf-8") as f:
        json.dump(flatten(pluck(M, lang)), f, ensure_ascii=False, indent=2)
        f.write("\n")
print("written")
