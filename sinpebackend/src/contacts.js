const aws = require("aws-sdk");
const { v4 } = require("uuid");
const { dynamodb } = require("./db.js");
const errorMessage = require("./error.js");

//This is a private method to use in other lambdas
const generateMovement = async (phone, newMovement) => {
  try {

    await dynamodb.update({
      TableName: "Contacts",
      Key: { phone },
      UpdateExpression: "SET movements = list_append(if_not_exists(movements, :emptyList), :newMovement)",
      ExpressionAttributeValues: {
        ":newMovement": [newMovement],
        ":emptyList": []
      },
      ReturnValues: "ALL_NEW"
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Movimiento añadido exitosamente." })
    };

  } catch (error) {
    console.error("Error al añadir movimiento:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al añadir el movimiento.", error: error.message })
    };
  }
};

//This is a private method to get contact information
const getInfoContact = async(phone) => {
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
}

const getMovements = async (event) => {
  
  const { phone } = event.pathParameters;
  try {
    const result = await dynamodb
      .get({
        TableName: "Contacts",
        Key: {
          phone
        },
      })
      .promise();

    const movements = result.Item ? result.Item.movements : null;

    return {
      statusCode: 200,
      body: JSON.stringify(movements),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

//This method creates a new client
const createContact = async (event) => {
  try {
    const { name, surname, phone, balance, movements } = JSON.parse(event.body);

    const newClient = {
      name,
      surname,
      phone,
      balance,
      movements,
    };

    await dynamodb
      .put({
        TableName: "Contacts",
        Item: newClient,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(newClient),
    };
  } catch (error) {
    return errorMessage(error);
  }
};

//This method returns an specific client
const getContact = async (event) => {
  try {

    const { phone } = event.pathParameters;
    const contact = await getInfoContact(phone);

    return {
      statusCode: 200,
      body: JSON.stringify(contact),
    };
  } catch (error) {
    return errorMessage(error);
  }
};

//This method returns a detail of an specific movement
const getMovement = async (event) => {
  try {
    const { phone, movementId } = JSON.parse(event.body);

    const result = await dynamodb
      .get({
        TableName: "Contacts",
        Key: {
          phone,
        },
      })
      .promise();

    const client = result.Item;

    if (!client || !client.movements) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Client or movements not found" }),
      };
    }

    const movement = client.movements.find((mov) => mov.id === movementId);

    if (!movement) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Movement not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(movement),
    };
  } catch (error) {
    console.error("Error fetching movement:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

//This method sends money to another contact
const sendMoney = async (event) => {
  
  const { 
    phoneSend, 
    phoneReceive, 
    ammount, 
    detail
  } = JSON.parse(event.body);
  
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toISOString().split('T')[1].split('.')[0];

  try {
    await dynamodb
      .transactWrite({
        TransactItems: [
          {
            Update: {
              TableName: "Contacts",
              Key: { phone: phoneSend },
              UpdateExpression: "set balance = balance - :ammount",
              ConditionExpression: "balance >= :ammount",
              ExpressionAttributeValues: {
                ":ammount": ammount,
              },
            },
          },
          {
            Update: {
              TableName: "Contacts",
              Key: { phone: phoneReceive },
              UpdateExpression: "set balance = balance + :ammount",
              ExpressionAttributeValues: {
                ":ammount": ammount,
              },
            },
          },
        ],
      })
      .promise();
      const contactName = await getInfoContact(phoneReceive);
      
      await generateMovement(phoneSend, 
        {
          id:v4(),
          name: contactName.name,
          phone: phoneReceive,
          date: currentDate,
          hour: currentTime,
          description: detail,
          ammount: ammount
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Transferencia completada exitosamente.",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al realizar la transferencia.",
        error: error.message,
      }),
    };
  }
};

module.exports = {
  getContact,
  createContact,
  getMovement,
  sendMoney,
  getMovements,
};
