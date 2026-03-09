import { FlaskConfig } from '@/types/project'
import { generateFlaskBlueprint } from './generateFlaskBlueprint'
import { sanitizeIdentifier } from './sanitizeIdentifier'

export function generateFlaskApp(config: FlaskConfig): Record<string, string> {
  const files: Record<string, string> = {}

  let appCode = `from flask import Flask\n`
  if (config.corsOrigins && config.corsOrigins.length > 0) {
    appCode += `from flask_cors import CORS\n`
  }
  appCode += `\n`

  config.blueprints.forEach(blueprint => {
    const blueprintVarName = sanitizeIdentifier(blueprint.name, { fallback: 'blueprint' })
    appCode += `from blueprints.${blueprintVarName} import ${blueprintVarName}_bp\n`
  })

  appCode += `\ndef create_app():\n`
  appCode += `    app = Flask(__name__)\n\n`

  if (config.debug !== undefined) {
    appCode += `    app.config['DEBUG'] = ${config.debug ? 'True' : 'False'}\n`
  }

  if (config.databaseUrl) {
    appCode += `    app.config['SQLALCHEMY_DATABASE_URI'] = '${config.databaseUrl}'\n`
    appCode += `    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False\n`
  }

  appCode += `\n`

  if (config.corsOrigins && config.corsOrigins.length > 0) {
    appCode += `    CORS(app, resources={r"/*": {"origins": ${JSON.stringify(config.corsOrigins)}}})\n\n`
  }

  config.blueprints.forEach(blueprint => {
    const blueprintVarName = sanitizeIdentifier(blueprint.name, { fallback: 'blueprint' })
    appCode += `    app.register_blueprint(${blueprintVarName}_bp)\n`
  })

  appCode += `\n    @app.route('/')\n`
  appCode += `    def index():\n`
  appCode += `        return {'message': 'Flask API is running', 'version': '1.0.0'}\n\n`

  appCode += `    return app\n\n\n`
  appCode += `if __name__ == '__main__':\n`
  appCode += `    app = create_app()\n`
  appCode += `    app.run(host='0.0.0.0', port=${config.port || 5000}, debug=${config.debug ? 'True' : 'False'})\n`

  files['app.py'] = appCode

  config.blueprints.forEach(blueprint => {
    const blueprintVarName = sanitizeIdentifier(blueprint.name, { fallback: 'blueprint' })
    files[`blueprints/${blueprintVarName}.py`] = generateFlaskBlueprint(blueprint)
  })

  files['blueprints/__init__.py'] = '# Flask blueprints\n'

  files['requirements.txt'] = `Flask>=3.0.0
${config.corsOrigins && config.corsOrigins.length > 0 ? 'Flask-CORS>=4.0.0' : ''}
${config.databaseUrl ? 'Flask-SQLAlchemy>=3.0.0\npsycopg2-binary>=2.9.0' : ''}
${config.jwtSecret ? 'PyJWT>=2.8.0\nFlask-JWT-Extended>=4.5.0' : ''}
python-dotenv>=1.0.0
`

  files['.env'] = `FLASK_APP=app.py
FLASK_ENV=${config.debug ? 'development' : 'production'}
${config.databaseUrl ? `DATABASE_URL=${config.databaseUrl}` : 'DATABASE_URL=postgresql://user:password@localhost:5432/mydb'}
${config.jwtSecret ? 'JWT_SECRET_KEY=your-secret-key-here' : ''}
`

  files['README.md'] = `# Flask API

Generated with CodeForge

## Getting Started

1. Create a virtual environment:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

2. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. Set up your environment variables in .env

4. Run the application:
\`\`\`bash
python app.py
\`\`\`

The API will be available at http://localhost:${config.port || 5000}

## Blueprints

${config.blueprints.map(bp => `- **${bp.name}**: ${bp.description || 'No description'} (${bp.urlPrefix})`).join('\n')}

## API Documentation

${config.enableSwagger ? 'Swagger documentation available at /docs' : 'No API documentation configured'}
`

  return files
}
