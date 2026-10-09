import type { Look } from "../look-types.ts";

export const looks: Look[] = [
  {
    id: "personal",
    kind: "personal",
    label: { en: "Personal style", zh: "个人风格" },
    prompt:
      "Personal style: light camel double-breasted trench coat worn open; white button-up blouse; tailored charcoal-grey straight-leg trousers; black low-block heels; small pearl stud earrings. Her black hair is pulled into her signature tight low bun.",
    extras: [
      {
        key: "manuscript",
        label: { en: "Reviewing a manuscript", zh: "审阅稿件" },
        direction: "reading a paper manuscript, focused and composed",
      },
      {
        key: "red-pen",
        label: { en: "Marking a script", zh: "红笔批稿" },
        direction: "marking a paper manuscript with a red pen",
      },
      {
        key: "half-smile",
        label: { en: "Half-smile", zh: "浅笑" },
        direction: "close-up with a restrained half-smile",
      },
      {
        key: "portrait",
        label: { en: "Portrait", zh: "肖像" },
        direction: "head-and-shoulders portrait",
      },
    ],
  },
];
