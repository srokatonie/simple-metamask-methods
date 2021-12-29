export const sendTransactionFunction = async (
  fromAccountAddress: string,
  toContractAddress: string,
  gasLimitDecimal: string|number,
  amountToSendInWei: string|number,
  functionParamsValues: FunctionParamsValuesInterface,
): Promise<string|boolean> => {

  let web3: any
  
  try {
    //@ts-ignore
    web3 = new Web3(window['ethereum'])    
  } catch (error) {
    console.error(`Make sure Web3 library is included!`)
    return
  }

  const functionData = getFunctionData(functionParamsValues)

  const gasLimitHex = web3.utils.toHex(gasLimitDecimal.toString())    
  const priceHex = web3.utils.toHex(amountToSendInWei.toString())
  const functionParamsHex = web3.eth.abi.encodeFunctionCall(functionData.functionParams, functionData.functionValues)
  
  const callParameters = {
    from: fromAccountAddress,
    to: toContractAddress,
    value: priceHex,
    gasLimit: gasLimitHex,
    data: functionParamsHex,
  }

  try {
    let txHash = await window['ethereum'].request({method:"eth_sendTransaction", params: [callParameters]})
    return txHash
  } catch (error) {
    console.error(error)
    return false
  }
}

export const call = async(
  fromAccountAddress: string,
  toContractAddress: string,
  gasAmountDecimal: string|number,
  gasPriceDecimal: string|number,
  functionParamsValues: FunctionParamsValuesInterface,
  nonceNumber: string|number
) => {
  let web3: any
  
  try {
    //@ts-ignore
    web3 = new Web3(window['ethereum'])    
  } catch (error) {
    console.error(`Make sure Web3 library is included!`)
    return
  }

  const gas = web3.utils.toHex(gasAmountDecimal.toString())  
  const gasPrice = web3.utils.toHex(gasPriceDecimal.toString())
  const nonce = web3.utils.toHex(nonceNumber.toString())

  const functionData = getFunctionData(functionParamsValues)
  const functionParamsHex = web3.eth.abi.encodeFunctionCall(functionData.functionParams, functionData.functionValues)

  const callData = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [
      {
        from: fromAccountAddress,
        to: toContractAddress,
        gas,
        gasPrice,
        input: functionParamsHex,
        nonce
      },
      "latest"
    ],
    id: 0
  }

  try {
    const result = await window['ethereum'].request(callData)
    if (result) {
      const decoded = web3.eth.abi.decodeParameter(functionParamsValues.expectedReturnType, result)
      return decoded
    } else {
      console.log(`Cound't decode result`)
      return  null
    }
  } catch (error) {
    console.error(error)
  }
}

function getFunctionData(
  functionParamsValues: FunctionParamsValuesInterface
): {functionParams: FunctionParamsInterface, functionValues: string[]} {
  let functionParams: FunctionParamsInterface
  let functionValues: string[] = []
  let inputs: InputsInterface[] = []
  
  functionParamsValues.inputs.forEach(element => {
    const input = {
      name: element.name,
      type: element.type
    }
    inputs.push(input)
    functionValues.push(element.value.toString())
  })

  functionParams = {
    name: functionParamsValues.name,
    inputs
  }

  return {
    functionParams,
    functionValues
  }
}

interface FunctionParamsValuesInterface {
  // Function name with no brackets, ie. 'setMessage'
  name: string,
  // address, string, uint256, bool...
  expectedReturnType?: string,
  inputs: InputsValuesInterface[]
}

interface InputsValuesInterface {
  // address, string, uint256, bool...
  type: string,
  // parameter name, ie. '_newMessage'
  name: string,
  // value, ie. 'my super new message'
  value: string|number
}

interface FunctionParamsInterface {
  // Function name with no brackets, ie. 'setMessage'
  name: string,
  inputs: InputsInterface[]
}

interface InputsInterface {
  // address, string, uint256, bool...
  type: string,
  // parameter name, ie. '_newMessage'
  name: string
}
