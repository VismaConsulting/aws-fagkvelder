const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /sertifiseringer/{id}":
        await dynamo
          .delete({
            TableName: TABLE_NAME,
            Key: {
              id: event.pathParameters.id,
            },
          })
          .promise();
        body = `Slettet sertifisering med id ${event.pathParameters.id}`;
        break;
      case "GET /sertifiseringer/{id}":
        body = await dynamo
          .get({
            TableName: TABLE_NAME,
            Key: {
              id: event.pathParameters.id,
            },
          })
          .promise();
        body = body.Item;
        break;
      case "GET /sertifiseringer":
        body = await dynamo.scan({ TableName: TABLE_NAME }).promise();
        body = body.Items;
        break;
      case "PUT /sertifiseringer":
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: TABLE_NAME,
            Item: {
              id: requestJSON.id,
              tittel: requestJSON.tittel,
              status: requestJSON.status,
              dato: requestJSON.dato,
              bilde: requestJSON.bilde,
              gyldig_til: requestJSON.gyldig_til,
            },
          })
          .promise();
        body = `Lagt til/ oppdatert sertifisering med id: ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Ugyldig Rute: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
