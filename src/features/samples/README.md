# Samples

负责官方样片在演员页与作品页的展示。

- 入口：`index.ts` 的 OfficialSamplesSection、ActorSample。
- 唯一源：生产记录 officialSamples → `content/official-samples.generated.ts`；不在组件里添样片副本。
- 合同：批准的公开样片地址、演员归属、工具与批准日期，不伪造可播放媒体。
- 验证：`tools/test/actor-data.test.ts`、`generated-media.test.ts`、`e2e/actors.spec.ts`。
