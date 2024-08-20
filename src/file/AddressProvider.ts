import fs from 'fs';

const AddressProvider = () => {
    const getContractAddress = (): string | undefined => {
        try {
            const data = fs.readFileSync('./broadcast/Deploy.s.sol/31337/run-latest.json', 'utf8');
            // 
            const jsonData = JSON.parse(data);
            console.log(jsonData);
            return jsonData.receipts[0].contractAddress;
        } catch (err) {
            console.error(err);
        }
    }

    return {
        getContractAddress
    }
}


export default AddressProvider;