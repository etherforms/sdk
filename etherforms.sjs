const rpc = (()  => {
    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const sendEth = async (provider) => {
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        console.log("pubKey", accounts);
        const txRes = await web3.eth.sendTransaction({
            from: accounts[0],
            to: accounts[0],
            value: web3.utils.toWei("0.01"),
        });
        console.log("txRes", txRes);
        return txRes;
    };

    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const getAccounts = async (provider) => {
        const web3 = new Web3(provider);
        return await web3.eth.getAccounts();
    };

    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const getChainId = async (provider) => {
        const web3 = new Web3(provider);
        const chainId = await web3.eth.getChainId();
        return chainId.toString();
    };

    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const getBalance = async (provider) => {
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        return await web3.eth.getBalance(accounts[0]);
    };

    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const signTransaction = async (provider) => {
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();

        // only supported with social logins (openlogin adapter)
        return await web3.eth.signTransaction({
            from: accounts[0],
            to: accounts[0],
            value: web3.utils.toWei("0.01"),
        });
    };

    return {
        sendEth,
        getAccounts,
        getChainId,
        getBalance,
        signTransaction
    }
})();

function subscribeAuthEvents(web3auth) {
    web3auth.on("connected", (data) => {
        (async () => {
            const accounts = await EtherForms.getAccounts();

            if (accounts.length) {
                EtherForms.activeAccount = accounts[0];
            }
        })();
    });

    web3auth.on("connecting", () => {
        // console.log("connecting");
    });

    web3auth.on("disconnected", () => {
        // console.log("disconnected");
    });

    web3auth.on("errored", (error) => {
        // console.log("some error or user have cancelled login request", error);
    });

    web3auth.on("MODAL_VISIBILITY", (isVisible) => {
        // console.log("modal visibility", isVisible);
    });
}

let EtherForms = {
    web3authSdk: window.Web3auth,
    web3AuthInstance: null,
    OpenloginAdapter: window.OpenloginAdapter,
    rpc: rpc,
    activeAccount: null,
    init: async function() {
        const clientId = "BMrruqmToyxCrgGZM3qWEKANo6kwqgQOMxICyqCmYQ3B_qiZGud3bYsHAZUfBXxcwzw1GIW_S5f8BOKl832mHQo"; // get your clientId from https://developer.web3auth.io

        const web3AuthCtorParams = {
            clientId,
            chainConfig: {
                chainNamespace: "eip155",
                chainId: "0x2A"
            }
        }

        this.web3AuthInstance = new EtherForms.web3authSdk.Web3Auth(web3AuthCtorParams);

        // REPLACE-const web3AuthOpenloginConfigure = {};-

        subscribeAuthEvents(this.web3AuthInstance);

        await this.web3AuthInstance.initModal();
    },
    connect: async function () {
        const provider = await this.web3AuthInstance.connect();
        console.log("provider after login", provider);

        return true
    },
    disconnect: async function() {
        await this.web3AuthInstance.logout();

        return true
    },
    getUserInfo: async function() {
        return this.web3AuthInstance.getUserInfo()
    },
    getAccounts: async function() {
        return this.rpc.getAccounts(this.web3AuthInstance.provider)
    }
};

// Init
EtherForms.init();

// Listeners
const abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];

const etherForm = document.getElementById("etherForm");

etherForm.addEventListener("submit", function(e){
    e.preventDefault();

    if (!EtherForms.activeAccount) {
        (async () => {
            await EtherForms.connect();
        })();
        return;
    }

    let inputs = etherForm.getAttribute('data-web3-inputs') || [];

    if (inputs) {
        inputs = JSON.parse(inputs);
    }

    const formData = new FormData(etherForm);

    const inputValues = inputs.map((input) => formData.get(input));

    const contractAddress = etherForm.getAttribute("data-web3-contract");
    const functionToCall = etherForm.getAttribute("data-web3-function");

    (async () => {
        const web3 = new Web3(EtherForms.web3AuthInstance.provider);
        const contract = new web3.eth.Contract(abi, contractAddress);

        if (inputValues.length > 0) {
            console.log(
                await contract
                    .methods[functionToCall](...inputValues)
                    .send({
                        from: EtherForms.activeAccount
                    })
            )
        } else {
            console.log(
                await contract
                    .methods[functionToCall]()
                    .send({
                        from: EtherForms.activeAccount
                    })
            )
        }
    })();
});
*/
