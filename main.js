import { ABI } from './abi';

const contractAddress = "0xa1ee5587E20cE87c4AbdfaFDE08e67750E4A3735";

const connex = new Connex({
  node: 'https://vethor-node-test.vechaindev.com',
  network: 'test'
});

let userLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('#login-btn');
  const storeBtn = document.querySelector('#store-btn');
  const readBtn = document.querySelector('#read-btn');

  loginBtn.addEventListener('click', handleLogin);
  storeBtn.addEventListener('click', handleStore);
  readBtn.addEventListener('click', handleRead);
});

async function handleLogin() {
  try {
    const message = {
      purpose: "identification",
      payload: {
        type: "text",
        content: "Sign this certificate to prove your identity",
      },
    };

    const certResponse = await connex.vendor.sign("cert", message).request();

    if (certResponse) {
      userLoggedIn = true;
      const userAddress = certResponse.annex.signer;
      toggleLoginDisplay(userAddress);
    } else {
      alert("Wallet not found");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred during login");
  }
}

function toggleLoginDisplay(userAddress) {
  const loginBody = document.querySelector('#login-body');
  const dappBody = document.querySelector('#dapp-body');
  const userAddressElement = document.querySelector('#user-address');

  loginBody.classList.add('hidden');
  dappBody.classList.remove('hidden');
  userAddressElement.innerHTML = userAddress;
}

async function handleStore() {
  if (!userLoggedIn) {
    alert("Please sign in first!");
    return;
  }

  try {
    const storeInput = document.querySelector('#store-input').value;
    const abiStore = ABI.find(({ name }) => name === "store");

    if (storeInput.trim().length === 0) {
      alert("Please add a number to the input");
      return;
    }

    const clause = connex.thor
      .account(contractAddress)
      .method(abiStore)
      .asClause(storeInput);

    const result = await connex.vendor
      .sign("tx", [clause])
      .comment('Calling the store function')
      .request();

    alert("Transaction done! Transaction ID: " + result.txid);
  } catch (error) {
    console.error("Error during store operation:", error);
    alert("An error occurred during store operation");
  }
}

async function handleRead() {
  try {
    const contractNumberElement = document.querySelector('#contract-number');
    const abiRetrieve = ABI.find(({ name }) => name === "read");

    contractNumberElement.innerHTML = "Loading...";

    const result = await connex.thor
      .account(contractAddress)
      .method(abiRetrieve)
      .call();

    if (result) {
      contractNumberElement.innerHTML = result.decoded[0];
    } else {
      contractNumberElement.innerHTML = "Failed to fetch";
    }
  } catch (error) {
    console.error("Error during read operation:", error);
    alert("An error occurred during read operation");
  }
}
