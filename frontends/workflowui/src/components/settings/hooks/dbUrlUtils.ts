/**
 * dbUrlUtils - Build database connection URLs from form fields
 */

export const DEFAULT_PORTS: Record<string, string> = {
  postgres: '5432',
  mysql: '3306',
  cockroachdb: '26257',
  tidb: '4000',
  mongodb: '27017',
  redis: '6379',
  elasticsearch: '9200',
  cassandra: '9042',
  surrealdb: '8000',
};

export function buildUrl(
  adapter: string,
  fields: Record<string, string>
): string {
  if (adapter === 'sqlite') {
    return `sqlite://${fields.path || ':memory:'}`;
  }
  if (adapter === 'mongodb') {
    return (
      fields.connectionString ||
      `mongodb://localhost:27017/${
        fields.database || 'metabuilder'
      }`
    );
  }
  const auth = fields.user
    ? `${fields.user}${
        fields.password ? ':' + fields.password : ''
      }@`
    : '';
  const port = fields.port
    ? ':' + fields.port
    : DEFAULT_PORTS[adapter]
    ? ':' + DEFAULT_PORTS[adapter]
    : '';
  return (
    `${adapter}://${auth}${fields.host || 'localhost'}` +
    `${port}/${fields.database || 'metabuilder'}`
  );
}
