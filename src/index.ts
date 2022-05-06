import { JsonRpcSigner, TransactionResponse, Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";

interface IEtherFormsSDK {
    web3Provider: Web3Provider | null
    accounts: string[] | null
    signer: JsonRpcSigner | null
    initialize(): void
}

const EtherFormsSDK: IEtherFormsSDK = {
    web3Provider: null,
    accounts: null,
    signer: null,
    initialize: async function() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.web3Provider = new Web3Provider(window.ethereum);

        this.accounts = this.web3Provider.send("eth_requestAccounts", []);
        this.signer = this.web3Provider.getSigner();
    }
};

// TODO: Fix validation
function validate(value: string, dataType: string): boolean {
    switch (dataType) {
    case "address":
        return value.length === 42 && value.slice(0, 2) === "0x";
    case "uint256":
        return value.length > 0;
    default:
        return true;
    }
}

// Initialize SDK
EtherFormsSDK.initialize();

// Listener
document.querySelectorAll("[data-web3-contract]")
    .forEach(function (element) {
        element.addEventListener("click", function (event) {
            event.preventDefault();

            (async () => {
                const button = event.target as HTMLButtonElement;

                const contractAddress = button.getAttribute("data-web3-contract");
                const contractMethod = button.getAttribute("data-web3-function");
                const inputs = button.getAttribute("data-web3-inputs");

                const methodArgumentsAbi = inputs
                    .split(",")
                    .filter((input: string) => input.split(":").length === 2)
                    .map((input: string) => {
                        const splittedInput = input.split(":");

                        return splittedInput[1]+" "+splittedInput[0];
                    })
                    .join(", ");

                const abi = ["function "+contractMethod+"("+methodArgumentsAbi+")"];

                const contract = new Contract(contractAddress, abi, EtherFormsSDK.signer);

                let response: TransactionResponse | null = null;

                if (methodArgumentsAbi.length > 0) {
                    const methodArguments: string[] = [];
                    let methodArgumentErrors = 0;

                    inputs
                        .split(",")
                        .forEach(function (input: string) {
                            const [label, dataType] = input.split(":");

                            const value = prompt(label+" ("+dataType+")");

                            if (false === validate(value, dataType)) {
                                methodArgumentErrors++;
                            }

                            methodArguments.push(value);
                        });

                    if (methodArgumentErrors === 0) {
                        response = await contract[contractMethod](...methodArguments);
                    } else {
                        console.log("Error with the provided inputs");
                    }
                } else {
                    response = await contract[contractMethod]();
                }

                console.log(response);
            })();
        });
    });
