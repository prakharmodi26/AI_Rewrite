declare module 'uuid' {
  const uuid: { v4(): string } & ((...args: any[]) => string);
  export default uuid;
}
