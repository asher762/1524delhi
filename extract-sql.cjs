const fs = require('fs');
const content = fs.readFileSync('src/migrations/20260723_181612.ts', 'utf8');
const startIndex = content.indexOf('db.execute(sql`') + 'db.execute(sql`'.length;
const endIndex = content.indexOf('`);', startIndex);
if (startIndex > -1 && endIndex > -1) {
  let sql = content.substring(startIndex, endIndex);
  sql += `\nINSERT INTO "payload_migrations" ("name", "batch", "updated_at", "created_at") VALUES ('20260723_181612', 1, now(), now());\n`;
  fs.writeFileSync('migration_schema.sql', sql);
  console.log('Extracted to migration_schema.sql');
} else {
  console.log('Match failed');
}
