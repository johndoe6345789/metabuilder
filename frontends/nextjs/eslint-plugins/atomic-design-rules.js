/**
 * ESLint plugin to enforce atomic design hierarchy rules
 * 
 * Rules:
 * - Atoms cannot import from molecules or organisms
 * - Molecules cannot import from organisms
 */

export default {
  rules: {
    'no-upward-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent atoms from importing molecules/organisms and molecules from importing organisms',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          atomImportsMolecule: 'Atoms cannot import from molecules. Atoms should only use MUI and React primitives.',
          atomImportsOrganism: 'Atoms cannot import from organisms. Atoms should only use MUI and React primitives.',
          moleculeImportsOrganism: 'Molecules cannot import from organisms. Molecules should only import atoms.',
        },
        schema: [],
      },
      create(context) {
        const filename = context.getFilename()
        
        // Determine component level based on file path
        const isAtom = filename.includes('/atoms/')
        const isMolecule = filename.includes('/molecules/')
        
        return {
          ImportDeclaration(node) {
            const importPath = node.source.value
            
            // Check if atom is importing from molecule or organism
            if (isAtom) {
              if (importPath.includes('molecules') || importPath.includes('@/components/molecules')) {
                context.report({
                  node,
                  messageId: 'atomImportsMolecule',
                })
              }
              if (importPath.includes('organisms') || importPath.includes('@/components/organisms')) {
                context.report({
                  node,
                  messageId: 'atomImportsOrganism',
                })
              }
            }
            
            // Check if molecule is importing from organism
            if (isMolecule) {
              if (importPath.includes('organisms') || importPath.includes('@/components/organisms')) {
                context.report({
                  node,
                  messageId: 'moleculeImportsOrganism',
                })
              }
            }
          },
        }
      },
    },
  },
}
