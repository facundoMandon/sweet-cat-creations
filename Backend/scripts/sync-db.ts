import { sequelize } from '../src/models';

async function main() {
  console.log('Syncing DB (alter: true) — ejecutar SOLO EN DESARROLLO y UNA VEZ');
  await sequelize.sync({ alter: true });
  console.log('DB synced (alter)');
  process.exit(0);
}

main().catch(err => {
  console.error('Sync failed', err);
  process.exit(1);
});
