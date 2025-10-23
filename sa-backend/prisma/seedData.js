import prisma from '../src/prisma.js';
import bcrypt from 'bcryptjs';

async function main(){
  console.log('Seeding database...');

  // Clear existing data
  await prisma.sale.deleteMany();
  await prisma.image.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash('adminpass', 10);
  const clientPass = await bcrypt.hash('clientpass', 10);

  const admin = await prisma.user.create({ data: { name: 'Admin', email: 'admin@example.com', password: adminPass, role: 'ADMIN' } });
  const client = await prisma.user.create({ data: { name: 'Client', email: 'client@example.com', password: clientPass, role: 'CLIENT' } });

  const vehicles = [];
  vehicles.push(await prisma.vehicle.create({ data: { brand: 'Toyota', model: 'Corolla', year: 2020, price: 35000, description: 'Sedan popular', sold: false } }));
  vehicles.push(await prisma.vehicle.create({ data: { brand: 'Honda', model: 'Civic', year: 2019, price: 42000, description: 'Sedan médio', sold: false } }));
  vehicles.push(await prisma.vehicle.create({ data: { brand: 'Ford', model: 'Ka', year: 2018, price: 25000, description: 'Hatch compacto', sold: false } }));

  // images
  await prisma.image.createMany({ data: [
    { url: '/images/corolla-1.jpg', vehicleId: vehicles[0].id },
    { url: '/images/civic-1.jpg', vehicleId: vehicles[1].id },
    { url: '/images/ka-1.jpg', vehicleId: vehicles[2].id },
  ]});

  // create a sale
  await prisma.sale.create({ data: { price: vehicles[0].price, clientId: client.id, vehicleId: vehicles[0].id } });

  console.log('Seed complete');
}

main().catch((e)=>{ console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
