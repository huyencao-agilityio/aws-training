import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeData() {
  try {
    console.log('Initializing data...');

    const products = await prisma.product.createMany({
      data: [
        { name: 'Premium Rice', description: 'Long grain fragrant rice', quantity: 100, price: 129000 },
        { name: 'Cooking Oil', description: 'Refined vegetable oil 1L', quantity: 50, price: 45000 },
        { name: 'Fish Sauce', description: 'Traditional fish sauce 500ml', quantity: 30, price: 85000 },
        { name: 'Instant Noodles', description: 'Spicy shrimp flavor', quantity: 200, price: 4500 },
        { name: 'Fresh Milk', description: 'Pasteurized milk 180ml', quantity: 150, price: 5500 },
      ]
    });
    console.log('Products created');

    const user = await prisma.user.findUnique({
      where: { email: 'huyen.cao+2@asnet.com.vn' }
    });

    if (!user) throw new Error('User not found');

    const cart = await prisma.cart.create({
      data: { owner_id: user.id }
    });

    const allProducts = await prisma.product.findMany();
    const cartItemsData = await Promise.all(
      allProducts.slice(0, 4).map((product, i) =>
        prisma.cartItem.create({
          data: {
            cart_id: cart.id,
            product_id: product.id,
            quantity: i + 1,
          }
        })
      )
    );
    console.log('Cart items created');

    const orders = [];
    const orderItems = [];
    const baseDate = new Date('2025-04-14T00:00:00Z');

    for (let i = 0; i < 10; i++) {
      const completed_at = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);

      let total = 0;
      let totalQty = 0;

      const selectedProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

      const createdOrder = await prisma.order.create({
        data: {
          owner_id: user.id,
          status: 'COMPLETED',
          completed_at,
          amount: 0,
          quantity: 0,
        }
      });

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const amount = quantity * product.price;

        await prisma.orderItem.create({
          data: {
            order_id: createdOrder.id,
            product_id: product.id,
            quantity,
            amount,
          }
        });

        total += amount;
        totalQty += quantity;
      }

      await prisma.order.update({
        where: { id: createdOrder.id },
        data: {
          amount: total,
          quantity: totalQty,
        }
      });
    }

    console.log('10 orders created with order items.');
    console.log('Data initialization complete!');
  } catch (error) {
    console.error('Error initializing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeData();
