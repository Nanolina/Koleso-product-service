// seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetAutoIncrement() {
  await prisma.$executeRaw`ALTER SEQUENCE "Section_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Category_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "Subcategory_id_seq" RESTART WITH 1`;
}

const sections = [
  {
    name: 'Women',
    image:
      'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158929/catalog/women_lpmr24.jpg',
    categories: [
      {
        name: 'Blouses and shirts',
        image:
          'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158929/catalog/blouse_lsqaaf.jpg',
      },
      {
        name: 'Pants',
        image:
          'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158929/catalog/pants_oo4lw9.jpg',
      },
      {
        name: 'Outerwear',
        image:
          'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158928/catalog/outerwear_oso0k7.jpg',
      },
      {
        name: 'Sweater, turtlenecks, cardigans',
        image:
          'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158929/catalog/sweater_wctpri.jpg',
      },
      { name: 'Jeans' },
      { name: 'Overalls' },
      { name: 'Suits' },
      { name: 'Longsleeves' },
      { name: 'Jackets, vests, jackets' },
      { name: 'Dresses and sundresses' },
      { name: 'Sweatshirts, sweatshirts and hoodies' },
      { name: 'Tunics' },
      { name: 'T-shirts and tops' },
      { name: 'Robes' },
      { name: 'Shorts' },
      { name: 'Skirts' },
      {
        name: 'Lingerie',
        image:
          'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158927/catalog/lingerie_yja7el.webp',
        subcategories: [
          {
            name: 'Accessories',
            image:
              'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158917/catalog/accessories_njhf5j.webp',
          },
          {
            name: 'Bandages',
            image:
              'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158928/catalog/bandages_acjg37.jpg',
          },
          {
            name: 'Seamless',
            image:
              'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158931/catalog/seamless_lbmaht.jpg',
          },
          {
            name: 'Bodysuits and corsets',
            image:
              'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158928/catalog/corsets_djkzsw.jpg',
          },
          { name: 'Bras' },
          { name: 'Pantyhose and stockings' },
          { name: 'Combinations and negligees' },
          { name: 'Lingerie sets' },
          { name: 'Corrective underwear' },
          { name: 'T-shirts' },
          { name: 'Thermal underwear' },
          { name: 'Underpants' },
        ],
      },
      { name: 'Moms-to-be' },
      { name: 'Clothes for home' },
      { name: 'Office' },
      { name: 'Beach' },
      { name: 'Wedding' },
    ],
  },
  {
    name: 'Men',
    image:
      'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158928/catalog/men_vh2gns.jpg',
  },
  {
    name: 'Kids',
    image:
      'https://res.cloudinary.com/dbrquscbv/image/upload/v1708158929/catalog/kids_j1jxpo.jpg',
  },
  { name: 'Shoes' },
  { name: 'House' },
  { name: 'Beauty' },
  { name: 'Accessories' },
  { name: 'Electronics' },
  { name: 'Toys' },
  { name: 'Furniture' },
  { name: 'Products' },
  { name: 'Household appliances' },
  { name: 'Pet products' },
  { name: 'Sport' },
  { name: 'Auto goods' },
  { name: 'Books' },
  { name: 'Jewelry' },
  { name: 'For repair' },
  { name: 'Garden and cottage' },
  { name: 'Health' },
  { name: 'Stationery' },
];

async function main() {
  // Remove this for production
  await resetAutoIncrement();

  for (const sectionData of sections) {
    const section = await prisma.section.create({
      data: {
        name: sectionData.name,
        image: sectionData.image,
        categories: {
          create: sectionData.categories?.map((category) => ({
            name: category.name,
            image: category.image,
            subcategories: {
              create: category.subcategories?.map((subcategory) => ({
                name: subcategory.name,
                image: subcategory.image,
              })),
            },
          })),
        },
      },
    });

    console.log(`Section created: ${section.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
