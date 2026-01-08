#!/usr/bin/env python3
"""
Type generator for DBAL
Reads YAML entity schemas and generates TypeScript and C++ type definitions
"""

import yaml
from pathlib import Path
from typing import Dict, Any, List
import sys

YAML_TO_TS_TYPE_MAP = {
    'uuid': 'string',
    'cuid': 'string',
    'string': 'string',
    'text': 'string',
    'email': 'string',
    'integer': 'number',
    'boolean': 'boolean',
    'datetime': 'Date',
    'bigint': 'bigint',
    'json': 'Record<string, unknown>',
    'enum': 'string',
}

YAML_TO_CPP_TYPE_MAP = {
    'uuid': 'std::string',
    'cuid': 'std::string',
    'string': 'std::string',
    'text': 'std::string',
    'email': 'std::string',
    'integer': 'int',
    'boolean': 'bool',
    'datetime': 'Timestamp',
    'bigint': 'Timestamp',
    'json': 'Json',
    'enum': 'std::string',
}


def load_entity_schemas(schema_dir: Path) -> Dict[str, Any]:
    """Load all entity YAML files (including nested, multi-doc schemas)."""
    entities = {}
    for yaml_file in (schema_dir / 'entities').rglob('*.yaml'):
        with open(yaml_file) as f:
            for entity_data in yaml.safe_load_all(f):
                if not entity_data:
                    continue
                entity_name = entity_data.get('entity')
                if not entity_name:
                    continue
                entities[entity_name] = entity_data
    return entities


def generate_typescript_interface(entity_name: str, entity_data: Dict[str, Any]) -> str:
    """Generate TypeScript interface from entity schema"""
    lines = [f"export interface {entity_name} {{"]
    
    for field_name, field_data in entity_data['fields'].items():
        field_type = YAML_TO_TS_TYPE_MAP.get(field_data['type'], 'unknown')
        optional = '?' if field_data.get('optional', False) else ''
        if field_data.get('nullable', False):
            field_type = f"{field_type} | null"
        
        if field_data['type'] == 'enum':
            enum_values = ' | '.join(f"'{v}'" for v in field_data['values'])
            field_type = enum_values
            
        lines.append(f"  {field_name}{optional}: {field_type}")
    
    lines.append("}")
    return '\n'.join(lines)


def generate_typescript_types(entities: Dict[str, Any], output_file: Path):
    """Generate TypeScript types file"""
    lines = ["// Generated types from YAML schemas - DO NOT EDIT MANUALLY\n"]
    
    for entity_name, entity_data in entities.items():
        lines.append(generate_typescript_interface(entity_name, entity_data))
        lines.append("")
    
    output_file.write_text('\n'.join(lines))
    print(f"✓ Generated TypeScript types: {output_file}")


def generate_cpp_struct(entity_name: str, entity_data: Dict[str, Any]) -> str:
    """Generate C++ struct from entity schema"""
    lines = [f"struct {entity_name} {{"]
    
    for field_name, field_data in entity_data['fields'].items():
        field_type = YAML_TO_CPP_TYPE_MAP.get(field_data['type'], 'std::string')
        
        if field_data.get('optional', False) or field_data.get('nullable', False):
            field_type = f"std::optional<{field_type}>"
            
        lines.append(f"    {field_type} {field_name};")
    
    lines.append("};")
    return '\n'.join(lines)


def generate_cpp_types(entities: Dict[str, Any], output_file: Path):
    """Generate C++ types header"""
    lines = [
        "// Generated types from YAML schemas - DO NOT EDIT MANUALLY",
        "#ifndef DBAL_GENERATED_TYPES_HPP",
        "#define DBAL_GENERATED_TYPES_HPP",
        "",
        "#include <string>",
        "#include <optional>",
        "#include <chrono>",
        "#include <map>",
        "#include <cstdint>",
        "",
        "namespace dbal {",
        "",
        "using Timestamp = std::chrono::system_clock::time_point;",
        "using Json = std::map<std::string, std::string>;",
        ""
    ]
    
    for entity_name, entity_data in entities.items():
        lines.append(generate_cpp_struct(entity_name, entity_data))
        lines.append("")
    
    lines.extend([
        "}  // namespace dbal",
        "",
        "#endif  // DBAL_GENERATED_TYPES_HPP"
    ])
    
    output_file.write_text('\n'.join(lines))
    print(f"✓ Generated C++ types: {output_file}")


def main():
    """Main entry point"""
    dbal_root = Path(__file__).resolve().parents[3]
    schema_dir = dbal_root / 'shared' / 'api' / 'schema'
    
    if not schema_dir.exists():
        print(f"Error: Schema directory not found: {schema_dir}", file=sys.stderr)
        sys.exit(1)
    
    print("Loading entity schemas...")
    entities = load_entity_schemas(schema_dir)
    print(f"Loaded {len(entities)} entities")
    
    ts_output = dbal_root / 'development' / 'src' / 'core' / 'foundation' / 'types' / 'types.generated.ts'
    ts_output.parent.mkdir(parents=True, exist_ok=True)
    generate_typescript_types(entities, ts_output)
    
    cpp_output = dbal_root / 'production' / 'include' / 'dbal' / 'core' / 'types.generated.hpp'
    cpp_output.parent.mkdir(parents=True, exist_ok=True)
    generate_cpp_types(entities, cpp_output)
    
    print("\n✓ Type generation complete!")


if __name__ == '__main__':
    main()
