# Actors

负责名册、筛选、演员档案与图片表现。

- 入口：`index.ts` 供服务器页面组合；`queries.ts` 提供不引入 UI 的查询。图片组件供本功能直接使用，不另建空 client barrel。
- 事实：[演员数据归属](../../content/actors/README.md)。不在页面或查询层复制生产记录。
- 合同：永久 slug、双语档案、已交付状态、筛选与分享路径；无图不伪造交付。
- `discovery.ts` 为纯筛选/URL合同：姓名、外貌关键词、性别、年龄、语言、已写地区、身高、戏路线索及真实声音/视频。戏路仅匹配已写片单和角色描述；外貌搜索只检索既有文字，不从图片推断族裔或性格。声音语言不等于声音文件已交付。
- 桌面默认筛选为一行，外貌、年龄、语言等收在“更多筛选”；素材状态可选 Ready / New faces，过滤后跳到对应分组，工具名图例解释样片所用工具，简介仍为两行。
- URL 为筛选状态来源（含 `readiness=active|new-face`）；服务器使用相同参数首屏渲染，浏览器保留外部查询参数并支持返回/前进/分享。clear 重置已知筛选，不删来源参数。
- 验证：`tools/test/actor-data.test.ts`、`roster.test.ts`、`discovery.test.ts`、`e2e/actors.spec.ts`、`assets.spec.ts`、`discovery-next-stage.spec.ts`（含素材状态/跳转与紧凑筛选）、`build-1-layout.spec.ts`（手机先看演员、起步包范围/账号说明与页签留白）。
