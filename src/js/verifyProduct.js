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
        $(document).on('click', '.btn-register', App.verifyProduct);
        $(document).on('click', '#btn-verify-qr', App.verifyQRSignature);
    },

    verifyQRSignature: function(event) {
        event.preventDefault();
        var fileInput = document.getElementById('qrInput');
        var resultDiv = document.getElementById('logdata');
        var resultCard = document.getElementById('result-card');

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select a QR code image to upload.');
            return;
        }

        resultCard.style.display = 'block';
        resultDiv.innerHTML = '<span style="color:#b2bec3;">Scanning Image...</span>';

        var file = fileInput.files[0];
        var reader = new FileReader();
        
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.getElementById('qrCanvas');
                var context = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);
                
                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                var code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    try {
                        var rawData = decodeURIComponent(code.data);
                        var data = JSON.parse(rawData);
                        
                        if (!data.sn || !data.sig) {
                            throw new Error("QR Data recognized but format is invalid.");
                        }

                        // Recalculate signature
                        var expectedSig = CryptoJS.HmacSHA256(data.sn, "AuthentiChain_Secure_Key_2026").toString();

                        if (data.sig === expectedSig) {
                            resultDiv.innerHTML = '<span style="color:#b2bec3;">QR Valid. Connecting to Blockchain to verify ownership...</span>';
                            
                            // Auto-fill the SN field
                            document.getElementById('productSN').value = data.sn;
                            
                            // Automatically trigger the blockchain verification
                            setTimeout(function() {
                                document.querySelector('.btn-register').click();
                            }, 500);
                        } else {
                            resultDiv.innerHTML = 
                                '<div style="color:#ef4444; font-size:3rem;">&#10007;</div>' +
                                '<div style="color:#ef4444; font-size:1.3rem; font-weight:800; margin-top:10px;">TAMPERED QR</div>' +
                                '<div style="color:#b2bec3; margin-top:8px; font-size:0.9rem;">The cryptographic signature in this QR code does not match. This is a fake label.</div>';
                        }
                    } catch (err) {
                        resultDiv.innerHTML = '<span style="color:#ef4444;">Error decoding QR content: ' + err.message + '</span>';
                    }
                } else {
                    resultDiv.innerHTML = '<span style="color:#ef4444;">Could not find a valid QR code in the uploaded image. Please ensure the image is clear.</span>';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    verifyProduct: function(event) {
        event.preventDefault();

        var productSN = document.getElementById('productSN').value.trim();
        var consumerCode = document.getElementById('consumerCode').value.trim();
        var scanLocation = document.getElementById('scanLocation').value.trim() || "Unknown City";

        if (!productSN) {
            alert('Please enter a Product Serial Number.');
            return;
        }

        document.getElementById('result-card').style.display = 'block';
        document.getElementById('logdata').innerHTML = '<span style="color:#b2bec3;">Recording scan and checking blockchain...</span>';
        document.getElementById('scandata').innerHTML = '';

        web3.eth.getAccounts(function(error, accounts) {
            if (error || !accounts || accounts.length === 0) {
                document.getElementById('logdata').innerHTML = '<span style="color:#ef4444;">No blockchain account. Connect MetaMask to Ganache.</span>';
                return;
            }

            var account = accounts[0];
            var productInstance;

            App.contracts.product.deployed().then(function(instance) {
                productInstance = instance;
                // Step 1: Record the scan
                return productInstance.recordScan(
                    web3.fromAscii(productSN),
                    scanLocation,
                    { from: account, gas: 3000000 }
                );
            }).then(function(tx) {
                console.log("Scan recorded:", tx);
                // Step 2: Verify status
                return productInstance.verifyProduct(
                    web3.fromAscii(productSN),
                    web3.fromAscii(consumerCode),
                    { from: account }
                );
            }).then(function(result) {
                // result is [isGenuine, isOwner, scanCount, isSuspicious, isSold, mfgLoc, purLoc, mfgDate, saleDate]
                var isGenuine = result[0];
                var isOwner = result[1];
                var scanCount = result[2].toNumber();
                var isSuspicious = result[3];
                var isSold = result[4];
                var mfgLoc = result[5];
                var purLoc = result[6];
                var mfgDate = result[7].toNumber();
                var saleDate = result[8].toNumber();

                function formatDate(timestamp) {
                    if (!timestamp || timestamp === 0) return "N/A";
                    var date = new Date(timestamp * 1000);
                    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
                }

                var statusHTML = "";
                var scanHTML = "<p>Scan history: <b>" + scanCount + "</b> records on blockchain.</p>";
                var provenanceHTML = "";

                // Get instance again for scan history
                App.contracts.product.deployed().then(function(instance) {
                    return instance.getScanHistory(web3.fromAscii(productSN));
                }).then(function(history) {
                    var times = history[0];
                    var locs = history[1];
                    var historyList = "<ul style='list-style:none; padding:0; font-size:0.75rem; color:#636e72;'>";
                    for(var i=0; i<times.length; i++) {
                        historyList += "<li>📍 Scan " + (i+1) + ": " + locs[i] + " (" + formatDate(times[i].toNumber()) + ")</li>";
                    }
                    historyList += "</ul>";
                    document.getElementById('scandata').innerHTML = scanHTML + historyList;
                });

                if (isGenuine) {
                    provenanceHTML = "<hr style='border-color:#2d3436; margin:15px 0;'><div style='text-align:left; font-size:0.8rem; color:#b2bec3;'>" +
                        "<p>🏭 <b>Manufactured:</b> " + (mfgLoc || "Unknown") + " (" + formatDate(mfgDate) + ")</p>";
                    if (isSold) {
                        provenanceHTML += "<p>🛒 <b>Purchased:</b> " + (purLoc || "Unknown") + " (" + formatDate(saleDate) + ")</p>";
                    }
                    provenanceHTML += "</div>";
                }

                if (!isGenuine) {
                    statusHTML = 
                        '<div class="status-icon" style="color:var(--danger);">&#10007;</div>' +
                        '<div style="color:var(--danger); font-size:1.5rem; font-weight:800; letter-spacing:1px;">UNKNOWN PRODUCT</div>' +
                        '<div style="color:var(--text-muted); margin-top:10px; font-size:1rem;">This serial number is not registered on our blockchain. DO NOT BUY this item.</div>';
                } else if (isOwner) {
                    statusHTML =
                        '<div class="status-icon pulse" style="color:var(--success);">&#10003;</div>' +
                        '<div style="color:var(--success); font-size:1.5rem; font-weight:800; letter-spacing:1px;">GENUINE & OWNED BY YOU</div>' +
                        '<div style="color:var(--text-muted); margin-top:10px; font-size:1rem;">You are the officially registered owner. Digital twin verified.</div>' + provenanceHTML;
                } else if (isSold) {
                    statusHTML =
                        '<div class="status-icon" style="color:var(--danger);">&#10007;</div>' +
                        '<div style="color:var(--danger); font-size:1.5rem; font-weight:800; letter-spacing:1px;">&#9888; COUNTERFEIT DETECTED</div>' +
                        '<div style="color:var(--danger); margin-top:10px; font-size:1.1rem; font-weight:600;">This product is already registered to a DIFFERENT OWNER on the blockchain.</div>' +
                        '<div style="color:var(--text-muted); margin-top:8px; font-size:0.95rem;">If someone is selling you this item — it is a FAKE DUPLICATE. Do NOT purchase it.</div>' + provenanceHTML;
                } else if (isSuspicious) {
                    statusHTML = 
                        '<div class="status-icon" style="color:var(--warning);">&#9888;</div>' +
                        '<div style="color:var(--warning); font-size:1.5rem; font-weight:800; letter-spacing:1px;">SUSPICIOUS ACTIVITY DETECTED</div>' +
                        '<div style="color:var(--warning); margin-top:10px; font-size:1rem; font-weight:600;">This product has been scanned in multiple locations. Possible cloned QR code.</div>' +
                        '<div style="color:var(--text-muted); margin-top:8px; font-size:0.9rem;">Exercise caution. This product may be counterfeit.</div>' + provenanceHTML;
                } else {
                    statusHTML =
                        '<div class="status-icon" style="color:var(--primary);">&#8505;</div>' +
                        '<div style="color:var(--primary); font-size:1.5rem; font-weight:800; letter-spacing:1px;">GENUINE - AVAILABLE</div>' +
                        '<div style="color:var(--text-muted); margin-top:10px; font-size:1rem;">Product verified on blockchain. Safe to purchase at this store.</div>' + provenanceHTML;
                }

                document.getElementById('logdata').innerHTML = statusHTML;
                document.getElementById('scandata').innerHTML = scanHTML;

            }).catch(function(err) {
                console.error(err);
                document.getElementById('logdata').innerHTML = '<span style="color:#ef4444;">Verification error: ' + err.message + '</span>';
            });
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
