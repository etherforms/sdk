import { JsonRpcSigner, TransactionResponse, Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import InputValue from "./interfaces/InputValue";
import { strToSlug } from "./helpers";

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
(() => {
    EtherFormsSDK.initialize();

    const modal = document.createElement("div");

    modal.id = "etherFormModal";
    modal.className = "ef-modal";

    modal.innerHTML = "<div class=\"ef-modal-backdrop\"></div><div class=\"ef-modal-dialog\"><div class='ef-modal-content'><form action='' class='ef-modal-form'><div class='ef-modal-header'>Submit Transaction</div><div class='ef-modal-body'></div><div class='ef-modal-footer'><button class='ef-modal-button'>Submit</button></div></div></form></div>";

    document.body.appendChild(modal);
})();

// Listeners
document.querySelectorAll("form.ef-modal-form")
    .forEach(function (element: Element) {
        element.addEventListener("submit", function (event) {
            event.preventDefault();

            (async () => {
                const form = event.target as HTMLFormElement;

                const contractAddress = form.getAttribute("data-web3-contract");
                const contractMethod = form.getAttribute("data-web3-function");
                const inputs = form.getAttribute("data-web3-inputs");

                console.log("contractAddress");
                console.log(contractAddress);
                console.log("contractMethod");
                console.log(contractMethod);
                console.log("inputs");
                console.log(inputs);

                const formData = new FormData(form);

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
                        .filter((input: string) => input.split(":").length === 2)
                        .map((input: string): InputValue => {
                            const [label, dataType] = input.split(":");

                            const inputValue = formData.get(strToSlug(label));

                            return {
                                label,
                                value: typeof inputValue === "string" ? inputValue : null,
                                dataType,
                            };
                        })
                        .forEach(function (inputValue: InputValue) {
                            const { value, dataType } = inputValue;

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
                    // */
                } else {
                    response = await contract[contractMethod]();
                }

                console.log(response);
            })();
        });
    });

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
                    // Create Form Popup
                    // const methodArguments: string[] = [];
                    // let methodArgumentErrors = 0;

                    const modal = document.getElementById("etherFormModal");

                    const modalBody = modal.querySelector(".ef-modal-body");

                    modalBody.innerHTML = "";

                    const etherForm = modal.querySelector("form.ef-modal-form");

                    etherForm.setAttribute("data-web3-contract", contractAddress);
                    etherForm.setAttribute("data-web3-function", contractMethod);
                    etherForm.setAttribute("data-web3-inputs", inputs);

                    inputs
                        .split(",")
                        .forEach(function (input: string) {
                            const [label, dataType] = input.split(":");

                            const sluggedLabel = strToSlug(label);

                            modalBody.innerHTML += "<div><label for=\"ef_"+sluggedLabel+"\">"+label+" ("+dataType+")</label><input type=\"text\" id=\"ef_"+sluggedLabel+"\" name=\""+sluggedLabel+"\" /></div>";
                        });

                    if ( ! modal.classList.contains("show")) {
                        modal.classList.add("show");
                    }

                    /*
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
                    // */
                } else {
                    response = await contract[contractMethod]();
                }

                console.log(response);
            })();
        });
    });
