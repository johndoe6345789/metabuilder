declare module '@aws-sdk/lib-storage' {
  export class Upload {
    constructor(options: any);
    done(): Promise<any>;
  }
}
