---
layout: post
title: Your first unit tested Ethereum Smart Contract
author: daniel
hidden: false
tags: [smartcontract, ethereum, blockchain, truffle, web3js, parity, unittests]
---

The goal of that blog post is to provide you with the exact steps how to start creating your first unit tested smart contract. 

# My toolbox

While writing this article I was using Parity 1.7.8-stable (Parity/v1.7.8-stable-d5fcf3b-20171025/x86_64-macos/rustc1.21.0) as a Ethereum client. You can find an installation guide on this site: [Parity - fast, light, and robust Ethereum client](https://github.com/paritytech/parity) or if you are on macOSX or Debian based Linux, please follow instructions described in the next paragraphs. 

# Installing parity on macOSX

If you don't have a `homebrew` package manager installed yet, please execute:

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

and now the parity installation:

```
brew tap paritytech/paritytech
brew install parity --stable
```

# Installing parity on Linux

Almost all parity packages you can find here: `https://github.com/paritytech/parity/releases`. To install on Debian based Linux you will need wget and dpkg. Below as an example installation of parity 1.7.9-stable:

```
wget https://parity-downloads-mirror.parity.io/v1.7.9/x86_64-unknown-linux-gnu/parity_1.7.9_amd64.deb
sudo dpkg -i parity_1.7.9_amd64.deb
```

# Starting parity

For the purpose of that article we will start parity with:    
- private development chain definition `--chain=dev`        
- JSON RPC APIs: `--jsonrpc-apis web3,rpc,personal,parity_accounts,eth,net,parity,parity_set,signer`    
- gas price set to 0 `--gasprice 0`    
- interface IP address `--ui-interface 0.0.0.0`    
- disabled host name validation `--ui-no-validation`    
- allowing all hosts (Host header values) for using JSON RPC API `--jsonrpc-hosts all`    
- interface's IP address - all interfaces `--jsonrpc-interface all`     
                                   
```
parity --chain=dev --jsonrpc-apis web3,rpc,personal,parity_accounts,eth,net,parity,parity_set,signer --gasprice 0 --ui-interface 0.0.0.0 --ui-no-validation --jsonrpc-hosts all --jsonrpc-interface all
```

Now we do need an account with some ether amount to be able to perform transactions. Parity development chain allows you to create an account with almost unlimited ether amount but only on a development chain. You will not find creating such an account as an regular UI option, it's available as a hack. Please first open a link to parity UI (`http://0.0.0.0:8180/`) and open ACCOUNTS and then RESTORE,you should see: 
![Restore super account 1](/images/smart-contract-create-test-and-deploy/parity-restore-super-account-1.jpg)

The trick is to restore an account with an empty recovery phrase. Please fill in the account name, password hint, passwords and click IMPORT on the right bottom corner:
![Restore super account 2](/images/smart-contract-create-test-and-deploy/parity-restore-super-account-2.jpg)

Once the account is created, you should see:
![Restore super account 3](/images/smart-contract-create-test-and-deploy/parity-restore-super-account-3.jpg)

 Next step is to run parity node with unlocked account on which we will execute all test transactions, so you will not need to sign every test transaction via Signer available via parity UI. To do that please first kill already started parity process and run that process with two additional parameters:    
- address to unlock `--unlock 0x00a329c0648769A73afAc7F9381E08FB43dBEA72`        
- user password for specified account to unlock `--password ./password`, where `./password` is a path to a file containing user password    

```
parity --chain=dev --jsonrpc-apis web3,rpc,personal,parity_accounts,eth,net,parity,parity_set,signer --gasprice 0 --ui-interface 0.0.0.0 --ui-no-validation --jsonrpc-hosts all --jsonrpc-interface all --unlock 0x00a329c0648769A73afAc7F9381E08FB43dBEA72 --password ./password
```

Which should result in something like this: 
![Parity in terminal](/images/smart-contract-create-test-and-deploy/running-parity.jpg)

Parity node is ready! :) 

# Creating and testing Smart Contract - Truffle

The fastest and the simplest way I know to create, test and build smart contract is by using [truffle](http://truffleframework.com/docs/getting_started/project) tool. You can install truffle using npm (node version 6.11.4) package manager:      
`npm install -g truffle@4.0.1`     

Now please prepare an empty folder for your new project and execute the following command to initialize the truffle project structure:
    
```
truffle init
```

then please open and edit configuration file `truffle.js`, `from` parameter is an address from which all truffle transactions should be executed by default, please set as a value the address of the already created/restored account.
        
```javascript
module.exports = {  
  // See <http://truffleframework.com/docs/advanced/configuration>  
    networks: { 
        development: {  
            host: "localhost",  
            port: 8545, 
            network_id: "*",    
            from: "0x00a329c0648769A73afAc7F9381E08FB43dBEA72", 
            gas: 5959115    
        }   
    }   
};  
```

For the purpose of that article I've decided to create a smart contract which stores the sum of all values added by calling `add` method. Method `add` is restricted to be called only by a smart contract owner.   

```solidity
pragma solidity ^0.4.17;    
    
contract TestSmartContract {    
    address public owner;   
    uint public total;  
    
    modifier restricted() { 
        if (msg.sender == owner) _; 
    }   
    
    function TestSmartContract() public {   
        owner = msg.sender; 
    }   
    
    function add(uint amount) public restricted {   
        total = total + amount; 
    }   
}   
```

Having the smart contract we need to create migration that will deploy that smart contract. To do that we need to create a new file: `2_test_smart_contract.js` inside `migrations` folder:

```javascript
var TestSmartContract = artifacts.require("./TestSmartContract.sol");      
module.exports = function(deployer) {   
    deployer.deploy(TestSmartContract); 
};  
```

Now we need to execute migration by executing:

`truffle migrate`   

We are ready to start writing and executing unit tests. Below you can find two unit tests, the first one asserts if we call add method with value 4 then the total would equal to 4 and the second one - if we add: 6, 4, 20 total would be equal to 30. In `beforeEach` block we do create a new smart contract and read the contract owner address. 

```javascript
const TestContract = artifacts.require('TestSmartContract');

let TestContractDeployed;
let ContractOwner;

contract('TestContract', (accounts) => {

    beforeEach('prepare', () => {
        return TestContract.new().then((instance) => {
            TestContractDeployed = instance;
            return TestContractDeployed.owner();
        }).then(function (owner) {
            ContractOwner = owner;
        });
    });

    describe('test add method', () => {

        it('total should be 4 if add(4)', (done) => {
            TestContractDeployed.add(4, {from: ContractOwner}).then(function () {
                TestContractDeployed.total({from: ContractOwner}).then(function (res) {
                    assert.equal(res.valueOf(), 4);
                    done();
                });
            });
        });

        it('total should be 30 if add(6);add(4);add(20);', (done) => {
            Promise.all([
                TestContractDeployed.add(6, {from: ContractOwner}),
                TestContractDeployed.add(4, {from: ContractOwner}),
                TestContractDeployed.add(20, {from: ContractOwner})
            ]).then(() => {
                TestContractDeployed.total({from: ContractOwner}).then(function (res) {
                    assert.equal(res.valueOf(), 30);
                    done();
                });
            });
        });

    });

});
```

For more information it's definitely worth to visiting [truffle docs](https://truffle.readthedocs.io/en/beta/)

All the code that was generated during that post creation you can find here [smart-contract repo](https://github.com/bright/smart-contract)

Hope you have liked it! :) 
