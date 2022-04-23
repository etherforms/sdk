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
    const signMessage = async (provider) => {
        const pubKey = await provider.request({ method: "eth_accounts" });

        return new Promise((resolve, reject)=>{
            const web3 = new Web3();
            web3.setProvider(provider);
            // hex message
            const message = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
            (web3.currentProvider)?.send(
                {
                    method: "eth_sign",
                    params: [pubKey[0], message],
                    from: pubKey[0],
                }, (err, res) => {
                    if (err) {
                        return rejects(err);
                    }
                    return resolve(res);
                }
            );
        })
    };

    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const getAccounts = async (provider) => {
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        return accounts;
    };

    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const getChainId = async (provider)=> {
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
        const balance = await web3.eth.getBalance(accounts[0]);
        return balance;
    };

    /**
     *
     * @param {*} provider - provider received from Web3Auth login.
     */
    const signTransaction = async (provider) => {
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();

        // only supported with social logins (openlogin adapter)
        const txRes = await web3.eth.signTransaction({
            from: accounts[0],
            to: accounts[0],
            value: web3.utils.toWei("0.01"),
        });
        return txRes;
    };
    return {
        sendEth,
        signMessage,
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
        console.log("rpc", rpc);
        $(".btn-logged-in").hide();
        $("#sign-tx").hide();

        const clientId = "BMeootVyjsUTW8EuKkJ3Mq0kCC5XI-lVeRfQWyrmmqBPfkUeIEF5ckOOCosZdT8Li0uSEL-SzVjlBKNf3wnaeCQ"; // get your clientId from https://developer.web3auth.io

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
        console.log("web3AuthInstance", this.web3AuthInstance, this.web3AuthInstance.provider);
        if (this.web3AuthInstance.provider) {
            $(".btn-logged-in").show();
            $(".btn-logged-out").hide();
            if (this.web3AuthInstance.connectedAdapterName === "openlogin") {
                $("#sign-tx").show();
            }
        } else {
            $(".btn-logged-out").show();
            $(".btn-logged-in").hide();
        }
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

document.body.addEventListener("click", function (event) {
    const isWeb3Btn = (event.target.getAttribute("data-web3-contract") || "").length === 42 && (event.target.getAttribute("data-web3-function") || "").length > 0

    if (isWeb3Btn) {
        const contractAddress = event.target.getAttribute("data-web3-contract");
        const functionToCall = event.target.getAttribute("data-web3-function");
        let functionArguments = event.target.getAttribute("data-web3-arguments") || null;

        if (!!functionArguments) {
            functionArguments = JSON.parse(functionArguments);
        }

        (async () => {
            const web3 = new Web3(EtherForms.web3AuthInstance.provider);
            const contract = new web3.eth.Contract(abi, contractAddress);

            if (!!functionArguments) {
                console.log(
                    await contract
                        .methods[functionToCall](...functionArguments)
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
    }
});
