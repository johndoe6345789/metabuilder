/**
 * Utility components F–R: file upload, filter, icon, image, input,
 * password, repeat.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from
  './create-json-component-with-hooks'
import type {
  FileUploadProps, FilterInputProps, IconRendererProps,
  ImageProps, InputProps, PasswordInputProps,
  RepeatWrapperProps,
} from './interfaces'
import fileUploadDef from
  '@/components/json-definitions/file-upload.json'
import filterInputDef from
  '@/components/json-definitions/filter-input.json'
import iconRendererDef from
  '@/components/json-definitions/icon-renderer.json'
import imageDef from '@/components/json-definitions/image.json'
import inputDef from '@/components/json-definitions/input.json'
import passwordInputDef from
  '@/components/json-definitions/password-input.json'
import repeatWrapperDef from
  '@/components/json-definitions/repeat-wrapper.json'

export const MetabuilderFormFileUpload =
  createJsonComponentWithHooks<FileUploadProps>(fileUploadDef, {
    hooks: { uploadState: {
      hookName: 'useFileUpload',
      args: (p) => [p.onFilesSelected, p.maxSize, p.disabled],
    } },
  })
export const MetabuilderFormFilterInput =
  createJsonComponentWithHooks<FilterInputProps>(
    filterInputDef,
    { hooks: { focusState: {
      hookName: 'useFocusState', args: () => [],
    } } },
  )
export const MetabuilderDisplayIconRenderer =
  createJsonComponent<IconRendererProps>(iconRendererDef)
export const MetabuilderDisplayImage =
  createJsonComponentWithHooks<ImageProps>(imageDef, {
    hooks: { imageState: {
      hookName: 'useImageState',
      args: (p) => [p.onLoad, p.onError],
    } },
  })
export const MetabuilderFormInput =
  createJsonComponent<InputProps>(inputDef)
export const MetabuilderFormPasswordInput =
  createJsonComponentWithHooks<PasswordInputProps>(
    passwordInputDef,
    { hooks: { visibility: {
      hookName: 'usePasswordVisibility', args: () => [],
    } } },
  )
export const MetabuilderLayoutRepeatWrapper =
  createJsonComponentWithHooks<RepeatWrapperProps>(
    repeatWrapperDef,
    { hooks: { repeatData: {
      hookName: 'useRepeatWrapper',
      args: (p) => [{
        items: p.items, render: p.render,
      }],
    } } },
  )
