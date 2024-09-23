import { ethers } from "ethers";
import { Contract } from "ethers";
import abi from "./contractABI.json"; // ABI should match your deployed contract



const contractAddress = "0x836c7b2e2370ea97df1d0c1f88bffdcd7963b2ba";


async function initializeContract() {
    try {

        if (!window.ethereum) {
            throw new Error("No crypto wallet found. Please install MetaMask.");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        let signer;
        try {
            signer = await provider.getSigner();
        } catch (error) {
            if (error.code === -32002) {

                console.error("MetaMask request is already pending. Please wait for the previous request to complete.");
                return;
            }
            throw error;
        }

        const contract = new Contract(contractAddress, abi, signer);
        return [contract, signer];
    } catch (error) {
        console.error('Error:', error.message);
    }
}


export default initializeContract;



