const aws = require("aws-sdk");
const { v4 } = require("uuid");
const { dynamodb } = require("./db.js");
const errorMessage = require("./error.js");

//This is a private method to use in other lambdas
const generateMovement = async (object) => {
  try {
    const id = v4();

    const newMovement = {
      id: id,
      ...object,
    };

    await dynamodb
      .put({
        TableName: "Contacts",
        Item: newMovement,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify(newMovement),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

//This is a private method that returns the current balance of the client
const getBalance = async(phone) => {
  try {
    const result = await dynamodb
      .get({
        TableName: "Contacts",
        Key: {
          phone: phone,
        },
      })
      .promise();

    const balance = result.Item? result.Item.balance : null;

    return {
      statusCode: 200,
      body: JSON.stringify(balance),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
}

//This method creates a new client
const createContact = async (event) => {
  try {
    const id = v4();
    const { name, surname, phone, balance, movements } = JSON.parse(event.body);

    const newClient = {
      id,
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
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

//This method returns an specific client
const getContact = async (event) => {
  try {
    const { id } = event.pathParameters;
    const result = await dynamodb
      .get({
        TableName: "Contacts",
        Key: {
          id: id,
        },
      })
      .promise();

    const client = result.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(client),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
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
          phone: phone,
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

module.exports = {
  getContact,
  createContact,
  getMovement,
};
