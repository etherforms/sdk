# 🧰 EtherForms

> Integrate web3 into any web application, with little-to-zero coding skill requirement.

EtherForms is a SDK that allows you to integrate web3 smart contracts directly into your web app, with little-to-zero coding skill requirement.

EtherForms can be integrated to any website that allows modification of the source code.

## Installation

### 1. Include the SDK just above your closing `</body>` tag

You have 2 options (*soon™*): hosted and self-hosted SDK.

**Hosted Solution:**

All you have to do, is to include a `<script></script>` before the `</body>`, and you're set.

```html
<script src="https://cdn.etherforms.com/sdk.min.js"></script>
```

**Self-hosted Solution:**

Either download our SDK manually, or install it using npm *(coming soon)* as shown below.

```
npm install stroopwafels-are-awesome
```

### 2. Insert the button on your website

The button will trigger the popup where people can confirm and submit the transaction.

**Example:**

```html
<button
    type="button"
    data-web3-contract="0xa36085f69e2889c224210f603d836748e7dc0088"
    data-web3-function="transfer"
    data-web3-inputs="Recipient:address,Amount:uint256"
>Transfer LINK</button>
```
