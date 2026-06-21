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
            App.contracts.product = TruffleContract(data);
            App.contracts.product.setProvider(App.web3Provider);
        });
        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-register', App.sellToConsumer);
    },

    sellToConsumer: function(event) {
        event.preventDefault();

        var productSN = document.getElementById('productSN').value.trim();
        var consumerCode = document.getElementById('consumerCode').value.trim();
        var purchaseLocation = document.getElementById('purchaseLocation').value.trim();

        if (!productSN || !consumerCode || !purchaseLocation) {
            alert('Please enter Serial Number, Consumer ID, and Purchase Location.');
            return;
        }

        web3.eth.getAccounts(function(error, accounts) {
            if (error || !accounts || accounts.length === 0) {
                alert('No blockchain account found. Connect MetaMask to Ganache first.');
                return;
            }

            var account = accounts[0];
            App.contracts.product.deployed().then(function(instance) {
                return instance.sellerSellProduct(
                    web3.fromAscii(productSN),
                    web3.fromAscii(consumerCode),
                    purchaseLocation,
                    { from: account, gas: 3000000 }
                );
            }).then(function() {
                // Show success card instead of reloading
                document.getElementById('success-card').style.display = 'block';
                document.getElementById('productSN').value = '';
                document.getElementById('consumerCode').value = '';
                window.scrollTo(0, document.body.scrollHeight);
            }).catch(function(err) {
                console.error(err);
                alert('Sale failed: ' + err.message);
            });
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});