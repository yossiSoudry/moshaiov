const { BrainerceClient } = require('brainerce');

async function testZoneNames() {
  const omni = new BrainerceClient({
    connectionId: 'vc_LtawnwQr1w5F5Tqi1wYOG',
  });

  try {
    // Get a product for testing
    const products = await omni.getProducts({ limit: 1 });
    if (!products || products.data.length === 0) {
      console.log('No products available');
      return;
    }

    const product = products.data[0];
    
    // Create test cart
    const localCart = {
      items: [{
        productId: product.id,
        variantId: product.variants?.[0]?.id,
        quantity: 1,
      }],
    };

    // Test address in Tel Aviv (should match zone 1)
    console.log('Testing Tel Aviv address...');
    const checkout1 = await omni.startGuestCheckout(localCart);
    const result1 = await omni.setShippingAddress(checkout1.id, {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '0501234567',
      line1: 'Rothschild 1',
      city: 'Tel Aviv',
      postalCode: '6100001',
      country: 'IL',
    });
    
    console.log('Tel Aviv rates:', result1.rates?.map(r => ({ 
      name: r.name, 
      zoneName: r.zoneName,
      zoneId: r.zoneId
    })));

    // Test address in Haifa (should match zone 2)
    console.log('\nTesting Haifa address...');
    const checkout2 = await omni.startGuestCheckout(localCart);
    const result2 = await omni.setShippingAddress(checkout2.id, {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '0501234567',
      line1: 'HaNevi\'im 1',
      city: 'Haifa',
      postalCode: '3100001',
      country: 'IL',
    });
    
    console.log('Haifa rates:', result2.rates?.map(r => ({ 
      name: r.name,
      zoneName: r.zoneName,
      zoneId: r.zoneId
    })));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testZoneNames();
