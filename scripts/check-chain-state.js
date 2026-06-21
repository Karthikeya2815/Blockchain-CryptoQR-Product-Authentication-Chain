const Product = artifacts.require('product');

module.exports = async function(callback) {
    try {
        const product = await Product.deployed();
        const productSN = process.argv[4] || 'P1001';
        const sellerCode = process.argv[5] || 'S101';
        const manufacturerCode = process.argv[6] || 'MFG001';

        const toBytes32 = (value) => web3.utils.asciiToHex(value);
        const fromBytes32 = (value) => web3.utils.hexToAscii(value).replace(/\0/g, '');

        console.log('Contract address:', product.address);
        console.log('Checking product serial:', productSN);
        console.log('Checking seller code:', sellerCode);
        console.log('Checking manufacturer code:', manufacturerCode);

        const allProducts = await product.viewProductItems();
        console.log('Total product slots:', allProducts[0].length);
        for (let i = 0; i < allProducts[0].length; i++) {
            const sn = fromBytes32(allProducts[1][i]);
            if (!sn) continue;
            console.log(`Product ${i}: SN=${sn}, Name=${fromBytes32(allProducts[2][i])}, Brand=${fromBytes32(allProducts[3][i])}, Price=${allProducts[4][i].toString()}, Status=${fromBytes32(allProducts[5][i])}`);
        }

        const productsForSeller = await product.queryProductsList(toBytes32(sellerCode));
        let foundForSeller = false;
        for (let i = 0; i < productsForSeller[0].length; i++) {
            const sn = fromBytes32(productsForSeller[1][i]);
            if (!sn) continue;
            foundForSeller = true;
            console.log(`Seller ${sellerCode} product: SN=${sn}, Name=${fromBytes32(productsForSeller[2][i])}`);
        }

        if (!foundForSeller) {
            console.log(`No products are currently assigned to seller ${sellerCode}.`);
        }

        const sellersForManufacturer = await product.querySellersList(toBytes32(manufacturerCode));
        let foundSeller = false;
        for (let i = 0; i < sellersForManufacturer[0].length; i++) {
            const code = fromBytes32(sellersForManufacturer[3][i]);
            if (!code) continue;
            foundSeller = true;
            console.log(`Manufacturer ${manufacturerCode} seller: Code=${code}, Name=${fromBytes32(sellersForManufacturer[1][i])}`);
        }

        if (!foundSeller) {
            console.log(`No sellers are currently assigned to manufacturer ${manufacturerCode}.`);
        }

        callback();
    } catch (error) {
        callback(error);
    }
};
