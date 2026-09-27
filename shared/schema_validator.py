import os
import json
import sys

try:
    import jsonschema
except ImportError:
    jsonschema = None

class SchemaValidator:
    """
    Utility module to validate JSON data against schema definitions in shared/schemas/
    """
    def __init__(self, schemas_dir=None):
        if schemas_dir is None:
            self.schemas_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "schemas"))
        else:
            self.schemas_dir = schemas_dir

    def validate(self, instance, schema_filename):
        """
        Validates a python dictionary against a JSON schema file.
        Returns (is_valid: bool, error_message: str).
        """
        schema_path = os.path.join(self.schemas_dir, schema_filename)
        if not os.path.exists(schema_path):
            return False, f"Schema file not found at {schema_path}"

        try:
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_data = json.load(f)

            if jsonschema is not None:
                jsonschema.validate(instance=instance, schema=schema_data)
            else:
                # Basic manual structural check if jsonschema package is omitted
                required = schema_data.get("required", [])
                for field in required:
                    if field not in instance:
                        return False, f"Missing required field '{field}' for schema {schema_filename}"
            return True, ""
        except Exception as e:
            return False, str(e)
