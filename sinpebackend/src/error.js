
function errorMessage(error){
    
    return {
        statusCode:500,
        body: JSON.stringify({message: error.message})
    }
}
module.exports = errorMessage;