export type OnInit = {
  init(): void | Promise<void>;
}
export type OnDestroy = {
  destroy(): void | Promise<void>;
}
