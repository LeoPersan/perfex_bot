declare module 'typhonjs-escomplex' {
  const escomplex: {
    analyzeModule(code: string, settings?: any): any;
    analyzeProject(modules: Array<{ path: string; code: string }>, settings?: any): any;
  };
  export default escomplex;
}
