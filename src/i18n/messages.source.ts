/**
 * Paired authored UI messages; generate catalogs with pnpm messages:generate.
 * Bounded authored-body exceptions: src/content/legal.ts and src/content/license.ts
 * retain their long legal text, credit lines, examples and rule/FAQ tables verbatim.
 * Actor/content field locale selectors remain data. ZIP README/legacy delivery
 * copy is outside this UI catalog; do not change its legal wording in this block.
 */
export const messages = {
  "settings.title": { en: "Setting references", zh: "场景参考" },
  "settings.intro": {
    en: "Pick a setting, edit its sentence, then copy it into your image tool.",
    zh: "选个场景，改一句描述，再复制到你的出图工具。",
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
    en: "A quiet photo studio with a pale backdrop and soft light.",
    zh: "安静的摄影棚，浅色背景，光线柔和。",
  },
  "settings.sentence.cafe": {
    en: "A small café with wooden tables and warm window light.",
    zh: "小咖啡馆里摆着木桌，暖光从窗边照进来。",
  },
  "settings.sentence.street": {
    en: "A calm city street in daylight, with shops in the background.",
    zh: "白天安静的城市街道，背景是沿街商店。",
  },
  "settings.sentence.garden": {
    en: "A green garden with a stone path in soft morning light.",
    zh: "绿意盎然的花园，石板路上洒着柔和晨光。",
  },
  "settings.sentence.livingRoom": {
    en: "A simple living room with a sofa and soft daylight.",
    zh: "简洁的客厅里放着沙发，自然光柔和。",
  },
  "settings.sentence.gym": {
    en: "A bright gym with exercise equipment and clear floor space.",
    zh: "明亮的健身房，器械旁留有空地。",
  },
  "settings.sentence": { en: "One sentence", zh: "一句描述" },
  "settings.copyPrompt": { en: "Copy prompt", zh: "复制提示词" },
  "settings.promptCopied": { en: "Prompt copied", zh: "提示词已复制" },
  "settings.saveImage": { en: "Save image", zh: "保存图片" },
  "settings.imagePending": { en: "Image pending", zh: "参考图待交付" },
  "settings.notSupplied": {
    en: "Image not supplied yet; saving is unavailable.",
    zh: "参考图尚未交付，暂不能保存。",
  },
  "settings.downloadFailed": {
    en: "Could not save the image. Try again.",
    zh: "图片没保存成功，请重试。",
  },
  "settings.imageSaved": { en: "Image saved.", zh: "图片已保存。" },
  "scene.title": { en: "Build a scene", zh: "摆个场面" },
  "scene.intro": {
    en: "Arrange up to 5 stand-in figures and save a layout image to upload alongside your actor references in an AI tool (no AI generation here).",
    zh: "最多摆 5 个人偶定好站位，保存站位图后，再和演员参考图一起传给你的 AI 绘图工具（本页不直接生图）。",
  },
  "scene.open": { en: "Build a scene", zh: "摆个场面" },
  "scene.loading": { en: "Loading the stage…", zh: "正在打开舞台…" },
  "scene.chooseFive": { en: "Choose up to five actors", zh: "选最多五位演员" },
  "scene.castUnchanged": { en: "Your saved cast stays unchanged.", zh: "不会改动你的选角单。" },
  "scene.start": { en: "Place these actors", zh: "摆上舞台" },
  "scene.savePng": { en: "Save PNG", zh: "保存 PNG" },
  "scene.undo": { en: "Undo", zh: "撤销" },
  "scene.redo": { en: "Redo", zh: "重做" },
  "scene.reset": { en: "Reset stage", zh: "重置舞台" },
  "scene.saved": { en: "Draft saved on this device.", zh: "草稿已保存在这台设备。" },
  "scene.unavailable": {
    en: "3D could not load. You can still use actor references and the Guide.",
    zh: "暂时无法打开 3D。演员参考图和使用指南仍可用。",
  },
  "scene.storageUnavailable": {
    en: "Local saving is unavailable. Keep this page open or save a PNG.",
    zh: "无法保存本地草稿。请保留此页，或先保存 PNG。",
  },
  "scene.exported": { en: "PNG saved.", zh: "PNG 已保存。" },
  "scene.failed": { en: "Could not save the PNG. Try again.", zh: "PNG 没保存成功，请重试。" },
  "scene.frame": { en: "Frame", zh: "画幅" },
  "scene.camera": { en: "Camera", zh: "机位" },
  "scene.view.eye": { en: "Eye level", zh: "平视" },
  "scene.view.low": { en: "Low", zh: "低机位" },
  "scene.view.high": { en: "High", zh: "高机位" },
  "scene.fit": { en: "Fit everyone", zh: "全员入镜" },
  "scene.line": { en: "Line up", zh: "排成一行" },
  "scene.faceOff": { en: "Face-off", zh: "面对面" },
  "scene.gestures": {
    en: "Drag a figure to move it. Drag empty space to orbit; pinch or scroll to zoom. Use the fields for precise placement.",
    zh: "拖人偶改位置，拖空白处转视角，双指或滚轮缩放。也可用输入框精确摆放。",
  },
  "scene.figures": { en: "Figures", zh: "人偶" },
  "scene.figure": { en: "Figure {count}", zh: "人偶 {count}" },
  "scene.add": { en: "Add figure", zh: "加个人偶" },
  "scene.remove": { en: "Remove", zh: "移除" },
  "scene.pose": { en: "Pose", zh: "姿势" },
  "scene.pose.stand": { en: "Stand", zh: "站立" },
  "scene.pose.walk": { en: "Walk", zh: "迈步" },
  "scene.pose.point": { en: "Point", zh: "指向" },
  "scene.pose.wave": { en: "Wave", zh: "挥手" },
  "scene.pose.sit": { en: "Sit", zh: "坐下" },
  "scene.pose.arms-crossed": { en: "Arms crossed", zh: "抱臂" },
  "scene.build": { en: "Build", zh: "体型" },
  "scene.build.slim": { en: "Slim", zh: "偏瘦" },
  "scene.build.average": { en: "Average", zh: "中等" },
  "scene.build.broad": { en: "Broad", zh: "宽壮" },
  "scene.height": { en: "Height", zh: "身高" },
  "scene.turn": { en: "Facing", zh: "朝向" },
  "scene.axis.x": { en: "Left / right (m)", zh: "左右（米）" },
  "scene.axis.z": { en: "Front / back (m)", zh: "前后（米）" },
  "scene.actorReferences": { en: "Actor reference sheet", zh: "演员设定图" },
  "scene.prompt": { en: "Actor prompt", zh: "演员对应提示词" },
  "scene.copyPrompt": { en: "Copy prompt", zh: "复制提示词" },
  "scene.promptCopied": { en: "Prompt copied", zh: "提示词已复制" },
  "scene.promptIntro": {
    en: "Upload the layout and each actor’s reference sheet. Match the numbers, names and coloured bands below. Use each actor’s face and outfit from their sheet, not the grey mannequin.",
    zh: "上传站位图和各演员设定图。按下列编号、姓名和色带对应人物；脸和服装以各自设定图为准，不照灰色人偶画。",
  },
  "scene.promptActor": {
    en: "{label} ({colour} band) → reference sheet: {url}",
    zh: "{label}（{colour}色带）→ 演员设定图：{url}",
  },
  "scene.promptUnassigned": {
    en: "{label} ({colour} band) → no actor reference assigned.",
    zh: "{label}（{colour}色带）→ 尚未指定演员参考图。",
  },
  "scene.colour.blue": { en: "blue", zh: "蓝" },
  "scene.colour.amber": { en: "amber", zh: "琥珀" },
  "scene.colour.magenta": { en: "magenta", zh: "紫红" },
  "scene.colour.teal": { en: "teal", zh: "青绿" },
  "scene.colour.purple": { en: "purple", zh: "紫" },
  "scene.approximate": {
    en: "Figures are generic stand-ins, not 3D actor models. Builds are approximate (unlisted heights start at 175 cm), and edits only affect this draft.",
    zh: "舞台上使用的是通用占位人偶（非演员 3D 模型）。体型仅作示意，未标注身高的演员默认按 175 cm 显示；修改只影响当前草稿。",
  },
  "nav.community": {
    en: "Community",
    zh: "泳者",
  },
  "c3.creatorWorks": {
    en: "Creator works",
    zh: "创作者作品",
  },
  "c3.withActor": {
    en: "Made with {name}",
    zh: "大家用 {name} 做的",
  },
  "c3.nextGraduation": {
    en: "Who joins the cast next?",
    zh: "下一位转正",
  },
  "c3.voteNotPromise": {
    en: "Current votes help set production priorities. Leading or tying is not a promise of promotion or a release date.",
    zh: "当前票数供制作排序参考。领先或并列不等于已确定转正，也不承诺交付日期。",
  },
  "c3.votes": {
    en: "{count} votes",
    zh: "{count} 票",
  },
  "c3.tied": {
    en: "Tied for the lead",
    zh: "并列领先",
  },
  "c3.noVotes": {
    en: "No votes yet. Cast the first vote!",
    zh: "还没有人投票，来投第一票吧。",
  },
  "c3.voteRoster": {
    en: "Meet the new faces and vote",
    zh: "去认识新面孔并投票",
  },
  "c3.official": {
    en: "Official example",
    zh: "官方示例",
  },
  "c3.creator": {
    en: "Creator work",
    zh: "用户作品",
  },
  "c3.officialExamples": {
    en: "See official samples",
    zh: "看官方样片",
  },
  "c3.separation": {
    en: "Works are labeled by source—official samples and creator posts are marked separately.",
    zh: "每件作品都会标明来源，官方样片与用户投稿分开标注。",
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
    en: "Media type",
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
    en: "Upload the expired file again",
    zh: "重新上传已过期的文件",
  },
  "c2.ownerOnly": {
    en: "Private review desk. Every action is authorized by the backend for the current Owner.",
    zh: "私有审核台，每次操作均由后端核验当前 Owner 权限。",
  },
  "c2.saved": {
    en: "Action saved. Reloading the current record below.",
    zh: "操作已保存，正在刷新当前记录。",
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
    en: "Pausing blocks new submissions and upload targets. Reading, reports, review and cleanup remain available.",
    zh: "暂停后不能新投稿或申请上传。阅读、举报、审核和清理仍可继续。",
  },
  "c2.pauseReason": {
    en: "Reason for changing submissions",
    zh: "变更投稿开关的原因",
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
    en: "Pause new submissions now? Existing published works stay visible.",
    zh: "现在暂停新投稿？已有公开作品仍可阅读。",
  },
  "c2.confirmResume": {
    en: "Resume new submissions with the current limits?",
    zh: "按当前额度恢复新投稿？",
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
    en: "Inspect media and history",
    zh: "查看媒体和历史",
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
    en: "No reports in this record.",
    zh: "本记录没有举报。",
  },
  "c2.history": {
    en: "Review history",
    zh: "审核历史",
  },
  "c2.noHistory": {
    en: "No history in this record.",
    zh: "本记录暂无历史。",
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
    en: "Approval applies only to this revision. It does not grant trust to the author.",
    zh: "通过只针对本修订，不会自动信任作者。",
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
    en: "Revoking trust sends future submissions to review. It does not remove previously published works.",
    zh: "撤销信任后，后续投稿需要审核；不会自动下架以前发布的作品。",
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
    en: "This author is not currently trusted.",
    zh: "当前未信任这位作者。",
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
    en: "Another draft in this tab is still saving. Finish that draft before editing a different work.",
    zh: "这个标签页还有一份草稿正在保存。请先回那份草稿处理完，再编辑其他作品。",
  },
  "c.resumeUpload": { en: "Resume upload", zh: "继续上传所选文件" },
  "c.transcript": {
    en: "Audio transcript (optional, creator-provided)",
    zh: "声音文字稿（可选，由创作者提供）",
  },
  "c.noTranscript": {
    en: "The creator has not provided a transcript.",
    zh: "创作者尚未提供文字稿。",
  },
  "c.loading": { en: "Loading…", zh: "加载中…" },
  "c.title": { en: "Community", zh: "泳者作品" },
  "c.new": { en: "Share a work", zh: "投稿作品" },
  "c.mine": { en: "My works", zh: "我的作品" },
  "c.noPosts": { en: "No works here yet.", zh: "这里还没有作品。" },
  "c.loadMore": { en: "Load more", zh: "加载更多" },
  "c.retry": { en: "Try again", zh: "刷新重试" },
  "c.retryWrite": { en: "Retry last action", zh: "重试刚才的操作" },
  "c.draftInvalidHint": {
    en: "We could not save this yet. Check the title and actor version. If both look right, send us the request number below. Your files are still here.",
    zh: "还没保存好。先看看标题和演员版本对不对。都没问题，就把下方请求编号发给我们。你选的文件还在。",
  },
  "c.requestReference": { en: "Request reference: {id}", zh: "请求编号：{id}" },
  "c.uncertain": {
    en: "Connection interrupted. Your submission request was saved—please don’t create a duplicate.",
    zh: "网络响应中断。系统已保留这次提交记录，请先别重复新建。",
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
  "c.files": { en: "Choose files", zh: "选择文件" },
  "c.fileLimits": {
    en: "Up to {count} files · {mib} MiB each",
    zh: "最多 {count} 个文件，每个 {mib} MiB",
  },
  "c.audioLimit": {
    en: "Up to {seconds} seconds (duration is checked on upload).",
    zh: "最长 {seconds} 秒（上传后会检查时长）。",
  },
  "c.dailyLimits": {
    en: "Daily limit: {posts} posts · {mib} MiB total (resets daily at 00:00 UTC).",
    zh: "每日上传额度：{posts} 次投稿、共 {mib} MiB（按 UTC 时间每天重置）。",
  },
  "c.metadata": {
    en: "Images are automatically re-saved before upload to strip metadata (original files must also fit the size limit).",
    zh: "上传前会自动重压图片并清除隐私信息（原图大小也需在上限内）。",
  },
  "c.preparing": { en: "Preparing files…", zh: "正在处理文件…" },
  "c.upload": { en: "Upload selected files", zh: "上传所选文件" },
  "c.cancel": { en: "Cancel", zh: "取消" },
  "c.checkStatus": { en: "Check processing status", zh: "查看处理状态" },
  "c.transfer": {
    en: "{loaded} / {total} bytes transferred",
    zh: "已传输 {loaded} / {total} 字节",
  },
  "c.reserving": { en: "Preparing upload…", zh: "正在准备上传…" },
  "c.uploading": { en: "Uploading", zh: "上传中" },
  "c.validating": {
    en: "Uploaded. Checking files now (not published yet).",
    zh: "上传完成，正在检查文件（尚未发布）。",
  },
  "c.ready": { en: "Files ready", zh: "文件检查通过" },
  "c.mediaLocked": {
    en: "Uploaded files are locked to this draft. Check the status before retrying, or start a new draft to use different files.",
    zh: "已上传的文件已绑定在这份草稿里。重试前请先查看状态；如果要换文件，请新建一份草稿。",
  },
  "c.publish": { en: "Submit for publication", zh: "提交发布" },
  "c.submitHelp": {
    en: "First submissions need review. The returned status, not this button, decides whether a work is public.",
    zh: "首次投稿需要审核。是否公开以服务端返回状态为准，不以点击按钮为准。",
  },
  "c.submitted": {
    en: "Submitted! Check the current status below.",
    zh: "已提交！你可以在下方查看最新状态。",
  },
  "c.returnReason": { en: "Reason for return", zh: "退回原因" },
  "c.openMedia": { en: "Show preview", zh: "显示媒体预览" },
  "c.openVideo": { en: "Load video player", zh: "加载视频播放器" },
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
    en: "Remove this work from public view? File cleanup will continue in the background.",
    zh: "确定删除这份作品吗？删除后将不再公开显示，后台会继续清理文件。",
  },
  "c.deleted": {
    en: "Removed from public view; files are being cleaned up.",
    zh: "作品已撤下，后台正在清理文件。",
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
    en: "This list expired. Refresh the page to load it again.",
    zh: "列表已过期，请刷新页面重新加载。",
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
    en: "Community features aren’t enabled for this address.",
    zh: "当前网址无法使用社区功能。",
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
    en: "Could not check the original request yet. Your request ID is kept when you retry.",
    zh: "暂时查不到刚才的提交记录，重试时会自动保留原请求编号。",
  },
  "c.error.REVISION_CONFLICT": {
    en: "This work was updated elsewhere. Reload the latest version before editing.",
    zh: "作品内容已有更新，请先刷新获取最新版本后再编辑。",
  },
  "c.error.IDEMPOTENCY_CONFLICT": {
    en: "This request doesn’t match the saved draft. Reload the saved work first.",
    zh: "这次请求与已保存内容不一致，请先刷新查看已保存版本。",
  },
  "c.error.INVALID_STATE": {
    en: "This action is not available in the current state. Refresh its status.",
    zh: "当前状态不能执行此操作，请刷新状态。",
  },
  "c.error.UPLOAD_EXPIRED": {
    en: "The upload link expired. Refresh the status before uploading again.",
    zh: "上传链接已过期，请先刷新状态再重新上传。",
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
    en: "This file couldn’t be verified. Please try an intact file in a supported format.",
    zh: "文件检查未通过，请换一个格式受支持且未损坏的文件。",
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
    en: "Copied",
    zh: "已复制",
  },
  "common.next": {
    en: "Next: {name}",
    zh: "下一位：{name}",
  },
  "nav.samples": { en: "Samples", zh: "样片" },
  "nav.learn": { en: "How to use", zh: "怎么用" },
  "nav.cast": { en: "My cast", zh: "选角单" },
  "nav.works": {
    en: "Samples & projects",
    zh: "样片与项目",
  },
  "nav.studio": {
    en: "Studio",
    zh: "工作室",
  },
  "home.metaTitle": {
    en: "SWIMMER PARTY — Original AI Animated Actors",
    zh: "SWIMMER PARTY · 原创 AI 动画演员",
  },
  "home.heroLines.0": { en: "Original AI animated actors.", zh: "原创 AI 动画演员" },
  "home.heroLines.1": { en: "Same look in any tool.", zh: "换工具也不走样" },
  "home.heroBody": {
    en: "Images, voices and prompts, free for commercial use. Watch both clips: same actor, two AI tools.",
    zh: "参考图、声音和提示词，免费商用。看两段样片：换了工具，还是同一个人。",
  },
  "home.ctaAssets": { en: "Browse actors", zh: "去挑演员" },
  "home.readyCount": { en: "{count} ready to use", zh: "{count} 位可直接用" },
  "home.newFaceCount": {
    en: "{count, plural, one {# new face} other {# new faces}}",
    zh: "{count, plural, other {# 位新面孔}}",
  },
  "home.samplesTitle": { en: "Official samples", zh: "官方样片" },
  "home.rosterTitle": { en: "Ready to use", zh: "可直接用的演员" },
  "home.rosterMore": { en: "See all actors", zh: "看全部演员" },
  "home.newFacesNote": {
    en: "First look. Vote for who gets a full pack next.",
    zh: "先放试镜照和声音，投票决定先补齐谁。",
  },
  "roster.metaTitle": {
    en: "Actors",
    zh: "演员",
  },
  "roster.metaDescription": {
    en: "Browse all SWIMMER PARTY animated AI actors—ready-to-use actors and new faces. Free for personal and commercial use; just credit SwimInAI.",
    zh: "浏览 SWIMMER PARTY 全部原创 AI 动画演员，包含可直接用的演员与待投票新面孔。个人与商用均免费，署名 SwimInAI 即可。",
  },
  "roster.appearance": { en: "Look or features", zh: "外貌特征" },
  "roster.origin": { en: "From", zh: "地区" },
  "roster.role": { en: "Role type", zh: "适合演什么" },
  "roster.role.comedy": { en: "Comedy", zh: "喜剧" },
  "roster.role.boss": { en: "Boss", zh: "老板 / 总裁" },
  "roster.role.villain": { en: "Villain", zh: "反派" },
  "roster.role.crew": { en: "Film crew", zh: "剧组" },
  "roster.height": { en: "Height", zh: "身高" },
  "roster.hasVoice": { en: "With voice", zh: "有声音" },
  "roster.hasVideo": { en: "With video", zh: "有视频" },
  "roster.resultCount": { en: "Matches: {count}", zh: "找到 {count} 位" },
  "roster.intro": {
    en: "{castable} actors ready to use, plus {newFaces} new faces you can vote for.",
    zh: "{castable} 位可直接用，{newFaces} 位新面孔等你投票。",
  },
  "roster.castableTitle": {
    en: "Ready to use",
    zh: "可直接用的演员",
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
  "works.heroLines.0": { en: "Watch the actors", zh: "先看样片，" },
  "works.heroLines.1": { en: "in action.", zh: "看看他们怎么演。" },
  "works.intro": {
    en: "Watch real clips made across AI tools, then open any actor to download their reference pack.",
    zh: "先看不同 AI 工具做出的真实样片，点开喜欢的演员就能免费下载参考素材。",
  },
  "studio.projectsTitle": { en: "Studio projects", zh: "工作室项目" },
  "studio.metaTitle": {
    en: "Studio",
    zh: "工作室",
  },
  "studio.metaDescription": {
    en: "How SWIMMER PARTY designs original animated AI actors, keeps them consistent across tools, and shares their reference packs.",
    zh: "了解 SWIMMER PARTY 如何设计原创 AI 动画演员、保持多角度一致，并向所有人免费开放参考素材。",
  },
  "studio.eyebrow": {
    en: "Studio",
    zh: "工作室",
  },
  "studio.heroLines.0": {
    en: "Original animated actors.",
    zh: "专注原创动画演员，",
  },
  "studio.heroLines.1": {
    en: "Open to every creator.",
    zh: "向每位创作者开放。",
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
  "studio.beliefs.0.title": { en: "More than one photo", zh: "不止一张正脸照" },
  "studio.beliefs.0.body": {
    en: "Reference views, expressions and actor notes give you a starting point.",
    zh: "转面、表情和演员设定，帮你开始创作。",
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
    en: "Original animated designs, not copies of real people.",
    zh: "原创动画形象，不复制真人。",
  },
  "studio.beliefs.2.n": {
    en: "03",
    zh: "03",
  },
  "studio.beliefs.2.title": {
    en: "Free and open to use",
    zh: "免费开放使用",
  },
  "studio.beliefs.2.body": {
    en: "Free for personal and commercial projects. Credit SwimInAI and follow the license.",
    zh: "个人创作和商用都免费；请署名 SwimInAI 并遵守授权规则。",
  },
  "studio.beliefs.3.n": {
    en: "04",
    zh: "04",
  },
  "studio.beliefs.3.title": {
    en: "Tested in real comedy scenes",
    zh: "能演喜剧，才算真演员",
  },
  "studio.beliefs.3.body": {
    en: "Watch our sample clips to see their timing, expressions and personality.",
    zh: "去样片里看看他们的表情、节奏和性格。",
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
    en: "We bring the actors and production; you bring the story, channel or funding. We co-own the film, and the actor stays in our library for future stories.",
    zh: "我们负责演员和制作，你出点子、渠道或资金。成片归双方共有，演员则会留在演员库里继续参演其他作品。",
  },
  "notFound.eyebrow": { en: "404 · Page not found", zh: "404 · 找不到页面" },
  "notFound.lines.0": {
    en: "Page not found.",
    zh: "没找到这一页，",
  },
  "notFound.lines.1": {
    en: "Meet the actors instead.",
    zh: "去看看演员吧。",
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
    zh: "定制演员和联合出品",
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
    en: "Coming soon",
    zh: "制作中",
  },
  "assets.legacy": {
    en: "Legacy",
    zh: "旧版",
  },
  "assets.slot.face.threeQuarterLeft": { en: "Other 3/4", zh: "另一半侧" },
  "assets.slot.face.sideRight": { en: "Other side", zh: "另一正侧" },
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
    en: "Download profile (JSON)",
    zh: "下载角色资料（JSON）",
  },
  "assets.noSeed": {
    en: "Prompt coming soon.",
    zh: "提示词即将上线。",
  },
  "assets.guestCooldown": {
    en: "Wait {seconds}s, or sign in free to skip the wait",
    zh: "请等 {seconds} 秒后再下，或免费登录跳过等待",
  },
  "assets.signIn": {
    en: "Sign in with Swimmer",
    zh: "用泳者账号登录",
  },
  "assets.signingIn": { en: "Opening…", zh: "正在前往…" },
  "assets.signInBenefits.0": {
    en: "Download all of an actor’s photos and voices at once",
    zh: "一键打包下载演员的全部图片和声音",
  },
  "assets.signInBenefits.1": { en: "Post your work, like and vote", zh: "发作品、点赞、投票" },
  "assets.signInBenefits.2": {
    en: "Build custom 4K character sheets",
    zh: "自由拼合 4K 角色设定图",
  },
  "assets.signInBenefits.3": {
    en: "No 30-second wait between downloads",
    zh: "连续下载不用等 30 秒",
  },
  "assets.signInConsent": {
    en: "By signing in you agree to our Terms of Use and Privacy Policy.",
    zh: "登录即表示同意《使用条款》和《隐私政策》。",
  },
  "assets.signInTitle": { en: "Sign in free to download packs", zh: "免费登录，一键打包下载" },
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
    en: "One transparent PNG per image, with the profile and terms of use.",
    zh: "每张一个透明背景 PNG，附角色资料和使用说明。",
  },
  "assets.format.model": {
    en: "By model",
    zh: "按模型",
  },
  "assets.format.modelNote": {
    en: "Picks and combines images to fit the model's reference limit, with an English note.",
    zh: "按所选模型的参考图上限自动挑图、拼图，并附上英文说明。",
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
    en: "{count} selected. This model takes up to {limit}, so we’ll keep the {limit} most useful.",
    zh: "已选 {count} 张；该模型最多收 {limit} 张，将自动保留最核心的 {limit} 张。",
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
    en: "This pack needs a front view, turnaround views and at least one expression—expressions for this actor are still in the works.",
    zh: "这个格式需要正面、转面和至少一张表情图。这位演员的表情图还在制作中。",
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
    en: "3/4 view",
    zh: "半侧",
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
    en: "3/4 view",
    zh: "半侧",
  },
  "assets.slot.face.side": {
    en: "Side",
    zh: "正侧",
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
    en: "Upset",
    zh: "烦躁",
  },
  "assets.slot.expression.angry": {
    en: "Angry",
    zh: "发怒",
  },
  "assets.slot.expression.surprised": {
    en: "Shock",
    zh: "惊讶",
  },
  "assets.slot.expression.scared": {
    en: "Scared",
    zh: "害怕",
  },
  "assets.slot.expression.disgusted": {
    en: "Grossed out",
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
    en: "Firm",
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
    en: "Wry smile",
    zh: "干笑",
  },
  "assets.slot.expression.deadpan": {
    en: "Blank",
    zh: "冷脸",
  },
  "assets.slot.wardrobe.front": {
    en: "Front",
    zh: "正面",
  },
  "assets.slot.wardrobe.threeQuarter": {
    en: "3/4 view",
    zh: "半侧",
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
    en: "No matching actors. Try clearing a few filters.",
    zh: "没找到符合条件的演员，减少几个筛选试试。",
  },
  "actor.openLibrary": {
    en: "Download starter pack",
    zh: "下载起步包",
  },
  "actor.freeFrontDownload": { en: "Download front photo (free)", zh: "免费下这张正面图" },
  "actor.fullPack": { en: "Download all files", zh: "下载全部文件" },
  "actor.starterFacts": {
    en: "Starter pack (~{size} MB): reference images ({count}) and character prompt.",
    zh: "起步包：含 {count} 张核心参考图和角色提示词（约 {size} MB）。",
  },
  "actor.fullPackFacts": {
    en: "All files (~{size} MB): original images ({images}) and voice clips ({voices}).",
    zh: "全部文件：含 {images} 张原图、{voices} 段声音（约 {size} MB）。",
  },
  "actor.guestNote": {
    en: "Single photos download without signing in (one every 30s). Sign in free to skip the wait and return right here.",
    zh: "单张图片免登录直接下（每张间隔 30 秒）；免费登录后不用等，还会直接回到本页。",
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
    en: "{name} hasn’t been in a show yet—cast them in yours for free!",
    zh: "{name}还没有参演过作品。免费带去你的故事里当主演吧！",
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
    en: "1st digit: new look · 2nd: new assets · 3rd: fixes",
    zh: "第 1 位：大改形象 · 第 2 位：新增素材 · 第 3 位：细节修正",
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
    en: "Temporary synthetic audio, not final voice acting. Full acoustic review is not complete.",
    zh: "临时合成声音，非正式配音；尚未完成完整声学审听。",
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
    en: "In your image or video tool, upload both images, paste the prompt and describe your scene.",
    zh: "打开你常用的图像或视频工具，上传这两张图，粘贴提示词，再写上你想要的场景。",
  },
  "assets.howTo.newFace1": {
    en: "Download the full-body casting photo.",
    zh: "下载这张全身试镜照。",
  },
  "assets.howTo.newFace3": {
    en: "In your image or video tool, upload the photo, paste the prompt and describe your scene.",
    zh: "打开你常用的图像或视频工具，上传这张图，粘贴提示词，再写上你想要的场景。",
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
    en: "Just one rule: credit SwimInAI.",
    zh: "只有一个要求：署上 SwimInAI。",
  },
  "assets.rulesBody": {
    en: "Use {name} in anything, even paid work. Put a small “SwimInAI” at the start and in the credits of a video, or in a corner of an image.",
    zh: "{name}可以用在任何地方，赚钱的也行。视频开头和片尾字幕放一行小字“SwimInAI”，图片放在角落。",
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
    en: "Studio projects in progress",
    zh: "工作室在拍项目",
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
    en: "Role to be announced",
    zh: "角色待定",
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
  "samples.loading": { en: "Loading the video…", zh: "正在加载视频…" },
  "samples.closePreview": { en: "Close video", zh: "关闭视频" },
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
    en: "{name} · video sample · {tool}",
    zh: "{name} · {tool} 视频样片",
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
    en: "Consistent across tools · Free commercial use",
    zh: "换工具也不走样 · 免费商用",
  },
  "home.licenseBadge": {
    en: "Free for commercial use · Credit SwimInAI",
    zh: "免费商用 · 署名 SwimInAI",
  },
  "home.licenseCta": { en: "How to credit", zh: "怎么署名" },
  "cast.title": { en: "My cast", zh: "选角单" },
  "cast.eyebrow": { en: "Cast", zh: "选角单" },
  "cast.intro": {
    en: "Group actors for your project and download their starter packs in one ZIP.",
    zh: "把同一部作品要用的演员加进来，一次打包下载。",
  },
  "license.badge": { en: "Free License · v1.0", zh: "免费商用 · v1.0" },
  "license.creditTitle": { en: "How to credit", zh: "怎么署名" },
  "license.creditNote": {
    en: "Any one of these counts. “SwimInAI” always stays in English; the words around it can be in any language.",
    zh: "下面任选一种都算。“SwimInAI”这几个字始终写英文，前后的话用什么语言都行。",
  },
  "license.creditFavourite": {
    en: "Our favourite is the third: name the actor. It helps them get famous, and if they take off because of you, you get first call.",
    zh: "我们最喜欢第三种：写上演员名字。他因为你火了，后面的项目你优先。",
  },
  "license.copyCredit": { en: "Copy credit line", zh: "复制署名" },
  "license.whereTitle": { en: "Where to put the credit", zh: "署名放哪里" },
  "license.whereMade": { en: "Project type", zh: "作品形式" },
  "license.wherePlacement": { en: "Where to credit", zh: "署名位置" },
  "license.whereSize": { en: "Minimum size", zh: "字号要求" },
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
    en: "Every actor on the site is free to use. If you need custom work or co-production:",
    zh: "站内现有演员都可以免费使用。如果你有专属定制或联合出品需求：",
  },
  "works.rolePrefix": { en: "as", zh: "饰" },
  "actor.newFaceDescription": {
    en: "Just one photo and one voice clip for now—vote if you want the full pack.",
    zh: "目前先放一张试镜照和一段声音，喜欢TA就投上一票。",
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
    en: "Your cast is empty. Click “Add to cast” on any actor page to download them together.",
    zh: "选角单还是空的。去演员页点「加入选角单」，就能在这里一次打包带走。",
  },
  "cast.pickActors": { en: "Pick actors", zh: "去挑演员" },
  "cast.count": { en: "{count} selected (up to 12)", zh: "已选 {count} 位（最多 12 位）" },
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
    en: "I made this myself and followed the Free License rules.",
    zh: "这是我自己做的作品，并遵守免费商用规则。",
  },
  "community.author": { en: "by {author}", zh: "作者：{author}" },
  "community.reported": { en: "Thanks. We’ll take a look.", zh: "谢谢，我们会看一下。" },
  "community.report": { en: "Report this post", zh: "举报这个作品" },
  "community.starring": { en: "Starring {actors}", zh: "出演：{actors}" },
  "community.delete": { en: "Delete", zh: "删除" },
  "community.voteLabel": { en: "Vote for {name}", zh: "投给{name}" },
  "license.heroLines.0": {
    en: "Free for personal and commercial projects.",
    zh: "个人创作、商用都免费。",
  },
  "license.metaDescription": {
    en: "Use SWIMMER PARTY’s animated actors in personal and commercial projects for free. Credit SwimInAI and follow the usage rules below.",
    zh: "SWIMMER PARTY 的动画演员可免费用于个人创作和商业项目。署名 SwimInAI，并遵守下列使用规则。",
  },
  "license.intro": {
    en: "Use our animated actors in films, ads, games, comics, music or merch under the rules below. No license fee or permission request. Credit SwimInAI where people can read it. Downloading packs requires a free Swimmer account.",
    zh: "动画演员可用于电影、广告、游戏、漫画、音乐和周边，具体规则见下方。无需支付许可费或申请许可；请在清晰可见处署名 SwimInAI。下载整包需要免费泳者账号。",
  },
  "license.heroLines.1": { en: "Just credit SwimInAI.", zh: "只需署名 SwimInAI。" },
  "common.languageName.zh": { en: "中文", zh: "中文" },
  "common.languageName.en": { en: "English", zh: "English" },
  "community.kind.image": { en: "Image", zh: "图片" },
  "community.kind.video": { en: "Video", zh: "视频" },
  "community.kind.audio": { en: "Audio", zh: "声音" },
  "common.breadcrumbFallback": { en: "Breadcrumb", zh: "当前位置" },
  "sheet.action": {
    en: "Make character sheet",
    zh: "拼设定图",
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
    en: "Pick angles and expressions of {name} to combine into one 4K reference sheet.",
    zh: "挑几张 {name} 的不同角度和表情，拼成一张 4K 参考设定图。",
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
    en: "Up to 16 images per sheet (max 8 full-body).",
    zh: "每张设定图最多拼 16 张，其中全身图最多 8 张。",
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
    en: "Download sheet + extras (ZIP)",
    zh: "下载设定图与附件（ZIP）",
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
    zh: "起步包",
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
    en: "Clicking Download starter pack starts the download",
    zh: "点击「下载起步包」即可开始下载",
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
    en: "Add actors to your cast,\nthen download them all at once from My cast.",
    zh: "把演员加进选角单，\n再到「选角单」一次打包下载全组。",
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
    en: "Keep your reference images and prompt together.\nThe guide shows three ways to prepare assets for your next scene.",
    zh: "把参考图和提示词保存在一起。\n指南里有三种准备素材的方法。",
  },
  "firstUse.cast.title": { en: "First cast tips", zh: "第一次组队，看看选角单" },
  "firstUse.cast.body": {
    en: "Your cast is saved in this browser.\nOpen My cast to review, share, or download the group pack.",
    zh: "选角单保存在当前浏览器。\n打开「选角单」即可查看、分享或一次打包下载。",
  },
  "firstUse.post.title": { en: "Before you submit", zh: "投稿前的小提示" },
  "firstUse.post.body": {
    en: "Select only actors used in your work and confirm your rights.\nSubmission status, media checks and review are different steps.",
    zh: "只选择作品实际使用的演员，并核对权利。\n提交、媒体检查和审核是不同的步骤。",
  },
  "firstUse.vote.title": { en: "First vote tips", zh: "第一次投票，看看规则" },
  "firstUse.vote.body": {
    en: "Vote to tell us which actor should get a full asset pack next.\nVotes help us prioritize production, without unlocking unmade files or promising a release date.",
    zh: "投一票，告诉我们你想先看哪位演员出全套素材。\n投票帮我们决定制作先后，但不会马上解锁新文件，也不设固定上线日期。",
  },
  "firstUse.vote.condition": {
    en: "A free Swimmer account is required to vote.",
    zh: "投票需要免费泳者账号。",
  },
  "downloads.authorizing": { en: "Preparing download…", zh: "正在准备下载…" },
  "downloads.fetching": { en: "Loading reference files", zh: "正在读取素材文件" },
  "downloads.filesProgress": {
    en: "{completed} / {total} files",
    zh: "{completed} / {total} 个文件",
  },
  "downloads.assembling": {
    en: "Almost ready—packing your files…",
    zh: "素材已就绪，正在打包…",
  },
  "learn.workflowPreview": { en: "How it works on the site", zh: "操作示意" },
  "learn.start.starter": { en: "Start with one actor", zh: "从一位演员开始" },
  "learn.start.sheet": { en: "Make a character sheet", zh: "做一张设定图" },
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
    en: "Upload this reference image (this is the input, not the tool’s output).",
    zh: "这是要上传的演员参考图（不是工具生成的成片）。",
  },
  "learn.getReference": { en: "Get the reference image", zh: "领取参考图" },
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
    en: "Opens another site. Its account, usage limits and charges are separate from Swimmer.",
    zh: "将打开其他网站，其账号、使用额度和费用与泳者账号分开。",
  },
  "learn.sources": { en: "Official references", zh: "官方参考资料" },
  "guide.title": {
    en: "Three ways to get an actor",
    zh: "三种下载方式，按需挑选",
  },
  "guide.lead": {
    en: "Grab one actor’s starter pack, combine angles into one 4K sheet, or bundle a full cast—then drop them into your AI tool.",
    zh: "可以单领一位演员的起步包、拼一张 4K 设定图，或者把多位演员一起打包，再放进常用的 AI 工具里开拍。",
  },
  "guide.starter.title": {
    en: "Starter pack · fastest start",
    zh: "起步包 · 最快开拍",
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
    zh: "入口：演员页点「下载起步包」。",
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
    en: "Inside: one big 4K picture made from the images you picked.",
    zh: "里面有：把你选的图片拼成一张大的 4K 图。",
  },
  "guide.sheet.where": {
    en: 'Where: "Make character sheet" on any actor page.',
    zh: "入口：演员页点「拼设定图」。",
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
    en: "Inside: every chosen actor’s starter pack in one ZIP, plus the credit line.",
    zh: "里面有：所选每位演员的起步包，合在一个压缩包里，附署名文本。",
  },
  "guide.cast.where": {
    en: 'Where: "Add to cast" on actor pages, then download from "My cast".',
    zh: "入口：演员页点「加入选角单」，再到「选角单」一键下载。",
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
    en: 'Free for commercial use under the usage rules. Credit "Actor name · SwimInAI" and read the full license before publishing.',
    zh: "遵守使用规则即可免费商用。请署名「演员名 · SwimInAI」，发布前阅读完整授权。",
  },
  "guide.browse": {
    en: "Browse actors",
    zh: "去挑演员",
  },
} as const;
