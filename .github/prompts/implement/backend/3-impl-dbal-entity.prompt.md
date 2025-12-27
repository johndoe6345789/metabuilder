# Add DBAL Entity

Run DBAL commands from `dbal/`.

Add a new entity to the DBAL following the API-first approach:

1. **Define entity** in `dbal/shared/api/schema/entities/{name}.yaml`:
```yaml
entity: EntityName
version: "1.0"
fields:
  id: { type: uuid, primary: true, generated: true }
  # Add fields...
```

2. **Define operations** in `dbal/shared/api/schema/operations/{name}.ops.yaml`

3. **Generate types**: `python tools/codegen/gen_types.py`

4. **Implement adapters** in both:
   - `dbal/development/src/adapters/`
   - `dbal/production/src/adapters/`

5. **Add conformance tests** in `dbal/shared/common/contracts/{name}_tests.yaml`

6. **Verify**: `python tools/conformance/run_all.py`
