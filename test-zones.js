const { BrainerceClient } = require('brainerce');

async function testZones() {
  const omni = new BrainerceClient({
    connectionId: 'vc_Qyklbs620yrtzhmgqoYUK',
  });

  try {
    // Try different approaches to get zones
    console.log('Testing zone methods...\n');
    
    // Try getShippingZone (singular)
    try {
      const zone = await omni.getShippingZone();
      console.log('getShippingZone() result:', JSON.stringify(zone, null, 2));
    } catch (e) {
      console.log('getShippingZone() not available:', e.message);
    }

    // Try getStoreInfo to see what's available
    const storeInfo = await omni.getStoreInfo();
    console.log('\nStore info keys:', Object.keys(storeInfo));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testZones();
