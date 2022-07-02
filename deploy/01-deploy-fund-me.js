// 3 different methods/syntax but the functionality is the same

// function deployFunc() {
//   console.log("hey!")
//   hre.getNamedAccounts()
//   hre.deployments
// }
// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
//  }

// * I prefer readability over writing shortcode.

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// * when we run the hardhat deploy it passes the hardhat instance (hre) to deploy scripts functions.
async function deployFundMe(hre) {
    const { getNamedAccounts, deployments } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    console.log(
        "Check either development chain includes the network name - Fund Me"
    )
    console.log(developmentChains.includes(network.name))
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId]["ethUsdPriceFeedAddress"]
    }
    console.log("got the ethUsd price feed address")

    const args = [ethUsdPriceFeedAddress]
    console.log("deploying fund me...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    console.log("fund me deployed!")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        console.log("verifying contract")
        await verify(fundMe.address, args)
    }
    console.log("------------------------------------------")
}

module.exports = deployFundMe

module.exports.tags = ["all", "fundme"]
