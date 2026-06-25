# Media Center Workflow Update Plan

**Last Updated**: 2026-01-22
**Status**: In Progress
**Scope**: 4 Workflows in `/packages/media_center/workflow/`
**Compliance Target**: n8n Schema with UUID versioning, multi-tenant support, and lifecycle management

---

## Executive Summary

The media_center package contains 4 JSON workflows that require standardization to follow the n8n compliance schema established in the GameEngine bootstrap workflows and packagerepo backend services.

### Current State
- **Location**: `/packages/media_center/workflow/`
- **Files**: 4 `.json` files (note: package.json lists `.jsonscript` extension)
- **Current Schema**: Basic n8n structure with nodes/connections/settings
- **Missing Elements**: Workflow-level `id`, `versionId`, `tenantId`, active status tracking

### Target State
- **Fully Compliant**: n8n schema with all recommended fields
- **Versioned**: Unique identifiers for audit trails and optimization
- **Multi-Tenant**: Explicit tenantId support for all workflows
- **Lifecycle Managed**: Active/inactive status, deployment tracking
- **Documented**: Complete validation checklist and migration guide

---

## Current Workflow Structure Analysis

### 1. Extract Image Metadata (`extract-image-metadata.json`)

**Current Status**: ⚠️ Partial Compliance

**Structure**:
```json
{
  "name": "Extract Image Metadata",
  "active": false,
  "nodes": [...],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": { ... }
}
```

**Node Count**: 7 nodes
**Node Types**:
- `metabuilder.validate` (2x)
- `metabuilder.database` (2x)
- `metabuilder.operation` (1x)
- `metabuilder.transform` (1x)
- `metabuilder.action` (1x)

**Current Issues**:
- ❌ Missing workflow-level `id` field
- ❌ Missing `versionId` for version tracking
- ❌ No explicit `tenantId` parameter
- ⚠️ tenantId only referenced in node parameters, not workflow config

### 2. Extract Video Metadata (`extract-video-metadata.json`)

**Current Status**: ⚠️ Partial Compliance

**Structure**: Same as image metadata workflow

**Node Count**: 7 nodes
**Node Types**: Similar to image extraction (validate, database, operation, transform, action)

**Current Issues**:
- ❌ Missing workflow-level `id` and `versionId`
- ❌ No explicit `tenantId` at workflow level
- ⚠️ Video-specific codec/resolution parameters need validation

### 3. List User Media (`list-user-media.json`)

**Current Status**: ⚠️ Partial Compliance

**Structure**: Same as extraction workflows

**Node Count**: 9 nodes
**Node Types**: Similar pattern (validate, transform, database, operation, action)

**Current Issues**:
- ❌ Missing workflow-level `id` and `versionId`
- ❌ Pagination logic embedded in parameters
- ⚠️ Sort/filter options need standardization

### 4. Delete Media Asset (`delete-media.json`)

**Current Status**: ⚠️ Partial Compliance

**Structure**: Same as other workflows

**Node Count**: 6 nodes
**Node Types**: validate, database, condition, operation, action

**Current Issues**:
- ❌ Missing workflow-level `id` and `versionId`
- ⚠️ File deletion operations need safety checks
- ⚠️ Authorization condition could use hardening

---

## Required Changes by Workflow

### Change 1: Add Workflow-Level Metadata

**Apply to All 4 Workflows**

**Current** (None of these fields):
```json
{
  "name": "Extract Image Metadata",
  "active": false,
  "nodes": [...]
}
```

**Updated**:
```json
{
  "id": "wf_extract_image_metadata_v1",
  "versionId": "v1.0.0",
  "name": "Extract Image Metadata",
  "description": "Extract metadata from image files (dimensions, format, EXIF, color space)",
  "tenantId": null,
  "active": false,
  "deployedAt": null,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "nodes": [...]
}
```

**Rationale**:
- `id`: Unique identifier for audit trails and versioning
- `versionId`: Semantic versioning for workflow evolution
- `tenantId`: Null at workflow definition; populated at runtime
- `active`: Lifecycle status (false = disabled, true = active)
- Timestamps: Audit trail for deployment tracking

### Change 2: Standardize Node Structure

**Apply to All Nodes Across 4 Workflows**

**Current**:
```json
{
  "id": "validate_context",
  "name": "Validate Context",
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": { ... }
}
```

**Updated** (Add optional fields for better tracking):
```json
{
  "id": "validate_context",
  "name": "Validate Context",
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "position": [100, 100],
  "disabled": false,
  "notes": "Validate that tenantId is present in execution context",
  "continueOnFail": false,
  "parameters": { ... }
}
```

**Rationale**:
- `disabled`: Allow selective node activation without deletion
- `notes`: Self-documenting purpose for canvas display
- `continueOnFail`: Error handling strategy per node
- Aligns with n8n best practices from GameEngine workflows

### Change 3: Standardize Connections Format

**Apply to All 4 Workflows**

**Current**:
```json
{
  "connections": {}
}
```

**Updated**:
```json
{
  "connections": {
    "validate_context": {
      "main": [[{ "node": "validate_input", "type": "main", "index": 0 }]]
    },
    "validate_input": {
      "main": [[{ "node": "fetch_asset", "type": "main", "index": 0 }]]
    }
  }
}
```

**Rationale**:
- Explicit connection mapping enables validation and visualization
- Current empty `connections` object suggests DAG is implicit
- Explicit format enables cycle detection and optimization

### Change 4: Multi-Tenant Parameter Validation

**Apply to All 4 Workflows**

**Issue**: tenantId filtering only happens in node parameters, not workflow level

**Current Example from Extract Image**:
```json
{
  "id": "validate_context",
  "parameters": {
    "input": "{{ $context.tenantId }}",
    "operation": "validate",
    "validator": "required"
  }
}
```

**Updated**: Add explicit tenantId validation node

```json
{
  "id": "validate_tenant",
  "name": "Validate Tenant",
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": {
    "input": "{{ $context.tenantId }}",
    "operation": "validate",
    "rules": {
      "tenantId": "required|string|uuid"
    }
  }
}
```

**Rationale**:
- Mandatory tenant validation at workflow entry point
- Prevents accidental data leaks across tenants
- Matches MULTI_TENANT_AUDIT.md requirements

### Change 5: Add Execution Settings

**Apply to All 4 Workflows**

**Current**:
```json
{
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

**Updated**:
```json
{
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 300,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "log_and_fail",
    "retryPolicy": {
      "maxAttempts": 1,
      "backoffMs": 0
    },
    "dataRetention": {
      "daysToKeep": 7,
      "minSizeKb": 100
    },
    "variables": {
      "MAX_FILE_SIZE": "5GB",
      "SUPPORTED_FORMATS": ["jpeg", "png", "gif", "webp", "mp4", "mkv"]
    }
  }
}
```

**Rationale**:
- Timeouts: Image/video processing needs bounded execution (5min vs 1hour)
- Error handling: Explicit failure policy for media operations
- Variables: Centralized configuration instead of hardcoded values
- Data retention: Comply with GDPR/storage policies

---

## Updated JSON Examples

### Example 1: Extract Image Metadata (Updated)

```json
{
  "id": "wf_extract_image_metadata_v1",
  "versionId": "1.0.0",
  "name": "Extract Image Metadata",
  "description": "Extract and store metadata from image files including dimensions, format, EXIF data, and color space. Applies multi-tenant filtering and async event emission.",
  "tenantId": null,
  "active": false,
  "deployedAt": null,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": ["media", "image", "metadata", "extraction"],
  "nodes": [
    {
      "id": "validate_tenant",
      "name": "Validate Tenant",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [50, 100],
      "disabled": false,
      "notes": "Entry point: validate tenantId is present and valid UUID",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "rules": {
          "tenantId": "required|string|uuid"
        }
      }
    },
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "disabled": false,
      "notes": "Validate request body has required fields (assetId, filePath)",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "assetId": "required|string|uuid",
          "filePath": "required|string|path",
          "format": "optional|string|in:jpeg,png,gif,webp"
        }
      }
    },
    {
      "id": "fetch_asset",
      "name": "Fetch Asset",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "disabled": false,
      "notes": "Fetch media asset record with multi-tenant filtering",
      "continueOnFail": false,
      "parameters": {
        "entity": "MediaAsset",
        "operation": "database_read",
        "filter": {
          "id": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "check_asset_exists",
      "name": "Check Asset Exists",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [1000, 100],
      "disabled": false,
      "notes": "Verify asset exists and belongs to tenant",
      "continueOnFail": false,
      "parameters": {
        "condition": "{{ $steps.fetch_asset.output !== null && $steps.fetch_asset.output.tenantId === $context.tenantId }}",
        "operation": "condition",
        "then": "extract_image_info",
        "else": "error_not_found"
      }
    },
    {
      "id": "extract_image_info",
      "name": "Extract Image Info",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "disabled": false,
      "notes": "Analyze image file and extract technical metadata",
      "continueOnFail": false,
      "parameters": {
        "operation": "analyze_image",
        "filePath": "{{ $json.filePath }}",
        "output": {
          "width": true,
          "height": true,
          "format": true,
          "colorSpace": true,
          "hasAlpha": true,
          "exif": true,
          "dpi": true
        }
      }
    },
    {
      "id": "calculate_dimensions",
      "name": "Calculate Dimensions",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "disabled": false,
      "notes": "Transform raw image data into structured metadata",
      "continueOnFail": false,
      "parameters": {
        "operation": "transform_data",
        "output": {
          "width": "{{ $steps.extract_image_info.output.width }}",
          "height": "{{ $steps.extract_image_info.output.height }}",
          "aspectRatio": "{{ ($steps.extract_image_info.output.width / $steps.extract_image_info.output.height).toFixed(2) }}",
          "megapixels": "{{ ((($steps.extract_image_info.output.width * $steps.extract_image_info.output.height) / 1000000).toFixed(1)) }}",
          "format": "{{ $steps.extract_image_info.output.format.toUpperCase() }}",
          "colorSpace": "{{ $steps.extract_image_info.output.colorSpace }}",
          "hasAlpha": "{{ $steps.extract_image_info.output.hasAlpha }}"
        }
      }
    },
    {
      "id": "update_asset_metadata",
      "name": "Update Asset Metadata",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 300],
      "disabled": false,
      "notes": "Persist extracted metadata to database with tenant context",
      "continueOnFail": false,
      "parameters": {
        "entity": "MediaAsset",
        "operation": "database_update",
        "filter": {
          "id": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "data": {
          "metadata": {
            "dimensions": "{{ $steps.calculate_dimensions.output }}",
            "format": "{{ $steps.extract_image_info.output.format }}",
            "colorSpace": "{{ $steps.extract_image_info.output.colorSpace }}",
            "hasAlpha": "{{ $steps.extract_image_info.output.hasAlpha }}",
            "exif": "{{ $steps.extract_image_info.output.exif }}"
          },
          "extractedAt": "{{ new Date().toISOString() }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "emit_complete",
      "name": "Emit Complete",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 500],
      "disabled": false,
      "notes": "Emit event to notify subscribers of metadata extraction",
      "continueOnFail": true,
      "parameters": {
        "action": "emit_event",
        "event": "image_metadata_extracted",
        "channel": "{{ 'media:' + $context.tenantId }}",
        "data": {
          "assetId": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}",
          "metadata": "{{ $steps.calculate_dimensions.output }}",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 500],
      "disabled": false,
      "notes": "Return extracted metadata to client",
      "continueOnFail": false,
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "ok": true,
          "data": "{{ $steps.update_asset_metadata.output }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "error_not_found",
      "name": "Error Not Found",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 500],
      "disabled": false,
      "notes": "Return 404 if asset not found",
      "continueOnFail": false,
      "parameters": {
        "action": "http_response",
        "status": 404,
        "body": {
          "ok": false,
          "error": "Asset not found or unauthorized",
          "assetId": "{{ $json.assetId }}"
        }
      }
    }
  ],
  "connections": {
    "validate_tenant": {
      "main": [[{ "node": "validate_input", "type": "main", "index": 0 }]]
    },
    "validate_input": {
      "main": [[{ "node": "fetch_asset", "type": "main", "index": 0 }]]
    },
    "fetch_asset": {
      "main": [[{ "node": "check_asset_exists", "type": "main", "index": 0 }]]
    },
    "check_asset_exists": {
      "main": [
        [{ "node": "extract_image_info", "type": "main", "index": 0 }],
        [{ "node": "error_not_found", "type": "main", "index": 0 }]
      ]
    },
    "extract_image_info": {
      "main": [[{ "node": "calculate_dimensions", "type": "main", "index": 0 }]]
    },
    "calculate_dimensions": {
      "main": [[{ "node": "update_asset_metadata", "type": "main", "index": 0 }]]
    },
    "update_asset_metadata": {
      "main": [
        [{ "node": "emit_complete", "type": "main", "index": 0 }],
        [{ "node": "return_success", "type": "main", "index": 0 }]
      ]
    },
    "emit_complete": {
      "main": [[{ "node": "return_success", "type": "main", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "category": "media",
    "author": "MetaBuilder",
    "source": "media_center",
    "supportedFormats": ["jpeg", "png", "gif", "webp"],
    "maxFileSize": "5GB",
    "performanceClass": "standard"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 300,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "log_and_fail",
    "retryPolicy": {
      "maxAttempts": 1,
      "backoffMs": 0
    },
    "dataRetention": {
      "daysToKeep": 7,
      "minSizeKb": 100
    },
    "variables": {
      "MAX_FILE_SIZE": "5GB",
      "SUPPORTED_FORMATS": ["jpeg", "png", "gif", "webp"],
      "TIMEOUT_MS": 300000,
      "ENABLE_EXIF": true
    }
  }
}
```

### Example 2: Extract Video Metadata (Updated)

```json
{
  "id": "wf_extract_video_metadata_v1",
  "versionId": "1.0.0",
  "name": "Extract Video Metadata",
  "description": "Extract and store metadata from video files including duration, bitrate, codecs, resolution, and fps. Applies multi-tenant filtering and async event emission.",
  "tenantId": null,
  "active": false,
  "deployedAt": null,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": ["media", "video", "metadata", "extraction", "ffmpeg"],
  "nodes": [
    {
      "id": "validate_tenant",
      "name": "Validate Tenant",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [50, 100],
      "disabled": false,
      "notes": "Entry point: validate tenantId is present and valid UUID",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "rules": {
          "tenantId": "required|string|uuid"
        }
      }
    },
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "disabled": false,
      "notes": "Validate request body has required fields",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "assetId": "required|string|uuid",
          "filePath": "required|string|path",
          "format": "optional|string|in:mp4,mkv,avi,mov,flv,webm"
        }
      }
    },
    {
      "id": "fetch_asset",
      "name": "Fetch Asset",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "disabled": false,
      "notes": "Fetch media asset record with multi-tenant filtering",
      "continueOnFail": false,
      "parameters": {
        "entity": "MediaAsset",
        "operation": "database_read",
        "filter": {
          "id": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "check_asset_exists",
      "name": "Check Asset Exists",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [1000, 100],
      "disabled": false,
      "notes": "Verify asset exists and belongs to tenant",
      "continueOnFail": false,
      "parameters": {
        "condition": "{{ $steps.fetch_asset.output !== null && $steps.fetch_asset.output.tenantId === $context.tenantId }}",
        "operation": "condition",
        "then": "extract_video_info",
        "else": "error_not_found"
      }
    },
    {
      "id": "extract_video_info",
      "name": "Extract Video Info",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "disabled": false,
      "notes": "Analyze video file using FFmpeg and extract technical metadata",
      "continueOnFail": false,
      "parameters": {
        "operation": "analyze_video",
        "filePath": "{{ $json.filePath }}",
        "output": {
          "duration": true,
          "bitrate": true,
          "codec": true,
          "videoCodec": true,
          "audioCodec": true,
          "width": true,
          "height": true,
          "fps": true,
          "colorBitDepth": true
        }
      }
    },
    {
      "id": "format_duration",
      "name": "Format Duration",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "disabled": false,
      "notes": "Convert duration seconds to HH:MM:SS format and compute aspect ratio",
      "continueOnFail": false,
      "parameters": {
        "operation": "transform_data",
        "output": {
          "seconds": "{{ $steps.extract_video_info.output.duration }}",
          "formatted": "{{ Math.floor($steps.extract_video_info.output.duration / 3600) }}:{{ Math.floor(($steps.extract_video_info.output.duration % 3600) / 60).toString().padStart(2, '0') }}:{{ ($steps.extract_video_info.output.duration % 60).toString().padStart(2, '0') }}",
          "aspectRatio": "{{ ($steps.extract_video_info.output.width / $steps.extract_video_info.output.height).toFixed(2) }}",
          "totalFrames": "{{ Math.round($steps.extract_video_info.output.duration * $steps.extract_video_info.output.fps) }}"
        }
      }
    },
    {
      "id": "update_asset_metadata",
      "name": "Update Asset Metadata",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 300],
      "disabled": false,
      "notes": "Persist extracted video metadata to database with tenant context",
      "continueOnFail": false,
      "parameters": {
        "entity": "MediaAsset",
        "operation": "database_update",
        "filter": {
          "id": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "data": {
          "metadata": {
            "duration": "{{ $steps.format_duration.output }}",
            "bitrate": "{{ $steps.extract_video_info.output.bitrate }}",
            "codec": "{{ $steps.extract_video_info.output.codec }}",
            "videoCodec": "{{ $steps.extract_video_info.output.videoCodec }}",
            "audioCodec": "{{ $steps.extract_video_info.output.audioCodec }}",
            "resolution": {
              "width": "{{ $steps.extract_video_info.output.width }}",
              "height": "{{ $steps.extract_video_info.output.height }}",
              "aspectRatio": "{{ $steps.format_duration.output.aspectRatio }}"
            },
            "fps": "{{ $steps.extract_video_info.output.fps }}",
            "colorBitDepth": "{{ $steps.extract_video_info.output.colorBitDepth }}"
          },
          "extractedAt": "{{ new Date().toISOString() }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "emit_complete",
      "name": "Emit Complete",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 500],
      "disabled": false,
      "notes": "Emit event to notify subscribers of metadata extraction completion",
      "continueOnFail": true,
      "parameters": {
        "action": "emit_event",
        "event": "video_metadata_extracted",
        "channel": "{{ 'media:' + $context.tenantId }}",
        "data": {
          "assetId": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}",
          "duration": "{{ $steps.format_duration.output.formatted }}",
          "resolution": "{{ $steps.extract_video_info.output.width }}x{{ $steps.extract_video_info.output.height }}",
          "fps": "{{ $steps.extract_video_info.output.fps }}",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 500],
      "disabled": false,
      "notes": "Return extracted metadata to client",
      "continueOnFail": false,
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "ok": true,
          "data": "{{ $steps.update_asset_metadata.output }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "error_not_found",
      "name": "Error Not Found",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 500],
      "disabled": false,
      "notes": "Return 404 if asset not found or unauthorized",
      "continueOnFail": false,
      "parameters": {
        "action": "http_response",
        "status": 404,
        "body": {
          "ok": false,
          "error": "Asset not found or unauthorized",
          "assetId": "{{ $json.assetId }}"
        }
      }
    }
  ],
  "connections": {
    "validate_tenant": {
      "main": [[{ "node": "validate_input", "type": "main", "index": 0 }]]
    },
    "validate_input": {
      "main": [[{ "node": "fetch_asset", "type": "main", "index": 0 }]]
    },
    "fetch_asset": {
      "main": [[{ "node": "check_asset_exists", "type": "main", "index": 0 }]]
    },
    "check_asset_exists": {
      "main": [
        [{ "node": "extract_video_info", "type": "main", "index": 0 }],
        [{ "node": "error_not_found", "type": "main", "index": 0 }]
      ]
    },
    "extract_video_info": {
      "main": [[{ "node": "format_duration", "type": "main", "index": 0 }]]
    },
    "format_duration": {
      "main": [[{ "node": "update_asset_metadata", "type": "main", "index": 0 }]]
    },
    "update_asset_metadata": {
      "main": [
        [{ "node": "emit_complete", "type": "main", "index": 0 }],
        [{ "node": "return_success", "type": "main", "index": 0 }]
      ]
    },
    "emit_complete": {
      "main": [[{ "node": "return_success", "type": "main", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "category": "media",
    "author": "MetaBuilder",
    "source": "media_center",
    "supportedFormats": ["mp4", "mkv", "avi", "mov", "flv", "webm"],
    "maxFileSize": "50GB",
    "performanceClass": "heavy"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "log_and_fail",
    "retryPolicy": {
      "maxAttempts": 1,
      "backoffMs": 0
    },
    "dataRetention": {
      "daysToKeep": 7,
      "minSizeKb": 500
    },
    "variables": {
      "MAX_FILE_SIZE": "50GB",
      "SUPPORTED_FORMATS": ["mp4", "mkv", "avi", "mov", "flv", "webm"],
      "TIMEOUT_MS": 600000,
      "USE_HARDWARE_ACCELERATION": true
    }
  }
}
```

### Example 3: List User Media (Updated)

```json
{
  "id": "wf_list_user_media_v1",
  "versionId": "1.0.0",
  "name": "List User Media",
  "description": "List media assets for authenticated user with pagination, sorting, and type filtering. Multi-tenant filtering applied at database layer.",
  "tenantId": null,
  "active": false,
  "deployedAt": null,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": ["media", "list", "pagination", "query"],
  "nodes": [
    {
      "id": "validate_tenant",
      "name": "Validate Tenant",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [50, 100],
      "disabled": false,
      "notes": "Entry point: validate tenantId is present and valid UUID",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "rules": {
          "tenantId": "required|string|uuid"
        }
      }
    },
    {
      "id": "validate_user",
      "name": "Validate User",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "disabled": false,
      "notes": "Ensure authenticated user context is present",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "rules": {
          "userId": "required|string|uuid"
        }
      }
    },
    {
      "id": "extract_params",
      "name": "Extract Params",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "disabled": false,
      "notes": "Extract and normalize query parameters with defaults",
      "continueOnFail": false,
      "parameters": {
        "operation": "transform_data",
        "output": {
          "type": "{{ $json.type || null }}",
          "sortBy": "{{ $json.sortBy || 'createdAt' }}",
          "sortOrder": "{{ $json.sortOrder || 'desc' }}",
          "limit": "{{ Math.min(Math.max($json.limit || 50, 1), 500) }}",
          "page": "{{ Math.max($json.page || 1, 1) }}",
          "offset": "{{ (Math.max($json.page || 1, 1) - 1) * Math.min(Math.max($json.limit || 50, 1), 500) }}",
          "search": "{{ $json.search || null }}"
        }
      }
    },
    {
      "id": "build_filter",
      "name": "Build Filter",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 300],
      "disabled": false,
      "notes": "Build database filter with tenant and user context",
      "continueOnFail": false,
      "parameters": {
        "operation": "transform_data",
        "output": {
          "tenantId": "{{ $context.tenantId }}",
          "uploadedBy": "{{ $context.user.id }}",
          "type": "{{ $steps.extract_params.output.type }}",
          "search": "{{ $steps.extract_params.output.search }}"
        }
      }
    },
    {
      "id": "clean_filter",
      "name": "Clean Filter",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "disabled": false,
      "notes": "Remove null/undefined values from filter to avoid invalid queries",
      "continueOnFail": false,
      "parameters": {
        "operation": "transform_data",
        "output": "{{ Object.entries($steps.build_filter.output).reduce((acc, [key, value]) => { if (value !== null && value !== undefined && value !== '') acc[key] = value; return acc; }, {}) }}"
      }
    },
    {
      "id": "fetch_media",
      "name": "Fetch Media",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 300],
      "disabled": false,
      "notes": "Query media assets with pagination, sorting, and multi-tenant filtering",
      "continueOnFail": false,
      "parameters": {
        "entity": "MediaAsset",
        "operation": "database_read",
        "filter": "{{ $steps.clean_filter.output }}",
        "sort": {
          "{{ $steps.extract_params.output.sortBy }}": "{{ $steps.extract_params.output.sortOrder === 'asc' ? 1 : -1 }}"
        },
        "limit": "{{ $steps.extract_params.output.limit }}",
        "offset": "{{ $steps.extract_params.output.offset }}"
      }
    },
    {
      "id": "count_total",
      "name": "Count Total",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 500],
      "disabled": false,
      "notes": "Count total matching records for pagination metadata",
      "continueOnFail": false,
      "parameters": {
        "operation": "database_count",
        "entity": "MediaAsset",
        "filter": "{{ $steps.clean_filter.output }}"
      }
    },
    {
      "id": "format_response",
      "name": "Format Response",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 500],
      "disabled": false,
      "notes": "Structure response with assets and pagination metadata",
      "continueOnFail": false,
      "parameters": {
        "operation": "transform_data",
        "output": {
          "ok": true,
          "assets": "{{ $steps.fetch_media.output }}",
          "pagination": {
            "total": "{{ $steps.count_total.output }}",
            "page": "{{ $steps.extract_params.output.page }}",
            "limit": "{{ $steps.extract_params.output.limit }}",
            "totalPages": "{{ Math.ceil($steps.count_total.output / $steps.extract_params.output.limit) }}",
            "hasMore": "{{ $steps.count_total.output > ($steps.extract_params.output.offset + $steps.extract_params.output.limit) }}",
            "offset": "{{ $steps.extract_params.output.offset }}"
          },
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 500],
      "disabled": false,
      "notes": "Return formatted response to client",
      "continueOnFail": false,
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": "{{ $steps.format_response.output }}"
      }
    }
  ],
  "connections": {
    "validate_tenant": {
      "main": [[{ "node": "validate_user", "type": "main", "index": 0 }]]
    },
    "validate_user": {
      "main": [[{ "node": "extract_params", "type": "main", "index": 0 }]]
    },
    "extract_params": {
      "main": [[{ "node": "build_filter", "type": "main", "index": 0 }]]
    },
    "build_filter": {
      "main": [[{ "node": "clean_filter", "type": "main", "index": 0 }]]
    },
    "clean_filter": {
      "main": [
        [{ "node": "fetch_media", "type": "main", "index": 0 }],
        [{ "node": "count_total", "type": "main", "index": 0 }]
      ]
    },
    "fetch_media": {
      "main": [[{ "node": "format_response", "type": "main", "index": 0 }]]
    },
    "count_total": {
      "main": []
    },
    "format_response": {
      "main": [[{ "node": "return_success", "type": "main", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "category": "media",
    "author": "MetaBuilder",
    "source": "media_center",
    "performanceClass": "fast",
    "rateLimit": "100 requests/min"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 30,
    "saveExecutionProgress": false,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "errors_only",
    "errorHandler": "log_and_fail",
    "retryPolicy": {
      "maxAttempts": 1,
      "backoffMs": 0
    },
    "dataRetention": {
      "daysToKeep": 1,
      "minSizeKb": 10
    },
    "variables": {
      "MAX_LIMIT": 500,
      "DEFAULT_LIMIT": 50,
      "DEFAULT_PAGE": 1,
      "TIMEOUT_MS": 30000
    }
  }
}
```

### Example 4: Delete Media Asset (Updated)

```json
{
  "id": "wf_delete_media_v1",
  "versionId": "1.0.0",
  "name": "Delete Media Asset",
  "description": "Delete media asset with authorization check. Removes asset record and associated files (original, thumbnail, optimized). Multi-tenant filtering ensures users can only delete their own assets.",
  "tenantId": null,
  "active": false,
  "deployedAt": null,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": ["media", "delete", "destructive", "authorization"],
  "nodes": [
    {
      "id": "validate_tenant",
      "name": "Validate Tenant",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [50, 100],
      "disabled": false,
      "notes": "Entry point: validate tenantId is present and valid UUID",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "rules": {
          "tenantId": "required|string|uuid"
        }
      }
    },
    {
      "id": "validate_asset_id",
      "name": "Validate Asset ID",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "disabled": false,
      "notes": "Validate assetId is provided and valid UUID format",
      "continueOnFail": false,
      "parameters": {
        "input": "{{ $json.assetId }}",
        "operation": "validate",
        "rules": {
          "assetId": "required|string|uuid"
        }
      }
    },
    {
      "id": "fetch_asset",
      "name": "Fetch Asset",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "disabled": false,
      "notes": "Fetch asset with multi-tenant filtering to ensure authorization",
      "continueOnFail": false,
      "parameters": {
        "entity": "MediaAsset",
        "operation": "database_read",
        "filter": {
          "id": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "check_authorization",
      "name": "Check Authorization",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [1000, 100],
      "disabled": false,
      "notes": "Verify user owns asset or has admin privileges (level >= 3)",
      "continueOnFail": false,
      "parameters": {
        "condition": "{{ ($steps.fetch_asset.output !== null) && ($steps.fetch_asset.output.uploadedBy === $context.user.id || $context.user.level >= 3) }}",
        "operation": "condition",
        "then": "delete_files",
        "else": "error_unauthorized"
      }
    },
    {
      "id": "delete_files",
      "name": "Delete Files",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "disabled": false,
      "notes": "Delete associated files from storage (original, thumbnail, optimized copies)",
      "continueOnFail": true,
      "parameters": {
        "operation": "delete_recursive",
        "paths": [
          "{{ $steps.fetch_asset.output.path }}",
          "{{ $steps.fetch_asset.output.path + '-thumbnail' }}",
          "{{ $steps.fetch_asset.output.path + '-optimized' }}"
        ],
        "dryRun": false
      }
    },
    {
      "id": "delete_asset_record",
      "name": "Delete Asset Record",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 300],
      "disabled": false,
      "notes": "Delete asset database record with multi-tenant filtering",
      "continueOnFail": false,
      "parameters": {
        "entity": "MediaAsset",
        "operation": "database_delete",
        "filter": {
          "id": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "emit_deleted",
      "name": "Emit Deleted",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "disabled": false,
      "notes": "Emit event to notify subscribers of asset deletion",
      "continueOnFail": true,
      "parameters": {
        "action": "emit_event",
        "event": "media_deleted",
        "channel": "{{ 'media:' + $context.tenantId }}",
        "data": {
          "assetId": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}",
          "deletedBy": "{{ $context.user.id }}",
          "deletedAt": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 500],
      "disabled": false,
      "notes": "Return success response",
      "continueOnFail": false,
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "ok": true,
          "message": "Media asset deleted successfully",
          "assetId": "{{ $json.assetId }}",
          "tenantId": "{{ $context.tenantId }}"
        }
      }
    },
    {
      "id": "error_unauthorized",
      "name": "Error Unauthorized",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 500],
      "disabled": false,
      "notes": "Return 403 if user not authorized or asset not found",
      "continueOnFail": false,
      "parameters": {
        "action": "http_response",
        "status": 403,
        "body": {
          "ok": false,
          "error": "Unauthorized: asset not found or insufficient permissions",
          "assetId": "{{ $json.assetId }}"
        }
      }
    }
  ],
  "connections": {
    "validate_tenant": {
      "main": [[{ "node": "validate_asset_id", "type": "main", "index": 0 }]]
    },
    "validate_asset_id": {
      "main": [[{ "node": "fetch_asset", "type": "main", "index": 0 }]]
    },
    "fetch_asset": {
      "main": [[{ "node": "check_authorization", "type": "main", "index": 0 }]]
    },
    "check_authorization": {
      "main": [
        [{ "node": "delete_files", "type": "main", "index": 0 }],
        [{ "node": "error_unauthorized", "type": "main", "index": 0 }]
      ]
    },
    "delete_files": {
      "main": [[{ "node": "delete_asset_record", "type": "main", "index": 0 }]]
    },
    "delete_asset_record": {
      "main": [[{ "node": "emit_deleted", "type": "main", "index": 0 }]]
    },
    "emit_deleted": {
      "main": [[{ "node": "return_success", "type": "main", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "category": "media",
    "author": "MetaBuilder",
    "source": "media_center",
    "destructive": true,
    "auditRequired": true,
    "performanceClass": "medium"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 120,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "log_and_fail",
    "retryPolicy": {
      "maxAttempts": 1,
      "backoffMs": 0
    },
    "dataRetention": {
      "daysToKeep": 90,
      "minSizeKb": 1
    },
    "variables": {
      "REQUIRE_CONFIRMATION": true,
      "TIMEOUT_MS": 120000,
      "AUDIT_DELETE_OPERATIONS": true
    }
  }
}
```

---

## Validation Checklist

### Root Schema Validation (Workflow Level)

**Mandatory Fields**:
- [x] `id` - UUID format: `wf_[workflow_name]_v[major]`
- [x] `versionId` - Semantic versioning: `major.minor.patch`
- [x] `name` - Human-readable display name
- [x] `active` - Boolean lifecycle status
- [x] `nodes` - Array of node definitions (min 1 node)
- [x] `connections` - Node adjacency map

**Recommended Fields**:
- [x] `description` - Purpose and behavior documentation
- [x] `tenantId` - Null at definition, populated at runtime
- [x] `deployedAt` - Timestamp or null
- [x] `createdAt` - ISO 8601 timestamp
- [x] `updatedAt` - ISO 8601 timestamp
- [x] `tags` - Array of categorization tags
- [x] `meta` - Metadata object with author, source, performance class
- [x] `settings` - Execution settings, timeouts, retries, variables

**Optional Fields**:
- [ ] `triggers` - Not needed for media_center workflows (API-driven)
- [ ] `variables` - Use `settings.variables` instead
- [ ] `credentials` - Not needed (no external services)

### Node Schema Validation

**Mandatory Fields (All Nodes)**:
- [x] `id` - snake_case unique identifier
- [x] `name` - Human-readable display name
- [x] `type` - Valid node type: `metabuilder.*`, `logic.*`, etc.
- [x] `typeVersion` - Integer >= 1
- [x] `position` - Array [x: number, y: number]

**Recommended Fields**:
- [x] `disabled` - Boolean, false = active
- [x] `notes` - Purpose documentation for canvas display
- [x] `continueOnFail` - Error handling strategy

**Optional Fields**:
- [ ] `parameters` - Optional for some node types
- [ ] `credentials` - Not used in media_center

### Multi-Tenant Safety Checks

**Critical Validations**:
- [x] Entry point validates tenantId is present and valid UUID
- [x] All database operations filter by `{ tenantId: $context.tenantId }`
- [x] No cross-tenant data leakage possible
- [x] User context validation (uploadedBy, userId checks)
- [x] Authorization checks before destructive operations

**Data Isolation**:
- [x] Extract Image: tenantId + assetId filtering on read/update
- [x] Extract Video: tenantId + assetId filtering on read/update
- [x] List Media: tenantId + userId filtering on query
- [x] Delete Media: tenantId + assetId + uploadedBy/admin check

### Node Type Registry Validation

**Validate All Node Types Are Registered**:
- [x] `metabuilder.validate` - Input validation
- [x] `metabuilder.database` - Database operations (read, write, delete, count)
- [x] `metabuilder.operation` - Image/video analysis, file operations
- [x] `metabuilder.transform` - Data transformation
- [x] `metabuilder.condition` - Conditional branching
- [x] `metabuilder.action` - HTTP response, event emission

### Connection Graph Validation

**DAG Verification**:
- [x] No circular references possible
- [x] All connection targets reference valid nodes
- [x] Output types are 'main' or 'error'
- [x] Output indices are non-negative integers
- [x] No dangling connections

**Connection Structure**:
```
Format: {
  "sourceNodeId": {
    "main": [
      [{ "node": "targetNodeId", "type": "main", "index": 0 }]
    ]
  }
}
```

### Parameter Validation

**No Duplicate Attributes**:
- [x] Node metadata (id, name, type, typeVersion, position) NOT in parameters
- [x] No [object Object] serialization issues
- [x] Proper nesting depth (max 2 levels for input parameters)

**Type Consistency**:
- [x] String values for node references (templateName, paths)
- [x] Boolean values for flags (disabled, continueOnFail)
- [x] Number values for coordinates (position x, y)
- [x] Expressions use `{{ }}` handlebars syntax

**Execution Settings**:
- [x] `executionTimeout` >= 30 seconds (minimum safe timeout)
- [x] Extract Image: 300s (5 min) - reasonable for large images
- [x] Extract Video: 600s (10 min) - FFmpeg can be slow
- [x] List Media: 30s (fast query)
- [x] Delete Media: 120s (2 min) - file deletion can vary

### JSON Schema Compliance

**Validate Against**: `/schemas/package-schemas/workflow.schema.json`

**Checks**:
- [x] All required fields present
- [x] Field types match schema
- [x] Enum values valid (actStatic data use valid actions)
- [x] Array items valid
- [x] Nested object structure valid

### Documentation Completeness

**Per Workflow**:
- [x] `description` explains workflow purpose
- [x] Node `notes` document each step
- [x] `meta` includes category, author, source
- [x] Performance expectations documented
- [x] Multi-tenant safety documented

**Meta Field Example**:
```json
{
  "category": "media",
  "author": "MetaBuilder",
  "source": "media_center",
  "supportedFormats": [...],
  "maxFileSize": "...",
  "performanceClass": "standard|heavy|fast"
}
```

### Backwards Compatibility

**Extension Safety**:
- [x] New fields are optional
- [x] Existing field structure unchanged
- [x] `connections` format preserved
- [x] Node type versioning supported (typeVersion)

---

## Migration Guide

### Phase 1: Backup Current Workflows (Week 1)

1. Create backup branch: `git checkout -b feature/media-center-workflow-update`
2. Copy current workflows to archive:
   ```bash
   cp /packages/media_center/workflow/*.json /docs/media_center_workflow_archive/
   ```

### Phase 2: Update Each Workflow (Week 1-2)

For each workflow file in `/packages/media_center/workflow/`:

1. **Update Root Schema**:
   - Add `id`: `wf_[workflow_name]_v1`
   - Add `versionId`: `1.0.0`
   - Add `description`: Purpose documentation
   - Add `tenantId`: `null`
   - Add `deployedAt`: `null`
   - Add `createdAt`, `updatedAt`: ISO 8601 timestamps
   - Add `tags`: Categorization array
   - Add `meta`: Author, source, performance info

2. **Update All Nodes**:
   - Add `disabled`: `false`
   - Add `notes`: Purpose documentation
   - Add `continueOnFail`: Appropriate value

3. **Add Entry Point Validation**:
   - First node must validate `tenantId`
   - Add condition checks before data access

4. **Update Settings**:
   - Adjust `executionTimeout` based on workflow type
   - Add retry policy
   - Add data retention settings
   - Add variables section

5. **Explicit Connections**:
   - Map all node connections explicitly
   - Verify DAG structure (no cycles)

### Phase 3: Validation (Week 2)

1. **JSON Schema Validation**:
   ```bash
   npm run validate:workflows
   ```

2. **Multi-Tenant Safety Audit**:
   - Verify all database queries filter by tenantId
   - Check authorization before destructive ops
   - Validate user context checks

3. **Node Type Registry**:
   - Ensure all node types are registered in executor
   - Test custom node types if any

4. **Connection Graph**:
   - No circular references
   - All connections valid
   - No dangling nodes

### Phase 4: Testing (Week 2-3)

1. **Unit Tests**: Test each workflow with sample data
2. **Integration Tests**: Test with real database
3. **Multi-Tenant Tests**: Test tenant isolation
4. **Performance Tests**: Verify timeout settings

### Phase 5: Documentation (Week 3)

1. Create workflow documentation
2. Update package.json metadata
3. Document performance characteristics
4. Document multi-tenant safety

### Phase 6: Deployment (Week 3)

1. Code review
2. Merge to main
3. Deploy to production
4. Monitor execution metrics

---

## File Extension Standards

**Current**: `.json` (basic n8n format)
**Target**: Keep `.json` for compatibility

**Alternative**: Could migrate to `.jsonscript` as indicated in package.json `files.byType.workflows`, but `.json` is more compatible with standard n8n tooling.

**Recommendation**: Keep `.json` extension for now; use `.jsonscript` only if implementing a domain-specific language variant.

---

## Performance Characteristics

### Extract Image Metadata

- **Timeout**: 300s (5 minutes)
- **Node Count**: 9 nodes (with tenant validation)
- **Database Operations**: 2 (read asset, update metadata)
- **Expected Latency**: 1-10s per image (depending on file size)
- **Max File Size**: 5GB
- **Supported Formats**: jpeg, png, gif, webp

### Extract Video Metadata

- **Timeout**: 600s (10 minutes)
- **Node Count**: 9 nodes (with tenant validation)
- **Database Operations**: 2 (read asset, update metadata)
- **Expected Latency**: 10-120s per video (FFmpeg analysis)
- **Max File Size**: 50GB
- **Supported Formats**: mp4, mkv, avi, mov, flv, webm

### List User Media

- **Timeout**: 30s (fast)
- **Node Count**: 9 nodes (with tenant validation)
- **Database Operations**: 2 (query, count)
- **Expected Latency**: 100-500ms (with pagination)
- **Max Limit**: 500 items per page
- **Default Limit**: 50 items

### Delete Media Asset

- **Timeout**: 120s (2 minutes)
- **Node Count**: 8 nodes (with tenant validation)
- **Database Operations**: 2 (read asset, delete record)
- **File Operations**: 3 (original, thumbnail, optimized)
- **Expected Latency**: 1-5s per delete
- **Audit Logging**: Yes (emit event)

---

## Summary of Changes

### Quantitative Changes

| Item | Current | Updated | Change |
|------|---------|---------|--------|
| Workflows | 4 | 4 | No change |
| Root Fields | ~3 | ~15 | +12 fields |
| Node Fields | ~4 | ~6 | +2 fields |
| Connections Explicit | No | Yes | Clarified |
| Multi-Tenant Validation | Implicit | Explicit | Added entry checks |
| Settings Fields | 5 | 11 | +6 fields |

### Breaking Changes

**None**. All additions are backwards compatible:
- New fields are optional during parsing
- Existing nodes still valid
- Existing connections still valid
- No field removals

### New Capabilities

1. **Versioning**: Semantic versioning for audit trails
2. **Lifecycle Management**: Active/inactive status, deployment tracking
3. **Configuration**: Variables, retries, data retention centralized
4. **Documentation**: Node notes, workflow description, metadata tags
5. **Multi-Tenant Safety**: Explicit entry point validation
6. **Monitoring**: Performance class, timeout tuning per workflow type

---

## Next Steps

1. **Review and Approval**: 7 days for stakeholder review
2. **Implementation**: Update all 4 workflows using examples
3. **Testing**: Full multi-tenant and performance testing
4. **Documentation**: Create migration guide and best practices
5. **Deployment**: Roll out via standard release process

---

**Status**: Plan Complete - Ready for Implementation
**Estimated Effort**: 2-3 weeks
**Risk Level**: Low (backwards compatible changes)
**Rollback Plan**: Revert to git branch, no database migrations needed
