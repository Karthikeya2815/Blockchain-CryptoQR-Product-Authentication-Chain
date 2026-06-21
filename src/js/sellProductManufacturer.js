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
        $(document).on('click', '.btn-register', App.transferProductToSeller);
    },

    transferProductToSeller: function(event) {
        event.preventDefault();

        var productSN = document.getElementById('productSN').value.trim();
        var sellerCode = document.getElementById('sellerCode').value.trim();

        if (!productSN || !sellerCode) {
            alert('Please enter Product Serial Number and Destination Seller Code.');
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
                return instance.manufacturerSellProduct(
                    web3.fromAscii(productSN),
                    web3.fromAscii(sellerCode),
                    { from: account, gas: 3000000 }
                );
            }).then(function() {
                alert('Ownership transferred to seller successfully!');
                document.getElementById('productSN').value = '';
                document.getElementById('sellerCode').value = '';
            }).catch(function(err) {
                console.error(err);
                alert('Transfer to seller failed: ' + err.message);
            });
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
