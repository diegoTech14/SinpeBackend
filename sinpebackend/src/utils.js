const { dynamodb } = require("./db.js");
const errorMessage = require("./error.js");

//This is a private method to use in other lambdas
const generateMovement = async (phone, newMovement) => {
    try {
      await dynamodb
        .update({
          TableName: "Contacts",
          Key: { phone },
          UpdateExpression:
            "SET movements = list_append(if_not_exists(movements, :emptyList), :newMovement)",
          ExpressionAttributeValues: {
            ":newMovement": [newMovement],
            ":emptyList": [],
          },
          ReturnValues: "ALL_NEW",
        })
        .promise();
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Movimiento añadido exitosamente." }),
      };
    } catch (error) {
      console.error("Error al añadir movimiento:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al añadir el movimiento.",
          error: error.message,
        }),
      };
    }
  };
  
  //This is a private method to get contact information
  const getInfoContact = async (phone) => {
    try {
      const result = await dynamodb
        .get({
          TableName: "Contacts",
          Key: {
            phone,
          },
        })
        .promise();
  
      return result.Item;
    } catch (error) {
      return errorMessage(error);
    }
  };
  
module.exports = {
    getInfoContact,
    generateMovement
}