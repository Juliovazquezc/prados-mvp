export type MessageKeys = keyof typeof import("./messages/en").default;
export type Messages = Record<MessageKeys, string>;
export type Locale = "en" | "es";
