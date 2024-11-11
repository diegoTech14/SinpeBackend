const { v4 } = require("uuid");
const { dynamodb } = require("./db.js");
const errorMessage = require("./error.js");
const { getInfoContact, generateMovement } = require("./utils.js")

const getFirstContact = async (event) => {
  try {

    const result = await dynamodb
    .scan({
      TableName: "Contacts",
      Limit: 1,
      ProjectionExpression: "#contactName, phone, balance",
      ExpressionAttributeNames: {
        "#contactName": "name",
      },
    })
    .promise();

    const firstContact = result.Items && result.Items[0];

    return {
      statusCode: 200,
      body: JSON.stringify(firstContact)
    };

  } catch (error) {
    return errorMessage(error);
  }
};

const getMovements = async (event) => {
  const { phone } = event.pathParameters;
  try {
    const result = await dynamodb
      .get({
        TableName: "Contacts",
        Key: {
          phone,
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

const getMovement = async (event) => {
  try {
    const { phone, id } = event.pathParameters;

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

    const movement = client.movements.find((mov) => mov.id === id);

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

const sendMoney = async (event) => {
  const { phoneSend, phoneReceive, ammount, detail } = JSON.parse(event.body);

  const currentDate = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toISOString().split("T")[1].split(".")[0];

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

    await generateMovement(phoneSend, {
      id: v4(),
      name: contactName.name,
      phone: phoneReceive,
      date: currentDate,
      hour: currentTime,
      description: detail,
      ammount: ammount,
    });

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

const getContacts = async (event) => {
  const { phone } = event.pathParameters;
  try {
    const result = await dynamodb
      .scan({
        TableName: "Contacts",
        FilterExpression: "phone <> :phone",
        ExpressionAttributeValues: {
          ":phone": phone,
        },
        ProjectionExpression: "#contactName, phone",
        ExpressionAttributeNames: {
          "#contactName": "name",
        },
      })
      .promise();

    const contacts = result.Items;

    return {
      statusCode: 200,
      body: JSON.stringify(contacts),
    };
  } catch (error) {
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
  sendMoney,
  getMovements,
  getContacts,
  getFirstContact,
};
