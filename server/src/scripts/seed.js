import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';
import { Claim } from '../models/Claim.js';
import { AIMatch } from '../models/AIMatch.js';
import { Notification } from '../models/Notification.js';
import { DEFAULT_CATEGORIES, ITEM_STATUS, ITEM_TYPES, CLAIM_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';

export const seedInitialData = async () => {
  try {
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount > 0) {
      console.log('Database already has data. Skipping initial seeding.');
      return;
    }

    console.log('Seeding initial FINDIT database records...');

    // 1. Create Default Categories
    const categories = await Category.insertMany(DEFAULT_CATEGORIES);
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 2. Create Demo Users
    const alexChen = await User.create({
      name: 'Alex Chen',
      email: 'alex.chen@campus.edu',
      password: 'Password123!',
      phone: '+1 (555) 234-5678',
      role: 'USER',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      isEmailVerified: true,
      isActive: true,
    });

    const officerMiller = await User.create({
      name: 'Officer J. Miller',
      email: 'security.desk@campus.edu',
      password: 'AdminPassword123!',
      phone: '+1 (555) 987-6543',
      role: 'ADMIN',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      isEmailVerified: true,
      isActive: true,
    });

    // 3. Create Items matching UI prototypes
    // Item 1: MacBook Pro 14" (Lost by Alex Chen)
    const lostMacBook = await Item.create({
      reportedBy: alexChen._id,
      categoryId: catMap['electronics'],
      title: 'MacBook Pro 14" (Space Gray, M3)',
      brand: 'Apple',
      description: 'Lost 14-inch MacBook Pro in Space Gray. Has monochrome octocat vinyl sticker on lower right quadrant and slight scuff mark on bottom corner.',
      distinctiveFeatures: 'White Octocat sticker, chassis scuff on bottom corner, neon green sleeve',
      type: ITEM_TYPES.LOST,
      location: {
        name: 'University Main Library 3rd Floor Quiet Study Zone',
        campusZone: 'Central Library',
        room: 'Study Pod B',
      },
      itemDate: new Date('2026-05-12T22:15:00Z'),
      approximateTime: '22:15',
      serialNumber: 'C02G40XYZ98Q',
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL6LMFBe9dAW6y2OHbQOiXpj4QqdPCipM5e6FmWpRwzMMMfI8AkgwXwrze2nT_GGpakKgmPleak1q_gGUgjYiVt7RqgmGM8X1LPxN9POI8SKKis6LEJQ_GKRs7ug_XFTHttkOaL9cs6mF_bfTCdjS-kfg3wv_1VsEiUd4y7Lc3e9s-LbMFWsN70Hu9taBDeWWpXbC_vAONbfbQ3vJ2H181DKfGKYzsba0JlzspVA',
          isPrimary: true,
        },
      ],
    });

    // Item 2: Found MacBook Pro at Desk
    const foundMacBook = await Item.create({
      reportedBy: officerMiller._id,
      categoryId: catMap['electronics'],
      title: 'Apple MacBook Pro 14-inch Laptop (Space Gray)',
      brand: 'Apple',
      description: 'Discovered left on study carrel desk #14 on 3rd floor. Dark metallic laptop with developer stickers and dark keyboard.',
      distinctiveFeatures: 'Sticker on lid, minor scratch on base',
      type: ITEM_TYPES.FOUND,
      location: {
        name: 'Library 3rd Floor Study Carrel #14',
        campusZone: 'Central Library',
        room: 'Carrel 14',
      },
      itemDate: new Date('2026-05-13T10:00:00Z'),
      approximateTime: '10:00',
      condition: 'good',
      storageLocation: 'Student Union Library Desk 2',
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD81yE1D0EvdHocJ9WYQh8YK35CczCC98tShq36iTyg8sM8KgYZmM9wbNdQRJ-a53C3UUO_t2CHHDfT6jkUYn7HoyMjsYAAayXFgmHydmzilk65qNpBfQ6GzqSvx9J8A2FDbWeQwaWB1wqpJ4510MWIgLVDls1xOP07xJ_u8IYoILkpeMMgDYtemk-zyouVPRz496HZ4Y8b4z87yQ7265-bbDVov1KQZnBrkzKEVg',
          isPrimary: true,
        },
      ],
    });

    // Item 3: Apple iPad Air Sky Blue (Found)
    const foundIPad = await Item.create({
      reportedBy: officerMiller._id,
      categoryId: catMap['electronics'],
      title: 'Apple iPad Air (Sky Blue)',
      brand: 'Apple',
      description: 'Discovered left behind at 4th floor quiet study cubicle. Silver/Sky blue finish with matte grey case featuring indie vinyl stickers.',
      distinctiveFeatures: 'Matte grey case with art stickers, serial AP-882-X',
      type: ITEM_TYPES.FOUND,
      location: {
        name: 'Central Library • Security Desk',
        campusZone: 'Central Library',
        room: '4th Floor Cubicle 12',
      },
      itemDate: new Date('2026-05-14T09:30:00Z'),
      approximateTime: '09:30',
      condition: 'good',
      storageLocation: 'Main Security Desk #2',
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdM9APD49Wo4bGRyuYIt4-SNrx1NUn71oykmtQse25jOSxrHd7SytVYu7yHztC8KaEDZT3u0R1ue4cZuow8-6CADdXWJJhIxvsaIKDMfGpAydhUC2JLCHfQa_Cam1accUqnapq7nEFZIPCXTDwGfSlZRxG0CK2dbXonLPjmltTWOFuY7PXh1hRPgQf3-0llfl6wFUoW6Lm8trxyfcuWLfW0CzrOtunyOTbrNuUwQ',
          isPrimary: true,
        },
      ],
    });

    // Item 4: Car Key Ring with Tesla Fob (Lost)
    await Item.create({
      reportedBy: alexChen._id,
      categoryId: catMap['keys'],
      title: 'Car Key Ring with Tesla Fob',
      brand: 'Tesla',
      description: 'Lost near the open lawn benches during evening student robotics meetup. Includes matte black carabiner attachment.',
      distinctiveFeatures: 'Matte black carabiner with Tesla vehicle key fob',
      type: ITEM_TYPES.LOST,
      location: {
        name: 'Tech Quad Lawn • East Benches',
        campusZone: 'Tech Quad Lawn',
        room: '',
      },
      itemDate: new Date('2026-05-13T16:40:00Z'),
      approximateTime: '16:40',
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQJuV7q15u4A_GzLR1cxwtLCt3umi4dCmR6QcCTNYA2qLgxbF0vEB-NbGEVCHp_vFsm6vpqT7_1FrdhMZ12WLTVLOZrAFcH8hNm9fxY2fWbPvGlHyMn7FJSlQsrIfms3t8a9E6s18On5BKc82pOKByjdlHmKD9_J6Lb9I1rtDsV9yBZOd8txiyUYIGM8brG1ielEwlB0fyMQYYE-sGGPm6APGwpPPytu7QaHsOjQ',
          isPrimary: true,
        },
      ],
    });

    // Item 5: Sony WH-1000XM5 Headphones (Found)
    await Item.create({
      reportedBy: officerMiller._id,
      categoryId: catMap['electronics'],
      title: 'Sony WH-1000XM5 Headphones',
      brand: 'Sony',
      description: 'Silver finish, original hard case included. Discovered on 3rd floor study bench in Engineering hall.',
      distinctiveFeatures: 'Matte silver finish, dark hard zip case',
      type: ITEM_TYPES.FOUND,
      location: {
        name: 'Engineering Hall, Lab 302',
        campusZone: 'Engineering Hall',
        room: 'Lab 302',
      },
      itemDate: new Date('2026-05-14T10:15:00Z'),
      approximateTime: '10:15',
      condition: 'brand_new',
      storageLocation: 'Engineering Station #04',
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDlXBDSRKq_73JcWnX0ENxqfUwXJLV7Wmd2vsFRMu7Y6hFgwCVVXvdQtaEH12EAQDVQiQxT_nkFHhaxOtyCC7M_hxqtJboGo5_-REu0yBVxEdB9kpxVZ3H7NMCEzQhuSTnjKr8Eccd3Bmc48nkgDHKUS7iFzXR1x9_f9FjXk2cpNhMXNceKzLOTOVeLQdoYv9g-NQcdmlaK2gvWbbifxjQSMJ2bRrj6IsoLLhFdA',
          isPrimary: true,
        },
      ],
    });

    // Item 6: Matte Black Hydro Flask (Lost)
    await Item.create({
      reportedBy: alexChen._id,
      categoryId: catMap['other'],
      title: 'Matte Black Hydro Flask',
      brand: 'Hydro Flask',
      description: '32oz wide mouth with flex cap. Has small engineering guild holographic decal.',
      distinctiveFeatures: 'Holographic decal, minor ding on bottom base',
      type: ITEM_TYPES.LOST,
      location: {
        name: 'Recreation Gym Courts',
        campusZone: 'Recreation Gym Courts',
        room: 'Bldg 12',
      },
      itemDate: new Date('2026-05-13T16:40:00Z'),
      approximateTime: '16:40',
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPF418-JKkk6m2gPOFd0XqruEgavNsyHSkVNhc903BE9tX3opRSqnq92Kd0rJO6hhWJ-AoxeGrg1LUOfcF8E3oollprNFwrXyGYrkDW8kZhzJD_IJS81F9gha0J0Yii-HQIQwzDCLoXMna9T4RW0FMPaTTFDRtrGN6ZjrMp20kEVlHnnq2ONLFd9dGkTIPRzNCLyjEfaqdLaF9hJA6wssD-ufDoTAhxKGZY6e4dg',
          isPrimary: true,
        },
      ],
    });

    // Item 7: Bellroy Leather Cardholder (Found)
    await Item.create({
      reportedBy: officerMiller._id,
      categoryId: catMap['wallets'],
      title: 'Bellroy Navy Blue Cardholder Wallet',
      brand: 'Bellroy',
      description: 'A premium slim navy blue leather cardholder wallet found on dining table. Contains initials J.M.',
      distinctiveFeatures: 'Stitched border, Navy blue leather with campus ID card initials J.M.',
      type: ITEM_TYPES.FOUND,
      location: {
        name: 'Central Cafeteria North',
        campusZone: 'Student Union / Cafeteria',
        room: 'Safe Box A',
      },
      itemDate: new Date('2026-05-13T13:20:00Z'),
      approximateTime: '13:20',
      condition: 'good',
      storageLocation: 'Central Cafeteria Manager Safe',
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBod-UTpv39FGBOh6joOnBQKi_Bt3KxlPRlODvNg7jRch9iItd8zIBZ5NwymQBu2Pje1ZZDkV4lV6Br7c9XaEyS1jhpdQ1khefzOWpqs-VqUiACLODgxyqIW9OAKyCe6wxv8Cxg4BXifyE2_CQEpF3hxdugLex4qJx9qn_mdfJ39XV2Px1Q9_ZbC4idZiI26kOlR-Ggq4_-_dGZf4LTEvQ-73NHqDHAYmUxuiGWg',
          isPrimary: true,
        },
      ],
    });

    // Item 8: Navy Blue Gym Duffle (Lost)
    await Item.create({
      reportedBy: alexChen._id,
      categoryId: catMap['bags'],
      title: 'Navy Blue Gym Duffle',
      brand: 'Under Armour',
      description: 'Medium size nylon duffle bag with gym clothes, towel, and water bottle.',
      distinctiveFeatures: 'Red luggage tag with initials A.C.',
      type: ITEM_TYPES.LOST,
      location: {
        name: 'Recreation Hub Locker Room',
        campusZone: 'Recreation Gym Courts',
        room: 'Locker Area B',
      },
      itemDate: new Date('2026-05-09T18:00:00Z'),
      status: ITEM_STATUS.APPROVED,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
          isPrimary: true,
        },
      ],
    });

    // 4. Create Active Claim on iPad Air by Alex Chen
    await Claim.create({
      itemId: foundIPad._id,
      claimantId: alexChen._id,
      proofDescription: 'I left my Sky Blue iPad Air with custom holographic indie stickers in the 4th floor cubicle on May 14 around 9:30 AM while working on a research paper. The lockscreen shows a mountain wallpaper.',
      identifyingDetails: 'Serial prefix AP-882-X, slight ding on left volume button, stickers include GitHub octocat and local indie coffee roasters.',
      evidence: [
        {
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUHH3PqJ1XVGmPaLtQQNquFEJnettn8da8TKyyKjOESr7hZqZP4l0AkVL_XlzVuMFVnJttpLG0Q8uNaTc4SOLdi7cZgvF8u4fG7qxszMBTLQpGFwn8v9IPQ1r9WkJFj8RPrc7oy9_k121N2a79HjyxyxrhYI5UtVkcSwkzwMTPx9P-NxXSGoK6sdw1_PCgK29TDq7NuWUqg_FbXnExkWAZlfrM6sFleliecdGXlQ',
          name: 'apple_store_receipt_ipad_air.pdf',
        },
      ],
      status: CLAIM_STATUS.PENDING,
      adminNote: 'Assigned to Campus Security Desk #2 for physical verification check.',
    });

    // 5. Create AI Match (94% confidence) between Alex Chen's MacBook Pro and Found MacBook
    await AIMatch.create({
      lostItemId: lostMacBook._id,
      foundItemId: foundMacBook._id,
      similarityScore: 94,
      confidence: 94,
      matchingFeatures: [
        'Category Match 100%',
        'Brand & Model Match 98%',
        'Visual Color & Aesthetic Match 95%',
        'Geo-temporal Corridor Match 90%',
      ],
      status: 'PENDING',
    });

    // 6. Create Notifications for Alex Chen
    await Notification.create([
      {
        recipientId: alexChen._id,
        title: 'High-Confidence AI Smart Match Identified',
        message: '94% visual match detected between your reported MacBook Pro and new item record #FND-8821 at Student Union Library Desk 2.',
        type: NOTIFICATION_TYPES.AI_MATCH_FOUND,
        relatedItemId: foundMacBook._id,
        isRead: false,
      },
      {
        recipientId: alexChen._id,
        title: 'Claim in Desk Review',
        message: 'Claim submitted for iPad Pro 11" (#CLM-109). Assigned to Campus Desk 3.',
        type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
        relatedItemId: foundIPad._id,
        isRead: false,
      },
      {
        recipientId: alexChen._id,
        title: 'Lost Report Published',
        message: 'Report #LST-3801 broadcast to Science & Tech sector recovery nodes.',
        type: NOTIFICATION_TYPES.REPORT_APPROVED,
        relatedItemId: lostMacBook._id,
        isRead: true,
      },
      {
        recipientId: alexChen._id,
        title: 'Handover Confirmed',
        message: 'Calculus textbook collected and signed off by Student #29910.',
        type: NOTIFICATION_TYPES.SYSTEM,
        isRead: true,
      },
    ]);

    console.log('✅ FINDIT Initial Data Seeded Successfully!');
  } catch (error) {
    console.error('Seed Error:', error);
  }
};
