/**
 * Paired authored UI messages; generate catalogs with pnpm messages:generate.
 * Bounded authored-body exceptions: src/content/legal.ts and src/content/license.ts
 * retain their long legal text, credit lines, examples and rule/FAQ tables verbatim.
 * Actor/content field locale selectors remain data. ZIP README/legacy delivery
 * copy is outside this UI catalog; do not change its legal wording in this block.
 */
export const messages = {
  "c.resumePendingDraft": {
    en: "Return to the draft with the pending request",
    zh: "回到有待核对请求的草稿",
  },
  "c.pendingDraftHint": {
    en: "Another draft has an unanswered request in this tab. Reconcile that same request before changing a different work.",
    zh: "这个标签页的另一份草稿还有未确认的请求。请先核对原请求，再修改其他作品。",
  },
  "c.resumeUpload": { en: "Check and resume the selected uploads", zh: "核对并继续所选上传" },
  "c.transcript": {
    en: "Audio transcript (optional, creator-provided)",
    zh: "声音文字稿（可选，由创作者提供）",
  },
  "c.noTranscript": {
    en: "The creator has not provided a transcript.",
    zh: "创作者尚未提供文字稿。",
  },
  "c.loading": { en: "Loading…", zh: "正在读取…" },
  "c.title": { en: "Community", zh: "泳者作品" },
  "c.new": { en: "Share a work", zh: "投稿作品" },
  "c.mine": { en: "My works", zh: "我的作品" },
  "c.noPosts": { en: "No works in this view yet.", zh: "这里还没有作品。" },
  "c.loadMore": { en: "Load more", zh: "加载更多" },
  "c.retry": { en: "Read again", zh: "重新读取" },
  "c.retryWrite": { en: "Check and retry the same request", zh: "核对并重试原请求" },
  "c.uncertain": {
    en: "The reply was lost. Your original request ID is kept; do not create another copy.",
    zh: "没有收到完整回包。已保留原请求编号，请勿重复新建。",
  },
  "c.type": { en: "1 · Choose a type", zh: "1 · 选类型" },
  "c.media": { en: "2 · Add media", zh: "2 · 放媒体" },
  "c.preview": { en: "3 · Preview and submit", zh: "3 · 预览并发布" },
  "c.next": { en: "Continue", zh: "下一步" },
  "c.back": { en: "Back", zh: "上一步" },
  "c.save": { en: "Save draft", zh: "保存草稿" },
  "c.saved": { en: "Draft saved.", zh: "草稿已保存。" },
  "c.edit": { en: "Edit this work", zh: "编辑作品" },
  "c.actorSearch": { en: "Find an actor", zh: "查找演员" },
  "c.actors": { en: "Actors and asset versions used", zh: "使用的演员和素材版本" },
  "c.actorLimit": {
    en: "Choose 1–16 actors. The version is saved with your work.",
    zh: "选择 1–16 位演员，素材版本会随作品保存。",
  },
  "c.videoLink": { en: "Video link", zh: "视频链接" },
  "c.videoHelp": {
    en: "Only links from the listed platforms. No video file uploads.",
    zh: "只收下列平台链接，不上传视频文件。",
  },
  "c.files": { en: "Choose media files", zh: "选择媒体文件" },
  "c.fileLimits": {
    en: "Up to {count} files · {mib} MiB each",
    zh: "最多 {count} 个文件，每个 {mib} MiB",
  },
  "c.audioLimit": {
    en: "Up to {seconds} seconds; the server verifies the duration.",
    zh: "最长 {seconds} 秒，最终时长由服务端核验。",
  },
  "c.dailyLimits": {
    en: "Current daily limits: {posts} submissions · {mib} MiB uploaded (UTC day).",
    zh: "当前每日额度：{posts} 次投稿、{mib} MiB 上传，按 UTC 自然日计算。",
  },
  "c.metadata": {
    en: "Images are re-encoded before upload to remove metadata. The original size must also fit the limit.",
    zh: "图片会先重新编码、去掉元数据；原文件大小也必须符合上限。",
  },
  "c.preparing": { en: "Preparing media…", zh: "正在准备媒体…" },
  "c.upload": { en: "Upload selected files", zh: "上传所选文件" },
  "c.cancel": { en: "Cancel", zh: "取消" },
  "c.checkStatus": { en: "Check processing status", zh: "查看处理状态" },
  "c.transfer": {
    en: "{loaded} / {total} bytes transferred",
    zh: "已传输 {loaded} / {total} 字节",
  },
  "c.reserving": { en: "Reserving an upload…", zh: "正在申请上传…" },
  "c.uploading": { en: "Uploading", zh: "上传中" },
  "c.validating": {
    en: "Uploaded; awaiting server validation. This is not publication.",
    zh: "传输完成，等待服务端核验；还没有发布。",
  },
  "c.ready": { en: "Media validated", zh: "媒体核验通过" },
  "c.mediaLocked": {
    en: "Uploaded files stay with this draft. Read its status before retrying; use a new draft for different files.",
    zh: "已上传文件保留在本草稿中。重试前先读状态；换文件请使用新草稿。",
  },
  "c.publish": { en: "Submit for publication", zh: "提交发布" },
  "c.submitHelp": {
    en: "First submissions need review. The returned status, not this button, decides whether a work is public.",
    zh: "首次投稿需要审核。是否公开以服务端返回状态为准，不以点击按钮为准。",
  },
  "c.submitted": {
    en: "Submission received. See the current status below.",
    zh: "已收到投稿，请以下方当前状态为准。",
  },
  "c.returnReason": { en: "Review reason", zh: "审核原因" },
  "c.openMedia": { en: "Load media preview", zh: "加载媒体预览" },
  "c.openVideo": { en: "Load external player", zh: "加载外部播放器" },
  "c.externalFallback": {
    en: "Cannot play here? Open the original. Private, removed or region-restricted videos may not embed.",
    zh: "这里无法播放？请打开原站。私密、已删除或地区受限的视频可能不能嵌入。",
  },
  "c.original": { en: "Open on {platform}", zh: "在 {platform} 打开" },
  "c.playerTitle": { en: "Video for {title}", zh: "{title}的视频" },
  "c.mediaUnavailable": {
    en: "A media preview is not available yet. No placeholder is a delivered file.",
    zh: "媒体预览暂不可用；占位不代表已经交付。",
  },
  "c.likes": { en: "Like · {count}", zh: "点赞 · {count}" },
  "c.reportReason": { en: "Reason for reporting", zh: "举报原因" },
  "c.reportNote": { en: "Details (optional)", zh: "补充说明（可选）" },
  "c.confirmDelete": {
    en: "Remove this work from public view? Physical file cleanup continues separately.",
    zh: "确定移除这份作品？文件清理会另行继续。",
  },
  "c.deleted": {
    en: "Removed from public view. File cleanup is still pending.",
    zh: "已撤下公开内容，文件仍待清理。",
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
    en: "This page link expired. Explicitly reload the list to start again.",
    zh: "列表游标已失效，请重新读取列表。",
  },
  "c.error.AUTH_REQUIRED": {
    en: "Sign in with your Swimmer account to continue.",
    zh: "请用泳者账号登录后继续。",
  },
  "c.error.OWNER_REQUIRED": {
    en: "Only the Owner can use this review desk.",
    zh: "只有 Owner 能使用审核台。",
  },
  "c.error.ORIGIN_NOT_ALLOWED": {
    en: "This website is not enabled for community requests.",
    zh: "此网站尚未获准调用社区服务。",
  },
  "c.error.METHOD_NOT_ALLOWED": {
    en: "This request method is not supported. Reload before trying again.",
    zh: "不支持这种请求方式，请重新加载页面后再试。",
  },
  "c.error.SCOPE_NOT_ALLOWED": { en: "This operation is not allowed.", zh: "这项操作没有权限。" },
  "c.error.POST_UNAVAILABLE": {
    en: "This work is not available to you.",
    zh: "这份作品暂不可访问。",
  },
  "c.error.MEDIA_UNAVAILABLE": {
    en: "This media is not available to you.",
    zh: "这份媒体暂不可访问。",
  },
  "c.error.OPERATION_UNAVAILABLE": {
    en: "The original request cannot be read yet. Keep its ID when retrying.",
    zh: "暂时查不到原操作，重试时仍保留原编号。",
  },
  "c.error.REVISION_CONFLICT": {
    en: "This work changed. Read the latest revision before editing again.",
    zh: "作品已变更，请重读最新版本后再编辑。",
  },
  "c.error.IDEMPOTENCY_CONFLICT": {
    en: "This request ID belongs to different content. Read the saved work before continuing.",
    zh: "此请求编号对应不同内容，请先核对已保存作品。",
  },
  "c.error.INVALID_STATE": {
    en: "This action is not available in the current state. Refresh its status.",
    zh: "当前状态不能执行此操作，请刷新状态。",
  },
  "c.error.UPLOAD_EXPIRED": {
    en: "The upload expired. Read its status before starting a new upload.",
    zh: "上传已过期，请先核对状态再申请新上传。",
  },
  "c.error.FILE_TOO_LARGE": {
    en: "The file exceeds the current size limit.",
    zh: "文件超过当前大小上限。",
  },
  "c.error.POST_MEDIA_LIMIT": {
    en: "Check the permitted number of files for this work.",
    zh: "请检查每份作品允许的文件数量。",
  },
  "c.error.UNSUPPORTED_MEDIA": {
    en: "This media format is not supported.",
    zh: "不支持这个媒体格式。",
  },
  "c.error.MEDIA_INVALID": {
    en: "The file could not be validated. Try a supported, intact file.",
    zh: "文件核验未通过，请使用受支持且完整的文件。",
  },
  "c.error.AUDIO_TOO_LONG": {
    en: "The audio exceeds the current duration limit.",
    zh: "声音超过当前时长上限。",
  },
  "c.error.VIDEO_URL_UNSUPPORTED": {
    en: "Use a supported HTTPS video link, not embed code.",
    zh: "请填写支持的 HTTPS 视频链接，不要粘贴嵌入代码。",
  },
  "c.error.RIGHTS_CONFIRMATION_REQUIRED": {
    en: "Confirm both credit and usage rights before submitting.",
    zh: "提交前请确认署名和使用权。",
  },
  "c.error.POST_QUOTA_EXCEEDED": {
    en: "Your daily submission allowance is used up.",
    zh: "今日投稿额度已用完。",
  },
  "c.error.UPLOAD_QUOTA_EXCEEDED": {
    en: "Your daily upload allowance is used up.",
    zh: "今日上传额度已用完。",
  },
  "c.error.RATE_LIMITED": {
    en: "Too many requests. Wait before trying again.",
    zh: "请求过于频繁，请稍后再试。",
  },
  "c.error.SUBMISSIONS_PAUSED": {
    en: "Submissions are paused. Reading, reports and review remain available.",
    zh: "投稿已暂停；阅读、举报和审核仍可使用。",
  },
  "c.error.COMMUNITY_UNAVAILABLE": {
    en: "Community is unavailable. No local copy was substituted.",
    zh: "社区暂不可用，没有切换成本地替代数据。",
  },
  "c.error.PROCESSING_UNAVAILABLE": {
    en: "The upload or media service is not ready. Your work has not been published.",
    zh: "上传或媒体服务暂未就绪，作品尚未发布。",
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
    en: "Switch light and dark",
    zh: "切换明暗",
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
    en: "Packs require a free Swimmer account.",
    zh: "整包下载需要免费泳者账号。",
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
    en: "Link copied",
    zh: "链接已复制",
  },
  "common.next": {
    en: "Next: {name}",
    zh: "下一位：{name}",
  },
  "nav.samples": { en: "Samples", zh: "样片" },
  "nav.learn": { en: "Learn", zh: "学着做" },
  "nav.cast": { en: "Your cast", zh: "我的选角单" },
  "nav.works": {
    en: "Works",
    zh: "作品",
  },
  "nav.studio": {
    en: "Studio",
    zh: "工作室",
  },
  "home.metaTitle": { en: "SWIMMER PARTY — Original AI actors", zh: "SWIMMER PARTY——原创 AI 演员" },
  "home.heroLines.0": { en: "AI actors.", zh: "用 AI 演员，" },
  "home.heroLines.1": { en: "Your next story.", zh: "演你的故事。" },
  "home.heroBody": {
    en: "Free reference assets. Make something with the tools you love.",
    zh: "免费参考素材，用你喜欢的工具开演。",
  },
  "home.ctaAssets": { en: "Choose an actor", zh: "去挑演员" },
  "home.readyCount": { en: "{count} ready to cast", zh: "{count} 位可用演员" },
  "home.newFaceCount": {
    en: "{count, plural, one {# new face} other {# new faces}}",
    zh: "{count, plural, other {# 位新面孔}}",
  },
  "home.samplesTitle": { en: "Official samples", zh: "官方样片" },
  "home.rosterTitle": { en: "Ready to cast", zh: "可用演员" },
  "home.rosterMore": { en: "See all actors", zh: "看全部演员" },
  "home.newFacesNote": {
    en: "A first look, not a full starter pack.",
    zh: "先认识一下，素材尚未齐全。",
  },
  "roster.metaTitle": {
    en: "Actors",
    zh: "演员",
  },
  "roster.metaDescription": {
    en: "Every SWIMMER PARTY AI actor, ready to cast or new. Free to use, even commercially. Just credit Swim In AI.",
    zh: "SWIMMER PARTY 的全部 AI 演员，可出演的和新面孔。商用也免费，署上 Swim In AI 就好。",
  },
  "roster.appearance": { en: "Appearance keywords", zh: "外貌关键词" },
  "roster.origin": { en: "From", zh: "地区" },
  "roster.role": { en: "Role cues", zh: "戏路线索" },
  "roster.role.comedy": { en: "Comedy", zh: "喜剧" },
  "roster.role.boss": { en: "Boss", zh: "老板 / 总裁" },
  "roster.role.villain": { en: "Villain", zh: "反派" },
  "roster.role.crew": { en: "Film crew", zh: "剧组" },
  "roster.height": { en: "Height", zh: "身高" },
  "roster.hasVoice": { en: "Has voice files", zh: "已有声音" },
  "roster.hasVideo": { en: "Has video", zh: "已有视频" },
  "roster.resultCount": { en: "Matches: {count}", zh: "找到 {count} 位" },
  "roster.intro": {
    en: "{castable} ready to cast. {newFaces} new faces with a first look.",
    zh: "{castable} 位可用演员，{newFaces} 位新面孔。",
  },
  "roster.castableTitle": {
    en: "Ready to cast",
    zh: "现在就能开工",
  },
  "roster.buildingTitle": {
    en: "In development",
    zh: "制作中",
  },
  "works.metaTitle": { en: "Samples and studio projects", zh: "样片与工作室项目" },
  "works.metaDescription": {
    en: "Watch real samples made with our AI actors, and see the studio’s projects in development.",
    zh: "看 AI 演员的真实样片，以及工作室开发中的项目。",
  },
  "works.eyebrow": { en: "Samples", zh: "样片" },
  "works.heroLines.0": { en: "See the actors", zh: "看看演员" },
  "works.heroLines.1": { en: "in a story.", zh: "怎么演。" },
  "works.intro": {
    en: "Watch a sample, then open its actor’s reference pack.",
    zh: "看一段样片，再打开演员的参考素材。",
  },
  "studio.projectsTitle": { en: "Studio projects", zh: "工作室项目" },
  "studio.metaTitle": {
    en: "Studio",
    zh: "工作室",
  },
  "studio.metaDescription": {
    en: "How SWIMMER PARTY designs AI actors, keeps them consistent and decides who joins the roster.",
    zh: "SWIMMER PARTY 怎么设计 AI 演员、怎么让他们始终如一、谁能留在名单上。",
  },
  "studio.eyebrow": {
    en: "Studio",
    zh: "工作室",
  },
  "studio.heroLines.0": {
    en: "A small studio",
    zh: "一间小工作室，",
  },
  "studio.heroLines.1": {
    en: "making new faces.",
    zh: "专门造新面孔。",
  },
  "studio.intro": {
    en: "We make original animated actors and share their reference packs.",
    zh: "我们制作原创动画演员，并开放参考素材。",
  },
  "studio.beliefsLabel": { en: "Our approach", zh: "制作方式" },
  "studio.beliefsTitle": { en: "Built for your stories", zh: "为你的故事准备" },
  "studio.beliefs.0.n": {
    en: "01",
    zh: "01",
  },
  "studio.beliefs.0.title": { en: "More than a portrait", zh: "不止一张肖像" },
  "studio.beliefs.0.body": {
    en: "Reference views, expressions and actor notes give you a starting point.",
    zh: "转面、表情和演员设定，帮你开始创作。",
  },
  "studio.beliefs.1.n": {
    en: "02",
    zh: "02",
  },
  "studio.beliefs.1.title": {
    en: "Animated, never photoreal",
    zh: "做动画，不做写实",
  },
  "studio.beliefs.1.body": {
    en: "Original animated designs, not copies of real people.",
    zh: "原创动画形象，不复制真人。",
  },
  "studio.beliefs.2.n": {
    en: "03",
    zh: "03",
  },
  "studio.beliefs.2.title": {
    en: "Open by default",
    zh: "默认开放",
  },
  "studio.beliefs.2.body": {
    en: "Free for personal and commercial projects. Credit Swim In AI and follow the license.",
    zh: "个人创作和商用都免费；请署名 Swim In AI 并遵守授权规则。",
  },
  "studio.beliefs.3.n": {
    en: "04",
    zh: "04",
  },
  "studio.beliefs.3.title": {
    en: "Comedy is the test",
    zh: "喜剧是最难的考试",
  },
  "studio.beliefs.3.body": {
    en: "See their timing and personality in the published samples.",
    zh: "从已发布的样片里看节奏和性格。",
  },
  "studio.missionLabel": {
    en: "Why we do this",
    zh: "我们为什么做这件事",
  },
  "studio.missionTitle": {
    en: "AI for ordinary people",
    zh: "让 AI 造福普通人",
  },
  "studio.missionBody": {
    en: "Free actor references are one way we make creative tools more accessible.",
    zh: "开放演员参考素材，让创作更容易起步。",
  },
  "studio.missionLine": { en: "Bring a story. Choose your tools.", zh: "带上故事，选好工具。" },
  "studio.missionLink": {
    en: "See what we’ve released at SwimInAI.com",
    zh: "去 SwimInAI.com 看我们已经发布的作品",
  },
  "casting.routes.1.title": {
    en: "Commission an actor",
    zh: "定制演员",
  },
  "casting.routes.1.body": {
    en: "We design a new actor just for your brand or film. Only you can use them.",
    zh: "专门为你的品牌或片子设计一位新演员，只给你用。",
  },
  "casting.routes.2.title": {
    en: "Co-produce",
    zh: "联合出品",
  },
  "casting.routes.2.body": {
    en: "We bring the actors and the production, you bring the subject, the channel or the money. The film belongs to both of us; the character stays on the roster and keeps working.",
    zh: "我们出演员和制作，你出题材、渠道或资金。片子归双方，角色留在名册上继续演。",
  },
  "notFound.eyebrow": { en: "404 — Actor not found", zh: "404 — 没有这位演员" },
  "notFound.lines.0": {
    en: "Not on",
    zh: "不在",
  },
  "notFound.lines.1": {
    en: "the roster.",
    zh: "名册上",
  },
  "notFound.cta": {
    en: "Back to roster",
    zh: "回名册",
  },
  "footer.contact": {
    en: "Contact",
    zh: "联系",
  },
  "footer.contactNote": {
    en: "Custom actors and co-productions",
    zh: "定制演员和联合出品",
  },
  "footer.rights": {
    en: "© {year} Pie AI Studio",
    zh: "© {year} Pie AI Studio",
  },
  "footer.project": {
    en: "A Swim In AI project, made by Pie AI Studio.",
    zh: "Swim In AI 旗下项目，由 Pie AI Studio 制作。",
  },
  "assets.series.turnaround": {
    en: "Turnarounds",
    zh: "转面图",
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
    en: "Wardrobe",
    zh: "服装",
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
    en: "Credits",
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
    en: "Not available yet",
    zh: "暂未提供",
  },
  "assets.legacy": {
    en: "Legacy",
    zh: "旧版",
  },
  "assets.slot.face.threeQuarterLeft": { en: "Other three-quarter", zh: "另一侧 3/4" },
  "assets.slot.face.sideRight": { en: "Other profile", zh: "另一侧正侧" },
  "assets.slot.face.up": { en: "Looking up", zh: "仰头" },
  "assets.slot.face.down": { en: "Looking down", zh: "低头" },
  "assets.slot.turnaround.backThreeQuarterLeft": {
    en: "Back three-quarter left",
    zh: "背后 3/4（左）",
  },
  "assets.slot.turnaround.backThreeQuarterRight": {
    en: "Back three-quarter right",
    zh: "背后 3/4（右）",
  },
  "assets.selectSeries": {
    en: "Select all in this series",
    zh: "选中这一组",
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
  "assets.selectFirst": {
    en: "Select the images you want first.",
    zh: "先勾选要下载的图。",
  },
  "assets.downloadJson": {
    en: "Download profile (JSON)",
    zh: "下载角色资料（JSON）",
  },
  "assets.noSeed": {
    en: "Not released yet.",
    zh: "尚未发布。",
  },
  "assets.guestCooldown": {
    en: "Wait {seconds}s, or sign in",
    zh: "再等 {seconds} 秒，或者登录",
  },
  "assets.signIn": {
    en: "Sign in with Swimmer",
    zh: "用泳者账号登录",
  },
  "assets.signingIn": { en: "Opening…", zh: "正在前往…" },
  "assets.signInBenefits.0": {
    en: "Starter packs, full packs and custom downloads",
    zh: "懒人包、完整资产和自选下载",
  },
  "assets.signInBenefits.1": { en: "Post your work, like and vote", zh: "发作品、点赞、投票" },
  "assets.signInBenefits.2": { en: "4K character sheets", zh: "4K 角色设定图" },
  "assets.signInBenefits.3": { en: "No waiting between downloads", zh: "下载不用等待" },
  "assets.signInConsent": {
    en: "By signing in you agree to our Terms of Use and Privacy Policy.",
    zh: "登录即表示同意《使用条款》和《隐私政策》。",
  },
  "assets.signInTitle": { en: "Sign in to download packs", zh: "登录后下载整包" },
  "assets.signInBody": {
    en: "Packs and character sheets need a free Swimmer account. Single images do not.",
    zh: "整包和设定图需要免费泳者账号，单张图片不用登录。",
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
    en: "Account and security",
    zh: "管理账号与安全",
  },
  "account.signOut": {
    en: "Sign out",
    zh: "退出登录",
  },
  "account.cast": {
    en: "Your cast",
    zh: "我的选角单",
  },
  "account.castCount": {
    en: "Actors: {count}",
    zh: "{count} 位演员",
  },
  "assets.dialogTitle": {
    en: "Download selected",
    zh: "下载所选",
  },
  "assets.format.zip": {
    en: "Originals",
    zh: "原图打包",
  },
  "assets.format.zipNote": {
    en: "One transparent PNG per image, with the profile and terms of use.",
    zh: "每张一个透明背景 PNG，附角色资料和使用说明。",
  },
  "assets.format.model": {
    en: "For a model",
    zh: "按模型打包",
  },
  "assets.format.modelNote": {
    en: "Picks and combines images to fit the model's reference limit, with an English note.",
    zh: "按模型的参考图上限自动挑选和拼合，附一段英文说明。",
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
    en: "{count} selected. This model takes {limit}, so the {limit} most important will be kept.",
    zh: "已选 {count} 张，这个模型最多收 {limit} 张，将保留最重要的 {limit} 张。",
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
    en: "Original PNG files with their supplied dimensions and backgrounds, plus the profile and terms of use.",
    zh: "保留原图尺寸和背景的 PNG 原件，附角色资料和使用说明。",
  },
  "assets.originalsLegacy": {
    en: "The original files, including older WebP images, with the profile and terms of use.",
    zh: "保留原始文件，包括旧规格 WebP，附角色资料和使用说明。",
  },
  "assets.veoMissing": {
    en: "This pack needs a front view, turnaround views and at least one expression. The expression set is not delivered yet.",
    zh: "此包需要正面、转面和至少一张表情。目前表情尚未交付。",
  },
  "assets.seedanceUnverified": {
    en: "The nine-image limit follows the production plan; official confirmation is pending.",
    zh: "9 张上限沿用制作计划，待官方核实。",
  },
  "assets.slot.turnaround.front": {
    en: "Front",
    zh: "正面",
  },
  "assets.slot.turnaround.threeQuarter": {
    en: "Three-quarter",
    zh: "四分之三侧",
  },
  "assets.slot.turnaround.side": {
    en: "Side",
    zh: "正侧",
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
    en: "Three-quarter",
    zh: "四分之三侧",
  },
  "assets.slot.face.side": {
    en: "Side",
    zh: "正侧",
  },
  "assets.slot.expression.neutral": {
    en: "Neutral",
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
    en: "Crying",
    zh: "哭",
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
    zh: "窘迫",
  },
  "assets.slot.expression.tired": {
    en: "Tired",
    zh: "疲惫",
  },
  "assets.slot.expression.speaking": {
    en: "Speaking",
    zh: "说话中",
  },
  "assets.slot.expression.eyesClosed": {
    en: "Eyes closed",
    zh: "闭眼",
  },
  "assets.slot.expression.worried": {
    en: "Worried",
    zh: "发愁",
  },
  "assets.slot.expression.skeptical": {
    en: "Skeptical",
    zh: "怀疑",
  },
  "assets.slot.expression.smug": {
    en: "Smug",
    zh: "得意",
  },
  "assets.slot.expression.contempt": {
    en: "Contempt",
    zh: "不屑",
  },
  "assets.slot.expression.confused": {
    en: "Confused",
    zh: "困惑",
  },
  "assets.slot.expression.thinking": {
    en: "Thinking",
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
    en: "Awkward smile",
    zh: "尴尬笑",
  },
  "assets.slot.expression.deadpan": {
    en: "Deadpan",
    zh: "面无表情",
  },
  "assets.slot.wardrobe.front": {
    en: "Front",
    zh: "正面",
  },
  "assets.slot.wardrobe.threeQuarter": {
    en: "Three-quarter",
    zh: "四分之三侧",
  },
  "assets.slot.wardrobe.side": {
    en: "Side",
    zh: "正侧",
  },
  "assets.slot.wardrobe.back": {
    en: "Back",
    zh: "背面",
  },
  "assets.slot.pose.walk": {
    en: "Walking",
    zh: "走路",
  },
  "assets.slot.pose.run": {
    en: "Running",
    zh: "跑步",
  },
  "assets.slot.pose.sit": {
    en: "Sitting",
    zh: "坐着",
  },
  "assets.slot.pose.point": {
    en: "Pointing",
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
    en: "Signature prop",
    zh: "招牌道具",
  },
  "common.share": {
    en: "Share",
    zh: "分享",
  },
  "nav.license": {
    en: "Free License",
    zh: "免费商用",
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
    en: "New faces",
    zh: "新面孔",
  },
  "roster.search": {
    en: "Search by name",
    zh: "按名字搜索",
  },
  "roster.filters": {
    en: "Filters",
    zh: "筛选",
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
    en: "No actors match. Try fewer filters.",
    zh: "没有符合条件的演员，少选几个条件试试。",
  },
  "actor.openLibrary": {
    en: "Get the starter pack",
    zh: "领取懒人包",
  },
  "actor.workWithUs": {
    en: "How to credit",
    zh: "怎么署名",
  },
  "actor.roleTbd": {
    en: "Role to be announced",
    zh: "角色待定",
  },
  "actor.noCredits": {
    en: "Not in a production yet. Use {name} in yours. It’s free.",
    zh: "还没有出演作品。把{name}用进你的作品吧，免费。",
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
    en: "First number: a new look. Second: more material. Third: fixes.",
    zh: "第一位是换了形象，第二位是加了内容，第三位是修正。",
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
    en: "In your image or video model, upload both images, paste the prompt and describe your scene.",
    zh: "在你常用的图像或视频模型里上传这两张图，粘贴提示词，再写你想要的场景。",
  },
  "assets.howTo.newFace1": {
    en: "Download the full-body casting photo.",
    zh: "下载这张全身试镜照。",
  },
  "assets.howTo.newFace3": {
    en: "In your image or video model, upload the photo, paste the prompt and describe your scene.",
    zh: "在你常用的图像或视频模型里上传这张图，粘贴提示词，再写你想要的场景。",
  },
  "assets.characterPrompt": {
    en: "{name} · Character prompt",
    zh: "{name} · 角色提示词",
  },
  "assets.characterPromptNote": {
    en: "Paste it as is.",
    zh: "原样粘贴即可。",
  },
  "assets.rulesTitle": {
    en: "One rule: credit Swim In AI.",
    zh: "只有一条：署上 Swim In AI。",
  },
  "assets.rulesBody": {
    en: "Use {name} in anything, even paid work. Put a small “Swim In AI” at the start and in the credits of a video, or in a corner of an image.",
    zh: "{name}可以用在任何地方，赚钱的也行。视频开头和片尾字幕放一行小字“Swim In AI”，图片放在角落。",
  },
  "assets.copyCredit": {
    en: "Copy credit: {name} · Swim In AI",
    zh: "复制署名：{name} · Swim In AI",
  },
  "assets.castingPhoto": {
    en: "Casting photo",
    zh: "试镜照",
  },
  "assets.rulesPact": {
    en: "Free License · Privacy · Terms",
    zh: "免费商用 · 隐私 · 条款",
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
    en: "Turntable",
    zh: "转台",
  },
  "assets.video.intro": {
    en: "Self-introduction",
    zh: "自我介绍",
  },
  "assets.video.walk": {
    en: "Walk cycle",
    zh: "走路循环",
  },
  "assets.video.expressions": {
    en: "Expression reel",
    zh: "表情串",
  },
  "works.ourProductions": {
    en: "Our productions",
    zh: "我们做的",
  },
  "works.starring": {
    en: "Starring",
    zh: "主演",
  },
  "works.madeByYou": {
    en: "Made by you",
    zh: "大家做的",
  },
  "works.emptyFan": {
    en: "Nothing here yet. Made something with our actors? Send it and we’ll put it here.",
    zh: "还没有作品。用我们的演员做了东西？发给我们，我们放在这里。",
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
    en: "Role to be announced",
    zh: "角色待定",
  },
  "works.episodes": {
    en: "Episodes",
    zh: "分集",
  },
  "footer.claim": {
    en: "An open roster of animated AI actors.",
    zh: "一份开放的 AI 动画演员名单。",
  },
  "common.breadcrumb": {
    en: "Breadcrumb",
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
  "assets.voice.roleMaid": { en: "In role: maid", zh: "角色：女佣" },
  "assets.voice.roleCeo": { en: "In role: CEO", zh: "角色：霸道总裁" },
  "community.reviewTitle": { en: "Review queue", zh: "审核队列" },
  "community.reviewEmpty": { en: "Nothing to review.", zh: "没有待审核的。" },
  "samples.play": { en: "Play sample", zh: "播放样片" },
  "samples.playFailed": {
    en: "This sample could not be loaded. Try again later.",
    zh: "样片暂时无法加载，请稍后重试。",
  },
  "samples.label.solo": { en: "Solo", zh: "单人" },
  "samples.label.action": { en: "Action", zh: "动作" },
  "samples.label.two-actors": { en: "Two actors", zh: "双人" },
  "samples.worksTitle": { en: "Same actor, different tools", zh: "同一个演员，不同工具" },
  "samples.actorTitle": { en: "Same {name}, different tools", zh: "同一个{name}，不同工具" },
  "samples.official": { en: "By SWIMMER PARTY", zh: "SWIMMER PARTY 出品" },
  "samples.seeAll": { en: "See all samples", zh: "看全部样片" },
  "samples.videoLabel": {
    en: "{name} · short video made with Grok",
    zh: "{name} · 用 Grok 做的短视频",
  },
  "home.keywords.aiActor": { en: "AI actor", zh: "AI 演员" },
  "home.keywords.animatedCharacter": { en: "animated character", zh: "动画角色" },
  "home.keywords.syntheticTalent": { en: "synthetic talent", zh: "虚拟演员" },
  "home.keywords.cgCharacter": { en: "CG character", zh: "CG 角色" },
  "home.keywords.characterLicensing": { en: "character licensing", zh: "角色授权" },
  "home.keywords.virtualTalent": { en: "virtual talent", zh: "合成演员" },
  "home.keywords.brand": { en: "SWIMMER PARTY", zh: "SWIMMER PARTY" },
  "home.ogTitle": { en: "Original AI actors", zh: "原创 AI 演员" },
  "home.ogSubtitle": { en: "Made, delivered, licensed", zh: "制作、交付、授权" },
  "home.licenseBadge": {
    en: "Free for commercial use · Credit Swim In AI",
    zh: "商用免费 · 署名 Swim In AI",
  },
  "home.licenseCta": { en: "See how to credit", zh: "看怎么署名" },
  "cast.title": { en: "Your cast", zh: "我的选角单" },
  "cast.eyebrow": { en: "Cast", zh: "选角单" },
  "cast.intro": { en: "Choose actors and download them together.", zh: "选好演员，一次下载。" },
  "license.badge": { en: "Free License · v1.0", zh: "免费商用 · v1.0" },
  "license.creditTitle": { en: "How to credit", zh: "怎么署名" },
  "license.creditNote": {
    en: "Any one of these counts. “Swim In AI” always stays in English; the words around it can be in any language.",
    zh: "下面任选一种都算。“Swim In AI”这几个字始终写英文，前后的话用什么语言都行。",
  },
  "license.creditFavourite": {
    en: "Our favourite is the third: name the actor. It helps them get famous, and if they take off because of you, you get first call.",
    zh: "我们最喜欢第三种：写上演员名字。他因为你火了，后面的项目你优先。",
  },
  "license.copyCredit": { en: "Copy credit line", zh: "复制署名" },
  "license.whereTitle": { en: "Where it goes", zh: "放在哪" },
  "license.whereMade": { en: "What you made", zh: "你做的" },
  "license.wherePlacement": { en: "Where", zh: "放在哪" },
  "license.whereSize": { en: "How big", zh: "多大" },
  "license.markTitle": { en: "Credit mark", zh: "署名标" },
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
    en: "License v1.0 · Effective 8 October 2026 · Part of our Terms of Use",
    zh: "授权 v1.0 · 2026 年 10 月 8 日生效 · 属于《使用条款》的一部分",
  },
  "legal.lastUpdated": { en: "Last updated 8 October 2026", zh: "最后更新：2026 年 10 月 8 日" },
  "studio.workWithUs": { en: "Work with us", zh: "找我们合作" },
  "studio.cooperationTitle": { en: "Two ways to work together", zh: "两种合作方式" },
  "studio.cooperationNote": {
    en: "The roster is free for everyone. If you need more than that:",
    zh: "名单上的演员谁都能免费用。如果你需要更多：",
  },
  "works.rolePrefix": { en: "as", zh: "饰" },
  "actor.newFaceDescription": {
    en: "One photo and one voice so far.",
    zh: "目前只有一张照片和一段声音。",
  },
  "community.postTitle": { en: "Works", zh: "作品" },
  "roster.filters.all": { en: "All", zh: "全部" },
  "roster.filters.women": { en: "Women", zh: "女" },
  "roster.filters.men": { en: "Men", zh: "男" },
  "roster.filters.under30": { en: "Under 30", zh: "30 岁以下" },
  "roster.filters.over45": { en: "Over 45", zh: "45 岁以上" },
  "roster.filters.english": { en: "English", zh: "英语" },
  "roster.filters.chinese": { en: "Chinese", zh: "中文" },
  "cast.empty": { en: "Your cast is empty.", zh: "选角单是空的。" },
  "cast.pickActors": { en: "Pick actors", zh: "去挑演员" },
  "cast.count": { en: "{count} in your cast · up to 12", zh: "{count} 位演员 · 最多 12 位" },
  "cast.downloading": { en: "Downloading…", zh: "下载中…" },
  "cast.downloadPack": { en: "Download cast pack", zh: "下载选角包" },
  "cast.share": { en: "Share cast", zh: "分享选角单" },
  "cast.creditPrefix": { en: "Credit: ", zh: "署名：" },
  "cast.copyCredit": { en: "Copy credit", zh: "复制署名" },
  "cast.clear": { en: "Clear cast", zh: "清空" },
  "cast.failed": { en: "Something went wrong. Try again.", zh: "出了点问题，请再试一次。" },
  "cast.remove": { en: "Remove", zh: "移出" },
  "cast.added": { en: "In your cast", zh: "已在选角单" },
  "cast.add": { en: "Add to cast", zh: "加入选角单" },
  "community.intro": { en: "Made with our actors.", zh: "用本站演员做的作品。" },
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
    en: "My work credits Swim In AI.",
    zh: "我的作品里署了 Swim In AI。",
  },
  "community.rightsConfirmation": {
    en: "I made this, and it follows the Free License rules.",
    zh: "这是我做的，并且遵守免费商用的规则。",
  },
  "community.author": { en: "by {author}", zh: "作者：{author}" },
  "community.reported": { en: "Thanks. We’ll take a look.", zh: "谢谢，我们会看一下。" },
  "community.report": { en: "Report this post", zh: "举报这个作品" },
  "community.starring": { en: "Starring {actors}", zh: "出演：{actors}" },
  "community.delete": { en: "Delete", zh: "删除" },
  "community.voteLabel": { en: "Want more of {name}", zh: "想看更多{name}" },
  "license.heroLines.0": {
    en: "Free for personal and commercial projects.",
    zh: "个人创作、商用都免费。",
  },
  "license.metaDescription": {
    en: "Use SWIMMER PARTY’s animated actors in personal and commercial projects for free. Credit Swim In AI and follow the usage rules below.",
    zh: "SWIMMER PARTY 的动画演员可免费用于个人创作和商业项目。署名 Swim In AI，并遵守下列使用规则。",
  },
  "license.intro": {
    en: "Use our animated actors in films, ads, games, comics, music or merch under the rules below. No license fee or permission request. Credit Swim In AI where people can read it. Downloading packs requires a free Swimmer account.",
    zh: "动画演员可用于电影、广告、游戏、漫画、音乐和周边，具体规则见下方。无需支付许可费或申请许可；请在清晰可见处署名 Swim In AI。下载整包需要免费泳者账号。",
  },
  "license.heroLines.1": { en: "Credit Swim In AI.", zh: "署上 Swim In AI。" },
  "common.languageName.zh": { en: "中文", zh: "中文" },
  "common.languageName.en": { en: "English", zh: "English" },
  "community.kind.image": { en: "Image", zh: "图片" },
  "community.kind.video": { en: "Video", zh: "视频" },
  "community.kind.audio": { en: "Audio", zh: "声音" },
  "common.breadcrumbFallback": { en: "Breadcrumb", zh: "当前位置" },
  "sheet.action": {
    en: "Character sheet",
    zh: "做设定图",
  },
  "sheet.crumb": {
    en: "Character sheet",
    zh: "设定图",
  },
  "sheet.title": {
    en: "{name} · Character sheet",
    zh: "{name} · 角色设定图",
  },
  "sheet.metaTitle": {
    en: "{name} character sheet",
    zh: "{name}的角色设定图",
  },
  "sheet.lead": {
    en: "Choose reference images of {name} and combine them into one sheet.",
    zh: "挑选{name}的参考图，拼成一张设定图。",
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
    en: "Turnaround",
    zh: "转面",
  },
  "sheet.preset.expressions": {
    en: "Expressions",
    zh: "表情",
  },
  "sheet.preset.wardrobe": {
    en: "Wardrobe",
    zh: "服装",
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
    en: "One sheet holds up to 16 images, at most 8 of them full-body.",
    zh: "一张图最多放 16 张，其中全身最多 8 张。",
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
    en: "Prompt and profile",
    zh: "提示词和角色资料",
  },
  "sheet.download": {
    en: "Download sheet",
    zh: "下载设定图",
  },
  "sheet.downloadZip": {
    en: "Download sheet and files",
    zh: "下载设定图和附件",
  },
  "assets.makeSheet": {
    en: "Make a character sheet from these",
    zh: "用所选做设定图",
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
    zh: "懒人包",
  },
  "help.starter.title": {
    en: "Two images and a prompt, ready to shoot",
    zh: "两张图加提示词，马上开拍",
  },
  "help.starter.body": {
    en: "Full-body front, face front and the character prompt.\nUpload them to your AI tool and go.",
    zh: "全身正面、脸部正面和角色提示词。\n下载后上传到你的 AI 工具就能用。",
  },
  "help.starter.alt": {
    en: "Clicking Get the starter pack starts the download",
    zh: "点「领取懒人包」，开始下载",
  },
  "help.sheet.label": {
    en: "Sheet",
    zh: "设定图",
  },
  "help.sheet.title": {
    en: "Pick a few, combine them into one reference",
    zh: "挑几张，拼成一张参考图",
  },
  "help.sheet.body": {
    en: "Choose angles, expressions and outfits for one 4K image.\nAdd voice and video if you like.",
    zh: "选角度、表情和服装，拼成一张 4K 图。\n可以附上声音和视频。",
  },
  "help.sheet.alt": {
    en: "Ticking images on the sheet page updates the preview",
    zh: "在设定图页勾选图片，预览随之更新",
  },
  "help.cast.label": {
    en: "Cast",
    zh: "选角单",
  },
  "help.cast.title": {
    en: "Several actors, one download",
    zh: "几位演员，一次带走",
  },
  "help.cast.body": {
    en: "Add actors to your cast,\nthen download them all at once.",
    zh: "把演员加进选角单，\n再到「我的选角单」一次下载全组。",
  },
  "help.cast.alt": {
    en: "After Add to cast, the actor appears in Your cast",
    zh: "加入选角单后，在我的选角单里看到演员",
  },
  "guide.metaTitle": {
    en: "How it works",
    zh: "怎么用",
  },
  "guide.footer": {
    en: "How it works",
    zh: "怎么用",
  },
  "firstUse.label": { en: "Optional first-use help", zh: "可选的首次操作说明" },
  "firstUse.dismiss": { en: "Dismiss tips", zh: "不再提示" },
  "firstUse.download.title": { en: "First download tips", zh: "第一次下载，接下来怎么用" },
  "firstUse.download.body": {
    en: "Keep your reference images and prompt together.\nThe guide shows three ways to prepare assets for your next scene.",
    zh: "把参考图和提示词保存在一起。\n指南里有三种准备素材的方法。",
  },
  "firstUse.cast.title": { en: "First cast tips", zh: "第一次组队，看看选角单" },
  "firstUse.cast.body": {
    en: "Your cast stays in this browser.\nOpen Your cast to check the group, share it or download a cast pack.",
    zh: "选角单保存在当前浏览器。\n打开我的选角单，可核对、分享或下载整组素材。",
  },
  "firstUse.post.title": { en: "First submission tips", zh: "第一次投稿，先核对这些" },
  "firstUse.post.body": {
    en: "Select only actors used in your work and confirm your rights.\nSubmission status, media checks and review are different steps.",
    zh: "只选择作品实际使用的演员，并核对权利。\n提交、媒体检查和审核是不同的步骤。",
  },
  "firstUse.vote.title": { en: "First vote tips", zh: "第一次投票，看看规则" },
  "firstUse.vote.body": {
    en: "A vote asks for more assets for an actor.\nIt does not unlock unmade files or promise a release date.",
    zh: "投票表达你希望演员补齐素材。\n不会解锁未制作文件，也不代表承诺上线日期。",
  },
  "firstUse.vote.condition": {
    en: "A free Swimmer account is required to vote.",
    zh: "投票需要免费泳者账号。",
  },
  "downloads.authorizing": { en: "Checking download access…", zh: "正在核对下载权限……" },
  "downloads.fetching": { en: "Reference files fetched", zh: "已取回的参考文件" },
  "downloads.filesProgress": {
    en: "{completed} / {total} files",
    zh: "{completed} / {total} 个文件",
  },
  "downloads.assembling": {
    en: "Files fetched. Preparing the final download…",
    zh: "文件已取回，正在准备最终下载……",
  },
  "learn.workflowPreview": { en: "Site workflow preview", zh: "本站操作预览" },
  "learn.start.starter": { en: "Start with one actor", zh: "从一位演员开始" },
  "learn.start.sheet": { en: "Make a character sheet", zh: "做一张设定图" },
  "learn.start.cast": { en: "Open your cast", zh: "打开选角单" },
  "learn.toolsTitle": { en: "Next: choose your tool", zh: "下一步，选你的工具" },
  "learn.draft": { en: "Draft · not reproduced", zh: "草稿 · 尚未实测复现" },
  "learn.draftNotice": {
    en: "These tool workflows are drafts based on official documentation. We have not yet generated and reviewed a result for each recipe. They are not verified tutorials or a promise of matching results.",
    zh: "这些工具流程是依据官方资料整理的草稿，尚未逐篇生成并验收结果。它们不是已实测教程，也不保证得到相同结果。",
  },
  "learn.readDraft": { en: "Read the draft", zh: "查看流程草稿" },
  "learn.sourceChecked": { en: "Official sources checked:", zh: "官方资料核对日期：" },
  "learn.reproductionPending": { en: "Hands-on reproduction: pending", zh: "实际生成复现：待完成" },
  "learn.before": { en: "Before you start", zh: "开始前要知道" },
  "learn.steps": { en: "The workflow", zh: "操作流程" },
  "learn.inputPreview": {
    en: "Reference image to upload — not an output from this tool.",
    zh: "要上传的参考图，不是该工具的生成结果。",
  },
  "learn.getReference": { en: "Get the reference image", zh: "领取参考图" },
  "learn.prompt": { en: "Prompt to try", zh: "可尝试的提示词" },
  "learn.checkResult": { en: "Check the result", zh: "检查结果" },
  "learn.noOutput": {
    en: "No verified output for this draft yet. We will add one only after a recorded hands-on run.",
    zh: "此草稿尚无经过验收的生成结果，完成有记录的实际操作后才会补上。",
  },
  "learn.openTool": { en: "Open the tool ↗", zh: "打开工具 ↗" },
  "learn.externalCost": {
    en: "Opens another site. Its account, usage limits and charges are separate from Swimmer.",
    zh: "将打开其他网站，其账号、使用额度和费用与泳者账号分开。",
  },
  "learn.sources": { en: "Official references", zh: "官方参考资料" },
  "guide.title": {
    en: "Three ways to get an actor",
    zh: "三种拿法，挑一种就行",
  },
  "guide.lead": {
    en: "Pick a result: one actor, one reference sheet, or a whole cast. Prepare your assets here, then choose an image or video tool.",
    zh: "先选一个目标：一位演员、一张设定图，或一组选角。备好素材，再选图像或视频工具。",
  },
  "guide.starter.title": {
    en: "Starter pack · fastest start",
    zh: "懒人包 · 最快开拍",
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
    en: 'Where: "Get starter pack" on any actor page.',
    zh: "在哪：演员页的「领取懒人包」。",
  },
  "guide.sheet.title": {
    en: "Character sheet · one image says it all",
    zh: "设定图 · 一张图说清楚",
  },
  "guide.sheet.for": {
    en: "For: tools that take one reference image, or when you want to choose angles, expressions and outfits.",
    zh: "适合：工具只收一张参考图，或者你想自己挑角度、表情和服装。",
  },
  "guide.sheet.has": {
    en: "Inside: one 4K image made from your picks, with voice, video and prompt if you like.",
    zh: "里面有：你挑的图拼成的一张 4K 图，可以附上声音、视频和提示词。",
  },
  "guide.sheet.where": {
    en: 'Where: "Character sheet" on any actor page.',
    zh: "在哪：演员页的「做设定图」。",
  },
  "guide.cast.title": {
    en: "Cast · several actors, one story",
    zh: "选角单 · 一部戏好几位演员",
  },
  "guide.cast.for": {
    en: "For: stories that need more than one actor.",
    zh: "适合：一个故事里要用好几位演员。",
  },
  "guide.cast.has": {
    en: "Inside: every actor's starter pack in one file, with the credit line.",
    zh: "里面有：每位演员的懒人包，合成一个文件，附署名。",
  },
  "guide.cast.where": {
    en: 'Where: "Add to cast" on actor pages, then download from "Your cast".',
    zh: "在哪：演员页点「加入选角单」，再到「我的选角单」一次下载。",
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
    en: 'Your own selection: tick images in an actor\'s library and choose "Download selected" — as originals, or packed for GPT Image, Veo or Seedance.',
    zh: "自选打包：在演员页的素材库里勾选图片，点「下载所选」，可以原图打包，也可以按 GPT Image、Veo、Seedance 的要求打包。",
  },
  "guide.after.title": {
    en: "After you download",
    zh: "下载以后",
  },
  "guide.after.1": {
    en: "Upload the images to your image or video tool.",
    zh: "把图片上传到你常用的图像或视频工具。",
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
    en: "Not to browse, preview or download single images. Packs need a free Swimmer account — sign in with your email and skip the wait.",
    zh: "浏览、预览和单张下载都不用。打包下载需要泳者账号，免费，用邮箱就能登录，登录后下载不用等。",
  },
  "guide.license.title": {
    en: "Can I use it commercially",
    zh: "能商用吗",
  },
  "guide.license.body": {
    en: 'Free for commercial use under the usage rules. Credit "Actor name · Swim In AI" and read the full license before publishing.',
    zh: "遵守使用规则即可免费商用。请署名「演员名 · Swim In AI」，发布前阅读完整授权。",
  },
  "guide.browse": {
    en: "Browse actors",
    zh: "去挑演员",
  },
} as const;
