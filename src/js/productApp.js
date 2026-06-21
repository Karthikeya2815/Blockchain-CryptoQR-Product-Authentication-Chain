App = {
    web3Provider: null,
    contracts: {},

    init: async function() {
        return await App.initWeb3();
    },

    initWeb3: function() {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            window.ethereum.request({ method: 'eth_requestAccounts' }).catch(function(error) {
                console.error(error);
            });
        } else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {
        $.getJSON('product.json', function(data) {
            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-register', App.registerProduct);
    },

    registerProduct: function(event) {
        event.preventDefault();

        var manufacturerID = document.getElementById('manufacturerID').value.trim();
        var productName = document.getElementById('productName').value.trim();
        var productSN = document.getElementById('productSN').value.trim();
        var productBrand = document.getElementById('productBrand').value.trim();
        var productPrice = document.getElementById('productPrice').value.trim();
        var mfgLocation = document.getElementById('mfgLocation').value.trim();

        if (!manufacturerID || !productName || !productSN || !mfgLocation) {
            alert('Please fill all required fields, including Manufacture Location.');
            return;
        }

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.error(error);
                alert('Could not read MetaMask/Ganache account.');
                return;
            }

            if (!accounts || accounts.length === 0) {
                alert('No blockchain account found. Connect MetaMask to Ganache first.');
                return;
            }

            var account = accounts[0];

            App.contracts.product.deployed().then(function(instance) {
                return instance.addProduct(
                    web3.fromAscii(manufacturerID),
                    web3.fromAscii(productName),
                    web3.fromAscii(productSN),
                    web3.fromAscii(productBrand),
                    productPrice,
                    mfgLocation,
                    { from: account, gas: 3000000 }
                );
            }).then(function() {
                alert('Product successfully registered on blockchain!');
                
                // Now generate the QR Code
                var signature = CryptoJS.HmacSHA256(productSN, "AuthentiChain_Secure_Key_2026").toString();
                var payload = JSON.stringify({ sn: productSN, sig: signature });
                var qrValue = encodeURIComponent(payload);

                var src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrValue}`;
                var imgQR = document.getElementById('imgQR');
                imgQR.src = src;
                imgQR.removeAttribute('hidden');
                document.getElementById('rawQR').value = payload;
                document.getElementById('qr-card').style.display = 'block';

                // We don't clear productSN immediately so download logic still works
                // But we can clear name for next entry
                document.getElementById('productName').value = '';
            }).catch(function(err) {
                console.error(err);
                alert('Product registration failed: ' + err.message);
            });
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
