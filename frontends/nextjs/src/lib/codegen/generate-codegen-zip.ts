import JSZip from 'jszip'

import { CodegenSpec } from './codegen-types'
import { createProjectTemplate } from './create-project-template'

export const generateCodegenZip = async (spec: CodegenSpec) => {
  const template = createProjectTemplate(spec)
  const zip = new JSZip()

  template.files.forEach((file) => {
    zip.file(file.path, file.contents)
  })

  const uint8Array = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
  return {
    fileName: template.zipName,
    manifest: template.manifest,
    zipBuffer: Buffer.from(uint8Array),
  }
}
