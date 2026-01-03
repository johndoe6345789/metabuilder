// TODO: Implement package route validation
export const validatePackageRoute = (packageId: string) => true
export const canBePrimaryPackage = (packageId: string) => true
export const loadPackageMetadata = async (packageId: string) => ({ 
  name: packageId, 
  version: '1.0.0',
  dependencies: [] as string[],
  minLevel: 1
})
