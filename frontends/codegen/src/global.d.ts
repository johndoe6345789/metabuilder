declare module '*.css' {}
declare module '*.scss' {}
declare module '*.svg' {}

// Webpack require.context types — must all be in declare global because
// "moduleDetection": "force" in tsconfig treats this .d.ts file as a module.
declare global {
  namespace __WebpackModuleApi {
    interface RequireContext {
      keys(): string[];
      (id: string): any;
      <T>(id: string): T;
      resolve(id: string): string;
      id: string;
    }
  }

  interface NodeRequire {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
      mode?: string
    ): __WebpackModuleApi.RequireContext;
  }

  interface Require {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
      mode?: string
    ): __WebpackModuleApi.RequireContext;
  }

  // Declare require as a global variable with webpack context support
  var require: NodeRequire & {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
      mode?: string
    ): __WebpackModuleApi.RequireContext;
  }
}

export {}
