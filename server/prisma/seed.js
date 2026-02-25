const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default admin user if none exists
    const userCount = await prisma.user.count();
    if (userCount === 0) {
        await prisma.user.create({
            data: {
                email: 'admin@resonira.com',
                password: 'admin123',
                name: 'Admin User',
            },
        });
        console.log('✅ Created default admin user (admin@resonira.com / admin123)');
    } else {
        console.log('ℹ️ Users already exist, skipping user seed');
    }

    // Create default settings if none exist
    const settingsCount = await prisma.settings.count();
    if (settingsCount === 0) {
        await prisma.settings.create({
            data: {
                name: 'RESONIRA TECHNOLOGIES',
                gstin: '36ABMFR2520B1ZJ',
                state: 'Telangana',
                state_code: '36',
                pan: 'ABMFR2520B',
                sales_phone: '+919154289324',
                support_phone: '',
                email: 'info@resonira.com',
                address: 'Telangana, India',
            },
        });
        console.log('✅ Created default company settings');
    } else {
        console.log('ℹ️ Settings already exist, skipping settings seed');
    }

    console.log('🌱 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
