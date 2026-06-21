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
        $(document).on('click', '.btn-register', App.addSeller);
    },

    addSeller: function(event) {
        event.preventDefault();

        var manufacturerID = document.getElementById('manufacturerID').value.trim();
        var sellerName = document.getElementById('sellerName').value.trim();
        var sellerBrand = document.getElementById('sellerBrand').value.trim();
        var sellerCode = document.getElementById('sellerCode').value.trim();
        var sellerNum = document.getElementById('sellerNum').value.trim();
        var sellerManager = document.getElementById('sellerManager').value.trim();
        var sellerAddress = document.getElementById('sellerAddress').value.trim();

        if (!manufacturerID || !sellerName || !sellerCode) {
            alert('Please fill Name and Code (Username) at least.');
            return;
        }

        web3.eth.getAccounts(function(error, accounts) {
            if (error || !accounts || accounts.length === 0) {
                alert('No blockchain account found. Connect MetaMask to Ganache first.');
                return;
            }

            var account = accounts[0];
            App.contracts.product.deployed().then(function(instance) {
                return instance.addSeller(
                    web3.fromAscii(manufacturerID),
                    web3.fromAscii(sellerName),
                    web3.fromAscii(sellerBrand),
                    web3.fromAscii(sellerCode),
                    sellerNum,
                    web3.fromAscii(sellerManager),
                    web3.fromAscii(sellerAddress),
                    { from: account, gas: 3000000 }
                );
            }).then(function() {
                document.getElementById('success-card').style.display = 'block';
                window.scrollTo(0, document.body.scrollHeight);
            }).catch(function(err) {
                console.error(err);
                alert('Seller registration failed: ' + err.message);
            });
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
