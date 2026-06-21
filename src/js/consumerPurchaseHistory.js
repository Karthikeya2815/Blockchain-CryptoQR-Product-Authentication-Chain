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
        $(document).on('click', '.btn-register', App.loadHistory);
    },

    loadHistory: function(event) {
        event.preventDefault();

        var consumerCode = document.getElementById('consumerCode').value.trim();
        if (!consumerCode) {
            document.getElementById('status-msg').textContent = 'Could not detect your Consumer ID. Please log in again.';
            return;
        }

        document.getElementById('status-msg').textContent = 'Loading your products...';

        web3.eth.getAccounts(function(error, accounts) {
            if (error || !accounts || accounts.length === 0) {
                document.getElementById('status-msg').textContent = 'No blockchain account found. Connect MetaMask to Ganache.';
                return;
            }

            var account = accounts[0];
            App.contracts.product.deployed().then(function(instance) {
                return instance.getPurchaseHistory(web3.fromAscii(consumerCode), { from: account });
            }).then(function(result) {
                var rows = '';
                var count = 0;

                for (var i = 0; i < result[0].length; i++) {
                    var sn = web3.toAscii(result[0][i]).replace(/\0/g, '');
                    var seller = web3.toAscii(result[1][i]).replace(/\0/g, '');
                    var mfr = web3.toAscii(result[2][i]).replace(/\0/g, '');
                    if (!sn || seller === '0') continue;
                    rows += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">';
                    rows += '<td style="padding: 14px; font-family: monospace; color: #00d2ff;">' + sn + '</td>';
                    rows += '<td style="padding: 14px;">' + seller + '</td>';
                    rows += '<td style="padding: 14px;">' + mfr + '</td>';
                    rows += '</tr>';
                    count++;
                }

                document.getElementById('status-msg').style.display = 'none';
                document.getElementById('result-section').style.display = 'block';

                if (count === 0) {
                    document.getElementById('empty-msg').style.display = 'block';
                } else {
                    document.getElementById('logdata').innerHTML = rows;
                }
            }).catch(function(err) {
                console.error(err);
                document.getElementById('status-msg').textContent = 'Error loading products: ' + err.message;
            });
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});