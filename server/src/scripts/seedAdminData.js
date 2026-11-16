const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const {
  User,
  Category,
  Item,
  Claim,
  AIMatch,
  ActivityLog,
  SystemSetting,
  Report,
} = require('../models');

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/findit';
    console.log(`[Seeder] Connecting to MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI);

    console.log('[Seeder] Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({}),
      AIMatch.deleteMany({}),
      ActivityLog.deleteMany({}),
      SystemSetting.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log('[Seeder] Creating Administrators and Users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const userPassword = await bcrypt.hash('User@123', salt);

    // Superadmin (Sarah Jenkins)
    const admin = await User.create({
      name: 'Sarah Jenkins',
      email: 'admin@campus.edu',
      password: adminPassword,
      phone: '+1 (555) 234-5678',
      role: 'ADMIN',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      isEmailVerified: true,
      isActive: true,
    });

    // Users
    const [alex, david, elena, marcus, kevin] = await Promise.all([
      User.create({
        name: 'Alex Chen',
        email: 'alex.chen@campus.edu',
        password: userPassword,
        phone: '+1 (555) 111-2222',
        role: 'USER',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        isEmailVerified: true,
        isActive: true,
      }),
      User.create({
        name: 'David Chen',
        email: 'david.chen@campus.edu',
        password: userPassword,
        phone: '+1 (555) 333-4444',
        role: 'USER',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        isEmailVerified: true,
        isActive: true,
      }),
      User.create({
        name: 'Elena Rostova',
        email: 'elena.rostova@campus.edu',
        password: userPassword,
        phone: '+1 (555) 555-6666',
        role: 'USER',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
        isEmailVerified: true,
        isActive: true,
      }),
      User.create({
        name: 'Marcus Vance',
        email: 'marcus.vance@campus.edu',
        password: userPassword,
        phone: '+1 (555) 777-8888',
        role: 'USER',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        isEmailVerified: true,
        isActive: true,
      }),
      User.create({
        name: 'Kevin Walsh',
        email: 'kevin.walsh@campus.edu',
        password: userPassword,
        phone: '+1 (555) 999-0000',
        role: 'USER',
        profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
        isEmailVerified: true,
        isActive: false, // Suspended user for demo testing
      }),
    ]);

    console.log('[Seeder] Creating Categories...');
    const [catElectronics, catWallets, catBags, catJewelry, catKeys] = await Promise.all([
      Category.create({
        name: 'Electronics & Gadgets',
        description: 'Laptops, smartphones, headphones, tablets, calculators and chargers.',
        isActive: true,
        createdBy: admin._id,
      }),
      Category.create({
        name: 'Wallets & Identification',
        description: 'Wallets, purses, government photo IDs, and student cards.',
        isActive: true,
        createdBy: admin._id,
      }),
      Category.create({
        name: 'Bags & Backpacks',
        description: 'Backpacks, gym bags, luggage, and tote bags.',
        isActive: true,
        createdBy: admin._id,
      }),
      Category.create({
        name: 'Jewelry & Watches',
        description: 'Rings, smartwatches, necklaces, and luxury personal accessories.',
        isActive: true,
        createdBy: admin._id,
      }),
      Category.create({
        name: 'Keys & Keycards',
        description: 'Dorm keys, vehicle transponders, and badge lanyards.',
        isActive: true,
        createdBy: admin._id,
      }),
    ]);

    console.log('[Seeder] Creating Items (Lost & Found)...');
    // Found items (in custody depots)
    const [fMacBook, fWallet, fHeadphones, fBackpack, fFlask] = await Promise.all([
      Item.create({
        reportedBy: alex._id,
        categoryId: catElectronics._id,
        reviewedBy: admin._id,
        title: 'MacBook Pro 16" Space Gray (M3 Max)',
        description: 'Found on third floor study carrel. Space gray finish with university asset sticker #ASSET-9912.',
        type: 'FOUND',
        location: {
          depot: 'Science & Tech Center Desk',
          building: 'Science & Tech Building',
          room: 'Study Carrel 312',
        },
        dateTime: new Date(Date.now() - 24 * 3600 * 1000),
        images: [
          {
            url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
            publicId: 'seed_macbook',
          },
        ],
        status: 'APPROVED',
      }),
      Item.create({
        reportedBy: alex._id,
        categoryId: catWallets._id,
        reviewedBy: admin._id,
        title: 'Bellroy Leather Folio Wallet + State ID',
        description: 'Brown leather bi-fold wallet found near main revolving entrance doors with transit pass inside.',
        type: 'FOUND',
        location: {
          depot: 'Central Library (Main Vault)',
          building: 'Main Campus Library',
          room: 'Front Vestibule',
        },
        dateTime: new Date(Date.now() - 48 * 3600 * 1000),
        images: [
          {
            url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
            publicId: 'seed_wallet',
          },
        ],
        status: 'APPROVED',
      }),
      Item.create({
        reportedBy: david._id,
        categoryId: catElectronics._id,
        reviewedBy: admin._id,
        title: 'Sony WH-1000XM5 Noise Canceling Headphones',
        description: 'Black over-ear headphones with original protective traveling case left on bench.',
        type: 'FOUND',
        location: {
          depot: 'Athletics & Recreation Hub',
          building: 'Recreation Center',
          room: 'Locker Area B',
        },
        dateTime: new Date(Date.now() - 12 * 3600 * 1000),
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
            publicId: 'seed_headphones',
          },
        ],
        status: 'APPROVED',
      }),
      Item.create({
        reportedBy: elena._id,
        categoryId: catBags._id,
        reviewedBy: admin._id,
        title: 'Navy Fjällräven Kånken Backpack',
        description: 'Navy blue canvas backpack with art notebook and water bottle pouch.',
        type: 'FOUND',
        location: {
          depot: 'Student Union Welcome Center',
          building: 'Student Union',
          room: 'Lounge Area',
        },
        dateTime: new Date(Date.now() - 6 * 3600 * 1000),
        images: [
          {
            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
            publicId: 'seed_backpack',
          },
        ],
        status: 'PENDING', // Awaiting admin approval
      }),
      Item.create({
        reportedBy: marcus._id,
        categoryId: catBags._id,
        reviewedBy: admin._id,
        title: 'HydroFlask 32oz Cobalt Water Bottle',
        description: 'Cobalt blue metallic water bottle with national park stickers.',
        type: 'FOUND',
        location: {
          depot: 'Central Library (Main Vault)',
          building: 'Library West',
          room: 'First Floor Cafe',
        },
        dateTime: new Date(Date.now() - 72 * 3600 * 1000),
        images: [
          {
            url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
            publicId: 'seed_hydroflask',
          },
        ],
        status: 'RESOLVED',
        resolvedAt: new Date(Date.now() - 10 * 3600 * 1000),
      }),
    ]);

    // Lost item reports
    const [lMacBook, lWallet, lHeadphones] = await Promise.all([
      Item.create({
        reportedBy: david._id,
        categoryId: catElectronics._id,
        reviewedBy: admin._id,
        title: 'Lost MacBook Pro 16" Space Gray',
        description: 'Misplaced my MacBook Pro during late study hours in the science building. Serial starts with C02G9.',
        type: 'LOST',
        location: {
          depot: 'Science & Tech Center Desk',
          building: 'Science & Tech Building',
          room: '3rd Floor',
        },
        dateTime: new Date(Date.now() - 26 * 3600 * 1000),
        images: [
          {
            url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
            publicId: 'seed_lost_macbook',
          },
        ],
        status: 'APPROVED',
      }),
      Item.create({
        reportedBy: elena._id,
        categoryId: catWallets._id,
        reviewedBy: admin._id,
        title: 'Lost Bellroy Brown Leather Wallet',
        description: 'Dropped near campus library entry. Holds state driver license under Elena Rostova.',
        type: 'LOST',
        location: {
          depot: 'Central Library (Main Vault)',
          building: 'Main Campus Library',
          room: 'Entrance',
        },
        dateTime: new Date(Date.now() - 50 * 3600 * 1000),
        images: [],
        status: 'APPROVED',
      }),
      Item.create({
        reportedBy: marcus._id,
        categoryId: catElectronics._id,
        reviewedBy: admin._id,
        title: 'Lost Sony Over-Ear Headphones WH-1000XM5',
        description: 'Left inside black carrying case near rec locker rooms.',
        type: 'LOST',
        location: {
          depot: 'Athletics & Recreation Hub',
          building: 'Recreation Center',
          room: 'Locker Area B',
        },
        dateTime: new Date(Date.now() - 14 * 3600 * 1000),
        images: [],
        status: 'APPROVED',
      }),
    ]);

    console.log('[Seeder] Creating Claims & Affidavits...');
    await Promise.all([
      Claim.create({
        itemId: fMacBook._id,
        claimantId: david._id,
        reviewedBy: null,
        claimDescription: 'This is my university-issued MacBook Pro 16". The serial is C02G9912 and my Apple ID matches.',
        evidence: [
          {
            url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            publicId: 'proof_receipt_1',
            type: 'RECEIPT',
          },
        ],
        status: 'PENDING',
      }),
      Claim.create({
        itemId: fWallet._id,
        claimantId: elena._id,
        reviewedBy: null,
        claimDescription: 'Contains my State of California driver license and campus faculty pass #FAC-0142.',
        evidence: [
          {
            url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            publicId: 'proof_id_1',
            type: 'AFFIDAVIT',
          },
        ],
        status: 'PENDING',
      }),
      Claim.create({
        itemId: fHeadphones._id,
        claimantId: marcus._id,
        reviewedBy: null,
        claimDescription: 'Black Sony XM5s with serial number documented on Amazon invoice. Phone bluetooth MAC matches.',
        evidence: [
          {
            url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
            publicId: 'proof_bt_1',
            type: 'SERIAL_DOC',
          },
        ],
        status: 'PENDING',
      }),
    ]);

    console.log('[Seeder] Creating AI Matches...');
    await Promise.all([
      AIMatch.create({
        lostItemId: lMacBook._id,
        foundItemId: fMacBook._id,
        similarityScore: 96.2,
        confidence: 94.8,
        matchingFeatures: [
          'Matching brand & product line: Apple MacBook Pro 16"',
          'Space Gray metallic chassis finish match',
          'Asset label position aligns with description',
          'Intake location: Science & Tech Building 3rd Floor',
        ],
        differences: ['Minor surface scuff near rear left hinge reported on lost record.'],
        status: 'PENDING',
      }),
      AIMatch.create({
        lostItemId: lWallet._id,
        foundItemId: fWallet._id,
        similarityScore: 91.4,
        confidence: 89.2,
        matchingFeatures: [
          'Brand match: Bellroy leather folio',
          'Brown leather patina and texture alignment',
          'Coinciding intake time delta: 2 hours',
          'Same facility: Central Library front entrance',
        ],
        differences: [],
        status: 'PENDING',
      }),
      AIMatch.create({
        lostItemId: lHeadphones._id,
        foundItemId: fHeadphones._id,
        similarityScore: 88.0,
        confidence: 86.5,
        matchingFeatures: [
          'Matching model: Sony WH-1000XM5',
          'Black colorway with protective zip case',
          'Location match: Recreation locker hall',
        ],
        differences: ['Audio cable missing in found case.'],
        status: 'PENDING',
      }),
    ]);

    console.log('[Seeder] Creating Activity Logs...');
    await Promise.all([
      ActivityLog.create({
        actorId: admin._id,
        action: 'ITEM_REPORT_APPROVED',
        entityType: 'Item',
        entityId: fMacBook._id,
        description: 'Administrator Sarah Jenkins approved found report: "MacBook Pro 16\\" Space Gray (M3 Max)".',
      }),
      ActivityLog.create({
        actorId: admin._id,
        action: 'CLAIM_SUBMITTED',
        entityType: 'Claim',
        description: 'User #USR-902 (David Chen) submitted ownership affidavit for MacBook Pro 16".',
      }),
      ActivityLog.create({
        actorId: admin._id,
        action: 'AI_RADAR_MATCH',
        entityType: 'AIMatch',
        description: 'Core AI Engine matched report #LST-3801 to found item with 96.2% vector cosine confidence.',
      }),
      ActivityLog.create({
        actorId: admin._id,
        action: 'ITEM_HANDOVER_COMPLETED',
        entityType: 'Item',
        entityId: fFlask._id,
        description: 'Case #CAS-1082 closed. HydroFlask Water Bottle released to owner with signed digital receipt.',
      }),
    ]);

    console.log('[Seeder] Creating System Settings...');
    const defaultSettings = [
      {
        key: 'aiMatchingThreshold',
        value: 85,
        description: 'Minimum AI vector cosine similarity score required for high-priority radar alert.',
      },
      {
        key: 'claimReviewSlaHours',
        value: 24,
        description: 'Target SLA turnaround in hours for initial claim evidence inspection.',
      },
      {
        key: 'requireManualItemApproval',
        value: true,
        description: 'Whether lost & found reports require administrative approval before public display.',
      },
      {
        key: 'maxImageUploadSizeMb',
        value: 10,
        description: 'Maximum permissible image upload size in megabytes for item photos & claim evidence.',
      },
      {
        key: 'depotStorageAlertThreshold',
        value: 75,
        description: 'Depot physical capacity usage percentage that triggers custody overflow alerts.',
      },
      {
        key: 'autoNotifyOnAiMatch',
        value: true,
        description: 'Automatically dispatch advisory notification to claimant when high similarity match is detected.',
      },
    ];

    for (const s of defaultSettings) {
      await SystemSetting.create({
        ...s,
        updatedBy: admin._id,
      });
    }

    console.log('[Seeder] Creating Abuse/Policy Complaints (Reports)...');
    await Report.create({
      reporterId: david._id,
      itemId: fBackpack._id,
      reason: 'Suspicious duplicate or inaccurate description',
      description: 'The description states student union lounge, but this resembles a bag reported stolen from the north lot.',
      status: 'PENDING',
    });

    console.log('[Seeder] Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Superadmin Credentials:');
    console.log('Email:    admin@campus.edu');
    console.log('Password: Admin@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
