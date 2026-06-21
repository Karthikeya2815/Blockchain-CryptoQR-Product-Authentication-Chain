import re

filepath = 'src/js/verifyProduct.js'
content = open(filepath, 'r', encoding='utf-8').read()

# Find the block from "if (!isGenuine)" to the closing "}" of the last else
# We'll use a regex to match the entire if/else if/else chain

old_block = re.search(
    r'(if \(!isGenuine\) \{.*?} else \{.*?Safe to purchase at this store.*?\})',
    content, re.DOTALL
)

if not old_block:
    print("ERROR: Could not find the target block. Printing lines 188-216 for debug:")
    lines = content.split('\n')
    for i, line in enumerate(lines[187:216], start=188):
        print(f"{i}: {line}")
else:
    print("Found block. Replacing...")
    old_text = old_block.group(0)

    new_text = """if (!isGenuine) {
                    statusHTML = 
                        '<div class="status-icon" style="color:var(--danger);">&#10007;</div>' +
                        '<div style="color:var(--danger); font-size:1.5rem; font-weight:800; letter-spacing:1px;">UNKNOWN PRODUCT</div>' +
                        '<div style="color:var(--text-muted); margin-top:10px; font-size:1rem;">This serial number is not registered on our blockchain. DO NOT BUY this item.</div>';
                } else if (isOwner) {
                    statusHTML =
                        '<div class="status-icon pulse" style="color:var(--success);">&#10003;</div>' +
                        '<div style="color:var(--success); font-size:1.5rem; font-weight:800; letter-spacing:1px;">GENUINE &amp; OWNED BY YOU</div>' +
                        '<div style="color:var(--text-muted); margin-top:10px; font-size:1rem;">You are the officially registered owner. Digital twin verified on blockchain.</div>' + provenanceHTML;
                } else if (isSold) {
                    statusHTML =
                        '<div class="status-icon" style="color:var(--danger);">&#10007;</div>' +
                        '<div style="color:var(--danger); font-size:1.5rem; font-weight:800; letter-spacing:1px;">&#9888; COUNTERFEIT DETECTED</div>' +
                        '<div style="color:var(--danger); margin-top:10px; font-size:1.1rem; font-weight:600;">This product is already registered to a DIFFERENT OWNER on the blockchain.</div>' +
                        '<div style="color:var(--text-muted); margin-top:8px; font-size:0.95rem;">If someone is selling you this item - it is a FAKE DUPLICATE. Do NOT purchase it.</div>' + provenanceHTML;
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
                        '<div style="color:var(--text-muted); margin-top:10px; font-size:1rem;">Product verified on blockchain. This product is authentic and safe to purchase.</div>' + provenanceHTML;
                }"""

    content = content.replace(old_text, new_text)
    open(filepath, 'w', encoding='utf-8').write(content)
    print("SUCCESS: verifyProduct.js updated with fixed result order.")
    print("Changes made:")
    print("  - isSold check now comes BEFORE isSuspicious")
    print("  - COUNTERFEIT DETECTED message is now clearer and more alarming")
    print("  - GENUINE message updated")
